import React, {useMemo} from 'react';
import * as THREE from 'three';
import {Box} from './Box';

// Oficina de madrugada: escritorio, PC con el modelo 3D, torre de tazas de café y ventana a la ciudad

export const MONITOR_POS: [number, number, number] = [0.32, 0.78, 0.42];

// Pantalla del monitor: modelo 3D de un edificio en alambre que gira (se redibuja cada fotograma)
const useScreenTexture = (frame: number) => {
	const {canvas, tex} = useMemo(() => {
		const c = document.createElement('canvas');
		c.width = 512;
		c.height = 320;
		const t = new THREE.CanvasTexture(c);
		t.colorSpace = THREE.SRGBColorSpace;
		return {canvas: c, tex: t};
	}, []);
	const ctx = canvas.getContext('2d')!;
	ctx.fillStyle = '#10141f';
	ctx.fillRect(0, 0, 512, 320);
	ctx.fillStyle = '#2a3142';
	ctx.fillRect(0, 0, 512, 26);
	ctx.fillRect(0, 26, 40, 294);
	ctx.fillStyle = '#e8344a';
	ctx.fillRect(470, 6, 30, 14);
	// edificio de 7 pisos girando
	const a = frame / 40;
	const proj = (x: number, y: number, z: number): [number, number] => {
		const rx = x * Math.cos(a) - z * Math.sin(a);
		const rz = x * Math.sin(a) + z * Math.cos(a);
		return [276 + rx * 70 + rz * 18, 286 - y * 32 - rz * 14];
	};
	ctx.lineWidth = 2;
	for (let f = 0; f <= 7; f++) {
		ctx.strokeStyle = f === 0 ? '#ffd34d' : '#2fe8c8';
		const pts = [proj(-1, f, -0.7), proj(1, f, -0.7), proj(1, f, 0.7), proj(-1, f, 0.7)];
		ctx.beginPath();
		pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
		ctx.closePath();
		ctx.stroke();
	}
	ctx.strokeStyle = '#7fb2ff';
	for (const [x, z] of [[-1, -0.7], [1, -0.7], [1, 0.7], [-1, 0.7], [0, -0.7], [0, 0.7]]) {
		const [x0, y0] = proj(x, 0, z);
		const [x1, y1] = proj(x, 7, z);
		ctx.beginPath();
		ctx.moveTo(x0, y0);
		ctx.lineTo(x1, y1);
		ctx.stroke();
	}
	tex.needsUpdate = true;
	return tex;
};

