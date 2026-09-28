import { Box3, Mesh, MeshStandardMaterial, Object3D, Quaternion, Euler, Vector3 } from 'three';
import type { BikePart } from '@/types/bike';
export function inspectModel(scene: Object3D) {
  const rows: {name:string;type:string;parent:string;materials:string}[] = [];
  scene.traverse(o => { const m = o as Mesh; rows.push({ name: o.name || '(unnamed)', type:o.type, parent:o.parent?.name || 'root', materials:m.isMesh ? (Array.isArray(m.material) ? m.material : [m.material]).map(x=>x.name || x.type).join(', ') : '—' }); });
  console.group('FORMA GLTF hierarchy'); console.table(rows); console.groupEnd(); return rows;
}
export function mapModel(scene: Object3D, config: BikePart[], warn = true) {
  const used = new Set<Object3D>();
  const entries = config.flatMap(part => {
    const found: Object3D[] = [];
    scene.traverse(object => { if (part.meshNames.includes(object.name)) found.push(object); });
    // A group and its descendants must never receive the same offset twice.
    const roots = found.filter(o => { let parent=o.parent; while(parent) { if(found.includes(parent)) return false; parent=parent.parent; } return true; });
    if (!roots.length && warn) console.warn(`[FORMA] Missing ${part.id}: expected ${part.meshNames.join(' / ')}. Update src/data/bikeParts.ts.`);
    return roots.filter(object => { if(used.has(object)) return false; used.add(object); return true; }).map(object => {
      const materials: { material: MeshStandardMaterial; color: import('three').Color; emissive: import('three').Color; intensity: number }[] = [];
      object.traverse(child => { child.userData.partId=part.id; if(child instanceof Mesh) {
        child.castShadow=true; child.receiveShadow=true;
        const clone = (m: import('three').Material) => { const material = m.clone(); if(material instanceof MeshStandardMaterial) materials.push({material,color:material.color.clone(),emissive:material.emissive.clone(),intensity:material.emissiveIntensity}); return material; };
        child.material=Array.isArray(child.material) ? child.material.map(clone) : clone(child.material);
      }});
      const baseline=object.position.clone();
      const start=baseline.clone().add(new Vector3(...part.assembled.position));
      const end=baseline.clone().add(new Vector3(...part.exploded.position));
      const rotation=object.quaternion.clone();
      const bounds=new Box3().setFromObject(object);
      const radius=bounds.getSize(new Vector3()).length()/2;
      const center=object.worldToLocal(bounds.getCenter(new Vector3()));
      return { part, object, start, end, startRotation:rotation.clone().multiply(new Quaternion().setFromEuler(new Euler(...part.assembled.rotation))), endRotation:rotation.clone().multiply(new Quaternion().setFromEuler(new Euler(...part.exploded.rotation))), materials, center, radius };
    });
  });
  return entries;
}
