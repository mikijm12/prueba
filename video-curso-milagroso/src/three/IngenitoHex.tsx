import React, {useMemo} from 'react';
import * as THREE from 'three';

// Ingenito oficial de CIngeniería: cuerpo hexagonal azul, cara blanca, casco turquesa,
// brazos y piernas de resorte plateado, guantes azules con puño turquesa.
const NAVY = '#1f2a8f';
const NAVY_LIGHT = '#2b3aae';
const TEAL = '#2fe0c4';
const WHITE = '#f7f8fc';
const SILVER = '#c3c8d2';
const PINK = '#f7a8b0';
const MOUTH = '#8a1c2c';
const TONGUE = '#f2727f';

export type HexExpression = 'happy' | 'wink' | 'worried' | 'deadpan' | 'skeptic' | 'surprised';
export type HexArm = 'down' | 'wave' | 'point' | 'thumbs' | 'stop' | 'book' | 'hip';

const BODY_Y = 0.98; // centro del hexágono
const R = 0.52; // radio del hexágono (vértice arriba)

const Mat: React.FC<{color: string; rough?: number; metal?: number; side?: THREE.Side}> = ({color, rough = 0.35, metal = 0, side}) => (
	<meshStandardMaterial color={color} roughness={rough} metalness={metal} side={side} />
);

// Prisma hexagonal con vértice arriba, mirando a +z
const HexPrism: React.FC<{r: number; depth: number; color: string; z?: number; rough?: number}> = ({r, depth, color, z = 0, rough}) => (
	<mesh position={[0, 0, z]} rotation={[Math.PI / 2, 0, 0]}>
		<cylinderGeometry args={[r, r, depth, 6]} />
		<Mat color={color} rough={rough} />
	</mesh>
);

// Resorte: anillos apilados entre dos puntos (en el eje -y local)
const Spring: React.FC<{length: number; radius?: number}> = ({length, radius = 0.062}) => {
	const n = Math.max(3, Math.round(length / 0.032));
	return (
		<group>
			{Array.from({length: n}, (_, i) => (
				<mesh key={i} position={[0, -(i + 0.5) * (length / n), 0]} rotation={[Math.PI / 2, 0, 0]}>
					<torusGeometry args={[radius, radius * 0.38, 8, 16]} />
					<Mat color={SILVER} rough={0.25} metal={0.85} />
				</mesh>
			))}
		</group>
	);
};

const Glove: React.FC<{shape: 'fist' | 'open' | 'point' | 'thumbs'}> = ({shape}) => (
	<group>
		{/* puño turquesa */}
		<mesh rotation={[Math.PI / 2, 0, 0]}>
			<torusGeometry args={[0.078, 0.032, 10, 20]} />
			<Mat color={TEAL} />
		</mesh>
		<mesh position={[0, -0.1, 0]} scale={[1, shape === 'open' ? 1.15 : 0.95, 0.8]}>
			<sphereGeometry args={[0.12, 20, 16]} />
			<Mat color={NAVY_LIGHT} rough={0.4} />
		</mesh>
		{shape === 'open' &&
			[-0.05, -0.017, 0.017, 0.05].map((x) => (
				<mesh key={x} position={[x, -0.2, 0]}>
					<capsuleGeometry args={[0.022, 0.07, 4, 8]} />
					<Mat color={NAVY_LIGHT} rough={0.4} />
				</mesh>
			))}
		{shape === 'point' && (
			<mesh position={[0, -0.2, 0.02]}>
				<capsuleGeometry args={[0.026, 0.1, 4, 8]} />
				<Mat color={NAVY_LIGHT} rough={0.4} />
			</mesh>
		)}
		{(shape === 'thumbs' || shape === 'open') && (
			<mesh position={[shape === 'thumbs' ? 0 : 0.085, shape === 'thumbs' ? -0.02 : -0.1, shape === 'thumbs' ? 0.07 : 0.02]} rotation={[shape === 'thumbs' ? 0.2 : 0, 0, shape === 'thumbs' ? 0 : -0.6]}>
				<capsuleGeometry args={[0.028, 0.07, 4, 8]} />
				<Mat color={NAVY_LIGHT} rough={0.4} />
			</mesh>
		)}
	</group>
);

