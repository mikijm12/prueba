import React from 'react';
import {AbsoluteFill, interpolate, spring, useVideoConfig} from 'remotion';
import {useEp} from '../episode';

const FONT = 'Inter, sans-serif';

const COMMENTS = [
	{user: '@luchito.residente', text: '¿y el RNE dónde?', color: '#6c9cf0'},
	{user: '@maestro.pancho', text: '¿y si se cae quién paga?', color: '#f08cad'},
	{user: '@curso.express', text: '¡Certificado en 3 días! Escribe INFO', color: '#f2c94c'},
];

const Edificio: React.FC = () => (
	<svg width={250} height={300} viewBox="0 0 250 300">
		<rect x={55} y={20} width={140} height={280} fill="#f2c94c" />
		{Array.from({length: 20}, (_, r) =>
			[0, 1, 2, 3].map((c) => <rect key={`${r}-${c}`} x={66 + c * 32} y={28 + r * 13.5} width={20} height={8} fill="#11172e" />)
		)}
		<rect x={20} y={0} width={86} height={34} rx={8} fill="#d6202a" />
		<text x={63} y={23} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={18} fill="#fff">
			20 PISOS
		</text>
	</svg>
);

export const CourseMockup: React.FC<{frame: number}> = ({frame}) => {
	const {fps} = useVideoConfig();
	const {timeline, segmentWithOverlay} = useEp();
	const start = timeline.sfx.mockupIn;
	const local = frame - start;
	const enter = spring({frame: local, fps, config: {damping: 16, stiffness: 120}});
	const end = segmentWithOverlay('mockup')!.to;
	const exit = interpolate(frame, [end - 6, end], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const slash = interpolate(frame, [timeline.sfx.priceSlash, timeline.sfx.priceSlash + 6], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	const secondsLeft = 14 * 60 + 59 - Math.floor(Math.max(0, local) / fps);
	const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
	const ss = String(secondsLeft % 60).padStart(2, '0');
	const btnPulse = 1 + 0.03 * Math.sin(local / 4);

	return (
		<AbsoluteFill style={{background: `rgba(3,6,25,${0.55 * enter * (1 - exit)})`}}>
			<div
				style={{
					position: 'absolute',
					left: 70,
					top: 250,
					width: 940,
					borderRadius: 26,
					overflow: 'hidden',
					background: '#f3f4f8',
					boxShadow: '0 40px 90px rgba(0,0,0,0.6)',
					transform: `translateY(${(1 - enter) * 1400 + exit * -1500}px) rotate(${(1 - enter) * 4}deg)`,
					fontFamily: FONT,
				}}
			>
				{/* barra del navegador */}
				<div style={{padding: '22px 30px 14px', display: 'flex', alignItems: 'center', gap: 12}}>
					{['#ff5f57', '#febc2e', '#28c840'].map((c) => (
						<div key={c} style={{width: 16, height: 16, borderRadius: 8, background: c}} />
					))}
					<div style={{marginLeft: 16, fontWeight: 700, fontSize: 26, color: '#333'}}>DOMINA ETABS EN 3 DÍAS</div>
				</div>
				<div style={{margin: '0 24px 18px', padding: '12px 22px', background: '#fff', borderRadius: 12, fontSize: 24, color: '#888'}}>
					cursos-express.pe/etabs-3-dias
				</div>

				{/* hero */}
				<div style={{background: '#0f1430', padding: '40px 44px 34px', position: 'relative'}}>
					<div style={{fontWeight: 900, fontSize: 78, lineHeight: 1.0, color: '#f2c94c', letterSpacing: -1}}>DOMINA ETABS</div>
					<div style={{fontWeight: 900, fontSize: 78, lineHeight: 1.05, color: '#fff', letterSpacing: -1}}>EN 3 DÍAS</div>
					<div style={{marginTop: 14, fontSize: 30, color: '#c9cde0', maxWidth: 560}}>Diseña edificios sin saber estructuras.</div>
					<div style={{position: 'absolute', right: 30, top: 150}}>
						<Edificio />
					</div>
					<div style={{marginTop: 120, display: 'flex', alignItems: 'center', gap: 22}}>
						<span style={{position: 'relative', fontSize: 40, fontWeight: 800, color: '#ff6b6b'}}>
							S/ 997
							<span
								style={{
									position: 'absolute',
									left: -4,
									top: '52%',
									height: 5,
									width: `${slash * 108}%`,
									background: '#ff6b6b',
								}}
							/>
						</span>
						<span style={{fontSize: 58, fontWeight: 900, color: '#f2c94c', transform: `scale(${1 + slash * 0.08 - (slash === 1 ? 0.08 : 0)})`}}>
							S/ 47 SOLO HOY
						</span>
					</div>
					<div style={{marginTop: 10, display: 'inline-block', padding: '8px 16px', background: '#1f2a55', borderRadius: 10, color: '#fff', fontWeight: 800, fontSize: 24}}>
						CERTIFICADO EN 3 DÍAS
					</div>
					<div
						style={{
							marginTop: 26,
							background: '#e8344a',
							borderRadius: 16,
							padding: '26px 0',
							textAlign: 'center',
							color: '#fff',
							fontWeight: 900,
							fontSize: 40,
							transform: `scale(${btnPulse})`,
						}}
					>
						QUIERO SER INGENIERO
					</div>
					<div style={{marginTop: 14, color: '#ff6b6b', fontSize: 26, fontWeight: 600}}>
						La oferta termina en 00:{mm}:{ss}
					</div>
				</div>

				{/* comentarios */}
				<div style={{padding: '24px 36px 32px', minHeight: 330}}>
					<div style={{fontSize: 28, fontWeight: 600, color: '#555', marginBottom: 18}}>Comentarios (1.248)</div>
					{COMMENTS.map((c, i) => {
						const at = timeline.sfx.comments[i];
						const s = spring({frame: frame - at, fps, config: {damping: 14}});
						if (frame < at) return null;
						return (
							<div
								key={c.user}
								style={{display: 'flex', gap: 18, alignItems: 'center', marginBottom: 20, opacity: s, transform: `translateX(${(1 - s) * 60}px)`}}
							>
								<div style={{width: 52, height: 52, borderRadius: 26, background: c.color, flexShrink: 0}} />
								<div>
									<div style={{fontSize: 26, fontWeight: 700, color: '#222'}}>{c.user}</div>
									<div style={{fontSize: 28, color: '#333'}}>{c.text}</div>
								</div>
							</div>
						);
					})}
				</div>
			</div>
		</AbsoluteFill>
	);
};
