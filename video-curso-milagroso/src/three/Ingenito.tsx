import React from 'react';
import {Box} from './Box';

const BODY = '#efe6dc';
const JOINT = '#9aa0ab';
const HAT = '#ffc21a';
const EYE = '#e8f6ff';

export type IngenitoEyes = 'normal' | 'skeptic' | 'deadpan';

export const Ingenito: React.FC<{
	frame: number;
	mouth: number;
	talking: boolean;
	eyes: IngenitoEyes;
}> = ({frame, mouth, talking, eyes}) => {
	const t = frame / 30;
	const hover = Math.sin(t * 1.8) * 0.006;
	const headTilt = talking ? Math.sin(t * 9) * 0.03 : eyes === 'skeptic' ? 0.08 : 0;
	const blink = eyes === 'normal' && frame % 110 > 105 ? 0.12 : 1;
	const beacon = 0.6 + 0.4 * Math.max(0, Math.sin(t * 7));

	const eyeH = (side: number) => {
		if (eyes === 'deadpan') return 0.03;
		if (eyes === 'skeptic') return side < 0 ? 0.09 : 0.19;
		return 0.19 * blink;
	};
	const eyeW = eyes === 'deadpan' ? 0.17 : 0.14;

	return (
		<group>
			{/* piernas */}
			{[-0.15, 0.15].map((x) => (
				<group key={x}>
					<Box position={[x, 0.06, 0.03]} size={[0.24, 0.12, 0.3]} color={JOINT} />
					<Box position={[x, 0.39, 0]} size={[0.2, 0.58, 0.22]} color={BODY} />
				</group>
			))}
			<Box position={[0, 0.72, 0]} size={[0.5, 0.14, 0.34]} color={JOINT} />

			{/* cuerpo con panel brillante */}
			<group position={[0, 1.08 + hover, 0]}>
				<Box size={[0.62, 0.62, 0.42]} color={BODY} roughness={0.5} />
				<Box position={[0, 0.03, 0.212]} size={[0.36, 0.3, 0.01]} color="#ffe2b0" emissive="#ffc77a" emissiveIntensity={1.1} />
				<pointLight position={[0, 0.03, 0.5]} color="#ffc77a" intensity={0.5} distance={1.4} />
			</group>

			{/* brazos; el izquierdo sostiene un plano enrollado */}
			<group position={[-0.41, 1.34 + hover, 0]} rotation={[0.35, 0, -0.12]}>
				<Box position={[0, -0.05, 0]} size={[0.12, 0.12, 0.12]} color={JOINT} />
				<Box position={[0, -0.33, 0]} size={[0.17, 0.5, 0.19]} color={BODY} />
				<Box position={[0, -0.63, 0]} size={[0.15, 0.12, 0.17]} color={JOINT} />
				<mesh position={[0.05, -0.6, 0.12]} rotation={[1.2, 0, 0]}>
					<cylinderGeometry args={[0.055, 0.055, 0.62, 10]} />
					<meshStandardMaterial color="#3d74c9" roughness={0.7} flatShading />
				</mesh>
			</group>
			<group position={[0.41, 1.34 + hover, 0]} rotation={[0.05, 0, 0.1]}>
				<Box position={[0, -0.05, 0]} size={[0.12, 0.12, 0.12]} color={JOINT} />
				<Box position={[0, -0.33, 0]} size={[0.17, 0.5, 0.19]} color={BODY} />
				<Box position={[0, -0.63, 0]} size={[0.15, 0.12, 0.17]} color={JOINT} />
			</group>

			<Box position={[0, 1.44 + hover, 0]} size={[0.16, 0.1, 0.16]} color={JOINT} />

			{/* cabeza-monitor */}
			<group position={[0, 1.49 + hover, 0]} rotation={[0, 0, headTilt]}>
				<Box position={[0, 0.33, 0]} size={[0.82, 0.62, 0.6]} color={BODY} roughness={0.5} />
				<Box position={[0, 0.33, 0.3]} size={[0.7, 0.5, 0.02]} color="#0b0f1a" roughness={0.95} />
				{[-0.15, 0.15].map((x) => (
					<Box key={x} position={[x, 0.38, 0.315]} size={[eyeW, eyeH(x), 0.01]} color={EYE} emissive={EYE} emissiveIntensity={2.4} />
				))}
				<Box position={[0, 0.2, 0.315]} size={[0.14, 0.03 + mouth * 0.07, 0.01]} color={EYE} emissive={EYE} emissiveIntensity={2.4} />
								{[-0.43, 0.43].map((x) => (
					<mesh key={x} position={[x, 0.33, 0]} rotation={[0, 0, Math.PI / 2]}>
						<cylinderGeometry args={[0.08, 0.08, 0.06, 12]} />
						<meshStandardMaterial color={JOINT} flatShading />
					</mesh>
				))}
				{/* casco amarillo con circulina */}
				<Box position={[0, 0.74, -0.01]} size={[0.66, 0.2, 0.56]} color={HAT} roughness={0.4} />
				<Box position={[0, 0.85, -0.01]} size={[0.1, 0.05, 0.58]} color={HAT} roughness={0.4} />
				<Box position={[0, 0.645, 0]} size={[0.74, 0.035, 0.64]} color={HAT} roughness={0.4} />
				<Box position={[0, 0.645, 0.36]} size={[0.54, 0.035, 0.14]} color={HAT} roughness={0.4} />
				<mesh position={[0, 0.92, 0]}>
					<cylinderGeometry args={[0.05, 0.06, 0.1, 10]} />
					<meshStandardMaterial color="#ffb020" emissive="#ff9800" emissiveIntensity={2.5 * beacon} flatShading />
				</mesh>
				<pointLight position={[0, 1.0, 0.1]} color="#ff9a1a" intensity={0.5 * beacon} distance={1.6} />
			</group>
		</group>
	);
};