type ArmPose = {shoulder: [number, number, number]; elbow: number; hand: 'fist' | 'open' | 'point' | 'thumbs'};

// side = +1 brazo derecho de la pantalla (izquierdo del personaje), -1 el otro
const armPose = (pose: HexArm, side: number): ArmPose => {
	switch (pose) {
		case 'wave':
			return {shoulder: [0, 0, side * 2.0], elbow: side * 0.9, hand: 'open'};
		case 'stop':
			return {shoulder: [-0.35, 0, side * 1.5], elbow: side * 1.3, hand: 'open'};
		case 'point':
			return {shoulder: [0, 0, side * 1.55], elbow: side * 0.15, hand: 'point'};
		case 'thumbs':
			return {shoulder: [-0.2, 0, side * 1.25], elbow: side * 1.35, hand: 'thumbs'};
		case 'book':
			return {shoulder: [-0.75, 0, side * 0.25], elbow: side * -1.1, hand: 'fist'};
		case 'hip':
			return {shoulder: [0, 0, side * 0.75], elbow: side * -1.7, hand: 'fist'};
		default:
			return {shoulder: [0.05, 0, side * 0.22], elbow: side * -0.1, hand: 'fist'};
	}
};

const Arm: React.FC<{pose: HexArm; side: number; swing: number}> = ({pose, side, swing}) => {
	const p = armPose(pose, side);
	return (
		<group position={[side * R * 0.86, BODY_Y - 0.05, -0.02]} rotation={[p.shoulder[0] + swing, p.shoulder[1], p.shoulder[2]]}>
			<Spring length={0.26} />
			<group position={[0, -0.26, 0]} rotation={[0, 0, p.elbow]}>
				<Spring length={0.2} />
				<group position={[0, -0.22, 0]}>
					<Glove shape={p.hand} />
				</group>
			</group>
		</group>
	);
};

const useBookTexture = () =>
	useMemo(() => {
		const c = document.createElement('canvas');
		c.width = 256;
		c.height = 200;
		const ctx = c.getContext('2d')!;
		ctx.fillStyle = NAVY;
		ctx.fillRect(0, 0, 256, 200);
		ctx.fillStyle = TEAL;
		ctx.font = '900 64px Inter, sans-serif';
		ctx.textAlign = 'center';
		ctx.fillText('E.060', 128, 92);
		ctx.fillStyle = '#ffffff';
		ctx.fillRect(48, 112, 160, 3);
		ctx.font = '700 26px Inter, sans-serif';
		ctx.fillText('MANUAL RNE', 128, 156);
		const tex = new THREE.CanvasTexture(c);
		tex.colorSpace = THREE.SRGBColorSpace;
		return tex;
	}, []);

const Eye: React.FC<{x: number; open: number; closed?: boolean; look: [number, number]}> = ({x, open, closed, look}) => {
	if (closed) {
		// ojo guiñado: arco ^
		return (
			<mesh position={[x, 0.05, 0.137]} rotation={[0, 0, 0]}>
				<torusGeometry args={[0.06, 0.012, 8, 20, Math.PI * 0.8]} />
				<meshBasicMaterial color={NAVY} />
			</mesh>
		);
	}
	return (
		<group position={[x, 0.05, 0.135]} scale={[1, open, 1]}>
			<mesh scale={[1, 1.15, 1]}>
				<circleGeometry args={[0.078, 32]} />
				<meshBasicMaterial color={NAVY} />
			</mesh>
			<mesh position={[0, 0, 0.001]} scale={[1, 1.15, 1]}>
				<circleGeometry args={[0.066, 32]} />
				<meshBasicMaterial color="#ffffff" />
			</mesh>
			<mesh position={[look[0], look[1] - 0.004, 0.002]}>
				<circleGeometry args={[0.045, 32]} />
				<meshBasicMaterial color="#2433a6" />
			</mesh>
			<mesh position={[look[0], look[1] - 0.004, 0.003]}>
				<circleGeometry args={[0.027, 24]} />
				<meshBasicMaterial color="#0b1240" />
			</mesh>
			<mesh position={[look[0] + 0.016, look[1] + 0.018, 0.004]}>
				<circleGeometry args={[0.013, 16]} />
				<meshBasicMaterial color="#ffffff" />
			</mesh>
		</group>
	);
};

