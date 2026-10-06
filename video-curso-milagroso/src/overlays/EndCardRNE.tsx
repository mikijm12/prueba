import React from 'react';
import {AbsoluteFill, interpolate, spring, useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import {useEp} from '../episode';
import {IngenitoHex} from '../three/IngenitoHex';

// Cierre de venta del Manual Ilustrado del RNE, con la estética de la web de CIngeniería
const FONT = 'Inter, sans-serif';
const TEAL = '#2fe8c8';
const NAVY = '#16208a';

const COVERS = [
	{code: 'A.120', name: 'Accesibilidad Universal', rot: -16, x: -330, y: 60},
	{code: 'E.030', name: 'Diseño Sismorresistente', rot: -5, x: -110, y: 0},
	{code: 'E.060', name: 'Concreto Armado', rot: 6, x: 110, y: 10},
	{code: 'OS.090', name: 'Tratamiento de Aguas Residuales', rot: 17, x: 330, y: 70},
];

const Cover: React.FC<{code: string; name: string}> = ({code, name}) => (
	<div
		style={{
			width: 330,
			height: 460,
			borderRadius: 10,
			background: `linear-gradient(160deg, #2433b8, ${NAVY})`,
			border: '2px solid rgba(255,255,255,0.25)',
			boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
			padding: 22,
			boxSizing: 'border-box',
			fontFamily: FONT,
			backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
			backgroundSize: '22px 22px',
		}}
	>
		<div style={{display: 'inline-block', background: TEAL, color: NAVY, fontWeight: 900, fontSize: 13, letterSpacing: 1, padding: '4px 8px'}}>MANUAL ILUSTRADO DEL RNE</div>
		<div style={{marginTop: 22, color: '#fff', fontWeight: 900, fontSize: 50, lineHeight: 1}}>
			Norma <span style={{color: TEAL}}>{code}</span>
		</div>
		<div style={{marginTop: 8, color: '#fff', fontWeight: 700, fontSize: 21}}>{name}</div>
		<svg width={286} height={200} viewBox="0 0 286 200" style={{marginTop: 26}}>
			<g stroke={TEAL} strokeWidth={2} fill="rgba(47,232,200,0.1)">
				<rect x={90} y={30} width={100} height={150} />
				{[0, 1, 2, 3, 4].map((i) => (
					<line key={i} x1={90} y1={60 + i * 25} x2={190} y2={60 + i * 25} />
				))}
				<line x1={140} y1={30} x2={140} y2={180} />
				<line x1={40} y1={180} x2={250} y2={180} />
			</g>
		</svg>
	</div>
);

const LookAt: React.FC<{y: number}> = ({y}) => {
	const {camera} = useThree();
	camera.lookAt(0, y, 0);
	return null;
};

export const EndCardRNE: React.FC<{frame: number}> = ({frame}) => {
	const {fps} = useVideoConfig();
	const ep = useEp();
	const seg = ep.segmentWithOverlay('end-rne');
	if (!seg || frame < seg.from) return null;
	const local = frame - seg.from;
	const sp = (delay: number, damping = 14) => spring({frame: local - delay, fps, config: {damping}});
	const bg = interpolate(local, [0, 8], [0, 1], {extrapolateRight: 'clamp'});
	const pulse = 1 + 0.035 * Math.sin(local / 5);

	return (
		<AbsoluteFill
			style={{
				opacity: bg,
				background: 'linear-gradient(180deg, #1b2bb0 0%, #121c86 55%, #0b1260 100%)',
				fontFamily: FONT,
				overflow: 'hidden',
			}}
		>
			<AbsoluteFill
				style={{
					backgroundImage: 'linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)',
					backgroundSize: '60px 60px',
				}}
			/>
			<div style={{position: 'absolute', top: 0, left: 0, right: 0, height: 8, background: TEAL}} />

			{/* marca */}
			<div style={{position: 'absolute', top: 110, left: 0, right: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 18, opacity: sp(2)}}>
				<svg width={56} height={56} viewBox="0 0 56 56">
					<polygon points="28,3 50,15.5 50,40.5 28,53 6,40.5 6,15.5" fill="none" stroke="#fff" strokeWidth={5} />
					<text x={28} y={37} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={26} fill="#fff">C</text>
				</svg>
				<div style={{color: '#fff', fontWeight: 800, fontSize: 40}}>Cingeniería</div>
				<div style={{border: `2px solid ${TEAL}`, color: TEAL, borderRadius: 30, padding: '6px 16px', fontWeight: 900, fontSize: 22, letterSpacing: 3}}>RNE ILUSTRADO</div>
			</div>

			{/* titular */}
			<div style={{position: 'absolute', top: 230, left: 0, right: 0, textAlign: 'center'}}>
				<div
					style={{
						display: 'inline-flex',
						alignItems: 'center',
						gap: 12,
						border: `2px solid rgba(47,232,200,0.6)`,
						borderRadius: 40,
						padding: '10px 26px',
						color: TEAL,
						fontWeight: 800,
						fontSize: 26,
						letterSpacing: 3,
						opacity: sp(6),
					}}
				>
					<span style={{width: 14, height: 14, borderRadius: 7, background: TEAL, display: 'inline-block'}} />
					RNE · VIGENTE A OCTUBRE DE 2026
				</div>
				<div style={{marginTop: 30, color: '#fff', fontWeight: 900, fontSize: 118, letterSpacing: -3, lineHeight: 1, transform: `translateY(${(1 - sp(10)) * 60}px)`, opacity: sp(10)}}>
					El RNE vigente,
				</div>
				<div style={{display: 'inline-block', marginTop: 8, transform: `scale(${sp(18, 10)})`}}>
					<div style={{color: TEAL, fontWeight: 900, fontSize: 168, letterSpacing: -5, lineHeight: 1}}>dibujado.</div>
					<div style={{height: 14, borderRadius: 7, background: TEAL, opacity: 0.35, marginTop: -6}} />
				</div>
			</div>

			{/* portadas en abanico */}
			{COVERS.map((c, i) => {
				const s = sp(22 + i * 4, 13);
				return (
					<div
						key={c.code}
						style={{
							position: 'absolute',
							left: 540 - 165 + c.x,
							top: 650 + c.y + (1 - s) * 500,
							transform: `rotate(${c.rot * s}deg)`,
							opacity: s,
						}}
					>
						<Cover code={c.code} name={c.name} />
					</div>
				);
			})}

			{/* Ingenito al frente, hablando */}
			<div style={{position: 'absolute', left: 90, top: 800, width: 900, height: 840, transform: `translateY(${(1 - sp(30, 12)) * 700}px)`}}>
				<ThreeCanvas width={900} height={840} camera={{fov: 30, position: [0, 0.98, 3.75], near: 0.1, far: 30}} gl={{alpha: true, antialias: true}}>
					<LookAt y={0.95} />
					<ambientLight color="#9aa8f0" intensity={1.3} />
					<directionalLight color="#fff2e0" intensity={2.6} position={[2, 4, 5]} />
					<directionalLight color="#4de8d0" intensity={1.2} position={[-3, 2, -3]} />
					<group position={[0, 0.05, 0]}>
						<IngenitoHex frame={frame} mouth={ep.mouthOpen('ingenito', frame)} shape={ep.mouthShape('ingenito', frame)} talk={ep.talkLevel('ingenito', frame)} expr="happy" leftArm="down" rightArm="thumbs" />
					</group>
				</ThreeCanvas>
			</div>

			{/* beneficios y llamada a la acción */}
			<div style={{position: 'absolute', top: 1640, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 28, opacity: sp(40)}}>
				{['73 normas', 'Cita literal + artículo', 'Ejemplos resueltos'].map((t) => (
					<div key={t} style={{color: '#fff', fontWeight: 700, fontSize: 30}}>
						<span style={{color: TEAL}}>✓</span> {t}
					</div>
				))}
			</div>
			<div style={{position: 'absolute', top: 1720, left: 0, right: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 26}}>
				<div
					style={{
						background: TEAL,
						color: NAVY,
						fontWeight: 900,
						fontSize: 46,
						borderRadius: 60,
						padding: '26px 60px',
						boxShadow: '0 0 40px rgba(47,232,200,0.5)',
						transform: `scale(${sp(46, 10) * pulse})`,
					}}
				>
					Ver packs y precios →
				</div>
				<div
					style={{
						width: 104,
						height: 104,
						borderRadius: 52,
						background: '#25d366',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						transform: `scale(${sp(52, 10)})`,
						boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
					}}
				>
					<svg width={58} height={58} viewBox="0 0 32 32">
						<path
							fill="#fff"
							d="M16 3C9 3 3.3 8.6 3.3 15.6c0 2.3.6 4.5 1.8 6.4L3 29l7.2-2c1.8 1 3.8 1.5 5.8 1.5 7 0 12.7-5.6 12.7-12.6S23 3 16 3zm0 23.1c-1.9 0-3.7-.5-5.3-1.4l-.4-.2-4.3 1.1 1.1-4.1-.3-.4c-1-1.6-1.6-3.5-1.6-5.5C5.2 9.8 10 5.1 16 5.1s10.8 4.7 10.8 10.5S21.9 26.1 16 26.1zm5.9-7.8c-.3-.2-1.9-.9-2.2-1-.3-.1-.5-.2-.7.2-.2.3-.8 1-1 1.2-.2.2-.4.2-.7.1-.3-.2-1.4-.5-2.6-1.6-1-.9-1.6-1.9-1.8-2.2-.2-.3 0-.5.1-.7l.5-.6c.2-.2.2-.3.3-.6.1-.2 0-.4 0-.6l-1-2.4c-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.3-1.2 1.1-1.2 2.8s1.2 3.2 1.4 3.5c.2.2 2.4 3.6 5.8 5 .8.4 1.4.6 1.9.7.8.3 1.5.2 2.1.1.6-.1 1.9-.8 2.2-1.5.3-.7.3-1.4.2-1.5-.1-.1-.3-.2-.6-.3z"
						/>
					</svg>
				</div>
			</div>
		</AbsoluteFill>
	);
};
