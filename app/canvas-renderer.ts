import { legPose } from '../lib/gait';
type V = [
    number,
    number,
    number
];
const add = (a: V, b: V): V => [a[0] + b[0], a[1] + b[1], a[2] + b[2]], sub = (a: V, b: V): V => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], mul = (a: V, s: number): V => [a[0] * s, a[1] * s, a[2] * s], dot = (a: V, b: V) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2], cross = (a: V, b: V): V => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]], unit = (a: V): V => mul(a, 1 / (Math.hypot(...a) || 1));
export function startCanvas(el: HTMLDivElement, p: {
    current: any;
}, ready: () => void, canvasRef: {
    current: HTMLCanvasElement | null;
}) {
    const canvas = document.createElement('canvas');
    canvasRef.current = canvas;
    el.appendChild(canvas);
    const ctx = canvas.getContext('2d')!;
    let w = 0, h = 0, yaw = .7, pitch = .48, zoom = 9.5, phase = 0, last = 0, frame = 0, view = '', drag = false, px = 0, py = 0;
    let footprints: V[][] = Array.from({ length: 8 }, () => []);
    const ratio = Math.min(devicePixelRatio, 1.5);
    const ro = new ResizeObserver(() => { w = el.clientWidth; h = el.clientHeight; canvas.width = w * ratio; canvas.height = h * ratio; canvas.style.width = w + 'px'; canvas.style.height = h + 'px'; });
    ro.observe(el);
    const down = (e: PointerEvent) => { drag = true; px = e.clientX; py = e.clientY; canvas.setPointerCapture(e.pointerId); }, move = (e: PointerEvent) => { if (!drag)
        return; yaw -= (e.clientX - px) * .008; pitch = Math.max(.1, Math.min(1.52, pitch + (e.clientY - py) * .006)); px = e.clientX; py = e.clientY; }, up = () => { drag = false; }, wheel = (e: WheelEvent) => { e.preventDefault(); zoom = Math.min(18, Math.max(5, zoom + e.deltaY * .008)); };
    canvas.addEventListener('pointerdown', down);
    canvas.addEventListener('pointermove', move);
    canvas.addEventListener('pointerup', up);
    canvas.addEventListener('wheel', wheel, { passive: false });
    function animate(now: number) {
        frame = requestAnimationFrame(animate);
        if (!w || !h)
            return;
        const dt = Math.min((now - last) / 1000, .05);
        last = now;
        const q = p.current;
        if (q.running)
            phase += dt * q.speed * 2.4;
        if (q.auto && !drag && q.view === 'orbit')
            yaw += dt * .08;
        if (view !== q.view) {
            view = q.view;
            if (view === 'top') {
                pitch = 1.5;
                yaw = 0;
            }
            else if (view === 'front') {
                pitch = .2;
                yaw = Math.PI;
            }
            else {
                pitch = .48;
                yaw = .7;
            }
        }
        ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
        const bg = ctx.createRadialGradient(w * .5, h * .55, 20, w * .5, h * .5, w * .75);
        bg.addColorStop(0, '#17282d');
        bg.addColorStop(1, '#090f14');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, w, h);
        const eye: V = [Math.sin(yaw) * Math.cos(pitch) * zoom, Math.sin(pitch) * zoom + 1, Math.cos(yaw) * Math.cos(pitch) * zoom];
        const forward = unit(sub([0, .9, 0], eye)), right = unit(cross(forward, [0, 1, 0])), vertical = cross(right, forward);
        const scale = Math.min(w * 1.4, h * 1.15);
        function proj(a: V) { const d = sub(a, eye), z = dot(d, forward); return { x: w * .5 + dot(d, right) * scale / z, y: h * .57 - dot(d, vertical) * scale / z, z }; }
        function line(a: V, b: V, color: string, width = 1) { const aa = proj(a), bb = proj(b); if (aa.z < .1 || bb.z < .1)
            return; ctx.strokeStyle = color; ctx.lineWidth = width; ctx.beginPath(); ctx.moveTo(aa.x, aa.y); ctx.lineTo(bb.x, bb.y); ctx.stroke(); }
        for (let i = -15; i <= 15; i++) {
            line([i, 0, -15], [i, 0, 15], i === 0 ? '#35524d' : '#23363c', .6);
            line([-15, 0, i], [15, 0, i], i === 0 ? '#35524d' : '#23363c', .6);
        }
        ctx.beginPath();
        for (let i = 0; i <= 128; i++) {
            const a = i / 128 * Math.PI * 2, v = proj([Math.cos(a) * 3.7, .005, Math.sin(a) * 3.7]);
            if (i === 0)
                ctx.moveTo(v.x, v.y);
            else
                ctx.lineTo(v.x, v.y);
        }
        ctx.strokeStyle = '#496955';
        ctx.lineWidth = .7;
        ctx.stroke();
        // Soft contact shadow, projected into the ground plane.
        for (let layer = 15; layer > 0; layer--) {
            ctx.beginPath();
            for (let i = 0; i <= 40; i++) {
                const a = i / 40 * Math.PI * 2, v = proj([Math.cos(a) * (1.3 + layer * .08), .01, Math.sin(a) * (1.4 + layer * .07)]);
                if (!i)
                    ctx.moveTo(v.x, v.y);
                else
                    ctx.lineTo(v.x, v.y);
            }
            ctx.fillStyle = '#00000006';
            ctx.fill();
        }
        type Face = {
            vs: V[];
            color: number[];
            glow: boolean;
            z: number;
        };
        const faces: Face[] = [];
        function face(vs: V[], color: number[], glow = false) { faces.push({ vs, color, glow, z: vs.reduce((s, v) => s + proj(v).z, 0) / vs.length }); }
        const metal = [94, 123, 133], silver = [167, 191, 196], dark = [28, 45, 54], black = [9, 19, 25], green = [138, 255, 185];
        function sphere(c: V, r: V, color: number[], glow = false) { const N = 16, M = 8; function point(i: number, j: number): V { const a = i / N * Math.PI * 2, b = j / M * Math.PI; return add(c, [r[0] * Math.sin(b) * Math.cos(a), r[1] * Math.cos(b), r[2] * Math.sin(b) * Math.sin(a)]); } for (let j = 0; j < M; j++)
            for (let i = 0; i < N; i++)
                face([point(i, j), point(i + 1, j), point(i + 1, j + 1), point(i, j + 1)], color, glow); }
        function rod(a: V, b: V, ra: number, rb: number, color: number[]) { const d = unit(sub(b, a)), u = unit(cross(d, Math.abs(d[1]) < .9 ? [0, 1, 0] : [1, 0, 0])), v = cross(d, u), n = 8; function pt(c: V, r: number, i: number) { return add(c, add(mul(u, Math.cos(i / n * Math.PI * 2) * r), mul(v, Math.sin(i / n * Math.PI * 2) * r))); } for (let i = 0; i < n; i++)
            face([pt(a, ra, i), pt(a, ra, i + 1), pt(b, rb, i + 1), pt(b, rb, i)], color); }
        const y = 1.16 + Math.sin(phase * 2) * .025;
        sphere([0, y, 0], [.8, .38, 1.25], dark);
        sphere([0, y + .15, .1], [.72, .33, 1.05], metal);
        sphere([0, y + .03, -1.05], [.55, .35, .4], dark);
        for (const x of [-.27, .27]) {
            sphere([x, y + .14, -1.4], [.17, .17, .09], silver);
            sphere([x, y + .14, -1.48], [.115, .115, .065], green, true);
        }
        for (let i = 0; i < 6; i++)
            rod([-.13, y + .47, -.16 + i * .14], [.13, y + .47, -.16 + i * .14], .025, .025, green);
        for (const x of [-.5, .5])
            for (let i = 0; i < 4; i++)
                sphere([x, y + .33, -.5 + i * .4], [.04, .025, .04], silver);
        let li = 0;
        for (const side of [-1, 1])
            for (let i = 0; i < 4; i++) {
                const pose = legPose({ side, index: i, phase, bodyHeight: y, stride: q.stride, lift: q.lift, gait: q.gait });
                const hip = pose.hip, knee = pose.knee, foot = pose.foot;
                rod(hip, knee, .14, .1, metal);
                rod(knee, foot, .09, .035, silver);
                rod(add(add(hip, mul(sub(knee, hip), .2)), [0, -.09, 0]), add(knee, mul(sub(foot, knee), .32)), .04, .04, black);
                sphere(hip, [.16, .16, .16], silver);
                sphere(knee, [.14, .14, .14], dark);
                sphere(foot, [.085, .085, .085], green, true);
                if (q.running) {
                    footprints[li].push(foot);
                    if (footprints[li].length > 75)
                        footprints[li].shift();
                }
                if (q.trail) {
                    const ps = footprints[li];
                    for (let j = 1; j < ps.length; j++)
                        line(ps[j - 1], ps[j], side === 1 ? '#76cfaa88' : '#69a9e388', 1.2);
                }
                li++;
            }
        faces.sort((a, b) => b.z - a.z);
        for (const f of faces) {
            const ps = f.vs.map(proj);
            if (ps.some(v => v.z < .1))
                continue;
            const norm = unit(cross(sub(f.vs[1], f.vs[0]), sub(f.vs[2], f.vs[0]))), light = Math.abs(dot(norm, unit([-.5, 1, .6]))) * .65 + .35;
            const col = f.color.map(c => Math.min(255, Math.round(c * (f.glow ? 1.1 : light))));
            ctx.beginPath();
            ps.forEach((v, i) => i ? ctx.lineTo(v.x, v.y) : ctx.moveTo(v.x, v.y));
            ctx.closePath();
            ctx.fillStyle = `rgb(${col.join(',')})`;
            if (!q.wire)
                ctx.fill();
            ctx.strokeStyle = q.wire ? '#a3d0bc88' : `rgb(${col.join(',')})`;
            ctx.lineWidth = q.wire ? .55 : .35;
            ctx.stroke();
        }
    }
    frame = requestAnimationFrame(animate);
    ready();
    return () => { cancelAnimationFrame(frame); ro.disconnect(); canvas.removeEventListener('pointerdown', down); canvas.removeEventListener('pointermove', move); canvas.removeEventListener('pointerup', up); canvas.removeEventListener('wheel', wheel); el.removeChild(canvas); };
}
