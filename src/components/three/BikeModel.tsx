'use client';
import { useEffect, useMemo, useRef } from 'react';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { Group, MathUtils, Vector3 } from 'three';
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js';
import { bikeParts } from '@/data/bikeParts';
import { mapModel, inspectModel } from '@/lib/model';
import { partProgress } from '@/lib/animation';
import type { Category, MotionState } from '@/types/bike';
import type { ProjectionStore } from '@/lib/labels';
export interface ModelProps {
  url: string; motion: React.RefObject<MotionState>; selected: string|null; hovered: string|null;
  category: Category|null; reduced: boolean; enabled: boolean; isolated:boolean;
  onSelect:(id:string)=>void; onHover:(id:string|null)=>void; onLoaded:()=>void;
  focus: React.RefObject<Vector3>;
  projections: React.RefObject<ProjectionStore>;
  focusRadius: React.RefObject<number>;
}
export default function BikeModel({url,motion,selected,hovered,category,reduced,enabled,isolated,onSelect,onHover,onLoaded,focus,projections,focusRadius}:ModelProps) {
  const {scene}=useGLTF(url, '/draco/', true);
  const copy=useMemo(()=>clone(scene),[scene]);
  const entries=useMemo(()=>mapModel(copy,bikeParts),[copy]);
  const root=useRef<Group>(null);
  const tap=useRef<{x:number;y:number;scroll:number}|null>(null);
  const temp=useMemo(()=>new Vector3(),[]);
  useEffect(()=>{
    if(process.env.NODE_ENV==='development' && new URLSearchParams(window.location.search).has('debug')) inspectModel(copy);
    onLoaded();
    return ()=>{ entries.forEach(e=>e.materials.forEach(({material})=>material.dispose())); };
  },[copy,entries,onLoaded]);
  useFrame((state,delta)=>{
    const damping=1-Math.exp(-delta*7);
    if(root.current) {root.current.rotation.y=MathUtils.lerp(root.current.rotation.y,reduced||selected||enabled?0:state.pointer.x*.035,damping);root.current.rotation.x=MathUtils.lerp(root.current.rotation.x,reduced||selected||enabled?0:state.pointer.y*.015,damping);}
    entries.forEach(entry=>{
      entry.object.visible=!selected||!isolated||entry.part.id===selected;
      const progress=partProgress(motion.current.explosion,entry.part.interval);
      entry.object.position.lerpVectors(entry.start,entry.end,progress);
      entry.object.quaternion.slerpQuaternions(entry.startRotation,entry.endRotation,progress);
      const active=selected||hovered;
      const dim=active?active!==entry.part.id:category?entry.part.category!==category:false;
      const highlighted=active===entry.part.id;
      entry.materials.forEach(({material,color,emissive,intensity})=>{
        material.color.copy(color).multiplyScalar(dim?.055:highlighted?1.5:1);
        material.emissive.copy(highlighted?color:emissive);material.emissiveIntensity=highlighted?.22:intensity*(dim?.25:1);
      });
      if(entry.part.id===selected) {entry.object.updateWorldMatrix(true,false);temp.copy(entry.center);entry.object.localToWorld(temp);focus.current.copy(temp);focusRadius.current=entry.radius;}
    });
    if(enabled&&!selected){
      root.current?.updateWorldMatrix(true,true);
      entries.forEach(entry=>{
        if(!entry.part.interactive)return;
        temp.copy(entry.center);entry.object.localToWorld(temp);temp.project(state.camera);
        const point=projections.current.get(entry.part.id)??{x:0,y:0,visible:false};
        point.x=(temp.x+1)*state.size.width/2;point.y=(1-temp.y)*state.size.height/2;
        point.visible=temp.z>-1&&temp.z<1&&entry.object.visible;
        projections.current.set(entry.part.id,point);
      });
    }
  });
  const hit=(e:ThreeEvent<PointerEvent>|ThreeEvent<MouseEvent>) => {
    if(!enabled) return null;
    const id=e.object.userData.partId as string|undefined;
    const part=bikeParts.find(p=>p.id===id&&p.interactive);
    if(part) e.stopPropagation();return part?.id??null;
  };
  return <>
    <group ref={root}><primitive object={copy} onPointerDown={(e:ThreeEvent<PointerEvent>)=>{tap.current={x:e.clientX,y:e.clientY,scroll:window.scrollY};}} onPointerCancel={()=>{tap.current=null;}} onPointerOver={(e:ThreeEvent<PointerEvent>)=>{const id=hit(e);if(id&&e.pointerType!=='touch')onHover(id);}} onPointerOut={()=>onHover(null)} onClick={(e:ThreeEvent<MouseEvent>)=>{const start=tap.current;tap.current=null;if(!start||Math.hypot(e.clientX-start.x,e.clientY-start.y)>8||Math.abs(window.scrollY-start.scroll)>4)return;const id=hit(e);if(id)onSelect(id);}} /></group>
  </>;
}
