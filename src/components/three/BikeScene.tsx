'use client';
import { Component, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { AdaptiveDpr, PerformanceMonitor, useProgress, useGLTF } from '@react-three/drei';
import { Vector3 } from 'three';
import BikeModel, { type ModelProps } from './BikeModel';
import BikeCamera from './BikeCamera';
import BikeLighting from './BikeLighting';
import PartLabels from './PartLabels';
import type { ProjectionStore } from '@/lib/labels';
function Loading() {
  const {progress}=useProgress();
  const [slow,setSlow]=useState(false);
  useEffect(()=>{const t=setTimeout(()=>setSlow(true),12000);return()=>clearTimeout(t);},[]);
  return <div className="loading-overlay"><div className="model-loading" role="status"><span className="eyebrow">ENGINEERING EXPERIENCE</span><p>{slow?'Preparing the vehicle. You can explore the component list below.':'Preparing your machine'}</p><div className="loading-track"><i style={{width:`${Math.max(progress,8)}%`}}/></div><small>{Math.round(progress)}%</small></div></div>;
}
class SceneBoundary extends Component<{children:React.ReactNode;fallback:React.ReactNode},{failed:boolean}> {
  state={failed:false};
  static getDerivedStateFromError(){return {failed:true};}
  render(){return this.state.failed?this.props.fallback:this.props.children;}
}
function Fallback(){return <div className="scene-fallback"><img src="/images/reference.png" alt="Black step-through electric scooter with a brown saddle"/><p>3D preview unavailable. Explore every component in the accessible list below.</p></div>;}
export default function BikeScene(props:Omit<ModelProps,'focus'|'projections'|'focusRadius'>&{labelPage:number}) {
  const focus=useRef(new Vector3());
  const focusRadius=useRef(1);
  const projections=useRef<ProjectionStore>(new Map());
  const [dpr,setDpr]=useState(1.5),[lost,setLost]=useState(false),[ready,setReady]=useState(false);
  const onLoaded=props.onLoaded;
  const handleLoaded=useCallback(()=>{setReady(true);onLoaded();},[onLoaded]);
  useEffect(()=>{useGLTF.preload(props.url,'/draco/',true);},[props.url]);
  useEffect(()=>{document.body.style.cursor=props.hovered&&props.enabled?'pointer':'';return()=>{document.body.style.cursor='';};},[props.hovered,props.enabled]);
  if(lost)return <Fallback/>;
  return <SceneBoundary fallback={<Fallback/>}><Canvas dpr={[1,dpr]} camera={{position:[-3.5,2.8,7],fov:34,near:.05,far:100}} gl={{antialias:true,alpha:true,powerPreference:'high-performance'}} fallback={<Fallback/>} onCreated={({gl})=>{gl.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();setLost(true);},{once:true});}}>
    <PerformanceMonitor onDecline={()=>setDpr(1)}><AdaptiveDpr pixelated/></PerformanceMonitor>
    <Suspense fallback={null}><BikeLighting/><BikeModel {...props} onLoaded={handleLoaded} focus={focus} focusRadius={focusRadius} projections={projections}/></Suspense>
    <BikeCamera motion={props.motion} selected={props.selected} focus={focus} focusRadius={focusRadius} reduced={props.reduced}/>
  </Canvas>{!ready&&<Loading/>}{ready&&props.enabled&&!props.selected&&<PartLabels projections={projections} category={props.category} page={props.labelPage} onSelect={props.onSelect} onHover={props.onHover}/>}</SceneBoundary>;
}
