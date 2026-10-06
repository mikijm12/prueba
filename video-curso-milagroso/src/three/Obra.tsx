import React from 'react';
import {Box} from './Box';

// Losa de obra con utilería: cono, barrera, fierros y encofrado
export const Obra: React.FC = () => (
	<group>
		<Box position={[0, -0.1, -1]} size={[16, 0.2, 12]} color="#4c535f" roughness={0.95} />
		{/* borde de losa */}
		<Box position={[0, -0.1, 5]} size={[16, 0.24, 0.1]} color="#3a4049" />

		{/* fierros de columna esperando */}
		{[-2.6, -2.4, -2.2, 2.3, 2.5, 2.7].map((x) =>
			[-3.0, -2.8].map((z) => (
				<Box key={`${x}${z}`} position={[x, 0.7, z]} size={[0.035, 1.4, 0.035]} color="#8a4b2a" roughness={0.9} />
			))
		)}
		{/* encofrado de madera */}
		<Box position={[-2.4, 0.6, -2.0]} size={[0.6, 1.2, 0.6]} color="#b98a4e" />

		{/* cono */}
		<group position={[-1.55, 0, 0.7]}>
			<Box position={[0, 0.02, 0]} size={[0.4, 0.04, 0.4]} color="#e8590c" />
			<mesh position={[0, 0.3, 0]}>
				<coneGeometry args={[0.15, 0.55, 8]} />
				<meshStandardMaterial color="#ff6b1a" flatShading />
			</mesh>
			<mesh position={[0, 0.33, 0]}>
				<cylinderGeometry args={[0.085, 0.105, 0.08, 8]} />
				<meshStandardMaterial color="#f2f2f2" emissive="#ffffff" emissiveIntensity={0.2} flatShading />
			</mesh>
		</group>

		{/* barrera rojo/blanco */}
		<group position={[2.1, 0, -1.4]} rotation={[0, -0.4, 0]}>
			{[-0.7, 0.7].map((x) => (
				<Box key={x} position={[x, 0.45, 0]} size={[0.08, 0.9, 0.08]} color="#ddd" />
			))}
			{[-0.6, -0.2, 0.2, 0.6].map((x, i) => (
				<Box key={x} position={[x, 0.75, 0]} size={[0.4, 0.18, 0.06]} color={i % 2 ? '#f4f4f4' : '#d62828'} />
			))}
		</group>
	</group>
);
