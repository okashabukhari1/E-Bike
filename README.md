# FORMA F01 — interactive e-bike engineering study

Next.js, React, TypeScript, Tailwind CSS, Three.js / React Three Fiber, Drei and GSAP ScrollTrigger. The hero is a real loaded GLB, never a video or image animation.

## Run

Requires Node.js 22 or newer.

```sh
npm ci
npm run dev
```

Open http://localhost:3000. `npm run build` creates the production app; `npm start` serves it. `npm run typecheck` checks strict TypeScript. `npm test` validates actual GLB loading, mapping, missing objects and reversible interpolation.

## Replace the demo vehicle

1. Place the final asset at `public/models/ebike.glb`. Restart development or rebuild production. The page automatically chooses that file when present; otherwise it loads the bundled `demo-ebike.glb`.
2. Edit **src/data/bikeParts.ts**. Each record contains mesh/group aliases, category, specifications, assembly offsets, exploded offsets, rotation offsets, staging interval and inspection camera offsets.
3. Export with Y up, wheels along X, front toward negative X, a roughly 3.8-unit overall length and ground at Y=0. Apply scale in your modeling package. Keep major assemblies in independently named groups and center their pivots sensibly. The demo generator documents the convention.
4. Match aliases exactly. Multiple objects matching a record move together. If both a group and a descendant match, only the group is animated. Avoid mapping an ancestor and its descendant to different part records; split them into sibling groups for independent movement.
5. All configured positions and rotations are offsets from authored transforms in the matched object's **parent coordinate system**, not absolute scene coordinates. Zero assembled offsets preserve the original asset. Exploded offsets use the model's exported units. Rotation values are radians; camera offsets are world-space vectors relative to the selected part's bounding center.
6. Visit `/?debug` in development and inspect the browser console for the hierarchy table: names, object types, parent groups and materials. Missing mapped objects produce a specific warning and do not interrupt rendering. Never expose debug diagnostics in production.

The supplied PNG is used only as the error/WebGL fallback. The video is not used. The demo GLB is procedural and intentionally approximate: final manufacturer-quality geometry, UVs and PBR textures are still needed for a photorealistic match to the reference. All vehicle specifications are illustrative.

The reference-inspired demo has 54 independently movable groups, including 14 fastening sets. Forty components have selectable descriptions and leader labels in the inspection stage; mobile pages the labels six at a time. The demo geometry and specifications are illustrative.

## Interaction architecture

- `useExplodedProgress`: pinned, scrubbed page scroll. The progression is deterministic and reverses exactly. There is no explosion slider. ScrollTrigger updates a mutable motion ref; React state changes only at chapter boundaries.
- `lib/animation.ts`: assembled → staged explosion → inspection hold → reassembly.
- `BikeModel`: native GLTF hierarchy, preserved materials, raycast hover/tap selection, independent transforms. Touch movement cancels selection so scrolling remains natural.
- `BikeCamera`: damped camera choreography, aspect-ratio-aware full assembly framing and selected-part focus. The mobile panel reserves a separate canvas area.
- `BikeScene`: lazy client-only WebGL, Suspense, progress UI, local environment lighting, bounded adaptive DPR, load/error/context-loss fallbacks. Meshopt is enabled; Draco decoder files are served locally from `public/draco`.
- `PartPanel`: data-driven modal inspector with focus trapping, Escape/close and scroll lock. HTML component disclosures provide the full content independently of WebGL.

Reduced motion switches between assembly states and holds camera movement to a minimum. Navigation and HTML controls work by keyboard. The loading interface provides slow-network guidance.

## Asset and performance guidance

Merge geometry **within** each logical component by material, not across independent components. Keep object/material counts low, reuse textures, remove invisible internal detail, and prefer 1K–2K textures. Use Meshopt or Draco geometry compression after confirming exporter compatibility; use optimized textures or KTX2 with an added KTX2Loader when needed. Recheck offsets, bounds and selection after each asset revision. Test on physical phones before a public launch.

`npm run generate:model` rebuilds only the supplied demo asset. It never overwrites `ebike.glb`.

## Reference review

Reviewed [Human Atlas](https://github.com/ashemag/human-atlas), particularly `app/scene.tsx`, `app/explosion-layout.ts` and `app/pointer-tap.ts`. Its selection isolation, available-space camera framing and tap-versus-drag concepts informed validation. This project has its own R3F implementation and mechanically directed offsets; it does not reuse anatomy assets or inventory-grid layouts. Page scroll, not a slider, drives assembly.