const Brow: React.FC<{x: number; y: number; tilt: number}> = ({x, y, tilt}) => (
	<mesh position={[x, y, 0.137]} rotation={[0, 0, Math.PI * 0.3 + tilt]}>
		<torusGeometry args={[0.07, 0.011, 8, 20, Math.PI * 0.4]} />
		<meshBasicMaterial color={NAVY} />
	</mesh>
);

const Mouth: React.FC<{expr: HexExpression; open: number}> = ({expr, open}) => {
	const z = 0.136;
	if (expr === 'deadpan' && open < 0.1) {
		return (
			<mesh position={[0, -0.1, z]}>
				<planeGeometry args={[0.1, 0.014]} />
				<meshBasicMaterial color={NAVY} />
			</mesh>
		);
	}
	if (expr === 'worried' || expr === 'surprised') {
		const s = 0.6 + open * 0.5;
		return (
			<group position={[0, -0.1, z]} scale={[s * 0.8, s, 1]}>
				<mesh>
					<circleGeometry args={[0.045, 24]} />
					<meshBasicMaterial color={MOUTH} />
				</mesh>
				<mesh position={[0, -0.022, 0.001]} scale={[1, 0.5, 1]}>
					<circleGeometry args={[0.03, 20]} />
					<meshBasicMaterial color={TONGUE} />
				</mesh>
			</group>
		);
	}
	// sonrisa abierta: semicírculo que se abre con la voz
	const h = expr === 'deadpan' || expr === 'skeptic' ? 0.25 + open * 0.6 : 0.55 + open * 0.55;
	return (
		<group position={[0, -0.07, z]} scale={[1, h, 1]}>
			<mesh>
				<circleGeometry args={[0.1, 32, Math.PI, Math.PI]} />
				<meshBasicMaterial color={NAVY} />
			</mesh>
			<mesh position={[0, 0, 0.001]}>
				<circleGeometry args={[0.088, 32, Math.PI, Math.PI]} />
				<meshBasicMaterial color={MOUTH} />
			</mesh>
			<mesh position={[0, -0.058, 0.002]} scale={[1, 0.55, 1]}>
				<circleGeometry args={[0.055, 24, 0, Math.PI]} />
				<meshBasicMaterial color={TONGUE} />
			</mesh>
		</group>
	);
};

