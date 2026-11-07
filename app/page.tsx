'use client';
import { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { legPose } from '../lib/gait';
import { startCanvas } from './canvas-renderer';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Play, Pause, RotateCcw, Maximize, MoveUpRight, Camera, ChevronRight, ScanLine, ArrowUpRight } from 'lucide-react';
type Params = {
    speed: number;
    stride: number;
    lift: number;
    running: boolean;
    trail: boolean;
    wire: boolean;
    auto: boolean;
    gait: string;
    view: string;
};
function Scene({ params, onError, onReady, shot }: {
    params: Params;
    onError: (s: string) => void;
    onReady: () => void;
    shot: number;
}) {
    const host = useRef<HTMLDivElement>(null), p = useRef(params), canvas = useRef<HTMLCanvasElement | null>(null);
    p.current = params;
    useEffect(() => { if (!shot || !canvas.current)
        return; const a = document.createElement('a'); a.download = 'Vincent-Builds-SPDR.png'; a.href = canvas.current.toDataURL('image/png'); a.click(); }, [shot]);
    useEffect(() => {
        if (!host.current)
            return;
        const el = host.current;
        let renderer: THREE.WebGLRenderer;
        try {
            renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
        }
        catch {
            return startCanvas(el, p, onReady, canvas);
        }
        canvas.current = renderer.domElement;
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.35;
        el.appendChild(renderer.domElement);
        const scene = new THREE.Scene();
        scene.background = new THREE.Color('#0b1014');
        scene.fog = new THREE.FogExp2('#0b1014', .035);
        const camera = new THREE.PerspectiveCamera(38, 1, .1, 100);
        camera.position.set(8, 6, 10);
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.target.set(0, 1, 0);
        controls.minDistance = 5;
        controls.maxDistance = 22;
        controls.maxPolarAngle = Math.PI / 2 - .03;
        controls.autoRotateSpeed = .55;
        scene.add(new THREE.HemisphereLight(0xaad9f6, 0x192429, 2));
        const key = new THREE.DirectionalLight(0xffffff, 4);
        key.position.set(4, 9, 5);
        key.castShadow = true;
        key.shadow.mapSize.set(2048, 2048);
        key.shadow.camera.left = -8;
        key.shadow.camera.right = 8;
        key.shadow.camera.top = 8;
        key.shadow.camera.bottom = -8;
        key.shadow.normalBias = .03;
        scene.add(key);
        const rim = new THREE.DirectionalLight(0x7cffda, 3);
        rim.position.set(-5, 3, -5);
        scene.add(rim);
        const fill = new THREE.PointLight(0x588bff, 35);
        fill.position.set(4, 3, -3);
        scene.add(fill);
        const floor = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.MeshStandardMaterial({ color: 0x111b20, metalness: .65, roughness: .5 }));
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = -.035;
        floor.receiveShadow = true;
        scene.add(floor);
        const grid = new THREE.GridHelper(80, 80, 0x25423e, 0x192b30);
        grid.position.y = -.02;
        scene.add(grid);
        const ring = new THREE.Mesh(new THREE.RingGeometry(3.7, 3.72, 128), new THREE.MeshBasicMaterial({ color: 0x59e4ae, transparent: true, opacity: .22, side: THREE.DoubleSide }));
        ring.rotation.x = -Math.PI / 2;
        ring.position.y = -.005;
        scene.add(ring);
        const metal = new THREE.MeshStandardMaterial({ color: 0x789399, metalness: .88, roughness: .26 });
        const dark = new THREE.MeshStandardMaterial({ color: 0x19272e, metalness: .85, roughness: .32 });
        const silver = new THREE.MeshStandardMaterial({ color: 0xc0c9c9, metalness: .9, roughness: .2 });
        const black = new THREE.MeshStandardMaterial({ color: 0x070f14, metalness: .55, roughness: .28 });
        const glow = new THREE.MeshStandardMaterial({ color: 0x69ffbc, emissive: 0x2eff9e, emissiveIntensity: 2.4, metalness: .3, roughness: .25 });
        const allMat = [metal, dark, silver, black];
        function mesh(geo: THREE.BufferGeometry, mat: THREE.Material, parent: THREE.Object3D, pos: number[] = [0, 0, 0]) { const m = new THREE.Mesh(geo, mat); m.position.set(pos[0], pos[1], pos[2]); m.castShadow = true; m.receiveShadow = true; parent.add(m); return m; }
        const body = new THREE.Group();
        scene.add(body);
        mesh(new THREE.SphereGeometry(1, 32, 16), dark, body).scale.set(.8, .38, 1.25);
        const shell = mesh(new THREE.SphereGeometry(1, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), metal, body, [0, .12, .12]);
        shell.scale.set(.72, .34, 1.05);
        mesh(new THREE.BoxGeometry(.24, .16, 1.1), black, body, [0, .38, .2]);
        for (let i = 0; i < 6; i++)
            mesh(new THREE.BoxGeometry(.3, .025, .025), glow, body, [0, .47, -.16 + i * .14]);
        mesh(new THREE.SphereGeometry(.55, 24, 16), dark, body, [0, .03, -1.05]).scale.set(1, .65, .65);
        for (const x of [-.27, .27]) {
            mesh(new THREE.CylinderGeometry(.16, .16, .08, 24), silver, body, [x, .14, -1.39]).rotation.x = Math.PI / 2;
            mesh(new THREE.SphereGeometry(.115, 24, 12), glow, body, [x, .14, -1.45]);
        }
        for (const x of [-.47, .47])
            mesh(new THREE.SphereGeometry(.065, 16, 8), glow, body, [x, .08, -1.25]);
        for (const side of [-1, 1])
            for (let i = 0; i < 4; i++)
                mesh(new THREE.CylinderGeometry(.045, .045, .03, 8), silver, body, [side * .5, .39, -.5 + i * .4]);
        const legs: {
            side: number;
            index: number;
            upper: THREE.Mesh;
            lower: THREE.Mesh;
            piston: THREE.Mesh;
            knee: THREE.Mesh;
            hip: THREE.Mesh;
            foot: THREE.Mesh;
            line: THREE.Line;
            points: THREE.Vector3[];
        }[] = [];
        for (const side of [-1, 1])
            for (let i = 0; i < 4; i++) {
                const group = new THREE.Group();
                scene.add(group);
                const hip = mesh(new THREE.SphereGeometry(.16, 16, 12), silver, group), knee = mesh(new THREE.SphereGeometry(.13, 16, 12), dark, group), foot = mesh(new THREE.SphereGeometry(.1, 16, 8), glow, group);
                const upper = mesh(new THREE.CylinderGeometry(.1, .14, 1, 8), metal, group), lower = mesh(new THREE.CylinderGeometry(.035, .09, 1, 8), silver, group), piston = mesh(new THREE.CylinderGeometry(.035, .035, 1, 12), black, group);
                const line = new THREE.Line(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: side === 1 ? 0x6af8bf : 0x5f9dff, transparent: true, opacity: .6 }));
                scene.add(line);
                legs.push({ side, index: i, upper, lower, piston, knee, hip, foot, line, points: [] });
            }
        const up = new THREE.Vector3(0, 1, 0);
        function segment(m: THREE.Mesh, a: THREE.Vector3, b: THREE.Vector3) { const d = b.clone().sub(a); m.position.copy(a).add(b).multiplyScalar(.5); m.quaternion.setFromUnitVectors(up, d.clone().normalize()); m.scale.y = d.length(); }
        let frame = 0, phase = 0, last = 0, view = 'orbit';
        const clock = new THREE.Clock();
        let visible = true;
        const ro = new ResizeObserver(() => { const w = el.clientWidth, h = el.clientHeight; camera.aspect = w / h; camera.updateProjectionMatrix(); renderer.setSize(w, h); });
        ro.observe(el);
        function animate() {
            frame = requestAnimationFrame(animate);
            const dt = Math.min(clock.getDelta(), .05), q = p.current;
            if (q.running)
                phase += dt * q.speed * 2.4;
            body.position.y = 1.16 + Math.sin(phase * 2) * .025;
            body.rotation.z = Math.sin(phase) * .02;
            body.rotation.x = Math.cos(phase * 2) * .015;
            if (view !== q.view) {
                view = q.view;
                if (view === 'top')
                    camera.position.set(0, 13, .01);
                else if (view === 'front')
                    camera.position.set(0, 3, -12);
                else
                    camera.position.set(8, 6, 10);
            }
            controls.autoRotate = q.auto && view === 'orbit';
            controls.update();
            allMat.forEach(m => m.wireframe = q.wire);
            for (const leg of legs) {
                const { side, index: i } = leg;
                const pose = legPose({ side, index: i, phase, bodyHeight: body.position.y, stride: q.stride, lift: q.lift, gait: q.gait });
                const hip = new THREE.Vector3(...pose.hip), knee = new THREE.Vector3(...pose.knee), foot = new THREE.Vector3(...pose.foot);
                leg.hip.position.copy(hip);
                leg.knee.position.copy(knee);
                leg.foot.position.copy(foot);
                segment(leg.upper, hip, knee);
                segment(leg.lower, knee, foot);
                segment(leg.piston, hip.clone().lerp(knee, .2).add(new THREE.Vector3(0, -.09, 0)), knee.clone().lerp(foot, .32));
                leg.line.visible = q.trail;
                if (q.running && phase - last > .045) {
                    leg.points.push(foot.clone());
                    if (leg.points.length > 85)
                        leg.points.shift();
                    leg.line.geometry.dispose();
                    leg.line.geometry = new THREE.BufferGeometry().setFromPoints(leg.points);
                }
            }
            if (phase - last > .045)
                last = phase;
            if (visible)
                renderer.render(scene, camera);
        }
        animate();
        onReady();
        const vis = () => { visible = !document.hidden; };
        document.addEventListener('visibilitychange', vis);
        return () => { cancelAnimationFrame(frame); document.removeEventListener('visibilitychange', vis); ro.disconnect(); controls.dispose(); scene.traverse(o => { if (o instanceof THREE.Mesh || o instanceof THREE.Line) {
            o.geometry?.dispose();
            const ms = Array.isArray(o.material) ? o.material : [o.material];
            ms.forEach(m => m.dispose());
        } }); renderer.dispose(); el.removeChild(renderer.domElement); };
    }, []);
    return <div ref={host} className="scene" aria-label="可拖动旋转的机械蜘蛛三维步态演示"/>;
}
export default function Page() { const [params, setParams] = useState<Params>({ speed: 1, stride: .55, lift: .55, running: true, trail: false, wire: false, auto: true, gait: 'alternating', view: 'orbit' }), [ready, setReady] = useState(false), [error, setError] = useState(''), [focus, setFocus] = useState(false), [shot, setShot] = useState(0); const defaults = () => setParams({ speed: 1, stride: .55, lift: .55, running: true, trail: false, wire: false, auto: true, gait: 'alternating', view: 'orbit' }); const set = (k: keyof Params, v: any) => setParams(x => ({ ...x, [k]: v })); return <div className={focus ? 'app focus' : 'app'}><header><a href="https://x.com/Vincent_Tesla_" target="_blank" rel="noreferrer" className="brand"><span className="brand-icon">V↗</span><span>VINCENT<span className="brand-light"> BUILDS</span></span></a><div className="header-mid">EXPERIMENT 001 <span>/</span> ROBOTICS & MOTION <a href="https://github.com/1988-Vincent/vincent-builds-spdr" className="project-link">项目与源码 ↗</a></div><span className="prototype"><i /> INTERACTIVE PROTOTYPE</span></header><div className="layout"><section className="stage"><div className="stage-top"><div className="eyebrow">EIGHT LEGS. ONE RHYTHM.</div><h1>Meet <em>SPDR.</em></h1><p>从一个想法，到一只会行走的机械蜘蛛。</p><div className="stage-tags"><span>PROCEDURAL 3D</span><span>LIVE IN YOUR BROWSER</span></div></div><Scene params={params} onError={setError} onReady={() => setReady(true)} shot={shot}/>{!ready && !error && <div className="loading">正在启动三维场景…</div>}{error && <div className="loading error">{error}</div>}<div className="cross tl"/><div className="cross tr"/><div className="stage-bottom"><div className="live-info"><span className={params.running ? 'dot' : 'dot paused'}/><span>{params.running ? 'GAIT ENGINE ACTIVE' : 'MOTION PAUSED'}</span><small>8 LEGS / 24 SEGMENTS</small></div><div className="camera-help">拖动旋转 · 滚轮缩放 · 双指操作</div></div><div className="scene-tools"><button onClick={() => set('running', !params.running)} aria-label={params.running ? '暂停运动' : '继续运动'}>{params.running ? <Pause size={18}/> : <Play size={18}/>}</button><button onClick={() => set('auto', !params.auto)} aria-label="切换自动环绕" className={params.auto ? 'selected' : ''}><RotateCcw size={18}/></button><span /><button onClick={() => setShot(s => s + 1)} aria-label="保存场景截图" disabled={!ready}><Camera size={18}/></button><button onClick={() => setFocus(!focus)} aria-label={focus ? '退出展示模式' : '进入展示模式'}><Maximize size={18}/></button></div><div className="watermark">VINCENT BUILDS <span>SPDR / 001</span></div></section><aside className="controls"><div className="panel-heading"><div><span className="eyebrow">CONTROL ROOM</span><h2>让它动起来<span>↗</span></h2></div><span className="version">v0.2</span></div><div className="intro">改变参数，观察八条腿如何协调运动。<br />每一次调整，都会实时发生。</div><div className="control-section"><div className="section-label"><span>01</span> 运动参数 <ScanLine size={15}/></div>{[['speed', '步态速度', 'SPEED', .15, 2, .05, '×'], ['stride', '步幅', 'STRIDE', .15, .9, .05, ''], ['lift', '抬腿高度', 'LIFT', .1, .95, .05, '']].map(([key, label, en, min, max, step, suffix]) => <label className="slider-label" key={key}><div><span>{label}<small>{en}</small></span><output>{Number(params[key as keyof Params]).toFixed(2)}{suffix}</output></div><input aria-label={String(label)} type="range" min={min} max={max} step={step} value={Number(params[key as keyof Params])} onChange={e => set(key as keyof Params, +e.target.value)}/></label>)}</div><div className="control-section"><div className="section-label"><span>02</span> 步态模式</div><div className="gait-choices"><button className={params.gait === 'alternating' ? 'active' : ''} onClick={() => set('gait', 'alternating')}><span className="leg-symbol">⠿</span><strong>交替步态<small>ALTERNATING</small></strong><i /></button><button className={params.gait === 'wave' ? 'active' : ''} onClick={() => set('gait', 'wave')}><span className="leg-symbol">⠷</span><strong>波浪步态<small>WAVE</small></strong><i /></button></div></div><div className="control-section"><div className="section-label"><span>03</span> 观察方式</div><div className="views">{[['orbit', '自由视角'], ['front', '正面'], ['top', '俯视']].map(([v, l]) => <button key={v} className={params.view === v ? 'active' : ''} onClick={() => set('view', v)}>{l}</button>)}</div>{[['trail', '足端轨迹', '查看每只脚的运动路径'], ['wire', '结构线框', '观察几何结构']].map(([k, l, sub]) => <button className="toggle-row" key={k} onClick={() => set(k as keyof Params, !params[k as keyof Params])} role="switch" aria-checked={Boolean(params[k as keyof Params])}><span>{l}<small>{sub}</small></span><i className={params[k as keyof Params] ? 'toggle on' : 'toggle'}/></button>)}</div><a className="repo-button" href="https://github.com/1988-Vincent/vincent-builds-spdr">查看项目 · 源码 · 构建笔记 <ArrowUpRight size={14}/></a><button className="reset" onClick={defaults}><RotateCcw size={14}/> 重置所有参数</button><div className="build-note"><span>BUILT WITH AI. DRIVEN BY CURIOSITY.</span><p>程序化建模 + 逆运动学步态演示。<br />当前为原地运动学动画，非动力学仿真或实体机器人控制。</p></div></aside></div><footer><div><span className="footer-num">001 /</span> 从零开始，公开构建。<small>每一个能操作的想法，都值得被看见。</small></div><a href="https://x.com/Vincent_Tesla_" target="_blank" rel="noreferrer">Follow the build <ArrowUpRight size={16}/><span>@Vincent_Tesla_</span></a></footer></div>; }
