export type Vec3 = [number, number, number];
export type Category = 'Power' | 'Performance' | 'Control' | 'Chassis' | 'Safety';
export interface BikePart {
  id: string; name: string; shortName: string; category: Category; description: string;
  meshNames: string[]; specifications: { label: string; value: string }[];
  assembled: { position: Vec3; rotation: Vec3 };
  exploded: { position: Vec3; rotation: Vec3 };
  camera: { position: Vec3; target: Vec3 };
  interval: [number, number]; interactive: boolean;
}
export interface MotionState { scroll: number; explosion: number; }
