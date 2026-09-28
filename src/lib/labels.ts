export interface ProjectedPart { x:number; y:number; visible:boolean; }
export type ProjectionStore = Map<string, ProjectedPart>;
export interface LabelPlacement { id:string; x:number; y:number; width:number; side:'left'|'right'|'top'|'bottom'; anchor:ProjectedPart; }

const offsets:Record<string,[number,number]>={
  'mirror-left':[-215,-65],'mirror-right':[65,-110],display:[-70,-120],handlebar:[55,-40],
  visor:[-220,-55],throttle:[65,-25],switches:[-205,35],'brake-lever':[35,-90],
  seat:[-50,-72],backrest:[65,-40],'seat-base':[100,-35],'seat-lock':[-200,-20],
  'front-panel':[-215,-25],headlight:[-220,-40],'front-signals':[-220,40],
  'left-panel':[65,25],'right-panel':[-170,-70],'tail-light':[75,-55],'rear-signals':[90,-10],
  suspension:[-200,-65],'rear-fender':[95,50],frame:[-160,-65],
  'front-cover':[-210,25],'front-fender':[-205,-20],'front-spring':[-210,-45],
  fork:[-160,75],'fork-right':[35,65],'front-wheel':[-170,95],'front-brake':[-130,130],
  'front-caliper':[35,90],battery:[-80,100],'battery-cover':[-80,105],controller:[50,90],
  motor:[90,15],'rear-wheel':[90,65],'rear-brake':[-180,60],'motor-cover':[75,65],
  'side-stand':[55,80],'main-stand':[-135,95],charging:[-170,80],
};

/** Reserve distinct text slots; leaders still terminate at the live 3D anchor. */
export function layoutLabels(points:{id:string;point:ProjectedPart}[], width:number, height:number):LabelPlacement[] {
  if(!points.length)return [];
  const mobile=width<700;
  if(mobile){
    const sorted=[...points].sort((a,b)=>a.point.y-b.point.y);
    const rows=[sorted.slice(0,Math.ceil(sorted.length/2)),sorted.slice(Math.ceil(sorted.length/2))];
    return rows.flatMap((row,index)=>row.sort((a,b)=>a.point.x-b.point.x).map(({id,point},i)=>({
      id,anchor:point,side:index===0?'top':'bottom',width:(width-24)/Math.max(3,row.length)-8,
      x:12+i*(width-24)/Math.max(3,row.length),y:index===0?8:height-48,
    })));
  }
  const placed:LabelPlacement[]=[];
  const labelWidth=width<1000?135:170, labelHeight=30;
  const scale=Math.min(1,width/1440);
  const clamp=(v:number,max:number)=>Math.max(10,Math.min(max,v));
  for(const {id,point} of [...points].sort((a,b)=>a.point.y-b.point.y)){
    const [dx,dy]=offsets[id]??[60,-45];
    const wantedX=point.x+dx*scale,wantedY=point.y+dy*scale;
    let best={x:10,y:10,score:Infinity};
    // Prefer short leaders, move the label only as far as avoiding collisions requires.
    for(const ox of [0,-90,90,-180,180])for(const oy of [0,-34,34,-68,68,-102,102,-136,136]){
      const x=clamp(wantedX+ox,width-labelWidth-10),y=clamp(wantedY+oy,height-labelHeight-10);
      const collisions=placed.reduce((count,p)=>count+(x<p.x+p.width+8&&x+labelWidth+8>p.x&&y<p.y+labelHeight+5&&y+labelHeight+5>p.y?1:0),0);
      const score=collisions*1e6+Math.abs(ox)*.9+Math.abs(oy);
      if(score<best.score)best={x,y,score};
    }
    placed.push({id,anchor:point,x:best.x,y:best.y,width:labelWidth,side:best.x+labelWidth/2<point.x?'left':'right'});
  }
  return placed;
}
