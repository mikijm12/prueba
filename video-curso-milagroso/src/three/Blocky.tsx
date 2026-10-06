import React, {useMemo} from 'react';
import * as THREE from 'three';
import {Box} from './Box';

// Personaje de bloques configurable (junior, maestro de obra, supervisora…)

export type Look = {
	skin: string;
	shirt: string;
	pants: string;
	boots: string;
	hat: string;
	hatWorn?: boolean;
	hair: string;
	hairStyle: 'short' | 'long' | 'gray';
	vest?: string;
	glasses?: 'thick' | 'thin';
	mustache?: boolean;
	belly?: boolean;
	priceTag?: boolean;
	badge?: boolean;
	lips?: string;
	mud?: boolean;
};

export const LOOKS: Record<string, Look> = {
	junior: {
		skin: '#c98b62', shirt: '#9ec3e6', pants: '#27345e', boots: '#c68b3c', hat: '#f5f5f0', hair: '#16131a',
		hairStyle: 'short', vest: '#ff6a13', glasses: 'thick', priceTag: true, badge: true,
	},
	teo: {
		skin: '#a8714f', shirt: '#8a2c35', pants: '#3b4f78', boots: '#6b5440', hat: '#e9b51c', hatWorn: true, hair: '#9a9a9a',
		hairStyle: 'gray', mustache: true, belly: true, mud: true,
	},
	supervisora: {
		skin: '#d6a07a', shirt: '#f4f4f4', pants: '#262b38', boots: '#2a2a2a', hat: '#f5f5f0', hair: '#2b1a14',
		hairStyle: 'long', vest: '#c6f03a', glasses: 'thin', lips: '#b3303d',
	},
};

export type BlockyPose = 'idle' | 'phone' | 'proud' | 'point' | 'crossed' | 'shy' | 'reading' | 'typing' | 'walk';

const usePriceTag = () =>
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

type Rot = [number, number, number];

// Rotaciones de brazo derecho (+x) e izquierdo (-x) por pose
const ARMS: Record<BlockyPose, {r: Rot; l: Rot}> = {
	idle: {r: [0.05, 0, 0.08], l: [0.05, 0, -0.08]},
	phone: {r: [-1.15, 0, -0.4], l: [0.05, 0, -0.08]},
	proud: {r: [-2.05, 0, 0.18], l: [0, 0, -0.75]},
	point: {r: [-1.3, 0, 0.5], l: [0.05, 0, -0.08]},
	crossed: {r: [-1.25, 0, -1.0], l: [-1.15, 0, 1.0]},
	shy: {r: [-0.25, 0, -0.35], l: [-0.25, 0, 0.35]},
	reading: {r: [0.05, 0, 0.08], l: [-1.2, 0, 0.45]},
	typing: {r: [-1.25, 0, -0.15], l: [-1.25, 0, 0.15]},
	walk: {r: [0, 0, 0.08], l: [0, 0, -0.08]},
};

