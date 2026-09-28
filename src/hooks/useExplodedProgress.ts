'use client';
import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { explosionAt, stageAt } from '@/lib/animation';
import type { MotionState } from '@/types/bike';
export function useExplodedProgress(reduced: boolean) {
  const section=useRef<HTMLDivElement>(null), pinned=useRef<HTMLDivElement>(null);
  const motion=useRef<MotionState>({scroll:0,explosion:0});
  const stageRef=useRef('hero');
  const [stage,setStage]=useState('hero');
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const driver={progress:0};
    const update=()=>{
      const p=driver.progress;
      motion.current.scroll=p;motion.current.explosion=reduced?(p>=.21&&p<.9?1:0):explosionAt(p);
      const next=stageAt(p);if(next!==stageRef.current){stageRef.current=next;setStage(next);}
      pinned.current?.style.setProperty('--progress',String(p));
    };
    const ctx=gsap.context(() => {
      gsap.fromTo(driver,{progress:0},{ progress:1, ease:'none', scrollTrigger:{trigger:section.current,start:'top top',end:()=>`+=${window.innerHeight*(window.innerWidth<700?6:8)}`,pin:pinned.current,scrub:reduced?true:.45,invalidateOnRefresh:true,onRefresh:self=>{driver.progress=self.progress;update();}},onUpdate:update});
    },section);
    return ()=>ctx.revert();
  },[reduced]);
  const navigate=(progress:number) => {
    const trigger=ScrollTrigger.getAll().find(t=>t.trigger===section.current);
    if(trigger) window.scrollTo({top:trigger.start+(trigger.end-trigger.start)*progress,behavior:reduced?'instant':'smooth'});
  };
  return {section,pinned,motion,stage,navigate};
}
