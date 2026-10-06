import React, {useLayoutEffect} from 'react';
import {useThree} from '@react-three/fiber';
import {interpolate, Easing} from 'remotion';
import * as THREE from 'three';
import {Junior} from './Junior';
import {Ingenito} from './Ingenito';
import {Obra} from './Obra';
import {mouthOpen, isTalking} from '../talk';
import {shotAt} from '../shots';

export const JUNIOR_POS: [number, number, number] = [-0.55, 0, 0];
export const INGENITO_POS: [number, number, number] = [0.62, 0, 0];

type Cam = {pos: [number, number, number]; look: [number, number, number]};

const lerp3 = (a: [number, number, number], b: [number, number, number], k: number): [number, number, number] => [
	a[0] + (b[0] - a[0]) * k,
	a[1] + (b[1] - a[1]) * k,
	a[2] + (b[2] - a[2]) * k,
];

// Cada plano tiene una posición inicial y final: empuje lento de cámara
const camFor = (frame: number): Cam => {
	const shot = shotAt(frame);
	const k = interpolate(frame, [shot.from, shot.to], [0, 1], {easing: Easing.inOut(Easing.quad)});
	switch (shot.id) {
		case 'A':
			return {pos: lerp3([0.25, 1.62, 4.3], [0.18, 1.64, 3.8], k), look: [-0.35, 1.5, 0]};
		case 'B':
			return {pos: lerp3([0.2, 1.4, 6.4], [0.1, 1.45, 5.9], k), look: [0, 1.25, 0]};
		case 'C':
			return {pos: lerp3([-0.2, 1.66, 4.2], [-0.12, 1.68, 3.75], k), look: [0.45, 1.55, 0]};
		case 'D':
			return {pos: lerp3([0.1, 1.0, 4.4], [0.05, 1.05, 3.9], k), look: [-0.4, 1.45, 0]};
		case 'E':
		default:
			return {pos: lerp3([0.3, 1.8, 3.0], [0.32, 1.82, 2.75], k), look: [0.6, 1.78, 0]};
	}
};

const CameraRig: React.FC<{frame: number}> = ({frame}) => {
	const {camera} = useThree();
	useLayoutEffect(() => {
		const c = camFor(frame);
		camera.position.set(...c.pos);
		camera.lookAt(new THREE.Vector3(...c.look));
		camera.updateProjectionMatrix();
	}, [camera, frame]);
	return null;
};

export const Scene3D: React.FC<{frame: number}> = ({frame}) => {
	const shot = shotAt(frame).id;
	const juniorLookUp = interpolate(frame, [22, 32], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const proud = shot === 'D';

	return (
		<>
			<CameraRig frame={frame} />
			<ambientLight color="#7085d6" intensity={0.9} />
			<hemisphereLight args={['#8fa6ff', '#2a2230', 0.6]} />
			<directionalLight color="#ffd9a8" intensity={2.2} position={[2.5, 4, 4]} />
			<directionalLight color="#5a7dff" intensity={2.4} position={[-3, 3, -4]} />
			<directionalLight color="#ffb46b" intensity={0.8} position={[0, 5, -1]} />

			<Obra />

			<group position={JUNIOR_POS} rotation={[0, 0.38, 0]}>
				<Junior
					frame={frame}
					pose={proud ? 'proud' : 'phone'}
					mouth={mouthOpen('junior', frame)}
					talking={isTalking('junior', frame)}
					lookUp={proud ? 0.9 : juniorLookUp}
					browRaise={proud ? 1 : 0}
					smile={proud ? 1 : 0}
				/>
			</group>

			<group position={INGENITO_POS} rotation={[0, -0.38, 0]}>
				<Ingenito
					frame={frame}
					mouth={mouthOpen('ingenito', frame)}
					talking={isTalking('ingenito', frame)}
					eyes={shot === 'E' ? 'deadpan' : shot === 'C' ? 'skeptic' : 'normal'}
				/>
			</group>
		</>
	);
};
