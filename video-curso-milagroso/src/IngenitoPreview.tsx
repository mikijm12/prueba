import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {IngenitoHex, HexArm, HexExpression} from './three/IngenitoHex';

// Hoja de poses del nuevo Ingenito para aprobar el diseño
const POSES: {expr: HexExpression; left?: HexArm; right?: HexArm; book?: boolean; label: string}[] = [
	{expr: 'happy', right: 'wave', label: 'Saludo'},
	{expr: 'wink', right: 'thumbs', label: '¡Bien!'},
	{expr: 'happy', book: true, label: 'Norma E.060'},
	{expr: 'happy', right: 'point', label: 'Señala'},
	{expr: 'worried', right: 'stop', label: '¡Alto!'},
	{expr: 'deadpan', label: 'Cara seria'},
];

export const IngenitoPreview: React.FC = () => {
	const frame = useCurrentFrame();
	const {width, height} = useVideoConfig();
	const spacing = 1.6;
	const x0 = -((POSES.length - 1) * spacing) / 2;
	return (
		<AbsoluteFill style={{background: 'linear-gradient(180deg, #040824 0%, #0a1648 55%, #17287a 100%)'}}>
			<ThreeCanvas width={width} height={height} camera={{fov: 22, position: [0, 1.05, 14.5], near: 0.1, far: 60}} gl={{alpha: true, antialias: true}}>
				<ambientLight color="#8b9be6" intensity={1.2} />
				<directionalLight color="#fff2e0" intensity={2.6} position={[2, 4, 5]} />
				<directionalLight color="#5a7dff" intensity={1.6} position={[-3, 3, -4]} />
				{POSES.map((p, i) => (
					<group key={p.label} position={[x0 + i * spacing, 0, 0]}>
						<IngenitoHex frame={frame} mouth={0.4} talk={0} expr={p.expr} leftArm={p.left} rightArm={p.right} book={p.book} />
					</group>
				))}
			</ThreeCanvas>
			{POSES.map((p, i) => (
				<div
					key={p.label}
					style={{
						position: 'absolute',
						top: 930,
						left: 960 - 100 + (i - (POSES.length - 1) / 2) * 293,
						width: 200,
						textAlign: 'center',
						color: '#fff',
						fontFamily: 'Inter, sans-serif',
						fontWeight: 700,
						fontSize: 30,
					}}
				>
					{p.label}
				</div>
			))}
		</AbsoluteFill>
	);
};
