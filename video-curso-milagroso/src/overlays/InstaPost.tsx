import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useVideoConfig} from 'remotion';
import {useEp} from '../episode';

const FONT = 'Inter, sans-serif';

// Encuadre recortado (parece "su edificio") y encuadre completo (es un centro comercial)
const CROP = [250, 380, 500, 500];
const FULL = [-150, 40, 1300, 1300];

const Profe: React.FC = () => (
	<g>
		{/* bolsas de compras: fuera del recorte */}
		<g transform="translate(330, 1050) rotate(-4)">
			<rect width={95} height={120} rx={6} fill="#e8344a" />
			<path d="M22 0 Q47 -45 72 0" stroke="#b81d31" strokeWidth={7} fill="none" />
			<text x={47} y={72} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={26} fill="#fff">SALE</text>
		</g>
		<g transform="translate(575, 1060) rotate(5)">
			<rect width={100} height={125} rx={6} fill="#f2c94c" />
			<path d="M24 0 Q50 -45 76 0" stroke="#b8931d" strokeWidth={7} fill="none" />
			<text x={50} y={74} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={24} fill="#11172e">-70%</text>
		</g>
		{/* piernas y zapatos */}
		<rect x={445} y={900} width={48} height={400} fill="#1d2233" />
		<rect x={507} y={900} width={48} height={400} fill="#1d2233" />
		<rect x={432} y={1295} width={66} height={26} rx={8} fill="#5a3a22" />
		<rect x={502} y={1295} width={66} height={26} rx={8} fill="#5a3a22" />
		{/* brazos hacia las bolsas */}
		<rect x={385} y={650} width={46} height={420} rx={20} fill="#26314f" transform="rotate(4 408 650)" />
		<rect x={569} y={650} width={46} height={420} rx={20} fill="#26314f" transform="rotate(-4 592 650)" />
		{/* saco y camisa */}
		<rect x={410} y={630} width={180} height={300} rx={24} fill="#26314f" />
		<path d="M470 630 L500 720 L530 630 Z" fill="#fff" />
		<rect x={493} y={650} width={14} height={60} fill="#d6202a" />
		{/* cabeza con lentes oscuros y pelo engominado */}
		<rect x={478} y={590} width={44} height={50} fill="#c98b62" />
		<rect x={440} y={470} width={120} height={135} rx={18} fill="#c98b62" />
		<path d="M436 500 Q440 445 500 445 Q565 445 566 505 L560 490 Q500 470 440 495 Z" fill="#111" />
		<rect x={450} y={520} width={46} height={26} rx={6} fill="#111" />
		<rect x={504} y={520} width={46} height={26} rx={6} fill="#111" />
		<rect x={494} y={527} width={12} height={6} fill="#111" />
		<path d="M478 575 Q500 590 522 575" stroke="#5a1f22" strokeWidth={6} fill="none" />
	</g>
);

const Scene: React.FC = () => (
	<g>
		<rect x={-400} y={-200} width={1800} height={1800} fill="#8fc7ff" />
		<rect x={-400} y={1320} width={1800} height={300} fill="#b9b2a6" />
		{/* fachada de vidrio */}
		<rect x={150} y={150} width={700} height={1180} fill="#5d9bd6" />
		{Array.from({length: 22}, (_, r) => (
			<rect key={`h${r}`} x={150} y={150 + r * 54} width={700} height={4} fill="#3a6ea3" />
		))}
		{Array.from({length: 8}, (_, c) => (
			<rect key={`v${c}`} x={150 + c * 100} y={150} width={4} height={1180} fill="#3a6ea3" />
		))}
		{/* letrero del techo: fuera del recorte */}
		<rect x={110} y={60} width={780} height={110} rx={10} fill="#d6202a" />
		<text x={500} y={140} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={72} fill="#fff">
			CENTRO COMERCIAL
		</text>
		{/* banners laterales */}
		<rect x={-110} y={700} width={220} height={320} fill="#f2c94c" />
		<text x={0} y={840} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={64} fill="#d6202a">SALE</text>
		<text x={0} y={910} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={48} fill="#11172e">-50%</text>
		<rect x={890} y={700} width={220} height={320} fill="#f2c94c" />
		<text x={1000} y={840} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={52} fill="#d6202a">PATIO</text>
		<text x={1000} y={900} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill="#11172e">DE COMIDAS</text>
		{/* puertas */}
		<rect x={300} y={1120} width={400} height={210} fill="#2b4a6b" />
		<rect x={497} y={1120} width={6} height={210} fill="#9ab" />
		<Profe />
	</g>
);

export const InstaPost: React.FC<{frame: number}> = ({frame}) => {
	const {fps} = useVideoConfig();
	const {segmentWithOverlay} = useEp();
	const crop = segmentWithOverlay('insta-crop');
	const reveal = segmentWithOverlay('insta-reveal');
	if (!crop || !reveal) return null;
	const inCrop = frame >= crop.overlayFrom! && frame < crop.to;
	const inReveal = frame >= reveal.overlayFrom! && frame < reveal.to;
	if (!inCrop && !inReveal) return null;

	const enter = inCrop ? spring({frame: frame - crop.overlayFrom!, fps, config: {damping: 15}}) : 1;
	const z = inReveal
		? interpolate(frame, [reveal.overlayFrom! + 4, reveal.overlayFrom! + 22], [0, 1], {
				extrapolateLeft: 'clamp',
				extrapolateRight: 'clamp',
				easing: Easing.out(Easing.cubic),
			})
		: 0;
	const vb = CROP.map((v, i) => v + (FULL[i] - v) * z).join(' ');
	const shake = inReveal && frame - reveal.overlayFrom! < 6 ? Math.sin(frame * 3) * 8 : 0;

	return (
		<AbsoluteFill style={{background: 'rgba(3,6,25,0.55)'}}>
			<div
				style={{
					position: 'absolute',
					left: 90,
					top: 330,
					width: 900,
					background: '#fff',
					borderRadius: 26,
					overflow: 'hidden',
					fontFamily: FONT,
					boxShadow: '0 40px 90px rgba(0,0,0,0.6)',
					transform: `translateY(${(1 - enter) * 1400}px) translateX(${shake}px)`,
				}}
			>
				<div style={{display: 'flex', alignItems: 'center', gap: 18, padding: '22px 26px'}}>
					<div style={{width: 64, height: 64, borderRadius: 32, background: 'linear-gradient(45deg, #f9ce34, #ee2a7b, #6228d7)', padding: 4}}>
						<div style={{width: '100%', height: '100%', borderRadius: 30, background: '#26314f', border: '3px solid #fff', boxSizing: 'border-box'}} />
					</div>
					<div>
						<div style={{fontWeight: 700, fontSize: 30, color: '#111'}}>ing.millonario</div>
						<div style={{fontSize: 24, color: '#666'}}>Lima, Perú</div>
					</div>
				</div>
				<svg width={900} height={900} viewBox={vb}>
					<Scene />
				</svg>
				<div style={{padding: '20px 28px 30px'}}>
					<div style={{fontWeight: 700, fontSize: 28, color: '#111'}}>12,4 mil Me gusta</div>
					<div style={{fontSize: 28, color: '#222', marginTop: 8}}>
						<b>ing.millonario</b> Mi último proyecto. 20 pisos. <span style={{color: '#1e5bb8'}}>#ingeniería #éxito</span>
					</div>
				</div>
			</div>
		</AbsoluteFill>
	);
};
