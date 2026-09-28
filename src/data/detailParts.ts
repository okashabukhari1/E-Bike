import { part } from './partFactory';
import type { BikePart, Category, Vec3 } from '@/types/bike';
import hardware from './hardware.json';

type Detail = [string, string, string, Category, Vec3, string, [string, string][]];
const details: Detail[] = [
  ['front-panel','Front panel','FrontPanel','Chassis',[-.8,.2,0],'The sculpted front shell protects the steering assembly and routes airflow around the rider.',[['Material','Molded polymer'],['Finish','Satin graphite']]],
  ['left-panel','Side panel (left)','LeftPanel','Chassis',[.15,.12,1.05],'A removable side shell provides access to the battery enclosure and rear frame mounts.',[['Mounting','Removable'],['Finish','Satin graphite']]],
  ['right-panel','Side panel (right)','RightPanel','Chassis',[.15,.12,-.85],'The opposite body shell completes the enclosure while remaining independently serviceable.',[['Construction','Molded shell'],['Mounting','Screw secured']]],
  ['backrest','Backrest','Backrest','Chassis',[.65,.9,0],'A padded passenger support transfers load to a separate alloy mounting bracket.',[['Upholstery','Cognac'],['Support','Alloy bracket']]],
  ['mirror-left','Rear view mirror (left)','MirrorLeft','Safety',[-.5,.75,.45],'An adjustable mirror on a threaded stalk gives the rider a clear rearward view.',[['Mount','Threaded stalk'],['Adjustment','Pivot joint']]],
  ['mirror-right','Rear view mirror (right)','MirrorRight','Safety',[-.2,.75,-.6],'The right mirror separates from the handlebar independently for adjustment and replacement.',[['Mount','Threaded stalk'],['Lens','Reflective glass']]],
  ['visor','Front visor cover','FrontVisor','Chassis',[-.85,.65,.2],'The removable upper cover shields the display mount and steering head fasteners.',[['Material','Polymer'],['Finish','Graphite']]],
  ['front-cover','Front lower cover','FrontCover','Chassis',[-.65,-.05,.6],'A lower splash shield protects the front frame junction and internal routing.',[['Role','Splash protection'],['Mounting','Removable']]],
  ['front-fender','Front fender','FrontFender','Chassis',[-.9,.12,.3],'A close-fitting guard follows the wheel and diverts water away from the chassis.',[['Material','Polymer'],['Location','Front wheel']]],
  ['rear-fender','Rear fender','RearFender','Chassis',[1.05,.08,-.25],'The rear guard supports road-spray protection behind the driven wheel.',[['Material','Polymer'],['Location','Rear wheel']]],
  ['seat-base','Seat base','SeatBase','Chassis',[.1,.63,0],'A separate structural pan supports the cushion and distributes rider load into the upper chassis.',[['Construction','Reinforced pan'],['Attachment','Hinged mount']]],
  ['seat-lock','Seat lock mechanism','SeatLock','Chassis',[-.15,.5,.65],'The latch locates and secures the seat base while preserving service access below it.',[['Mechanism','Mechanical latch'],['Housing','Steel']]],
  ['throttle','Throttle grip','ThrottleGrip','Control',[-.35,.5,.8],'A rotary input translates wrist movement into a request for motor torque.',[['Input','Rotary sensor'],['Grip','Textured rubber']]],
  ['switches','Switches (left)','SwitchesLeft','Control',[-.6,.5,-.65],'A compact switch housing places lighting and signaling controls within thumb reach.',[['Controls','Lights / signals'],['Housing','Sealed polymer']]],
  ['brake-lever','Brake lever (front)','BrakeLever','Safety',[-.9,.52,.8],'The lever converts hand pressure into hydraulic braking force through the master cylinder.',[['Material','Alloy'],['Actuation','Hydraulic']]],
  ['front-caliper','Brake caliper (front)','FrontCaliper','Safety',[-.65,-.2,1.05],'The caliper applies opposing pads to the front rotor for predictable deceleration.',[['Pistons','2'],['Body','Alloy']]],
  ['fork-right','Front fork (right)','FrontForkRight','Performance',[-.55,.05,-.65],'The right telescopic leg guides wheel travel and shares braking loads with the opposite fork.',[['Stanchion','30 mm'],['Travel','80 mm']]],
  ['front-spring','Front suspension spring','FrontSuspension','Performance',[-.6,.45,.6],'A coil spring and damper assembly manages front suspension travel and rebound.',[['Type','Coil spring'],['Damping','Hydraulic']]],
  ['battery-cover','Battery cover','BatteryCover','Power',[0,-.95,.65],'A removable lower tray protects the battery compartment and provides a defined service opening.',[['Material','Reinforced polymer'],['Protection','Lower enclosure']]],
  ['motor-cover','Motor cover','MotorCover','Power',[.8,-.35,1.1],'A separate protective housing shields the rear drive interface and its electrical connection.',[['Material','Alloy'],['Mounting','Bolted cover']]],
  ['side-stand','Side stand','SideStand','Chassis',[.5,-.6,1.2],'A pivoting support holds the vehicle at rest with a spring-assisted return.',[['Material','Steel'],['Return','Spring assisted']]],
  ['main-stand','Main stand','MainStand','Chassis',[.35,-.9,-.25],'A two-foot support lifts the rear wheel for stable parking and routine service.',[['Material','Steel'],['Layout','Twin foot']]],
  ['front-signals','Front turn signals','FrontSignals','Safety',[-1,.1,.65],'Paired amber indicators sit independently from the headlight enclosure.',[['Light source','LED'],['Color','Amber']]],
  ['rear-signals','Rear turn signals','RearSignals','Safety',[1.05,.4,.5],'Rear indicators provide a distinct directional signal on both sides of the vehicle.',[['Light source','LED'],['Color','Amber']]],
  ['tail-light','Tail light assembly','TailLight','Safety',[1.15,.4,-.3],'The separate rear lamp combines position and braking illumination in one sealed housing.',[['Light source','LED'],['Functions','Tail / brake']]],
];

export const detailParts: BikePart[] = details.map(([id,name,mesh,category,offset,description,specs]) =>
  part(id,name,name,category,[mesh],offset,[.25,.78],description,specs));

// Independent fastening sets reveal the mounting logic without random trajectories.
export const fastenerParts: BikePart[] = hardware.map(h => ({
  ...part(h.id,h.name,h.name,'Chassis',[h.mesh],h.offset as Vec3,[.55,1],'Service fasteners retain the corresponding assembly.',[]),
  interactive:false,
}));
