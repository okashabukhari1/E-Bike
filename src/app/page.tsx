import { existsSync } from 'node:fs';
import { join } from 'node:path';
import Experience from '@/components/Experience';
export default function Home() {
  const productionModel = existsSync(join(process.cwd(), 'public/models/ebike.glb'));
  return <Experience modelUrl={productionModel ? '/models/ebike.glb' : '/models/demo-ebike.glb'} isDemo={!productionModel} />;
}
