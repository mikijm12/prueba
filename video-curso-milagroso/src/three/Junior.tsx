import React, {useMemo} from 'react';
import * as THREE from 'three';
import {Box} from './Box';

const SKIN = '#c98b62';
const SKIN_DARK = '#b5774f';
const SHIRT = '#9ec3e6';
const VEST = '#ff6a13';
const STRIPE = '#dfe3ea';
const PANTS = '#27345e';
const HAIR = '#16131a';
const HAT = '#f5f5f0';

export type JuniorPose = 'phone' | 'proud';

// Etiqueta de precio que el junior olvidó quitarle al casco nuevo
const usePriceTagTexture = () =>
	useMemo(() => {
		const c = document.createElement('canvas');
		c.width = 128;
		c.height = 80;
		const ctx = c.getContext('2d')!;
		ctx.fillStyle = '#fff6c8';
		ctx.fillRect(0, 0, 128, 80);
		ctx.fillStyle = '#d6202a';
		ctx.font = '900 40px Inter, sans-serif';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillText('S/25', 64, 44);
		const tex = new THREE.CanvasTexture(c);
		tex.colorSpace = THREE.SRGBColorSpace;
		return tex;
	}, []);

export const Junior: React.FC<{
	frame: number;
	pose: JuniorPose;
	mouth: number;
	talking: boolean;
	lookUp: number; // 0 = mira el celular, 1 = mira al frente
	browRaise: number;
	smile: number;
}> = ({frame, pose, mouth, talking, lookUp, browRaise, smile}) => {
	const tagTex = usePriceTagTexture();
	const t = frame / 30;
	const breathe = Math.sin(t * 2.2) * 0.008;
	const headBob = talking ? Math.sin(t * 14) * 0.025 : 0;
	const blink = frame % 95 > 90 ? 0.15 : 1;

	const headPitch = THREE.MathUtils.lerp(0.32, -0.05, lookUp) + headBob;
	const pupilY = THREE.MathUtils.lerp(-0.03, 0.005, lookUp);

	const proud = pose === 'proud';
	// brazo con el celular (lado +x)
	const phoneArmRot: [number, number, number] = proud ? [-2.05, 0, 0.18] : [-1.15, 0, -0.4];
	// brazo libre: en jarra cuando está orgulloso
	const freeArmRot: [number, number, number] = proud ? [0, 0, -0.75] : [0.05, 0, -0.08];
	const chestOut = proud ? 1.035 : 1;

	return (
		<group>
			{/* botas de seguridad nuevas */}
			{[-0.14, 0.14].map((x) => (
				<group key={x}>
					<Box position={[x, 0.07, 0.04]} size={[0.26, 0.14, 0.34]} color="#c68b3c" />
					<Box position={[x, 0.46, 0]} size={[0.24, 0.72, 0.26]} color={PANTS} />
				</group>
			))}
			<Box position={[0, 0.81, 0]} size={[0.6, 0.06, 0.32]} color="#1b1b22" />

			{/* torso con chaleco reflectivo */}
			<group position={[0, 1.08 + breathe, 0]} scale={[chestOut, 1, chestOut]}>
				<Box size={[0.6, 0.66, 0.34]} color={SHIRT} />
				<Box position={[0, -0.02, 0]} size={[0.64, 0.6, 0.37]} color={VEST} />
				<Box position={[0, -0.02, 0.186]} size={[0.08, 0.6, 0.01]} color={SHIRT} />
				<Box position={[0, -0.15, 0]} size={[0.645, 0.05, 0.375]} color={STRIPE} emissive="#ffffff" emissiveIntensity={0.18} />
				<Box position={[0, 0.04, 0]} size={[0.645, 0.05, 0.375]} color={STRIPE} emissive="#ffffff" emissiveIntensity={0.18} />
				{/* fotocheck de practicante */}
				<Box position={[-0.16, 0.12, 0.2]} size={[0.11, 0.15, 0.01]} color="#ffffff" />
				<Box position={[-0.16, 0.17, 0.206]} size={[0.11, 0.04, 0.005]} color="#2f6fe0" />
			</group>

			{/* brazo con el celular */}
			<group position={[0.41, 1.37, 0]} rotation={phoneArmRot}>
				<Box position={[0, -0.15, 0]} size={[0.18, 0.3, 0.2]} color={SHIRT} />
				<Box position={[0, -0.45, 0]} size={[0.16, 0.3, 0.18]} color={SKIN} />
				<Box position={[0, -0.64, 0]} size={[0.17, 0.12, 0.18]} color={SKIN} />
				<group position={[-0.02, -0.72, 0.06]} rotation={[proud ? 2.05 : 1.55, 0, 0]}>
					<Box size={[0.14, 0.25, 0.02]} color="#111" />
					<Box size={[0.12, 0.22, 0.024]} color="#bfe0ff" emissive="#9fd0ff" emissiveIntensity={proud ? 0.4 : 1.3} />
				</group>
				{!proud && <pointLight position={[0, -0.7, 0.2]} color="#9fd0ff" intensity={0.6} distance={1.2} />}
			</group>

			{/* brazo libre */}
			<group position={[-0.41, 1.37, 0]} rotation={freeArmRot}>
				<Box position={[0, -0.15, 0]} size={[0.18, 0.3, 0.2]} color={SHIRT} />
				<Box position={[0, -0.45, 0]} size={[0.16, 0.3, 0.18]} color={SKIN} />
				<Box position={[0, -0.64, 0]} size={[0.17, 0.12, 0.18]} color={SKIN} />
			</group>

			{/* cabeza */}
			<group position={[0, 1.46 + breathe, 0]} rotation={[headPitch, 0, proud ? -0.06 : 0]}>
				<Box position={[0, 0.3, 0]} size={[0.56, 0.56, 0.5]} color={SKIN} />
				<Box position={[0, 0.25, 0.27]} size={[0.07, 0.09, 0.05]} color={SKIN_DARK} />
				{/* pelo que asoma bajo el casco */}
				<Box position={[0, 0.42, -0.255]} size={[0.56, 0.3, 0.03]} color={HAIR} />
				<Box position={[-0.285, 0.42, 0]} size={[0.03, 0.22, 0.4]} color={HAIR} />
				<Box position={[0.285, 0.42, 0]} size={[0.03, 0.22, 0.4]} color={HAIR} />
				{[-0.17, -0.05, 0.08, 0.19].map((x, i) => (
					<Box key={x} position={[x, 0.53, 0.25]} size={[0.1, 0.08, 0.04]} rotation={[0, 0, (i % 2 ? 1 : -1) * 0.35]} color={HAIR} />
				))}
				{/* lentes */}
				{[-0.13, 0.13].map((x) => (
					<group key={x} position={[x, 0.34, 0.255]}>
						<Box size={[0.21, 0.17, 0.02]} color="#2a2a35" />
						<group scale={[1, blink, 1]}>
							<Box position={[0, 0, 0.012]} size={[0.16, 0.12, 0.01]} color="#f4f6ff" />
							<Box position={[0.005, pupilY, 0.02]} size={[0.06, 0.07, 0.01]} color="#111" />
						</group>
					</group>
				))}
				<Box position={[0, 0.36, 0.26]} size={[0.06, 0.025, 0.02]} color="#2a2a35" />
				{/* cejas */}
				{[-0.13, 0.13].map((x) => (
					<Box key={x} position={[x, 0.45 + browRaise * 0.04, 0.26]} size={[0.14, 0.03, 0.02]} rotation={[0, 0, x < 0 ? -browRaise * 0.2 : browRaise * 0.2]} color={HAIR} />
				))}
				{/* boca */}
				<Box position={[0, 0.14, 0.255]} size={[0.13 + smile * 0.07, 0.025 + mouth * 0.075, 0.02]} color="#5a1f22" />
				{smile > 0 && mouth < 0.2 && (
					<>
						<Box position={[-0.095 - smile * 0.02, 0.16, 0.256]} size={[0.03, 0.03, 0.02]} color="#5a1f22" />
						<Box position={[0.095 + smile * 0.02, 0.16, 0.256]} size={[0.03, 0.03, 0.02]} color="#5a1f22" />
					</>
				)}
				{/* casco blanco recién comprado */}
				<Box position={[0, 0.66, -0.01]} size={[0.62, 0.22, 0.58]} color={HAT} roughness={0.35} />
				<Box position={[0, 0.79, -0.01]} size={[0.1, 0.06, 0.6]} color={HAT} roughness={0.35} />
				<Box position={[0, 0.555, 0]} size={[0.68, 0.035, 0.64]} color={HAT} roughness={0.35} />
				<Box position={[0, 0.555, 0.36]} size={[0.5, 0.035, 0.14]} color={HAT} roughness={0.35} />
				{/* etiqueta colgando */}
				<group position={[0.3, 0.54, 0.32]} rotation={[0, 0, Math.sin(t * 3.1) * 0.18]}>
					<Box position={[0, -0.05, 0]} size={[0.006, 0.1, 0.006]} color="#ddd" />
					<mesh position={[0, -0.13, 0]}>
						<planeGeometry args={[0.11, 0.07]} />
						<meshStandardMaterial map={tagTex} roughness={0.8} side={THREE.DoubleSide} />
					</mesh>
				</group>
			</group>
		</group>
	);
};
