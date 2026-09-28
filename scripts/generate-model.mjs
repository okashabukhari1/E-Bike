import * as T from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
const hardware=JSON.parse(await readFile('src/data/hardware.json','utf8'));
globalThis.FileReader=class { readAsArrayBuffer(blob) { blob.arrayBuffer().then(result=>{this.result=result;this.onloadend?.();}); } readAsDataURL(blob) { blob.arrayBuffer().then(result=>{this.result=`data:${blob.type};base64,${Buffer.from(result).toString('base64')}`;this.onloadend?.();}); } };
const scene=new T.Scene(); scene.name='FORMA_Demo_Scooter';
const mat=(name,color,metalness=.4,roughness=.35)=>new T.MeshStandardMaterial({name,color,metalness,roughness});
const black=mat('Graphite satin',0x242727,.65,.29), trim=mat('Black polymer',0x101212,.1,.6), silver=mat('Machined aluminum',0xa9b4b7,.85,.25), rubber=mat('Road rubber',0x151616,.02,.86), brown=mat('Cognac upholstery',0x754231,.03,.76), bronze=mat('Copper detail',0xd08554,.65,.33), cell=mat('Battery casing',0x363c38,.65,.48);
const led=mat('LED lens',0xeaf5f1,.1,.15);led.emissive.set(0xc7e6e1);led.emissiveIntensity=2;
const red=mat('Tail light',0x7c160a,.2,.3);red.emissive.set(0xed3415);red.emissiveIntensity=1.3;
function group(name,p=[0,0,0]) { const g=new T.Group();g.name=name;g.position.set(...p);scene.add(g);return g; }
function mesh(g,geometry,material,p=[0,0,0],r=[0,0,0]) {const m=new T.Mesh(geometry,material);m.position.set(...p);m.rotation.set(...r);m.name=`${g.name}_${g.children.length}`;g.add(m);return m;}
function box(g,size,p,material=black,r=[0,0,0],radius=.07) {return mesh(g,new RoundedBoxGeometry(...size,3,radius),material,p,r);}
function cyl(g,r1,r2,h,p,material=silver,r=[Math.PI/2,0,0]) {return mesh(g,new T.CylinderGeometry(r1,r2,h,40),material,p,r);}
function rod(g,a,b,r,material=silver) {const av=new T.Vector3(...a),bv=new T.Vector3(...b),d=bv.clone().sub(av);const m=mesh(g,new T.CylinderGeometry(r,r,d.length(),16),material,av.add(bv).multiplyScalar(.5).toArray());m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());return m;}
function profile(g,points,depth,material=black) {const s=new T.Shape();points.forEach(([x,y],i)=>i?s.lineTo(x,y):s.moveTo(x,y));s.closePath(); const geo=new T.ExtrudeGeometry(s,{depth,bevelEnabled:true,bevelThickness:.035,bevelSize:.045,bevelSegments:3,steps:1});geo.translate(0,0,-depth/2);return mesh(g,geo,material);}
const frame=group('Frame');
rod(frame,[-1.36,.84,0],[-.83,.34,0],.09);rod(frame,[-.83,.34,0],[1.19,.51,0],.09);rod(frame,[1.19,.51,0],[.7,1.35,0],.08);rod(frame,[.7,1.35,0],[-.03,1.32,0],.07);
box(frame,[1.75,.13,.72],[-.03,.43,0],trim);box(frame,[1.53,.035,.61],[-.1,.52,0],black);
for(let i=0;i<9;i++)box(frame,[.018,.012,.52],[-.75+i*.15,.548,0],silver,[0,0,0],.003);
profile(group('FrontCover'),[[-.83,.3],[-1.34,1.4],[-1.48,1.46],[-1.03,.26],[1.05,.26],[1.28,.49],[.95,.55]],.64);
for(const [name,x] of [['FrontWheel',-1.4],['RearWheel',1.24]]) {
  const g=group(name,[x,.54,0]);
  mesh(g,new T.TorusGeometry(.405,.125,16,64),rubber);
  cyl(g,.32,.32,.19,[0,0,0],black);cyl(g,.1,.1,.27,[0,0,0],silver);
  for(const z of [-.105,.105]) {mesh(g,new T.TorusGeometry(.315,.018,8,48),silver,[0,0,z]); for(let i=0;i<6;i++) {const a=i*Math.PI/3;box(g,[.07,.5,.028],[0,0,z],silver,[0,0,a],.018);}}
  for(let i=0;i<48;i++){const a=i*Math.PI/24;box(g,[.024,.035,.2],[Math.sin(a)*.518,Math.cos(a)*.518,0],trim,[0,0,-a+.22],.004);}
}
for(const [name,x,z,r] of [['FrontBrake',-1.4,.17,.255],['RearBrake',1.24,-.18,.22]]) {
  const g=group(name,[x,.54,z]);cyl(g,r,r,.018,[0,0,0],silver);cyl(g,.09,.09,.045,[0,0,0],black);
  for(let i=0;i<18;i++){const a=i*Math.PI/9;cyl(g,.012,.012,.021,[Math.sin(a)*(r-.045),Math.cos(a)*(r-.045),.001],trim);}
  if(name==='FrontBrake'){const caliper=group('FrontCaliper',[x+r-.02,.61,z]);box(caliper,[.13,.23,.1],[0,0,.015],black);}
}
const fork=group('FrontForkLeft',[-1.4,.54,.23]);rod(fork,[0,0,0],[.15,.61,0],.044,black);rod(fork,[.15,.55,0],[.23,.89,0],.031,silver);
const rightFork=group('FrontForkRight',[-1.4,.54,-.23]);rod(rightFork,[0,0,0],[.15,.61,0],.044,black);rod(rightFork,[.15,.55,0],[.23,.89,0],.031,silver);
rod(frame,[-1.2,1.37,-.26],[-1.2,1.37,.26],.05,silver);
const panel=group('FrontPanel',[-1.15,1.12,0]);profile(panel,[[-.39,-.07],[-.4,.28],[-.14,.95],[.11,1.02],[.3,.85],[.11,.15],[.15,-.14]],.53);
box(panel,[.04,.42,.36],[-.25,.56,0],trim,[0,0,-.31]);
const fender=group('FrontFender',[-1.4,.54,0]);mesh(fender,new T.TorusGeometry(.58,.055,8,40,Math.PI),black);
for(const [name,z] of [['LeftPanel',.34],['RightPanel',-.34]]) {
  const g=group(name,[.58,.97,z]);profile(g,[[-.73,-.25],[-.7,.29],[.58,.37],[.85,.16],[.86,-.24]],.08);
  box(g,[.09,.37,.019],[-.31,-.005,z>0?.071:-.071],silver,[0,0,-.15],.014);
  box(g,[.43,.02,.02],[.21,-.13,z>0?.071:-.071],bronze,[0,0,0],.005);
}
const seat=group('Seat',[.49,1.43,0]);box(seat,[1.66,.24,.78],[0,0,0],brown,[0,0,.055],.115);const seatBase=group('SeatBase',[.49,1.29,0]);box(seatBase,[1.59,.09,.73],[0,0,0],trim);
box(seat,[.64,.04,.68],[.42,.12,0],brown,[0,0,.025],.018);
const back=group('Backrest',[1.28,1.75,0]);rod(back,[0,-.39,0],[.09,.11,0],.035);box(back,[.17,.35,.65],[.1,.13,0],brown,[0,0,.12],.08);
const battery=group('Battery',[.43,.88,0]);box(battery,[.78,.47,.46],[0,0,0],cell);box(battery,[.7,.05,.39],[0,.245,0],trim);
for(let i=0;i<7;i++)box(battery,[.035,.35,.014],[-.3+i*.1,0,.238],black,[0,0,0],.006);
box(battery,[.22,.13,.014],[.06,.04,.253],bronze);rod(battery,[-.18,.29,0],[.18,.29,0],.028,trim);
const controller=group('Controller',[.98,.96,0]);box(controller,[.28,.36,.41],[0,0,0],silver);for(let i=0;i<7;i++)box(controller,[.018,.28,.44],[-.12+i*.04,0,0],black,[0,0,0],.003);
const motor=group('Motor',[1.24,.54,.28]);cyl(motor,.26,.26,.18,[0,0,0],black);cyl(motor,.19,.19,.19,[0,0,0],silver);cyl(motor,.065,.065,.21,[0,0,0],black);
const shock=group('RearSuspension',[1.14,.88,0]);for(const z of [-.29,.29]) {rod(shock,[.13,-.3,z],[-.13,.28,z],.03);for(let i=0;i<10;i++)mesh(shock,new T.TorusGeometry(.057,.012,6,16),silver,[.08-i*.019,-.2+i*.047,z],[Math.PI/2,0,.37]);}
const bars=group('Handlebar',[-1.13,2.14,0]);rod(bars,[0,-.27,0],[0,0,0],.043,black);rod(bars,[0,0,-.55],[0,0,.55],.032);
const throttle=group('ThrottleGrip',[-1.13,2.14,.46]);rod(throttle,[0,0,-.12],[0,0,.12],.051,trim);
const switches=group('SwitchesLeft',[-1.13,2.14,-.46]);rod(switches,[0,0,-.12],[0,0,.12],.051,trim);box(switches,[.12,.12,.13],[0,0,.14],black);
const lever=group('BrakeLever',[-1.25,2.12,.46]);rod(lever,[0,0,-.15],[-.04,.01,.12],.016,silver);
const display=group('Display',[-1.12,2.16,0]);box(display,[.18,.22,.34],[0,0,0],black,[0,0,-.4],.035);box(display,[.025,.15,.25],[.085,.018,0],trim,[0,0,-.4],.015);box(display,[.026,.025,.13],[.09,.035,0],led,[0,0,-.4],.006);
for(const [name,z] of [['MirrorLeft',.5],['MirrorRight',-.5]]) {const g=group(name,[-1.13,2.14,z]);rod(g,[0,0,0],[-.09,.3,z*.16],.013,black);box(g,[.075,.19,.24],[-.1,.37,z*.16],black,[0,.1,0],.06);box(g,[.013,.145,.19],[-.055,.37,z*.16],silver,[0,.1,0],.035);}
const light=group('Headlight',[-1.49,1.33,0]);box(light,[.11,.25,.48],[0,0,0],silver,[0,0,-.18],.045);box(light,[.12,.19,.4],[-.01,0,0],led,[0,0,-.18],.035);box(light,[.13,.13,.26],[-.02,0,0],trim,[0,0,-.18],.02);cyl(light,.062,.062,.145,[-.04,0,0],led,[0,0,Math.PI/2]);
const charge=group('ChargingSystem',[.81,.69,-.3]);box(charge,[.16,.16,.07],[0,0,0],trim);cyl(charge,.05,.05,.08,[0,0,0],bronze);
const tail=group('TailLight',[1.47,1.07,0]);box(tail,[.07,.13,.4],[0,0,0],red);
const visor=group('FrontVisor',[-1.25,2.02,0]);box(visor,[.12,.28,.4],[0,0,0],black,[0,0,-.2],.045);
const rearFender=group('RearFender',[1.24,.54,0]);mesh(rearFender,new T.TorusGeometry(.58,.06,8,40,Math.PI*.65),black,[0,0,0],[0,0,-.28]);box(rearFender,[.09,.3,.2],[.54,-.03,0],trim,[0,0,.2]);
const lock=group('SeatLock',[.02,1.24,.26]);box(lock,[.18,.1,.12],[0,0,0],silver);cyl(lock,.038,.038,.13,[0,0,0],black);
const frontSpring=group('FrontSuspension',[-1.28,1.18,0]);
for(const z of [-.23,.23]){for(let i=0;i<9;i++)mesh(frontSpring,new T.TorusGeometry(.055,.012,6,16),silver,[i*.008,i*.025-.1,z],[Math.PI/2,0,-.15]);}
const cover=group('BatteryCover',[.35,.6,0]);box(cover,[1.07,.07,.62],[0,0,0],black);for(const z of [-.25,.25])box(cover,[1,.07,.04],[0,.05,z],trim);
const motorCover=group('MotorCover',[1.23,.55,.43]);box(motorCover,[.68,.29,.11],[0,0,0],silver);box(motorCover,[.48,.035,.13],[0,.07,.02],black);
const sideStand=group('SideStand',[.52,.34,.34]);rod(sideStand,[0,0,0],[.18,-.31,.08],.024,black);box(sideStand,[.15,.025,.1],[.18,-.31,.08],black);cyl(sideStand,.045,.045,.09,[0,0,0]);
const mainStand=group('MainStand',[.3,.29,0]);for(const z of [-.25,.25]){rod(mainStand,[0,0,z],[.12,-.27,z],.026,black);box(mainStand,[.19,.035,.1],[.15,-.27,z],black);}rod(mainStand,[0,0,-.25],[0,0,.25],.025,black);
const amber=mat('Amber indicator',0xe49524,.15,.3);amber.emissive.set(0xc9680b);amber.emissiveIntensity=.65;
for(const [name,x,y] of [['FrontSignals',-1.42,1.1],['RearSignals',1.47,.94]]){const signals=group(name,[x,y,0]);for(const z of [-.41,.41]){rod(signals,[0,0,z*.6],[0,0,z],.02,black);box(signals,[.12,.065,.08],[0,0,z],amber,[0,0,0],.02);}}
// Chassis crossmembers, battery cage and mounting tabs exposed behind the shell.
for(const z of [-.27,.27]){
  rod(frame,[-.83,.35,z],[1.05,.43,z],.032,silver);
  rod(frame,[-.15,.48,z],[-.15,1.24,z],.027,silver);
  rod(frame,[.9,.5,z],[.9,1.24,z],.027,silver);
  rod(frame,[-.15,1.24,z],[.9,1.24,z],.027,silver);
  for(let i=0;i<5;i++){const x=-.1+i*.23;box(frame,[.065,.09,.024],[x,1.18,z],silver,[0,0,0],.009);cyl(frame,.012,.012,.031,[x,1.18,z],trim);}
}
for(const x of [-.4,.05,.5,.95])rod(frame,[x,.4,-.28],[x,.4,.28],.026,silver);
for(const mount of hardware){
  const g=group(mount.mesh,mount.anchor);
  for(let i=0;i<mount.count;i++){
    const u=(i/Math.max(1,mount.count-1)-.5)*mount.span;
    const bolt=new T.Group();bolt.position.set(mount.axis==='x'?0:u,(i%2-.5)*.13,mount.axis==='x'?u:0);
    if(mount.axis==='z')bolt.rotation.x=Math.PI/2;
    if(mount.axis==='x')bolt.rotation.z=Math.PI/2;
    g.add(bolt);
    const shaft=new T.Mesh(new T.CylinderGeometry(.011,.011,.075,10),silver);bolt.add(shaft);
    const head=new T.Mesh(new T.CylinderGeometry(.022,.022,.016,6),silver);head.position.y=.042;bolt.add(head);
    const washer=new T.Mesh(new T.TorusGeometry(.019,.004,5,12),silver);washer.rotation.x=Math.PI/2;washer.position.y=.025;bolt.add(washer);
  }
  // Bake each bolt's local transform before the per-assembly material batching pass.
  g.updateMatrixWorld(true);
  const baked=[];
  g.traverse(child=>{if(child.isMesh){const local=new T.Matrix4().copy(g.matrixWorld).invert().multiply(child.matrixWorld);const geometry=child.geometry.clone().applyMatrix4(local);baked.push(new T.Mesh(geometry,child.material));}});
  g.clear();baked.forEach(m=>g.add(m));
}
// Batch only within an assembly: preserve independent movement and material identity.
// Batch only within an assembly: preserve independent movement and material identity.
let drawCalls=0;
for(const assembly of scene.children){
  const batches=new Map();
  for(const child of [...assembly.children]){child.updateMatrix();const geometry=child.geometry.clone().applyMatrix4(child.matrix);if(!geometry.index)geometry.setIndex(Array.from({length:geometry.getAttribute('position').count},(_,i)=>i));const list=batches.get(child.material)??[];list.push(geometry);batches.set(child.material,list);assembly.remove(child);}
  for(const [material,geometries] of batches){const merged=mergeGeometries(geometries);const m=new T.Mesh(merged,material);m.name=`${assembly.name}_${material.name.replaceAll(' ','_')}`;assembly.add(m);drawCalls++;geometries.forEach(g=>g.dispose());}
}
const buffer=await new GLTFExporter().parseAsync(scene,{binary:true});await mkdir('public/models',{recursive:true});await writeFile('public/models/demo-ebike.glb',Buffer.from(buffer));console.log(`Generated demo GLB: ${(buffer.byteLength/1024).toFixed(0)} KB, ${scene.children.length} addressable groups, ${drawCalls} material batches`);
