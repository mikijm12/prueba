import React, {useMemo} from 'react';
import {AbsoluteFill, random} from 'remotion';
import {Cam} from '../episode';

const W = 1080;
const H = 1920;

// Desplazamiento del fondo según el plano (paralaje falso)
const PARALLAX: Record<Cam, {x: number; scale: number}> = {
	JUN: {x: 140, scale: 1.25},
	WIDE: {x: 0, scale: 1.0},
	ING: {x: -140, scale: 1.25},
	JUN_LOW: {x: 120, scale: 1.15},
	ING_CLOSE: {x: -160, scale: 1.35},
	TWO: {x: 0, scale: 1.1},
	WIDE_END: {x: 0, scale: 0.95},
};

const Skyline: React.FC = () => {
	const buildings = useMemo(() => {
		const out: {x: number; w: number; h: number; windows: {x: number; y: number; on: boolean}[]}[] = [];
		let x = -200;
		let i = 0;
		while (x < W + 200) {
			const w = 70 + random(`w${i}`) * 110;
			const h = 180 + random(`h${i}`) * 420;
			const windows: {x: number; y: number; on: boolean}[] = [];
			for (let wy = 16; wy < h - 20; wy += 28) {
				for (let wx = 12; wx < w - 14; wx += 24) {
					windows.push({x: wx, y: wy, on: random(`o${i}-${wx}-${wy}`) > 0.62});
				}
			}
			out.push({x, w, h, windows});
			x += w + 6 + random(`g${i}`) * 20;
			i++;
		}
		return out;
	}, []);
	const base = 1240;
	return (
		<svg width={W + 400} height={H} style={{position: 'absolute', left: -200, top: 0, filter: 'blur(5px)'}}>
			{buildings.map((b, i) => (
				<g key={i} transform={`translate(${b.x + 200}, ${base - b.h})`}>
					<rect width={b.w} height={b.h + 700} fill="#0c1438" />
					{b.windows.map((wn, j) =>
						wn.on ? <rect key={j} x={wn.x} y={wn.y} width={10} height={13} fill="#ffd27a" opacity={0.85} /> : null
					)}
				</g>
			))}
			{/* grúa torre */}
			<g transform="translate(860, 330)" stroke="#1a2552" strokeWidth={10} fill="none">
				<line x1={0} y1={0} x2={0} y2={920} />
				<line x1={-380} y1={30} x2={190} y2={30} />
				<line x1={0} y1={-60} x2={-380} y2={30} strokeWidth={5} />
				<line x1={0} y1={-60} x2={190} y2={30} strokeWidth={5} />
				<line x1={-300} y1={30} x2={-300} y2={260} strokeWidth={3} />
			</g>
		</svg>
	);
};

const Bokeh: React.FC<{frame: number}> = ({frame}) => {
	// guirnalda de focos de faena desenfocada en la parte superior
	const bulbs = Array.from({length: 9}, (_, i) => {
		const x = -60 + i * 150;
		const y = 120 + Math.sin(i * 0.9) * 50 + (i % 2) * 40;
		const r = 34 + random(`r${i}`) * 26;
		const flicker = 0.85 + 0.15 * Math.sin(frame / 7 + i * 1.7);
		return {x, y, r, flicker};
	});
	return (
		<>
			{bulbs.map((b, i) => (
				<div
					key={i}
					style={{
						position: 'absolute',
						left: b.x - b.r,
						top: b.y - b.r,
						width: b.r * 2,
						height: b.r * 2,
						borderRadius: '50%',
						background: 'radial-gradient(circle, rgba(255,240,205,1) 0%, rgba(255,214,140,0.85) 35%, rgba(255,190,100,0) 72%)',
						opacity: b.flicker,
						filter: 'blur(3px)',
					}}
				/>
			))}
		</>
	);
};

export const NightBackdrop: React.FC<{frame: number; cam: Cam}> = ({frame, cam}) => {
	const p = PARALLAX[cam];
	const craneLight = Math.sin(frame / 9) > 0 ? 1 : 0.2;
	return (
		<AbsoluteFill style={{background: 'linear-gradient(180deg, #040824 0%, #0a1648 45%, #17287a 75%, #0d1640 100%)', overflow: 'hidden'}}>
			<AbsoluteFill style={{transform: `translateX(${p.x}px) scale(${p.scale})`, transformOrigin: '50% 60%'}}>
				<Skyline />
				<div
					style={{
						position: 'absolute',
						left: 852,
						top: 248,
						width: 16,
						height: 16,
						borderRadius: '50%',
						background: '#ff3030',
						boxShadow: '0 0 30px 12px rgba(255,40,40,0.6)',
						opacity: craneLight,
						filter: 'blur(2px)',
					}}
				/>
			</AbsoluteFill>
			<Bokeh frame={frame} />
		</AbsoluteFill>
	);
};
