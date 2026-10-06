import React from 'react';
import {AbsoluteFill, interpolate, spring, useVideoConfig} from 'remotion';
import {ChatMsg, useEp} from '../episode';

const FONT = 'Inter, "Noto Color Emoji", sans-serif';
const TYPING_LEAD = 22; // fotogramas de "escribiendo…" antes de cada mensaje del cliente

// Foto que manda el cliente: la columna en medio de su cochera
const FotoColumna: React.FC = () => (
	<svg width={520} height={390} viewBox="0 0 520 390" style={{display: 'block', borderRadius: 12}}>
		<rect width={520} height={390} fill="#cfc8bd" />
		<rect y={250} width={520} height={140} fill="#9b948a" />
		<rect x={0} y={0} width={520} height={40} fill="#b8b0a4" />
		{/* auto apretado */}
		<g transform="translate(40, 205)">
			<rect x={0} y={20} width={170} height={60} rx={14} fill="#d6202a" />
			<path d="M25 20 L50 -10 L130 -10 L150 20 Z" fill="#b51b24" />
			<rect x={58} y={-4} width={38} height={22} fill="#9fd0ff" />
			<rect x={100} y={-4} width={36} height={22} fill="#9fd0ff" />
			<circle cx={40} cy={82} r={18} fill="#222" />
			<circle cx={135} cy={82} r={18} fill="#222" />
		</g>
		{/* la columna */}
		<rect x={250} y={40} width={70} height={260} fill="#8d8f93" />
		<rect x={250} y={40} width={12} height={260} fill="#a5a7ab" />
		{/* el cliente marcó la columna con el dedo */}
		<ellipse cx={285} cy={170} rx={70} ry={150} fill="none" stroke="#ff2d2d" strokeWidth={7} strokeDasharray="6 4" transform="rotate(4 285 170)" />
		<text x={370} y={110} fontFamily={FONT} fontWeight={900} fontSize={34} fill="#ff2d2d">
			ESTA
		</text>
		<path d="M370 120 Q340 140 330 160" stroke="#ff2d2d" strokeWidth={6} fill="none" />
	</svg>
);

const Ticks: React.FC = () => (
	<svg width={26} height={16} viewBox="0 0 26 16" style={{marginLeft: 6}}>
		<path d="M1 8 L6 13 L15 2" stroke="#53bdeb" strokeWidth={2.4} fill="none" />
		<path d="M9 13 L10 13 L21 2" stroke="#53bdeb" strokeWidth={2.4} fill="none" />
	</svg>
);

const Bubble: React.FC<{m: ChatMsg; appear: number}> = ({m, appear}) => {
	const mine = m.from === 'me';
	return (
		<div
			style={{
				alignSelf: mine ? 'flex-end' : 'flex-start',
				maxWidth: m.photo ? 560 : 690,
				background: mine ? '#d9fdd3' : '#ffffff',
				borderRadius: 18,
				borderTopLeftRadius: mine ? 18 : 4,
				borderTopRightRadius: mine ? 4 : 18,
				padding: m.photo ? 8 : '14px 20px 10px',
				boxShadow: '0 2px 2px rgba(0,0,0,0.08)',
				marginBottom: 14,
				opacity: appear,
				transform: `translateY(${(1 - appear) * 30}px) scale(${0.92 + 0.08 * appear})`,
				transformOrigin: mine ? 'right bottom' : 'left bottom',
			}}
		>
			{m.photo ? <FotoColumna /> : <div style={{fontSize: 38, lineHeight: 1.3, color: '#111b21'}}>{m.text}</div>}
			<div style={{display: 'flex', justifyContent: 'flex-end', alignItems: 'center', fontSize: 22, color: '#667781', marginTop: 4, padding: m.photo ? '0 10px 4px' : 0}}>
				{m.time}
				{mine && <Ticks />}
			</div>
		</div>
	);
};

const TypingBubble: React.FC<{frame: number}> = ({frame}) => (
	<div style={{alignSelf: 'flex-start', background: '#fff', borderRadius: 18, borderTopLeftRadius: 4, padding: '20px 26px', display: 'flex', gap: 10, marginBottom: 14}}>
		{[0, 1, 2].map((i) => (
			<div
				key={i}
				style={{width: 14, height: 14, borderRadius: 7, background: '#8696a0', transform: `translateY(${Math.sin(frame / 3 - i) * 4}px)`}}
			/>
		))}
	</div>
);

