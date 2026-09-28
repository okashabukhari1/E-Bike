'use client';
import dynamic from 'next/dynamic';
import { useCallback, useEffect, useState } from 'react';
import { ArrowDown, ArrowRight, ArrowUpRight, Menu, X, RotateCcw, Plus, Box, Zap } from 'lucide-react';
import { categories, interactiveParts } from '@/data/bikeParts';
import { useExplodedProgress } from '@/hooks/useExplodedProgress';
import type { Category } from '@/types/bike';
import PartPanel from './ui/PartPanel';
const BikeScene=dynamic(()=>import('./three/BikeScene'),{ssr:false,loading:()=> <div className="initial-loading"><span className="eyebrow">PREPARING YOUR MACHINE</span><span className="loading-line"/></div>});
const chapters=[['01','The introduction',.0],['02','The engineering',.17],['03','The anatomy',.48],['04','Built as one',.98]] as const;
export default function Experience({modelUrl,isDemo}:{modelUrl:string;isDemo:boolean}) {
  const [reduced,setReduced]=useState(false),[selected,setSelected]=useState<string|null>(null),[hovered,setHovered]=useState<string|null>(null),[category,setCategory]=useState<Category|null>(null),[menu,setMenu]=useState(false),[loaded,setLoaded]=useState(false);
  const {section,pinned,motion,stage,navigate}=useExplodedProgress(reduced);
  const [contact,setContact]=useState(false),[pending,setPending]=useState<string|null>(null),[isolated,setIsolated]=useState(true),[labelPage,setLabelPage]=useState(0);
  useEffect(()=>{const media=window.matchMedia('(prefers-reduced-motion: reduce)');const update=()=>setReduced(media.matches);update();media.addEventListener('change',update);return()=>media.removeEventListener('change',update);},[]);
  const close=useCallback(()=>setSelected(null),[]),onLoaded=useCallback(()=>setLoaded(true),[]);
  useEffect(()=>{setSelected(null);setHovered(null);},[stage]);
  useEffect(()=>{if(stage==='explore'&&pending){setSelected(pending);setPending(null);}},[stage,pending]);
  useEffect(()=>{
    if(!selected)return;
    const previous=document.body.style.overflow;document.body.style.overflow='hidden';return()=>{document.body.style.overflow=previous;};
  },[selected]);
  const select=useCallback((id:string)=>{setHovered(null);setSelected(id);},[]);
  const go=(p:number)=>{setMenu(false);setSelected(null);navigate(p);};
  const selectedPart=interactiveParts.find(p=>p.id===selected);
  const hero=stage==='hero',exploring=stage==='explore';
  const detailed=stage==='explode'||exploring||!!selected;
  return <>
    <a className="skip-link" href="#components">Skip to component information</a>
    <header className={`navigation ${hero?'':'scrolled'} ${detailed?'inspection-navigation':''}`}>
      <a href="#" className="brand" aria-label="Forma Electric home" onClick={e=>{e.preventDefault();go(0);}}><span className="brand-symbol">F</span> FORMA<span className="brand-sub">ELECTRIC</span></a>
      <nav aria-label="Main navigation" className={menu?'nav-links open':'nav-links'}><button onClick={()=>go(.17)}>Engineering</button><button onClick={()=>go(.5)}>Components</button><a href="#performance" onClick={()=>setMenu(false)}>Performance</a></nav>
      <a className="nav-cta" href="#specifications">Discover F01 <ArrowUpRight size={15}/></a>
      <button className="menu-toggle icon-button" aria-label={menu?'Close menu':'Open menu'} aria-expanded={menu} onClick={()=>setMenu(!menu)}>{menu?<X/>:<Menu/>}</button>
    </header>
    <main>
      <div ref={section} className="scroll-experience" id="engineering">
        <div ref={pinned} className={`pinned-scene stage-${stage} ${selected?'has-selection':''} ${detailed?'is-detail':''}`}>
          <div className="studio-glow"/>
          <div className="hero-word" aria-hidden="true">F<span>0</span>1</div>
          <div className="stage-canvas" aria-label="Interactive 3D electric scooter. Scroll to disassemble, then select a component.">
            <BikeScene labelPage={labelPage} url={modelUrl} motion={motion} selected={selected} hovered={hovered} isolated={isolated} category={exploring?category:null} reduced={reduced} enabled={exploring} onSelect={select} onHover={setHovered} onLoaded={onLoaded}/>
          </div>
          <div className="model-badge"><span className="status-dot"/>{isDemo?'F01 / CONCEPT SERIES':'F01 / ENGINEERING SERIES'}<span className="badge-line"/> ALL ELECTRIC</div>
          {hero&&<div className="hero-copy"><span className="eyebrow">A NEW FORM OF FREEDOM</span><h1>Less noise.<br/>More <em>possibility.</em></h1><p>Pure electric. Precisely engineered.<br/>Discover what moves you.</p><button className="primary-button" onClick={()=>go(.17)}>Explore the engineering <ArrowDown size={16}/></button></div>}
          {stage==='intro'&&<div className="chapter-copy"><span className="eyebrow">01 / INTENTIONAL BY DESIGN</span><h2>Engineered.<br/>From the<br/><em>inside out.</em></h2><p>Every component exists for a reason.<br/>Scroll to see how it all comes together.</p></div>}
          {stage==='explode'&&<div className="chapter-copy compact"><span className="eyebrow">02 / THE ART OF ENGINEERING</span><h2>Nothing extra.<br/><em>Everything essential.</em></h2><p>A closer look at the sum of our parts.</p></div>}
          {stage==='reassemble'&&<div className="chapter-copy"><span className="eyebrow">04 / PRECISION IN EVERY CONNECTION</span><h2>Many parts.<br/><em>One purpose.</em></h2><p>Engineering that moves in harmony.</p></div>}
          {stage==='final'&&<div className="chapter-copy"><span className="eyebrow">04 / THE COMPLETE PICTURE</span><h2>Built<br/><em>as one.</em></h2><p>Engineered component by component.<br/>Ready for the road ahead.</p><a className="primary-button" href="#performance">Meet the F01 <ArrowDown size={16}/></a></div>}
          {exploring&&!selected&&<div className="detail-toolbar">
            <select aria-label="Component system" value={category??''} onChange={e=>{setCategory((e.target.value||null) as Category|null);setLabelPage(0);}}><option value="">All systems</option>{categories.map(c=><option key={c}>{c}</option>)}</select>
            <select aria-label="Inspect a component" value="" onChange={e=>{if(e.target.value)select(e.target.value);}}><option value="">Inspect a component</option>{interactiveParts.filter(p=>!category||p.category===category).map(p=><option value={p.id} key={p.id}>{p.name}</option>)}</select>
            <button className="next-labels" onClick={()=>setLabelPage(p=>p+1)}>Next labels <ArrowRight size={14}/></button>
            <button className="continue-assembly" onClick={()=>go(.82)} aria-label="Continue scrolling to reassemble"><ArrowDown size={16}/></button>
          </div>}
          <div className="scene-bottom"><button className="scroll-prompt" onClick={()=>go(hero?.17:exploring?.81:stage==='final'?0:.49)}><span className="scroll-icon"><ArrowDown size={15}/></span>{hero?'SCROLL TO DISCOVER':exploring?'CONTINUE TO REASSEMBLE':stage==='final'?'EXPLORE AGAIN':'SCROLL TO EXPLORE'}</button><div className="scene-caption"><Box size={13}/>{loaded?'REAL-TIME 3D EXPERIENCE':'LOADING 3D EXPERIENCE'}</div><span className="scene-page">{hero?'01':stage==='intro'||stage==='explode'?'02':exploring?'03':'04'} <span>/ 04</span></span></div>
          <div className="scene-progress"/>
          <div className="chapter-rail" aria-label="Experience chapters">{chapters.map(([n,title,p])=><button key={n} title={title} aria-label={title} onClick={()=>go(p)} className={(hero&&n==='01'||(stage==='intro'||stage==='explode')&&n==='02'||exploring&&n==='03'||(stage==='reassemble'||stage==='final')&&n==='04')?'active':''}>{n}</button>)}</div>
          {selectedPart&&<PartPanel key={selectedPart.id} part={selectedPart} onClose={close} isolated={isolated} onIsolate={()=>setIsolated(!isolated)}/>}
        </div>
      </div>
      <section className="engineering-story content-section" id="technology"><div><span className="eyebrow">THE INTELLIGENCE WITHIN</span><h2>Power, without<br/>the excess.</h2></div><div className="story-description"><p>One integrated electric architecture. From the first input to the last kilometer, every system works together to make the ride feel effortless.</p><a className="text-button" href="#components">Get to know the components <ArrowUpRight size={17}/></a></div></section>
      <section className="technology-grid content-section" id="performance">
        <article className="tech-card motor-card"><span className="eyebrow">01 / DIRECT-DRIVE POWERTRAIN</span><div className="tech-art motor-art" aria-hidden="true"><div className="motor-disc"><Zap size={42} strokeWidth={1}/></div><span className="orbit orbit-one"/><span className="orbit orbit-two"/></div><div className="tech-card-bottom"><h3>Instant response.<br/>Lasting impression.</h3><p>A quiet 3,000 W hub motor. All the connection, with fewer moving parts.</p><button className="text-button" onClick={()=>{go(.5);setTimeout(()=>select('motor'),1000);}}>Explore the powertrain <ArrowUpRight size={17}/></button></div><span className="tech-number">3<span>kW</span></span></article>
        <article className="tech-card battery-card"><span className="eyebrow">02 / INTELLIGENT ENERGY</span><div className="battery-figure"><span>120</span><small>KM / EST. RANGE</small></div><div className="tech-card-bottom"><h3>Go further.<br/>Feel lighter.</h3><p>A 72 V lithium-ion system designed around the freedom of everyday journeys.</p><button className="text-button" onClick={()=>{go(.5);setTimeout(()=>select('battery'),1000);}}>Explore the battery <ArrowUpRight size={17}/></button></div><div className="energy-bars" aria-hidden="true">{Array.from({length:28},(_,i)=><i key={i}/>)}</div></article>
      </section>
      <section className="spec-section content-section" id="specifications"><div className="section-heading"><span className="eyebrow">CAPABILITY, CONSIDERED</span><h2>The details<br/>make the difference.</h2><p>Designed for your everyday.<br/>Engineered for what comes next.</p></div><dl className="spec-grid">{[['120','km','Estimated range'],['3,000','W','Rated motor power'],['72','V','Battery architecture'],['6–8','hrs','Full charging time'],['38','Ah','Battery capacity'],['12','in','Alloy wheels']].map(([v,u,l])=><div key={l}><dt>{l}</dt><dd>{v}<span>{u}</span></dd></div>)}</dl><small className="demo-note">Concept specifications for demonstration. Actual range depends on riding conditions, payload and temperature.</small></section>
      <section className="design-section content-section"><span className="eyebrow">FORM WITH PURPOSE</span><h2>A quieter kind<br/>of <em>statement.</em></h2><div className="design-copy"><span className="material-swatches"><i/><i/><i/></span><p>Graphite bodywork. A warm cognac saddle. A clean silhouette that puts function first, and leaves room for you.</p><span className="eyebrow">GRAPHITE / COGNAC / BRUSHED ALLOY</span></div></section>
      <section className="components-section content-section" id="components"><div className="section-heading"><span className="eyebrow">THE COMPONENT LIBRARY</span><h2>Every part.<br/>A purpose.</h2><p>Explore the complete engineering study.<br/>All details are available without the 3D viewer.</p></div><div className="component-library">{interactiveParts.map((p,i)=><details key={p.id}><summary><span className="component-index">{String(i+1).padStart(2,'0')}</span><span>{p.name}</span><small>{p.category}</small><Plus size={17}/></summary><div className="component-content"><p>{p.description}</p><dl>{p.specifications.map(s=><div key={s.label}><dt>{s.label}</dt><dd>{s.value}</dd></div>)}</dl></div></details>)}</div></section>
      <section className="final-cta content-section"><span className="eyebrow">THE FORMA F01</span><h2>Move with<br/><em>intention.</em></h2><div className="final-actions"><button className="primary-button" onClick={()=>go(0)}>Experience it again <RotateCcw size={16}/></button><button className="text-button" onClick={()=>setContact(!contact)} aria-expanded={contact}>About this concept <ArrowRight size={17}/></button></div>{contact&&<p className="concept-about">FORMA F01 is an interactive design and engineering concept. The 3D vehicle is {isDemo?'a procedural demonstration model inspired by the supplied reference':'a supplied vehicle model'}. Specifications are illustrative; this is not a vehicle available for purchase.</p>}</section>
    </main>
    <footer><a className="brand" href="#" onClick={e=>{e.preventDefault();go(0);}}>FORMA<span className="brand-sub">ELECTRIC</span></a><span>DESIGNED WITH INTENT. ENGINEERED TO MOVE.</span><small>© {new Date().getFullYear()} FORMA · Concept study</small></footer>
  </>;
}
