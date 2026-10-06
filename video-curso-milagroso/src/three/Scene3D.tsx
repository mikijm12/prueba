import React, {useLayoutEffect} from 'react';
import {useThree} from '@react-three/fiber';
import {interpolate, Easing} from 'remotion';
import * as THREE from 'three';
import {Junior} from './Junior';
import {Ingenito} from './Ingenito';
import {IngenitoHex} from './IngenitoHex';
import {Obra} from './Obra';
import {SceneSets} from './SceneSets';
import {Cam, Episode} from '../episode';

export const JUNIOR_POS: [number, number, number] = [-0.55, 0, 0];
const ROBOT_POS: [number, number, number] = [0.62, 0, 0];
const HEX_POS: [number, number, number] = [0.78, 0, 0];
const HEX_SCALE = 1.15;

type V3 = [number, number, number];
type CamDef = {a: V3; b: V3; look: V3};

// Cada cámara: posición inicial, final (empuje lento) y punto al que mira
const CAMS: Partial<Record<Cam, CamDef>> = {
	JUN: {a: [0.25, 1.62, 4.3], b: [0.18, 1.64, 3.8], look: [-0.35, 1.5, 0]},
	ING: {a: [-0.2, 1.66, 4.2], b: [-0.12, 1.68, 3.75], look: [0.45, 1.55, 0]},
	JUN_LOW: {a: [0.1, 1.0, 4.4], b: [0.05, 1.05, 3.9], look: [-0.4, 1.45, 0]},
	ING_CLOSE: {a: [0.3, 1.8, 3.0], b: [0.32, 1.82, 2.75], look: [0.6, 1.78, 0]},
	WIDE: {a: [0.2, 1.4, 6.4], b: [0.1, 1.45, 5.9], look: [0, 1.25, 0]},
	TWO: {a: [0.05, 1.5, 6.4], b: [0.05, 1.52, 5.9], look: [0.03, 1.5, 0]},
	WIDE_END: {a: [0, 1.6, 8.4], b: [0, 1.55, 7.6], look: [0, 0.95, 0]},
};

// El Ingenito hexagonal es más bajo y ancho: sus planos apuntan más abajo
const HEX_CAMS: Partial<Record<Cam, CamDef>> = {
	ING: {a: [0.0, 1.35, 6.4], b: [0.08, 1.37, 5.8], look: [0.6, 1.2, 0]},
	ING_CLOSE: {a: [0.4, 1.4, 4.9], b: [0.45, 1.42, 4.4], look: [0.74, 1.3, 0]},
	TWO: {a: [0.1, 1.45, 6.8], b: [0.1, 1.47, 6.3], look: [0.1, 1.25, 0]},
};

const lerp3 = (a: V3, b: V3, k: number): V3 => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];

const CameraRig: React.FC<{frame: number; ep: Episode}> = ({frame, ep}) => {
	const {camera} = useThree();
	useLayoutEffect(() => {
		const id = ep.segmentAt(frame).cam;
		const cam = (ep.timeline.ingenito === 'hex' && HEX_CAMS[id]) || CAMS[id] || CAMS.WIDE!;
		const run = ep.camRunAt(frame);
		const k = interpolate(frame, [run.from, run.to], [0, 1], {easing: Easing.inOut(Easing.quad)});
		camera.position.set(...lerp3(cam.a, cam.b, k));
		camera.lookAt(new THREE.Vector3(...cam.look));
		camera.updateProjectionMatrix();
	}, [camera, frame, ep]);
	return null;
};

export const Scene3D: React.FC<{frame: number; ep: Episode}> = ({frame, ep}) => {
	const seg = ep.segmentAt(frame);
	if (seg.set === 'oficina' || seg.set === 'obra-dia') return <SceneSets frame={frame} ep={ep} />;
	const pose = seg.juniorPose ?? 'phone';
	// mira el celular al inicio del plano y luego levanta la vista
	const lookUpAt = seg.from + (seg.to - seg.from) * (seg.lookUpAt ?? (seg.cam === 'JUN' ? 0.3 : 0));
	const lookUp = pose === 'proud' ? 0.9 : interpolate(frame, [lookUpAt - 1, lookUpAt + 9], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const hex = ep.timeline.ingenito === 'hex';

	return (
		<>
			<CameraRig frame={frame} ep={ep} />
			<ambientLight color="#7085d6" intensity={0.9} />
			<hemisphereLight args={['#8fa6ff', '#2a2230', 0.6]} />
			<directionalLight color="#ffd9a8" intensity={2.2} position={[2.5, 4, 4]} />
			<directionalLight color="#5a7dff" intensity={2.4} position={[-3, 3, -4]} />
			<directionalLight color="#ffb46b" intensity={0.8} position={[0, 5, -1]} />

			<Obra />

			<group position={JUNIOR_POS} rotation={[0, 0.38, 0]}>
				<Junior
					frame={frame}
					pose={pose}
					mouth={ep.mouthOpen('junior', frame)}
					talking={ep.isTalking('junior', frame)}
					lookUp={lookUp}
					browRaise={seg.juniorBrow ?? 0}
					smile={seg.juniorSmile ?? 0}
				/>
			</group>

			{hex ? (
				<group position={HEX_POS} rotation={[0, -0.3, 0]} scale={HEX_SCALE}>
					<IngenitoHex
						frame={frame}
						mouth={ep.mouthOpen('ingenito', frame)}
						shape={ep.mouthShape('ingenito', frame)}
						talk={ep.talkLevel('ingenito', frame)}
						expr={seg.expr ?? 'happy'}
						leftArm={seg.leftArm}
						rightArm={seg.rightArm}
						book={seg.book}
					/>
				</group>
			) : (
				<group position={ROBOT_POS} rotation={[0, -0.38, 0]}>
					<Ingenito
						frame={frame}
						mouth={ep.mouthOpen('ingenito', frame)}
						talking={ep.isTalking('ingenito', frame)}
						talk={ep.talkLevel('ingenito', frame)}
						eyes={seg.ingenitoEyes ?? 'normal'}
					/>
				</group>
			)}
		</>
	);
};
