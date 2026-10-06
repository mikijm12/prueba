import React from 'react';
import {AbsoluteFill, interpolate, spring, useVideoConfig} from 'remotion';
import {useEp} from '../episode';

const FONT = 'Inter, sans-serif';
const NAVY = '#1f2a8f';
const TEAL = '#14c7a9';

// Página interior del Manual Ilustrado E.060: la columna con sus cargas, dibujada y acotada
const Dibujo: React.FC<{k: number; frame: number}> = ({k, frame}) => {
	const dash = (len: number, delay: number) => ({strokeDasharray: len, strokeDashoffset: len * (1 - Math.min(1, Math.max(0, k * 1.6 - delay)))});
	const arrowY = (frame % 30) * 1.2;
	return (
		<svg width={820} height={720} viewBox="0 0 820 720">
			{/* 3 losas superiores */}
			{[0, 1, 2].map((i) => (
				<g key={i}>
					<rect x={110} y={60 + i * 120} width={600} height={26} fill="#e9edf8" stroke={NAVY} strokeWidth={3} style={dash(1260, i * 0.12)} />
					<rect x={370} y={86 + i * 120} width={80} height={94} fill="#e9edf8" stroke={NAVY} strokeWidth={3} style={dash(350, 0.1 + i * 0.12)} />
				</g>
			))}
			{/* columna de la cochera, resaltada */}
			<rect x={370} y={420} width={80} height={170} fill="#cdf6ee" stroke={TEAL} strokeWidth={5} style={dash(500, 0.45)} />
			{/* zapata */}
			<rect x={300} y={590} width={220} height={60} fill="#e9edf8" stroke={NAVY} strokeWidth={3} style={dash(560, 0.55)} />
			<line x1={60} y1={650} x2={760} y2={650} stroke="#9aa3c7" strokeWidth={3} strokeDasharray="12 8" />
			{/* cargas bajando */}
			{[0, 1, 2].map((i) => (
				<g key={i} opacity={k > 0.7 ? 1 : 0} transform={`translate(0, ${arrowY})`}>
					<path d={`M410 ${30 + i * 120} L410 ${62 + i * 120}`} stroke="#e8344a" strokeWidth={6} />
					<path d={`M398 ${52 + i * 120} L410 ${68 + i * 120} L422 ${52 + i * 120} Z`} fill="#e8344a" />
				</g>
			))}
			{/* cotas */}
			<g stroke={NAVY} strokeWidth={2} opacity={k > 0.8 ? 1 : 0}>
				<line x1={370} y1={615} x2={450} y2={615} />
				<line x1={370} y1={607} x2={370} y2={623} />
				<line x1={450} y1={607} x2={450} y2={623} />
				<line x1={480} y1={420} x2={480} y2={590} />
				<line x1={472} y1={420} x2={488} y2={420} />
				<line x1={472} y1={590} x2={488} y2={590} />
			</g>
			<g fontFamily={FONT} fontWeight={700} fill={NAVY} opacity={k > 0.8 ? 1 : 0}>
				<text x={410} y={612} fontSize={22} textAnchor="middle">b</text>
				<text x={496} y={512} fontSize={22}>h</text>
				<text x={560} y={470} fontSize={26} fill={TEAL} fontWeight={900}>COLUMNA</text>
				<path d="M555 462 L460 490" stroke={TEAL} strokeWidth={3} />
				<text x={560} y={300} fontSize={22}>Carga de los</text>
				<text x={560} y={328} fontSize={22}>pisos superiores</text>
				<text x={540} y={690} fontSize={22}>Zapata</text>
			</g>
		</svg>
	);
};

export const ManualPage: React.FC<{frame: number}> = ({frame}) => {
	const {fps} = useVideoConfig();
	const ep = useEp();
	const seg = ep.segmentWithOverlay('manual');
	if (!seg || frame < seg.overlayFrom! || frame >= seg.to) return null;
	const local = frame - seg.overlayFrom!;
	const enter = spring({frame: local, fps, config: {damping: 15}});
	const draw = interpolate(local, [6, 40], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const exit = interpolate(frame, [seg.to - 6, seg.to], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const stamp = spring({frame: local - 36, fps, config: {damping: 9, stiffness: 160}});

	return (
		<AbsoluteFill style={{background: `rgba(3,6,25,${0.5 * enter * (1 - exit)})`}}>
			<div
				style={{
					position: 'absolute',
					left: 70,
					top: 330,
					width: 940,
					borderRadius: 18,
					overflow: 'hidden',
					background: '#fff',
					fontFamily: FONT,
					boxShadow: '0 40px 90px rgba(0,0,0,0.6)',
					transform: `perspective(1600px) rotateY(${(1 - enter) * -60}deg) translateY(${exit * 1500}px)`,
					transformOrigin: 'left center',
				}}
			>
				<div style={{background: NAVY, padding: '22px 34px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
					<div style={{background: TEAL, color: NAVY, fontWeight: 900, fontSize: 22, letterSpacing: 2, padding: '6px 14px'}}>MANUAL ILUSTRADO DEL RNE</div>
					<div style={{color: '#fff', fontWeight: 800, fontSize: 30}}>
						Norma <span style={{color: TEAL}}>E.060</span>
					</div>
				</div>
				<div style={{padding: '26px 40px 10px'}}>
					<div style={{fontSize: 24, fontWeight: 700, color: TEAL, letterSpacing: 2}}>CONCRETO ARMADO</div>
					<div style={{fontSize: 48, fontWeight: 900, color: NAVY, lineHeight: 1.1, marginTop: 6}}>¿Qué carga una columna?</div>
				</div>
				<div style={{display: 'flex', justifyContent: 'center'}}>
					<Dibujo k={draw} frame={frame} />
				</div>
				<div style={{display: 'flex', gap: 16, padding: '0 40px 34px', flexWrap: 'wrap'}}>
					{['Cita literal + artículo', 'Ejemplos resueltos', 'Lista de control'].map((t) => (
						<div key={t} style={{border: `3px solid ${TEAL}`, color: NAVY, borderRadius: 40, padding: '10px 22px', fontWeight: 800, fontSize: 26}}>
							✓ {t}
						</div>
					))}
				</div>
				<div
					style={{
						position: 'absolute',
						right: 40,
						top: 150,
						transform: `rotate(-10deg) scale(${stamp})`,
						border: '6px solid #e8344a',
						color: '#e8344a',
						borderRadius: 14,
						padding: '10px 18px',
						fontWeight: 900,
						fontSize: 34,
						lineHeight: 1.1,
						textAlign: 'center',
						background: 'rgba(255,255,255,0.85)',
					}}
				>
					NO SE
					<br />
					RETIRA
				</div>
			</div>
		</AbsoluteFill>
	);
};
