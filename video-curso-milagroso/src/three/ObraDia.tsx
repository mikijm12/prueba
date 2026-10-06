import React from 'react';
import {Box} from './Box';
import {random} from 'remotion';

// Obra de día: columnas (una con cangrejera), fierros, mezcladora, carretilla, ladrillos y andamio

export const COLUMNA_POS: [number, number, number] = [-0.55, 0, -0.75];

const Columna: React.FC<{position: [number, number, number]; cangrejera?: boolean}> = ({position, cangrejera}) => (
	<group position={position}>
		<Box position={[0, 1.3, 0]} size={[0.4, 2.6, 0.4]} color="#a9a8a2" roughness={0.95} />
		{/* fierros esperando el siguiente piso */}
		{[-0.13, 0.13].map((x) =>
			[-0.13, 0.13].map((z) => <Box key={`${x}${z}`} position={[x, 2.9, z]} size={[0.025, 0.6, 0.025]} color="#8a4b2a" />)
		)}
		{cangrejera && (
			<group position={[0, 0.75, 0.201]}>
				{/* huecos de la cangrejera con piedras y fierro expuesto */}
				<Box position={[0, 0, 0]} size={[0.3, 0.42, 0.01]} color="#5d5a54" />
				{Array.from({length: 18}, (_, i) => (
					<mesh key={i} position={[(random(`cx${i}`) - 0.5) * 0.26, (random(`cy${i}`) - 0.5) * 0.36, 0.01]}>
						<sphereGeometry args={[0.025 + random(`cr${i}`) * 0.025, 6, 5]} />
						<meshStandardMaterial color={i % 3 ? '#7d786e' : '#3b3833'} roughness={1} flatShading />
					</mesh>
				))}
				<Box position={[-0.06, 0, 0.012]} size={[0.02, 0.44, 0.02]} color="#8a4b2a" />
				<Box position={[0.08, 0, 0.012]} size={[0.02, 0.44, 0.02]} color="#8a4b2a" />
			</group>
		)}
	</group>
);

export const ObraDia: React.FC<{frame: number}> = ({frame}) => (
	<group>
		{/* terreno y losa */}
		<Box position={[0, -0.06, -1]} size={[20, 0.1, 14]} color="#a58f74" roughness={1} />
		<Box position={[0, 0.0, -1.2]} size={[7, 0.06, 4.4]} color="#a7a6a1" roughness={0.95} />

		<Columna position={COLUMNA_POS} cangrejera />
		<Columna position={[2.6, 0, -1.4]} />
		<Columna position={[-2.9, 0, -1.6]} />

		{/* encofrado de madera apoyado */}
		<Box position={[-1.7, 0.7, -1.9]} size={[0.9, 1.4, 0.05]} rotation={[-0.15, 0.2, 0]} color="#c49a5c" />
		<Box position={[-1.2, 0.6, -2.0]} size={[0.7, 1.2, 0.05]} rotation={[-0.2, -0.1, 0]} color="#b98a4e" />

		{/* andamio al fondo */}
		<group position={[0.4, 0, -3.0]}>
			{[-1.2, 0, 1.2].map((x) => (
				<Box key={x} position={[x, 1.6, 0]} size={[0.05, 3.2, 0.05]} color="#5e6b7a" metalness={0.5} roughness={0.4} />
			))}
			{[1.0, 2.2].map((y) => (
				<Box key={y} position={[0, y, 0]} size={[2.5, 0.06, 0.6]} color="#b98a4e" />
			))}
			<Box position={[0, 1.6, 0]} size={[2.4, 0.04, 0.04]} rotation={[0, 0, 0.9]} color="#5e6b7a" />
		</group>

		{/* mezcladora (trompo) girando */}
		<group position={[2.5, 0, -0.4]} rotation={[0, -0.6, 0]}>
			<Box position={[0, 0.45, 0]} size={[0.9, 0.08, 0.5]} color="#444" />
			{[-0.35, 0.35].map((x) => (
				<mesh key={x} position={[x, 0.18, 0.28]} rotation={[Math.PI / 2, 0, 0]}>
					<cylinderGeometry args={[0.18, 0.18, 0.08, 16]} />
					<meshStandardMaterial color="#1c1c1c" />
				</mesh>
			))}
			<group position={[0, 0.95, 0]} rotation={[0, 0, -0.5]}>
				<mesh rotation={[0, frame / 6, 0]}>
					<cylinderGeometry args={[0.28, 0.42, 0.8, 14]} />
					<meshStandardMaterial color="#e8641e" roughness={0.5} flatShading />
				</mesh>
				<mesh position={[0, 0.5, 0]}>
					<cylinderGeometry args={[0.2, 0.28, 0.2, 14, 1, true]} />
					<meshStandardMaterial color="#c9551a" side={2} />
				</mesh>
			</group>
		</group>

		{/* carretilla con mezcla */}
		<group position={[-2.1, 0, 0.9]} rotation={[0, 0.7, 0]}>
			<Box position={[0, 0.42, 0]} size={[0.55, 0.25, 0.8]} color="#2f8f5b" />
			<Box position={[0, 0.55, 0]} size={[0.5, 0.04, 0.72]} color="#8d8a84" />
			<mesh position={[0, 0.16, 0.5]} rotation={[0, 0, Math.PI / 2]}>
				<cylinderGeometry args={[0.16, 0.16, 0.08, 16]} />
				<meshStandardMaterial color="#1c1c1c" />
			</mesh>
			{[-0.2, 0.2].map((x) => (
				<Box key={x} position={[x, 0.35, -0.65]} size={[0.04, 0.04, 0.6]} rotation={[0.3, 0, 0]} color="#555" />
			))}
		</group>

		{/* ladrillos y cemento */}
		<group position={[1.9, 0, -1.9]}>
			{Array.from({length: 4}, (_, y) =>
				Array.from({length: 3}, (_, i) => (
					<Box key={`${y}${i}`} position={[(i - 1) * 0.26 + (y % 2) * 0.13, 0.06 + y * 0.12, 0]} size={[0.24, 0.1, 0.12]} color="#b5532f" />
				))
			)}
		</group>
		<group position={[-2.6, 0, -0.6]}>
			{[0, 1, 2].map((y) => (
				<Box key={y} position={[(y % 2) * 0.06, 0.09 + y * 0.17, 0]} size={[0.6, 0.16, 0.4]} color="#9da1a6" />
			))}
			<Box position={[0.06, 0.43, 0.205]} size={[0.3, 0.06, 0.01]} color="#d6202a" />
		</group>

		{/* cono */}
		<group position={[0.55, 0, 1.3]}>
			<mesh position={[0, 0.25, 0]}>
				<coneGeometry args={[0.13, 0.5, 8]} />
				<meshStandardMaterial color="#ff6b1a" flatShading />
			</mesh>
			<Box position={[0, 0.02, 0]} size={[0.34, 0.04, 0.34]} color="#e8590c" />
		</group>
	</group>
);
