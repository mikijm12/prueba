import React, {useLayoutEffect} from 'react';
import {useThree} from '@react-three/fiber';
import {interpolate, Easing, random} from 'remotion';
import * as THREE from 'three';
import {Blocky, LOOKS} from './Blocky';
import {IngenitoHex} from './IngenitoHex';
import {Oficina, MONITOR_POS} from './Oficina';
import {ObraDia} from './ObraDia';
import {Cam, Episode} from '../episode';

type V3 = [number, number, number];
type CamDef = {a: V3; b: V3; look: V3; ease?: 'fast'};

// Encuadres de los escenarios del episodio 3 (posición inicial → final, y a dónde mira)
const CAMS: Partial<Record<Cam, CamDef>> = {
	OFI_WIDE: {a: [0.3, 1.55, 4.8], b: [0.25, 1.5, 4.3], look: [0.25, 1.1, 0]},
	OFI_JUN: {a: [0.15, 1.35, 2.7], b: [0.1, 1.33, 2.35], look: [-0.38, 1.2, 0]},
	OFI_PC: {a: [-0.95, 1.5, -0.55], b: [-0.85, 1.45, -0.35], look: [MONITOR_POS[0], 1.2, MONITOR_POS[2]]},
	OFI_ING: {a: [0.65, 1.45, 4.0], b: [0.72, 1.45, 3.55], look: [1.3, 1.25, 0.1]},
	OBRA_WIDE: {a: [0.3, 1.7, 8.6], b: [0.3, 1.6, 7.8], look: [0.3, 1.1, 0]},
	OBRA_COL: {a: [-0.45, 1.5, 4.6], b: [-0.5, 1.45, 4.1], look: [-0.7, 1.15, -0.4]},
	OBRA_JUN: {a: [0.35, 1.65, 3.2], b: [0.3, 1.66, 2.85], look: [-0.05, 1.62, 0]},
	OBRA_DRAMA: {a: [0.85, 1.4, 5.6], b: [1.05, 1.3, 2.3], look: [1.05, 1.25, 0], ease: 'fast'},
	OBRA_ING: {a: [0.7, 1.42, 4.5], b: [0.76, 1.42, 4.05], look: [1.05, 1.25, 0]},
	OBRA_TEO: {a: [-0.7, 1.65, 3.25], b: [-0.75, 1.66, 2.9], look: [-1.2, 1.6, 0]},
	OBRA_SUP: {a: [1.3, 0.7, 6.6], b: [1.4, 0.75, 6.1], look: [2.6, 1.3, 1.4]},
	OBRA_SUP2: {a: [1.5, 1.7, 3.9], b: [1.55, 1.7, 3.5], look: [2.0, 1.65, 0.9]},
	OBRA_GROUP: {a: [0.35, 1.9, 11.4], b: [0.35, 1.85, 10.8], look: [0.35, 1.1, 0]},
	OBRA_TRIO: {a: [-0.05, 1.9, 10.9], b: [-0.05, 1.85, 10.3], look: [-0.05, 1.15, 0.3]},
};

const lerp3 = (a: V3, b: V3, k: number): V3 => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];

const CameraRig: React.FC<{frame: number; ep: Episode}> = ({frame, ep}) => {
	const {camera} = useThree();
	useLayoutEffect(() => {
		const seg = ep.segmentAt(frame);
		const cam = CAMS[seg.cam] ?? CAMS.OBRA_WIDE!;
		const run = ep.camRunAt(frame);
		const k =
			cam.ease === 'fast'
				? interpolate(frame, [run.from, run.from + 9], [0, 1], {extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)})
				: interpolate(frame, [run.from, run.to], [0, 1], {easing: Easing.inOut(Easing.quad)});
		const p = lerp3(cam.a, cam.b, k);
		// temblor de cámara en los momentos dramáticos
		if (seg.shake && frame - seg.from < 24) {
			const amp = 0.04 * (1 - (frame - seg.from) / 24);
			p[0] += (random(`sx${frame}`) - 0.5) * amp;
			p[1] += (random(`sy${frame}`) - 0.5) * amp;
		}
		camera.position.set(...p);
		camera.lookAt(new THREE.Vector3(...cam.look));
		camera.updateProjectionMatrix();
	}, [camera, frame, ep]);
	return null;
};