export const IngenitoHex: React.FC<{
	frame: number;
	mouth: number;
	talk: number;
	expr: HexExpression;
	leftArm?: HexArm;
	rightArm?: HexArm;
	book?: boolean;
}> = ({frame, mouth, talk, expr, leftArm = 'down', rightArm = 'down', book}) => {
	const t = frame / 30;
	const bob = Math.sin(t * 2.2) * 0.012 + talk * Math.sin(t * 9) * 0.01;
	const tilt = talk * Math.sin(t * 4.5) * 0.04 + (expr === 'skeptic' ? 0.08 : 0);
	const blink = (expr === 'happy' || expr === 'worried') && frame % 100 > 96 ? 0.1 : 1;
	const swing = talk * Math.sin(t * 5) * 0.15;
	const bookTex = useBookTexture();

	const eyeOpen = expr === 'deadpan' ? 0.42 : expr === 'surprised' ? 1.15 : blink;
	const browY = expr === 'surprised' ? 0.2 : expr === 'deadpan' ? 0.13 : 0.17;
	const browTilt = expr === 'worried' ? 0.45 : expr === 'skeptic' ? -0.3 : 0;
	const bothArmsBook = book || leftArm === 'book' || rightArm === 'book';

	return (
		<group>
			{/* zapatos y piernas de resorte */}
			{[-0.18, 0.18].map((x) => (
				<group key={x} position={[x, 0, 0]}>
					<mesh position={[0, 0.025, 0.04]}>
						<cylinderGeometry args={[0.17, 0.17, 0.05, 24]} />
						<Mat color={TEAL} />
					</mesh>
					<mesh position={[0, 0.1, 0.05]} scale={[1, 0.62, 1.25]}>
						<sphereGeometry args={[0.16, 24, 16]} />
						<Mat color={NAVY_LIGHT} />
					</mesh>
					<mesh position={[0, 0.17, 0]} rotation={[Math.PI / 2, 0, 0]}>
						<torusGeometry args={[0.085, 0.034, 10, 20]} />
						<Mat color={TEAL} />
					</mesh>
					<group position={[0, BODY_Y - R * 0.8 + bob, 0]}>
						<Spring length={BODY_Y - R * 0.8 - 0.18 + bob} radius={0.068} />
					</group>
				</group>
			))}

			<group position={[0, bob, 0]}>
				<Arm pose={bothArmsBook ? 'book' : leftArm} side={-1} swing={leftArm === 'down' ? swing : 0} />
				<Arm pose={bothArmsBook ? 'book' : rightArm} side={1} swing={rightArm === 'down' ? -swing : 0} />

				{/* cuerpo-cabeza hexagonal */}
				<group position={[0, BODY_Y, 0]} rotation={[0, 0, tilt]}>
					<HexPrism r={R} depth={0.24} color={NAVY} />
					<HexPrism r={R * 0.86} depth={0.02} color={NAVY_LIGHT} z={0.12} />
					<HexPrism r={R * 0.78} depth={0.02} color={WHITE} z={0.125} rough={0.5} />

					<group scale={[1.4, 1.4, 1]}>
						<Eye x={-0.1} open={eyeOpen} look={[0.006, 0]} />
						<Eye x={0.1} open={eyeOpen} closed={expr === 'wink'} look={[0.006, 0]} />
						<Brow x={-0.1} y={browY} tilt={-browTilt} />
						<Brow x={0.1} y={browY + (expr === 'skeptic' ? 0.03 : 0)} tilt={browTilt} />
						<Mouth expr={expr} open={mouth} />
					</group>
					{[-0.25, 0.25].map((x) => (
						<mesh key={x} position={[x, -0.1, 0.136]}>
							<circleGeometry args={[0.065, 24]} />
							<meshBasicMaterial color={PINK} transparent opacity={0.75} />
						</mesh>
					))}

					{/* casco turquesa con franja azul y logo hexagonal */}
					<group position={[0, R * 0.74, -0.01]} scale={[1.18, 1.18, 1.18]}>
						<mesh position={[0, 0.0, 0]}>
							<cylinderGeometry args={[0.47, 0.47, 0.035, 40]} />
							<Mat color={TEAL} rough={0.25} />
						</mesh>
						<mesh position={[0, 0.02, 0]} scale={[1, 0.82, 0.95]}>
							<sphereGeometry args={[0.36, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2]} />
							<Mat color={TEAL} rough={0.2} />
						</mesh>
						<mesh position={[0, 0.02, 0]} rotation={[0, Math.PI / 2, 0]} scale={[0.95, 0.82, 1]}>
							<torusGeometry args={[0.36, 0.026, 10, 40, Math.PI]} />
							<Mat color={NAVY} rough={0.3} />
						</mesh>
						<group position={[0.2, 0.17, 0.23]} rotation={[-0.5, 0.55, 0]}>
							<mesh rotation={[Math.PI / 2, 0, 0]}>
								<cylinderGeometry args={[0.07, 0.07, 0.01, 6]} />
								<meshBasicMaterial color={NAVY} />
							</mesh>
							<mesh position={[0, 0, 0.006]} rotation={[Math.PI / 2, 0, 0]}>
								<cylinderGeometry args={[0.055, 0.055, 0.01, 6]} />
								<meshBasicMaterial color="#ffffff" />
							</mesh>
							<mesh position={[0, 0, 0.012]} rotation={[Math.PI / 2, 0, 0]}>
								<cylinderGeometry args={[0.03, 0.03, 0.01, 6]} />
								<meshBasicMaterial color={TEAL} />
							</mesh>
						</group>
					</group>
				</group>

				{bothArmsBook && (
					<group position={[0, BODY_Y - 0.36, 0.3]} rotation={[-0.15, 0, 0]} scale={[1.15, 1.15, 1.15]}>
						<mesh>
							<boxGeometry args={[0.46, 0.36, 0.07]} />
							<Mat color={NAVY} />
						</mesh>
						<mesh position={[0, 0, 0.036]}>
							<planeGeometry args={[0.44, 0.34]} />
							<meshStandardMaterial map={bookTex} roughness={0.5} />
						</mesh>
					</group>
				)}
			</group>
		</group>
	);
};
