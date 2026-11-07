/** Deterministic kinematics shared by the WebGL and Canvas renderers.
 * Coordinates are model units, not calibrated metres. Y is up; -Z is forward.
 */
export type Vec3 = [
    number,
    number,
    number
];
export type GaitInput = {
    side: number;
    index: number;
    phase: number;
    bodyHeight: number;
    stride: number;
    lift: number;
    gait: string;
};
export const UPPER_LENGTH = 1.8;
export const LOWER_LENGTH = 1.9;
export function legPose({ side, index, phase, bodyHeight, stride, lift, gait }: GaitInput) {
    const offset = gait === 'wave' ? (index + (side === 1 ? 4 : 0)) * Math.PI / 4 : ((index + (side === 1 ? 1 : 0)) % 2) * Math.PI;
    const angle = phase + offset;
    const hip: Vec3 = [side * .65, bodyHeight, -.85 + index * .58];
    const foot: Vec3 = [side * (2.55 + Math.abs(index - 1.5) * .13), .07 + Math.max(0, Math.sin(angle)) * lift, -1.7 + index * 1.1 + Math.cos(angle) * stride];
    const d = foot.map((v, i) => v - hip[i]) as Vec3;
    const length = Math.hypot(...d);
    const direction = d.map(v => v / length) as Vec3;
    const along = (UPPER_LENGTH ** 2 - LOWER_LENGTH ** 2 + length ** 2) / (2 * length);
    const height = Math.sqrt(Math.max(0, UPPER_LENGTH ** 2 - along ** 2));
    const bend: Vec3 = [side * .7, 1.2, 0];
    const projection = bend.reduce((sum, v, i) => sum + v * direction[i], 0);
    const perpendicular = bend.map((v, i) => v - projection * direction[i]);
    const magnitude = Math.hypot(...perpendicular);
    const knee = hip.map((v, i) => v + direction[i] * along + perpendicular[i] / magnitude * height) as Vec3;
    return { hip, knee, foot, reachable: length <= UPPER_LENGTH + LOWER_LENGTH && length >= Math.abs(UPPER_LENGTH - LOWER_LENGTH) };
}
