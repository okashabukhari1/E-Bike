import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { Group, Mesh, BoxGeometry, MeshStandardMaterial, Vector3 } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { bikeParts, interactiveParts } from '../src/data/bikeParts';
import { explosionAt, partProgress, stageAt } from '../src/lib/animation';
import { mapModel } from '../src/lib/model';
import { layoutLabels } from '../src/lib/labels';
test('scroll assembles, disassembles, holds for inspection, then reassembles',()=>{
  assert.equal(explosionAt(0),0);assert.equal(explosionAt(.16),0);
  assert.equal(explosionAt(.45),1);assert.equal(explosionAt(.7),1);assert.equal(explosionAt(1),0);
  assert.equal(stageAt(.5),'explore');assert.equal(stageAt(.98),'final');
  for(let p=.17;p<.45;p+=.01)assert.ok(explosionAt(p)>=explosionAt(p-.01));
  for(let p=.8;p<.97;p+=.01)assert.ok(explosionAt(p)<=explosionAt(p-.01));
});
test('all staged transforms are reversible and finite',()=>{
  for(const p of bikeParts){
    assert.equal(partProgress(0,p.interval),0);assert.equal(partProgress(1,p.interval),1);
    const start=new Vector3(...p.assembled.position),end=new Vector3(...p.exploded.position),position=start.clone();
    for(const amount of [0,.2,.7,1,.7,.2,0]){position.lerpVectors(start,end,partProgress(amount,p.interval));assert.ok(position.toArray().every(Number.isFinite));}
    assert.deepEqual(position.toArray(),start.toArray());
  }
  assert.equal(interactiveParts.length,40);
});
test('missing meshes report actionable warnings without throwing',()=>{
  const warnings:string[]=[];const original=console.warn;console.warn=(s:string)=>warnings.push(s);
  try{assert.deepEqual(mapModel(new Group(),bikeParts),[]);assert.equal(warnings.length,bikeParts.length);assert.match(warnings[0],/src\/data\/bikeParts.ts/);}finally{console.warn=original;}
});
test('nested aliases animate once and preserve authored transforms',()=>{
  const scene=new Group(),battery=new Group();battery.name='Battery';battery.position.set(2,3,4);
  const child=new Mesh(new BoxGeometry(),new MeshStandardMaterial());child.name='BatteryPack';battery.add(child);scene.add(battery);
  const entries=mapModel(scene,[bikeParts[0]]);assert.equal(entries.length,1);assert.deepEqual(entries[0].start.toArray(),[2,3,4]);assert.equal(child.userData.partId,'battery');
  assert.deepEqual(entries[0].end.toArray(),[2,2.35,5.55]);
});
test('bundled GLB loads with every mapped assembly and valid geometry',async()=>{
  const file=await readFile('public/models/demo-ebike.glb');
  const gltf=await new GLTFLoader().parseAsync(file.buffer.slice(file.byteOffset,file.byteOffset+file.byteLength),'');
  const entries=mapModel(gltf.scene,bikeParts,false);assert.equal(entries.length,bikeParts.length);assert.equal(entries.length,54);
  assert.ok(entries.every(entry=>entry.materials.length>0));
  let triangles=0;gltf.scene.traverse(o=>{if(o instanceof Mesh){assert.ok(o.geometry.getAttribute('position').count>0);triangles+=(o.geometry.index?.count??o.geometry.getAttribute('position').count)/3;}});
  assert.ok(triangles>1000);assert.ok(triangles<250000);
});
test('desktop annotation slots do not overlap or leave the viewport',()=>{
  const points=interactiveParts.map((p,i)=>({id:p.id,point:{x:240+(i%8)*125,y:100+Math.floor(i/8)*120,visible:true}}));
  const labels=layoutLabels(points,1440,810);
  assert.equal(labels.length,40);
  labels.forEach((p,i)=>{assert.ok(p.y>=0&&p.y+25<810);assert.ok(p.x>=0&&p.x+p.width<=1440);
    labels.slice(i+1).forEach(other=>assert.ok(!(p.x<other.x+other.width&&p.x+p.width>other.x&&p.y<other.y+25&&p.y+25>other.y)));});
});
test('mobile labels reserve two separate rows with live anchors',()=>{
  const points=interactiveParts.slice(0,6).map((p,i)=>({id:p.id,point:{x:50+i*40,y:100+i*30,visible:true}}));
  const labels=layoutLabels(points,320,450);
  assert.equal(labels.length,6);
  assert.equal(labels.filter(p=>p.side==='top').length,3);
  labels.forEach(p=>{assert.ok(p.x>=0&&p.x+p.width<320);assert.ok(p.y>=0&&p.y+40<=450);assert.ok(points.some(a=>a.point===p.anchor));});
});