export const WhatsAppChat: React.FC<{frame: number}> = ({frame}) => {
	const {fps} = useVideoConfig();
	const ep = useEp();
	const seg = ep.segmentAt(frame);
	const chat = ep.timeline.chat ?? [];
	if (seg.overlay !== 'chat' || chat.length === 0) return null;

	// inicio del bloque continuo de chat (para animar la entrada una sola vez)
	let runStart = seg.from;
	for (let i = ep.segments.indexOf(seg); i > 0 && ep.segments[i - 1].overlay === 'chat'; i--) runStart = ep.segments[i - 1].from;
	let runEnd = seg.to;
	for (let i = ep.segments.indexOf(seg); i < ep.segments.length - 1 && ep.segments[i + 1].overlay === 'chat'; i++) runEnd = ep.segments[i + 1].to;
	const enter = spring({frame: frame - runStart, fps, config: {damping: 16}});
	const exit = interpolate(frame, [runEnd - 6, runEnd], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

	const visible = chat.filter((m) => (m.typedEnd !== undefined ? frame >= m.typedEnd + 4 : frame >= m.frame));
	const typingClient = chat.some((m) => m.from === 'client' && frame >= m.frame - TYPING_LEAD && frame < m.frame);
	const composing = chat.find((m) => m.typedEnd !== undefined && frame >= m.frame && frame < m.typedEnd + 4);
	const typedChars = composing
		? Math.floor(interpolate(frame, [composing.frame, composing.typedEnd!], [0, composing.text!.length], {extrapolateRight: 'clamp'}))
		: 0;

	return (
		<AbsoluteFill style={{background: `rgba(3,6,25,${0.45 * enter * (1 - exit)})`}}>
			<div
				style={{
					position: 'absolute',
					left: 60,
					top: 300,
					width: 960,
					height: 1300,
					borderRadius: 34,
					overflow: 'hidden',
					fontFamily: FONT,
					boxShadow: '0 40px 90px rgba(0,0,0,0.6)',
					transform: `translateY(${(1 - enter) * 1500 + exit * 1500}px)`,
					display: 'flex',
					flexDirection: 'column',
					background: '#efeae2',
				}}
			>
				{/* cabecera */}
				<div style={{background: '#008069', color: '#fff', padding: '30px 30px', display: 'flex', alignItems: 'center', gap: 22}}>
					<div style={{fontSize: 44}}>←</div>
					<div style={{width: 76, height: 76, borderRadius: 38, background: '#dfe5e7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 42}}>🏠</div>
					<div>
						<div style={{fontSize: 38, fontWeight: 700}}>Sr. Cliente 🏠</div>
						<div style={{fontSize: 26, opacity: 0.9}}>{typingClient ? 'escribiendo…' : 'en línea'}</div>
					</div>
				</div>
				{/* mensajes, anclados abajo */}
				<div
					style={{
						flex: 1,
						padding: '24px 28px',
						display: 'flex',
						flexDirection: 'column',
						justifyContent: 'flex-end',
						overflow: 'hidden',
						backgroundImage: 'radial-gradient(rgba(0,0,0,0.05) 2px, transparent 2px)',
						backgroundSize: '34px 34px',
					}}
				>
					<div style={{alignSelf: 'center', background: '#fff', borderRadius: 12, padding: '8px 22px', fontSize: 24, color: '#54656f', marginBottom: 18}}>HOY</div>
					{visible.map((m) => (
						<Bubble
							key={`${m.frame}-${m.from}`}
							m={m}
							appear={spring({frame: frame - (m.typedEnd !== undefined ? m.typedEnd + 4 : m.frame), fps, config: {damping: 14, stiffness: 180}})}
						/>
					))}
					{typingClient && <TypingBubble frame={frame} />}
				</div>
				{/* barra para escribir */}
				<div style={{background: '#f0f2f5', padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 18}}>
					<div
						style={{
							flex: 1,
							background: '#fff',
							borderRadius: 40,
							padding: '20px 30px',
							fontSize: 32,
							color: composing ? '#111b21' : '#8696a0',
							minHeight: 44,
							lineHeight: 1.35,
						}}
					>
						{composing ? (
							<>
								{composing.text!.slice(0, typedChars)}
								<span style={{opacity: Math.floor(frame / 8) % 2 ? 1 : 0, color: '#00a884'}}>|</span>
							</>
						) : (
							'Mensaje'
						)}
					</div>
					<div style={{width: 86, height: 86, borderRadius: 43, background: '#00a884', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 40, flexShrink: 0}}>
						{composing ? '➤' : '🎤'}
					</div>
				</div>
			</div>
		</AbsoluteFill>
	);
};
