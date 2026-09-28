'use client';
import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, X } from 'lucide-react';
import type { BikePart } from '@/types/bike';
export default function PartPanel({part,onClose,isolated,onIsolate}:{part:BikePart;onClose:()=>void;isolated:boolean;onIsolate:()=>void}) {
  const close=useRef<HTMLButtonElement>(null),panel=useRef<HTMLElement>(null);
  const [more,setMore]=useState(false);
  useEffect(()=>{
    const previous=document.activeElement as HTMLElement|null;
    close.current?.focus({preventScroll:true});
    const key=(e:KeyboardEvent)=>{if(e.key==='Escape')onClose();if(e.key==='Tab'){
      const buttons=panel.current?.querySelectorAll<HTMLElement>('button,a[href]');if(!buttons?.length)return;
      const first=buttons[0],last=buttons[buttons.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
    }};
    document.addEventListener('keydown',key);return()=>{document.removeEventListener('keydown',key);previous?.focus({preventScroll:true});};
  },[onClose]);
  return <aside ref={panel} className="part-panel" role="dialog" aria-modal="true" aria-labelledby="part-title">
    <div className="panel-top"><span className="eyebrow">{part.category} / Component study</span><button ref={close} className="icon-button" onClick={onClose} aria-label="Close component details"><X size={20}/></button></div>
    <h2 id="part-title">{part.name}</h2><p>{part.description}</p>
    <dl>{part.specifications.map(s=><div key={s.label}><dt>{s.label}</dt><dd>{s.value}</dd></div>)}</dl>
    <div className="panel-actions"><button className="text-button" onClick={()=>setMore(!more)} aria-expanded={more}>{more?'Hide technology notes':'View technology'}<ArrowUpRight size={17}/></button><button className="text-button" onClick={onIsolate} aria-pressed={isolated}>{isolated?'Show assembly':'Isolate component'}</button></div>
    {more&&<p className="technology-note">{part.category==='Power'?'The power system works as one: battery management, motor control and direct drive continually balance efficiency and response.':part.category==='Safety'?'Visibility, feedback and predictable response guide this component’s role in the complete vehicle.':'Designed as part of an integrated assembly, this component balances durability, serviceability and everyday comfort.'} Values shown are concept specifications and require validation for a production vehicle.</p>}
    <small>CONCEPT STUDY · ILLUSTRATIVE SPECIFICATIONS</small>
  </aside>;
}