export const SceneSets: React.FC<{frame: number; ep: Episode}> = ({frame, ep}) => {
	const seg = ep.segmentAt(frame);
	const oficina = seg.set === 'oficina';
	const ingenito = (
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
	);
	const juniorProps = {
		frame,
		mouth: ep.mouthOpen('junior', frame),
		shape: ep.mouthShape('junior', frame),
		talking: ep.isTalking('junior', frame),
		browRaise: seg.juniorBrow ?? 0,
		smile: seg.juniorSmile ?? 0,
	};

	if (oficina) {
		return (
			<>
				<CameraRig frame={frame} ep={ep} />
				<ambientLight color="#5664a8" intensity={0.7} />
				<hemisphereLight args={['#6d7fd6', '#1a1420', 0.5]} />
				<directionalLight color="#9fb4ff" intensity={1.0} position={[0, 3, -4]} />
				<directionalLight color="#ffd9b0" intensity={0.9} position={[2, 3, 4]} />
				<Oficina frame={frame} />
				{/* junior sentado, tecleando de madrugada */}
				<group position={[-0.42, 0, -0.2]} rotation={[0, 0.95, 0]}>
					<Blocky look={LOOKS.junior} {...juniorProps} pose={juniorProps.talking ? 'idle' : 'typing'} seated lookUp={0.7} />
				</group>
				<group position={[1.35, 0, 0.15]} rotation={[0, -0.55, 0]} scale={1.1}>
					{ingenito}
				</group>
			</>
		);
	}

	// obra de día
	const supSeg = ep.segments.find((s) => s.supWalk);
	const supVisible = supSeg !== undefined && frame >= supSeg.from;
	const walkK = supSeg ? interpolate(frame, [supSeg.from, supSeg.to], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) : 1;
	const supPos = lerp3([3.4, 0, 2.4], [1.9, 0, 0.9], walkK);
	const walking = supSeg !== undefined && frame < supSeg.to;
	const lluvia = ep.timeline.clima === 'lluvia';
	const props = ep.timeline.props ?? [];
	const hose = seg.teoPose === 'hose';
	// cuánto lleva la manguera abierta (para que crezca el charco)
	const hoseFrames = ep.segments.filter((x) => x.teoPose === 'hose' && x.from <= frame).reduce((a, x) => a + Math.min(frame, x.to) - x.from, 0);

	return (
		<>
			<CameraRig frame={frame} ep={ep} />
			<ambientLight color={lluvia ? '#aab6c6' : '#cfe2ff'} intensity={lluvia ? 0.8 : 0.9} />
			<hemisphereLight args={[lluvia ? '#9fb0c4' : '#bfe0ff', '#6f6658', lluvia ? 0.8 : 0.9]} />
			<directionalLight color={lluvia ? '#dfe6ee' : '#fff1d6'} intensity={lluvia ? 1.6 : 3.0} position={[3, 6, 4]} />
			<directionalLight color="#9fc8ff" intensity={0.8} position={[-4, 3, -3]} />
			<ObraDia frame={frame} />
			{props.includes('losa') && <LosaEncofrada charco={Math.min(1, hoseFrames / 150)} />}
			{hose && <Manguera frame={frame} />}
			{seg.dropOnHat && <GotaCasco frame={frame - seg.from} />}

			<group position={[-1.2, 0, 0.1]} rotation={[0, 0.45, 0]}>
				<Blocky
					look={LOOKS.teo}
					frame={frame}
					talking={ep.isTalking('teo', frame)}
					pose={seg.teoPose && seg.teoPose !== 'idle' ? seg.teoPose : 'idle'}
					headTurn={seg.teoPose === 'point' ? -0.5 : seg.teoPose === 'hide' ? Math.sin(frame / 6) * 0.25 : 0}
					smile={seg.teoPose === 'shy' ? 0 : 0.4}
					prop={seg.teoProp}
					mouth={seg.teoPose === 'hide' ? 0.35 : ep.mouthOpen('teo', frame)}
					shape={seg.teoPose === 'hide' ? -1 : ep.mouthShape('teo', frame)}
				/>
			</group>
			<group position={[0.05, 0, 0.25]} rotation={[0, 0.12, 0]}>
				<Blocky look={LOOKS.junior} {...juniorProps} pose="idle" headTurn={seg.cam === 'OBRA_JUN' && seg.juniorBrow === -1 ? -0.6 : 0} />
			</group>
			<group position={[1.05, 0, 0.15]} rotation={[0, -0.35, 0]} scale={1.15}>
				{ingenito}
			</group>
			{supVisible && (
				<group position={supPos} rotation={[0, walking ? -0.75 : -0.95, 0]}>
					<Blocky
						look={LOOKS.supervisora}
						frame={frame}
						mouth={ep.mouthOpen('supervisora', frame)}
						shape={ep.mouthShape('supervisora', frame)}
						talking={ep.isTalking('supervisora', frame)}
						pose={walking ? 'walk' : seg.supPose === 'reading' ? 'reading' : 'idle'}
						browRaise={seg.supPose === 'reading' ? 0.8 : 0}
					/>
				</group>
			)}
		</>
	);
};