export const Blocky: React.FC<{
	look: Look;
	frame: number;
	pose?: BlockyPose;
	mouth?: number;
	shape?: number; // -1 boca redonda … +1 boca ancha
	talking?: boolean;
	lookUp?: number;
	browRaise?: number;
	smile?: number;
	seated?: boolean;
	headTurn?: number;
}> = ({look, frame, pose = 'idle', mouth = 0, shape = 0, talking = false, lookUp = 1, browRaise = 0, smile = 0, seated = false, headTurn = 0}) => {
	const tagTex = usePriceTag();
	const t = frame / 30;
	const breathe = Math.sin(t * 2.2) * 0.008;
	const headBob = talking ? Math.sin(t * 14) * 0.025 : 0;
	const blink = frame % 97 > 92 ? 0.15 : 1;
	const walkPhase = pose === 'walk' ? Math.sin(t * 7) : 0;
	const typingWiggle = pose === 'typing' ? Math.sin(t * 22) * 0.06 : 0;

	const headPitch = THREE.MathUtils.lerp(0.32, -0.05, lookUp) + headBob + (pose === 'shy' ? 0.35 : 0) + (pose === 'reading' ? 0.3 : 0);
	const pupilY = THREE.MathUtils.lerp(-0.03, 0.005, lookUp);
	const arms = ARMS[pose];
	const rArm: Rot = [arms.r[0] + walkPhase * 0.5 + typingWiggle, arms.r[1], arms.r[2]];
	const lArm: Rot = [arms.l[0] - walkPhase * 0.5 - typingWiggle, arms.l[1], arms.l[2]];
	const torsoDepth = look.belly ? 0.5 : 0.34;
	const skirt = look.vest;
	const bodyY = seated ? -0.42 : 0;
	const mouthW = (0.13 + smile * 0.07) * (1 + 0.3 * shape);
	const mouthH = 0.025 + mouth * 0.075 * (1 - 0.3 * Math.max(0, shape));

	const hand = (
		<Box position={[0, -0.64, 0]} size={[0.17, 0.12, 0.18]} color={look.skin} />
	);
	const sleeve = (color: string) => (
		<>
			<Box position={[0, -0.15, 0]} size={[0.18, 0.3, 0.2]} color={color} />
			<Box position={[0, -0.45, 0]} size={[0.16, 0.3, 0.18]} color={look.skin} />
		</>
	);

	return (
		<group position={[0, bodyY, 0]}>
			{/* piernas (giran desde la cadera al caminar o sentarse) */}
			{[-0.14, 0.14].map((x, i) => (
				<group key={x} position={[x, 0.82, 0]} rotation={[seated ? -1.45 : (i ? 1 : -1) * walkPhase * 0.45, 0, 0]}>
					<Box position={[0, -0.36, 0]} size={[0.24, 0.72, 0.26]} color={look.pants} />
					<Box position={[0, -0.75, 0.04]} size={[0.26, 0.14, 0.34]} color={look.boots} />
					{look.mud && <Box position={[0, -0.7, 0.13]} size={[0.27, 0.06, 0.1]} color="#8f8a80" />}
				</group>
			))}
			<Box position={[0, 0.81, 0]} size={[0.6, 0.06, torsoDepth - 0.02]} color="#1b1b22" />

			{/* torso */}
			<group position={[0, 1.08 + breathe, 0]} scale={[pose === 'proud' ? 1.035 : 1, 1, pose === 'proud' ? 1.035 : 1]}>
				<Box size={[0.6, 0.66, torsoDepth]} color={look.shirt} />
				{look.belly && <Box position={[0, -0.12, torsoDepth / 2]} size={[0.5, 0.36, 0.1]} color={look.shirt} />}
				{skirt && (
					<>
						<Box position={[0, -0.02, 0]} size={[0.64, 0.6, torsoDepth + 0.03]} color={look.vest!} />
						<Box position={[0, -0.02, torsoDepth / 2 + 0.016]} size={[0.08, 0.6, 0.01]} color={look.shirt} />
						<Box position={[0, -0.15, 0]} size={[0.645, 0.05, torsoDepth + 0.035]} color="#dfe3ea" emissive="#ffffff" emissiveIntensity={0.18} />
						<Box position={[0, 0.04, 0]} size={[0.645, 0.05, torsoDepth + 0.035]} color="#dfe3ea" emissive="#ffffff" emissiveIntensity={0.18} />
					</>
				)}
				{look.badge && (
					<>
						<Box position={[-0.16, 0.12, torsoDepth / 2 + 0.03]} size={[0.11, 0.15, 0.01]} color="#ffffff" />
						<Box position={[-0.16, 0.17, torsoDepth / 2 + 0.036]} size={[0.11, 0.04, 0.005]} color="#2f6fe0" />
					</>
				)}
			</group>

			{/* brazo derecho */}
			<group position={[0.41, 1.37, 0]} rotation={rArm}>
				{sleeve(look.shirt)}
				{hand}
				{pose === 'phone' || pose === 'proud' ? (
					<group position={[-0.02, -0.72, 0.06]} rotation={[pose === 'proud' ? 2.05 : 1.55, 0, 0]}>
						<Box size={[0.14, 0.25, 0.02]} color="#111" />
						<Box size={[0.12, 0.22, 0.024]} color="#bfe0ff" emissive="#9fd0ff" emissiveIntensity={1.1} />
					</group>
				) : null}
				{pose === 'point' && <Box position={[0, -0.76, 0.02]} size={[0.05, 0.14, 0.05]} color={look.skin} />}
			</group>
			{/* brazo izquierdo */}
			<group position={[-0.41, 1.37, 0]} rotation={lArm}>
				{sleeve(look.shirt)}
				{hand}
				{pose === 'reading' && (
					<group position={[0.12, -0.72, 0.08]} rotation={[1.3, 0, -0.4]}>
						<Box size={[0.36, 0.26, 0.025]} color="#222" />
						<Box position={[0, 0, 0.014]} size={[0.32, 0.22, 0.005]} color="#cfe6ff" emissive="#9fd0ff" emissiveIntensity={0.6} />
					</group>
				)}
			</group>

			{/* cabeza */}
			<group position={[0, 1.46 + breathe, 0]} rotation={[headPitch, headTurn, 0]}>
				<Box position={[0, 0.3, 0]} size={[0.56, 0.56, 0.5]} color={look.skin} />
				<Box position={[0, 0.25, 0.27]} size={[0.07, 0.09, 0.05]} color={look.skin} />
				{/* pelo */}
				{look.hairStyle === 'long' ? (
					<>
						<Box position={[0, 0.2, -0.27]} size={[0.6, 0.7, 0.06]} color={look.hair} />
						<Box position={[-0.29, 0.25, -0.05]} size={[0.04, 0.5, 0.42]} color={look.hair} />
						<Box position={[0.29, 0.25, -0.05]} size={[0.04, 0.5, 0.42]} color={look.hair} />
					</>
				) : (
					<>
						<Box position={[0, 0.42, -0.255]} size={[0.56, 0.3, 0.03]} color={look.hair} />
						<Box position={[-0.285, 0.42, 0]} size={[0.03, 0.22, 0.4]} color={look.hair} />
						<Box position={[0.285, 0.42, 0]} size={[0.03, 0.22, 0.4]} color={look.hair} />
					</>
				)}
				{look.hairStyle === 'short' &&
					[-0.17, -0.05, 0.08, 0.19].map((x, i) => (
						<Box key={x} position={[x, 0.53, 0.25]} size={[0.1, 0.08, 0.04]} rotation={[0, 0, (i % 2 ? 1 : -1) * 0.35]} color={look.hair} />
					))}
				{/* ojos */}
				{[-0.13, 0.13].map((x) => (
					<group key={x} position={[x, 0.34, 0.255]}>
						{look.glasses && <Box size={look.glasses === 'thick' ? [0.21, 0.17, 0.02] : [0.19, 0.14, 0.015]} color={look.glasses === 'thick' ? '#2a2a35' : '#6b3b2a'} />}
						<group scale={[1, blink, 1]}>
							<Box position={[0, 0, 0.012]} size={[0.16, 0.12, 0.01]} color="#f4f6ff" />
							<Box position={[0.005, pupilY, 0.02]} size={[0.06, 0.07, 0.01]} color="#111" />
						</group>
					</group>
				))}
				{look.glasses && <Box position={[0, 0.36, 0.26]} size={[0.06, 0.02, 0.02]} color={look.glasses === 'thick' ? '#2a2a35' : '#6b3b2a'} />}
				{/* cejas */}
				{[-0.13, 0.13].map((x) => (
					<Box
						key={x}
						position={[x, 0.45 + browRaise * 0.04, 0.26]}
						size={[0.14, look.mustache ? 0.045 : 0.03, 0.02]}
						rotation={[0, 0, x < 0 ? -browRaise * 0.2 : browRaise * 0.2]}
						color={look.hairStyle === 'gray' ? '#5c5c5c' : look.hair}
					/>
				))}
				{/* boca: se ensancha con "e/i" y se redondea con "o/u" */}
				<Box position={[0, 0.14, 0.255]} size={[mouthW, mouthH, 0.02]} color={look.lips ?? '#5a1f22'} />
				{mouth > 0.35 && shape > 0.2 && <Box position={[0, 0.14 + mouthH / 2 - 0.012, 0.262]} size={[mouthW * 0.8, 0.018, 0.01]} color="#ffffff" />}
				{look.mustache && <Box position={[0, 0.2, 0.27]} size={[0.3, 0.07, 0.04]} color="#3a3a3a" />}
				{/* casco */}
				<Box position={[0, 0.66, -0.01]} size={[0.62, 0.22, 0.58]} color={look.hat} roughness={look.hatWorn ? 0.9 : 0.35} />
				<Box position={[0, 0.79, -0.01]} size={[0.1, 0.06, 0.6]} color={look.hat} roughness={look.hatWorn ? 0.9 : 0.35} />
				<Box position={[0, 0.555, 0]} size={[0.68, 0.035, 0.64]} color={look.hat} roughness={look.hatWorn ? 0.9 : 0.35} />
				<Box position={[0, 0.555, 0.36]} size={[0.5, 0.035, 0.14]} color={look.hat} roughness={look.hatWorn ? 0.9 : 0.35} />
				{look.hatWorn && (
					<>
						<Box position={[0.12, 0.7, 0.285]} size={[0.12, 0.03, 0.01]} color="#7a6a3a" />
						<Box position={[-0.15, 0.64, 0.285]} size={[0.06, 0.05, 0.01]} color="#8a7a4a" />
						<Box position={[0.2, 0.62, 0.285]} size={[0.04, 0.04, 0.01]} color="#6a5a2a" />
					</>
				)}
				{look.priceTag && (
					<group position={[0.3, 0.54, 0.32]} rotation={[0, 0, Math.sin(t * 3.1) * 0.18]}>
						<Box position={[0, -0.05, 0]} size={[0.006, 0.1, 0.006]} color="#ddd" />
						<mesh position={[0, -0.13, 0]}>
							<planeGeometry args={[0.11, 0.07]} />
							<meshStandardMaterial map={tagTex} roughness={0.8} side={THREE.DoubleSide} />
						</mesh>
					</group>
				)}
			</group>
		</group>
	);
};
