import type { BikePart, Category, Vec3 } from '@/types/bike';

export function part(id: string, name: string, shortName: string, category: Category, meshNames: string[], position: Vec3, interval: [number, number], description: string, specs: [string, string][], rotation: Vec3 = [0, 0, 0]): BikePart {
  return {
    id, name, shortName, category, meshNames, description,
    specifications: specs.map(([label, value]) => ({ label, value })),
    assembled: { position: [0, 0, 0], rotation: [0, 0, 0] },
    exploded: { position, rotation }, interval, interactive: true,
    camera: { position: [1.7, 1, 4], target: [0, 0, 0] },
  };
}
