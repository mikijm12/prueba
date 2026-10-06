import React from 'react';

type V3 = [number, number, number];

export const Box: React.FC<{
	position?: V3;
	size: V3;
	color: string;
	rotation?: V3;
	emissive?: string;
	emissiveIntensity?: number;
	roughness?: number;
	metalness?: number;
}> = ({position = [0, 0, 0], size, color, rotation, emissive, emissiveIntensity = 1, roughness = 0.75, metalness = 0}) => (
	<mesh position={position} rotation={rotation}>
		<boxGeometry args={size} />
		<meshStandardMaterial
			color={color}
			emissive={emissive ?? '#000000'}
			emissiveIntensity={emissive ? emissiveIntensity : 0}
			roughness={roughness}
			metalness={metalness}
			flatShading
		/>
	</mesh>
);
