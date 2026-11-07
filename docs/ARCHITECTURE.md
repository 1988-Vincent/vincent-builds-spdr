# Architecture / 核心原理

## Data flow

Control panel → parameters → shared `legPose()` → hip/knee/foot coordinates → WebGL meshes or Canvas projection.

Speed advances a phase clock. Stride changes the fore/aft amplitude. Lift scales the positive half of a sine wave. A leg's side and index determine its phase offset.

## Coordinate system

X is lateral; Y is vertical; -Z is the model's forward direction. The torso remains near the origin. Grid motion is not used to imply forward locomotion. Units are arbitrary.

## Foot target

For leg index i in [0,3] and side s in {-1,+1}:

- hip = (0.65s, bodyHeight, -0.85 + 0.58i)
- foot X = s(2.55 + 0.13|i - 1.5|)
- foot Y = 0.07 + max(0, sin(phase + offset)) × lift
- foot Z = -1.7 + 1.1i + cos(phase + offset) × stride

The alternating pattern shifts adjacent legs by π. The wave pattern staggers eight phases by π/4. These are visual gait patterns, not a stability-optimized controller.

## Two-link inverse kinematics

Upper and lower link lengths are 1.8 and 1.9 model units. For hip-to-foot distance d, the projection of the upper link along that direction is:

`along = (L1² - L2² + d²) / (2d)`

The knee offset height is `sqrt(max(0, L1² - along²))`. A preferred outward/upward bend vector is projected onto the plane perpendicular to the hip-to-foot direction. The knee combines that direction with the computed height.

The user-exposed parameter envelope was sampled numerically for reachability. Inputs outside that envelope are not guaranteed to yield a valid leg configuration.

## Rendering

**WebGL:** Three.js procedural sphere/cylinder geometry, lit standard materials, shadows, orbit controls. Joint coordinates drive link orientations.

**Canvas compatibility:** The same joint coordinates drive generated polygon faces. A virtual camera projects 3D points onto a 2D canvas; faces are depth-sorted and shaded. This path has no WebGL requirement but may show painter-order artifacts where geometry intersects. It is not a screenshot or prerecorded animation.

Canvas and WebGL have different shading, camera and body-detail implementations. Foot-path histories are sampled differently; their visual density is not a measurement.

## Controls

All parameters are ephemeral client state. Refresh restores defaults. Screenshot export saves the renderer canvas only, without the surrounding DOM branding or controls. Presentation mode hides the panel; use screen recording to capture the branded page.
