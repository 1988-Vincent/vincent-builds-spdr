# Build notes / 构建记录

These notes describe work completed in this project. They are not a reconstruction of recorded development footage. No elapsed build-time claim is made.

## v0.1 — First prototype

- Created a procedural eight-legged model, body shell, illuminated eyes and mechanical links.
- Added sinusoidal foot trajectories and a two-link IK construction.
- Added alternating/wave patterns, parameters, camera controls, trails and presentation mode.
- WebGL could not initialize in the test browser. Added a Canvas perspective renderer as a compatibility path and visually checked that mode.

## v0.2 — Reviewable source package

- Extracted `lib/gait.ts` so both renderers use the same target positions and IK solver.
- Added numerical checks over 9,216 gait configurations.
- Added English/Chinese documentation, architecture notes, limitations, roadmap and video guide.
- Added a real-source viewer and a sanitized standalone download package.
- Initially retained private Site access; the demo and project page were subsequently made public.

## Public repository edition

- Published standalone React/Vite source to `1988-Vincent/vincent-builds-spdr`.
- Excluded hosted identity, credentials and deployment history.

## Next development footage

Record a new change from its actual starting state: inspect the existing solver, implement steering, run the numerical checks, then compare the demo before and after. Label any explanatory reenactment as a walkthrough, not original build footage.
