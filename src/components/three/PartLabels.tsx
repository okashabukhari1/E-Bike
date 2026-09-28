'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { interactiveParts } from '@/data/bikeParts';
import { layoutLabels, type ProjectionStore } from '@/lib/labels';
import type { Category } from '@/types/bike';

interface Props {
  projections:React.RefObject<ProjectionStore>; category:Category|null; page:number;
  onSelect:(id:string)=>void; onHover:(id:string|null)=>void;
}
const priority=['mirror-left','seat','front-wheel','battery','motor','headlight'];
export default function PartLabels({projections,category,page,onSelect,onHover}:Props){
  const host=useRef<HTMLDivElement>(null);
  const [size,setSize]=useState({width:1440,height:800});
  const buttons=useRef(new Map<string,HTMLButtonElement>());
  const lines=useRef(new Map<string,SVGPolylineElement>());
  const dots=useRef(new Map<string,SVGCircleElement>());
  const parts=useMemo(()=>{
    const filtered=interactiveParts.filter(p=>!category||p.category===category);
    if(size.width>=1000)return filtered;
    filtered.sort((a,b)=>{const ai=priority.indexOf(a.id),bi=priority.indexOf(b.id);return (ai<0?99:ai)-(bi<0?99:bi);});
    const count=size.width<700?6:12,offset=(page%Math.max(1,Math.ceil(filtered.length/count)))*count;
    return filtered.slice(offset,offset+count);
  },[size.width,category,page]);
  useEffect(()=>{
    const element=host.current;if(!element)return;
    const resize=new ResizeObserver(([entry])=>setSize({width:entry.contentRect.width,height:entry.contentRect.height}));resize.observe(element);
    return()=>resize.disconnect();
  },[]);
  useEffect(()=>{
    let frame=0,previous='';
    const update=()=>{
      const points=parts.flatMap(p=>{const point=projections.current.get(p.id);return point?.visible?[{id:p.id,point}]:[];});
      const signature=points.map(p=>`${p.id}:${Math.round(p.point.x)},${Math.round(p.point.y)}`).join('|');
      if(signature===previous){frame=requestAnimationFrame(update);return;}previous=signature;
      const placements=layoutLabels(points,size.width,size.height);
      const visible=new Set(placements.map(p=>p.id));
      parts.forEach(p=>{const button=buttons.current.get(p.id);if(button)button.style.visibility=visible.has(p.id)?'visible':'hidden';});
      placements.forEach(p=>{
        const button=buttons.current.get(p.id),line=lines.current.get(p.id),dot=dots.current.get(p.id);
        if(button){button.style.transform=`translate(${p.x}px,${p.y}px)`;button.style.width=`${p.width}px`;button.dataset.side=p.side;}
        const x=p.side==='left'?p.x+p.width:p.side==='right'?p.x:p.x+p.width/2;
        const y=p.y+(p.side==='top'?36:p.side==='bottom'?0:12);
        const kneeX=p.side==='left'?x+16:p.side==='right'?x-16:x;
        const kneeY=p.side==='top'?y+12:p.side==='bottom'?y-12:y;
        line?.setAttribute('points',`${x},${y} ${kneeX},${kneeY} ${p.anchor.x},${p.anchor.y}`);
        dot?.setAttribute('cx',String(p.anchor.x));dot?.setAttribute('cy',String(p.anchor.y));
      });
      frame=requestAnimationFrame(update);
    };frame=requestAnimationFrame(update);return()=>cancelAnimationFrame(frame);
  },[parts,projections,size]);
  return <div className="annotation-layer" ref={host} aria-label="Labeled bike components">
    <svg aria-hidden="true" width="100%" height="100%">{parts.map(p=><g key={p.id}><polyline ref={el=>{if(el)lines.current.set(p.id,el);else lines.current.delete(p.id);}}/><circle r="2" ref={el=>{if(el)dots.current.set(p.id,el);else dots.current.delete(p.id);}}/></g>)}</svg>
    {parts.map(p=><button key={p.id} ref={el=>{if(el)buttons.current.set(p.id,el);else buttons.current.delete(p.id);}} onClick={()=>onSelect(p.id)} onPointerEnter={()=>onHover(p.id)} onPointerLeave={()=>onHover(null)} onFocus={()=>onHover(p.id)} onBlur={()=>onHover(null)}>{p.shortName}</button>)}
  </div>;
}
