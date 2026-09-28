'use client';
import { useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { MathUtils, Vector3 } from 'three';
import { bikeParts } from '@/data/bikeParts';
import type { MotionState } from '@/types/bike';
export default function BikeCamera({motion,selected,focus,focusRadius,reduced}:{motion:React.RefObject<MotionState>;selected:string|null;focus:React.RefObject<Vector3>;focusRadius:React.RefObject<number>;reduced:boolean}) {
  const {camera,size}=useThree();
  const vectors=useMemo(()=>({target:new Vector3(0,1.05,0),position:new Vector3(),look:new Vector3(),offset:new Vector3()}),[]);
  useFrame((_,delta)=>{
    const e=motion.current.explosion, mobile=size.width<700;
    const aspect=(size.width-(size.width>=1000?360*e:0))/size.height;
    // Fit the full horizontal assembly at narrow aspect ratios, including ultrawide screens.
    const distance=Math.max(mobile?5.8:6.3,(2.7+e*1.5)/(Math.max(aspect,.4)*Math.tan(Math.PI*34/360)))*(size.width>=1000?1-e*.15:1);
    vectors.position.set(-distance*.43,2.8+e*.7,distance*(.94+e*.13));
    vectors.look.set(0,1.12,0);
    const part=bikeParts.find(p=>p.id===selected);
    if(part&&!reduced) {
      const fitDistance=Math.max(.85,focusRadius.current*3.8)*(mobile?1.1:1);
      vectors.look.copy(focus.current).add(vectors.offset.fromArray(part.camera.target));
      vectors.position.copy(focus.current).add(vectors.offset.fromArray(part.camera.position).normalize().multiplyScalar(fitDistance));
      if(!mobile) vectors.look.x+=fitDistance*.15;
    }
    if(reduced) vectors.position.set(-4,3,Math.max(distance,8));
    const damping=1-Math.exp(-Math.min(delta,.1)*3.5);
    camera.position.lerp(vectors.position,damping);vectors.target.lerp(vectors.look,damping);camera.lookAt(vectors.target);
    camera.zoom=MathUtils.lerp(camera.zoom,1,damping);camera.updateProjectionMatrix();
  });
  return null;
}