export const Oficina: React.FC<{frame: number}> = ({frame}) => {
	const screen = useScreenTexture(frame);
	const flicker = 0.95 + 0.05 * Math.sin(frame * 1.7);
	return (
		<group>
			{/* piso de madera y pared con ventana (la ciudad se ve detrás) */}
			<Box position={[0, -0.05, 0]} size={[10, 0.1, 8]} color="#3a2c26" roughness={0.8} />
			<Box position={[-3.2, 1.7, -1.6]} size={[4, 3.6, 0.15]} color="#262c47" />
			<Box position={[3.2, 1.7, -1.6]} size={[4, 3.6, 0.15]} color="#262c47" />
			<Box position={[0, 0.45, -1.6]} size={[2.4, 0.9, 0.15]} color="#262c47" />
			<Box position={[0, 3.2, -1.6]} size={[2.4, 0.6, 0.15]} color="#262c47" />
			<Box position={[0, 0.92, -1.5]} size={[2.5, 0.06, 0.25]} color="#d9d4c7" />
			<Box position={[0, 2.0, -1.62]} size={[0.06, 2.1, 0.06]} color="#d9d4c7" />

			{/* estante con archivadores */}
			<group position={[-2.1, 0, -1.2]}>
				<Box position={[0, 1.0, 0]} size={[1.2, 2.0, 0.4]} color="#4a3a30" />
				{[0.55, 1.15, 1.75].map((y) =>
					[-0.4, -0.2, 0, 0.2, 0.4].map((x, i) => (
						<Box key={`${y}${x}`} position={[x, y, 0.12]} size={[0.16, 0.42, 0.3]} color={['#2f6fe0', '#e8344a', '#2fe8c8', '#f2c94c', '#8a5cf0'][(i + y * 10) % 5 | 0]} />
					))
				)}
			</group>

			{/* escritorio */}
			<group position={[0, 0, 0.35]}>
				<Box position={[0, 0.74, 0]} size={[2.2, 0.06, 0.9]} color="#6b4e3a" />
				<Box position={[0, 0.37, 0.43]} size={[2.2, 0.74, 0.04]} color="#5a4030" />
				<Box position={[-1.06, 0.37, 0]} size={[0.06, 0.74, 0.86]} color="#5a4030" />
				<Box position={[1.06, 0.37, 0]} size={[0.06, 0.74, 0.86]} color="#5a4030" />
			</group>

			{/* monitor mirando al junior (y un poco a cámara) */}
			<group position={MONITOR_POS} rotation={[0, -0.95, 0]}>
				<Box position={[0, 0.06, 0]} size={[0.3, 0.03, 0.22]} color="#222" />
				<Box position={[0, 0.2, -0.02]} size={[0.06, 0.28, 0.04]} color="#222" />
				<Box position={[0, 0.48, 0]} size={[0.92, 0.6, 0.05]} color="#15171d" />
				<mesh position={[0, 0.48, 0.027]}>
					<planeGeometry args={[0.86, 0.54]} />
					<meshBasicMaterial map={screen} toneMapped={false} />
				</mesh>
				<pointLight position={[0, 0.48, 0.6]} color="#7fc4ff" intensity={1.6 * flicker} distance={2.4} />
			</group>
			{/* teclado */}
			<Box position={[-0.08, 0.785, 0.42]} size={[0.5, 0.03, 0.18]} color="#2a2d36" rotation={[0, 0.9, 0]} />

			{/* torre de tazas de café (la madrugada pasa factura) */}
			{Array.from({length: 6}, (_, i) => (
				<mesh key={i} position={[-0.75 + (i % 2) * 0.012, 0.84 + i * 0.13, 0.55]} rotation={[0, i * 0.5, 0]}>
					<cylinderGeometry args={[0.065, 0.055, 0.12, 14]} />
					<meshStandardMaterial color={i % 2 ? '#f3efe6' : '#e8344a'} roughness={0.5} />
				</mesh>
			))}
			{/* planos enrollados */}
			{[0, 1, 2].map((i) => (
				<mesh key={i} position={[0.85 - i * 0.06, 0.82, 0.18 + i * 0.09]} rotation={[0, 0, Math.PI / 2]}>
					<cylinderGeometry args={[0.04, 0.04, 0.6, 10]} />
					<meshStandardMaterial color={i === 1 ? '#bcd3f0' : '#e8eef7'} roughness={0.7} />
				</mesh>
			))}
			{/* lámpara de escritorio */}
			<group position={[-0.95, 0.77, 0.15]}>
				<mesh position={[0, 0.02, 0]}>
					<cylinderGeometry args={[0.1, 0.12, 0.04, 16]} />
					<meshStandardMaterial color="#222" />
				</mesh>
				<Box position={[0.05, 0.25, 0]} size={[0.03, 0.46, 0.03]} rotation={[0, 0, -0.3]} color="#222" />
				<mesh position={[0.14, 0.48, 0.05]} rotation={[0.4, 0, -0.9]}>
					<coneGeometry args={[0.11, 0.18, 16, 1, true]} />
					<meshStandardMaterial color="#e8b81c" side={THREE.DoubleSide} />
				</mesh>
				<pointLight position={[0.2, 0.4, 0.15]} color="#ffc27a" intensity={2.2} distance={2.2} />
			</group>
			{/* silla */}
			<group position={[-0.42, 0, -0.25]}>
				<Box position={[0, 0.45, 0]} size={[0.62, 0.08, 0.6]} color="#1d1f26" />
				<Box position={[0, 0.95, -0.3]} size={[0.62, 0.9, 0.08]} color="#1d1f26" />
				<Box position={[0, 0.22, 0]} size={[0.08, 0.44, 0.08]} color="#444" />
			</group>
		</group>
	);
};