// Losa con encofrado de madera y malla de fierro, lista para vaciar (el charco crece con la manguera)
const LosaEncofrada: React.FC<{charco: number}> = ({charco}) => (
	<group position={[-0.1, 0, 2.6]}>
		<mesh position={[0, 0.12, 0]}>
			<boxGeometry args={[2.6, 0.24, 1.0]} />
			<meshStandardMaterial color="#8d8a84" roughness={1} />
		</mesh>
		{[-0.5, 0.5].map((z) => (
			<mesh key={z} position={[0, 0.2, z]}>
				<boxGeometry args={[2.7, 0.4, 0.05]} />
				<meshStandardMaterial color="#b98a4e" roughness={0.9} />
			</mesh>
		))}
		{[-1.32, 1.32].map((x) => (
			<mesh key={x} position={[x, 0.2, 0]}>
				<boxGeometry args={[0.05, 0.4, 1.05]} />
				<meshStandardMaterial color="#b98a4e" roughness={0.9} />
			</mesh>
		))}
		{Array.from({length: 11}, (_, i) => (
			<mesh key={`x${i}`} position={[-1.25 + i * 0.25, 0.3, 0]}>
				<boxGeometry args={[0.018, 0.018, 0.95]} />
				<meshStandardMaterial color="#8a4b2a" />
			</mesh>
		))}
		{Array.from({length: 4}, (_, i) => (
			<mesh key={`z${i}`} position={[0, 0.3, -0.36 + i * 0.24]}>
				<boxGeometry args={[2.55, 0.018, 0.018]} />
				<meshStandardMaterial color="#8a4b2a" />
			</mesh>
		))}
		{/* charco de agua de más */}
		<mesh position={[-0.2, 0.245, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[0.3 + charco * 0.9, 0.3 + charco * 0.6, 1]}>
			<circleGeometry args={[0.8, 32]} />
			<meshStandardMaterial color="#7fa6c9" roughness={0.1} metalness={0.3} transparent opacity={0.25 + 0.5 * charco} />
		</mesh>
	</group>
);

// Manguera de Don Teo con chorro de agua cayendo a la losa
const Manguera: React.FC<{frame: number}> = ({frame}) => {
	const curve = React.useMemo(
		() =>
			new THREE.CatmullRomCurve3([
				new THREE.Vector3(-0.6, 0.82, 0.38),
				new THREE.Vector3(-0.95, 0.45, 0.15),
				new THREE.Vector3(-1.35, 0.04, -0.2),
				new THREE.Vector3(-2.2, 0.03, -0.9),
			]),
		[]
	);
	const drops = Array.from({length: 16}, (_, i) => {
		const k = ((frame / 10 + i / 16) % 1 + 1) % 1;
		const x = -0.6 + 0.3 * k;
		const z = 0.42 + 0.75 * k;
		const y = 0.82 + 0.25 * k - 0.85 * k * k;
		return [x, y, z] as [number, number, number];
	});
	return (
		<group>
			<mesh>
				<tubeGeometry args={[curve, 40, 0.025, 8, false]} />
				<meshStandardMaterial color="#2f9a4f" roughness={0.5} />
			</mesh>
			{drops.map((p, i) => (
				<mesh key={i} position={p}>
					<sphereGeometry args={[0.028, 8, 6]} />
					<meshStandardMaterial color="#cfe8ff" transparent opacity={0.85} roughness={0.1} />
				</mesh>
			))}
		</group>
	);
};

// La primera gota que cae justo en el casco nuevo del practicante
const GotaCasco: React.FC<{frame: number}> = ({frame}) => {
	const fall = Math.min(1, frame / 12);
	const y = 3.6 - (3.6 - 2.3) * fall * fall;
	const splash = frame > 12 && frame < 22 ? (frame - 12) / 10 : 0;
	return (
		<group position={[0.05, 0, 0.3]}>
			{frame <= 12 && (
				<mesh position={[0, y, 0]} scale={[1, 1.6, 1]}>
					<sphereGeometry args={[0.04, 10, 8]} />
					<meshStandardMaterial color="#cfe8ff" transparent opacity={0.9} roughness={0.05} />
				</mesh>
			)}
			{splash > 0 &&
				[-1, -0.4, 0.4, 1].map((d) => (
					<mesh key={d} position={[d * 0.12 * splash, 2.3 + 0.08 * Math.sin(splash * Math.PI), 0]}>
						<sphereGeometry args={[0.018, 6, 5]} />
						<meshStandardMaterial color="#cfe8ff" transparent opacity={1 - splash} />
					</mesh>
				))}
		</group>
	);
};
