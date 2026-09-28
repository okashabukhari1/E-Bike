import { ContactShadows, Environment, Lightformer } from '@react-three/drei';
export default function BikeLighting() {
  return <>
    <ambientLight intensity={.55}/>
    <hemisphereLight args={['#c7d5cd','#454137',.6]}/>
    <directionalLight position={[-3,6,4]} intensity={3.2} color="#f3e5d5" />
    <directionalLight position={[3,4,-4]} intensity={4} color="#b1c8d4" />
    <spotLight position={[-4,3,-2]} intensity={30} angle={.65} penumbra={1} color="#e8a16e" />
    <Environment resolution={128} frames={1}>
      <Lightformer form="rect" intensity={3} position={[0,5,0]} rotation={[Math.PI/2,0,0]} scale={[8,4,1]}/>
      <Lightformer form="rect" intensity={2} position={[0,2,-5]} scale={[7,3,1]}/>
      <Lightformer form="rect" intensity={2} position={[-4,2,3]} rotation={[0,Math.PI/3,0]} scale={[3,5,1]}/>
    </Environment>
    <ContactShadows position={[0,-.12,0]} opacity={.38} scale={18} blur={2.8} far={5} resolution={256} frames={1} />
  </>;
}
