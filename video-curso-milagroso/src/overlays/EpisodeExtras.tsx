import React from 'react';
import {AbsoluteFill, interpolate, spring, useVideoConfig} from 'remotion';
import {useEp} from '../episode';

const FONT = 'Inter, "Noto Color Emoji", sans-serif';
const TEAL = '#2fe8c8';
const NAVY = '#16208a';

// Texto gancho arriba, estilo TikTok
export const HookText: React.FC<{frame: number}> = ({frame}) => {
	const {fps} = useVideoConfig();
	const ep = useEp();
	const seg = ep.segmentAt(frame);
	if (!seg.hook) return null;
	const first = ep.segments.find((s) => s.hook === seg.hook)!;
	const s = spring({frame: frame - first.from, fps, config: {damping: 12}});
	return (
		<div style={{position: 'absolute', top: 150, left: 70, right: 70, display: 'flex', justifyContent: 'center', transform: `scale(${s})`}}>
			<div style={{background: '#fff', color: '#111', fontFamily: FONT, fontWeight: 800, fontSize: 46, lineHeight: 1.25, padding: '14px 26px', borderRadius: 16, textAlign: 'center', boxShadow: '0 8px 24px rgba(0,0,0,0.35)'}}>
				{seg.hook}
			</div>
		</div>
	);
};

// Pantalla de la PC: los archivos "final" del plano
const FILES = ['plano_FINAL.dwg', 'plano_FINAL_final.dwg', 'plano_FINAL_ahora_si.dwg', 'plano_FINAL_ahora_si_CORREGIDO_v7.dwg'];
export const PcScreen: React.FC<{frame: number}> = ({frame}) => {
	const {fps} = useVideoConfig();
	const ep = useEp();
	const seg = ep.segmentAt(frame);
	if (seg.overlay !== 'pc') return null;
	const local = frame - seg.from;
	const enter = spring({frame: local, fps, config: {damping: 16}});
	return (
		<AbsoluteFill style={{background: `rgba(3,6,25,${0.5 * enter})`}}>
			<div style={{position: 'absolute', left: 50, top: 520, width: 980, borderRadius: 18, overflow: 'hidden', fontFamily: FONT, boxShadow: '0 30px 80px rgba(0,0,0,0.6)', transform: `scale(${0.85 + 0.15 * enter})`, opacity: enter}}>
				<div style={{background: '#1f2633', color: '#dfe6f3', padding: '18px 26px', fontSize: 28, display: 'flex', justifyContent: 'space-between'}}>
					<span>📁 Proyecto_Edificio_7P / Planos</span>
					<span style={{color: '#ff6b6b', fontWeight: 700}}>2:47 a. m.</span>
				</div>
				<div style={{background: '#f4f6fa', padding: '20px 26px'}}>
					{FILES.map((f, i) => {
						const a = spring({frame: local - 6 - i * 9, fps, config: {damping: 14}});
						const last = i === FILES.length - 1;
						return (
							<div
								key={f}
								style={{
									display: 'flex',
									alignItems: 'center',
									gap: 20,
									padding: '18px 16px',
									borderRadius: 12,
									marginBottom: 8,
									background: last ? '#ffe8a3' : 'transparent',
									opacity: a,
									transform: `translateX(${(1 - a) * 80}px)`,
								}}
							>
								<div style={{width: 54, height: 62, borderRadius: 8, background: '#e8344a', color: '#fff', fontWeight: 900, fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>DWG</div>
								<div style={{fontSize: last ? 34 : 32, fontWeight: last ? 900 : 600, color: '#1b2233', wordBreak: 'break-all'}}>{f}</div>
							</div>
						);
					})}
				</div>
			</div>
		</AbsoluteFill>
	);
};

// Tarjeta de transición "Al día siguiente…"
export const TitleCard: React.FC<{frame: number}> = ({frame}) => {
	const {fps} = useVideoConfig();
	const ep = useEp();
	const seg = ep.segmentAt(frame);
	if (seg.overlay !== 'title') return null;
	const local = frame - seg.from;
	const s = spring({frame: local, fps, config: {damping: 9, stiffness: 140}});
	const wobble = Math.sin(local / 3) * 2;
	return (
		<AbsoluteFill style={{background: `radial-gradient(circle at 50% 45%, #2433b8 0%, ${NAVY} 70%)`, alignItems: 'center', justifyContent: 'center'}}>
			<div style={{fontFamily: FONT, fontWeight: 900, fontSize: 104, color: TEAL, transform: `scale(${s}) rotate(${wobble}deg)`, textShadow: '0 8px 0 #0b1260', textAlign: 'center', lineHeight: 1.05}}>
				{seg.titleText}
			</div>
		</AbsoluteFill>
	);
};

// Cartel de presentación (zócalo)
export const NameTag: React.FC<{frame: number}> = ({frame}) => {
	const {fps} = useVideoConfig();
	const ep = useEp();
	const seg = ep.segmentAt(frame);
	if (seg.overlay !== 'nametag' || !seg.nametag) return null;
	const s = spring({frame: frame - seg.from - 4, fps, config: {damping: 14}});
	const blink = Math.floor(frame / 8) % 2;
	return (
		<div style={{position: 'absolute', left: 60, top: 1380, transform: `translateX(${(1 - s) * -900}px)`, fontFamily: FONT}}>
			<div style={{display: 'inline-flex', alignItems: 'center', gap: 14, background: '#e8344a', color: '#fff', fontWeight: 900, fontSize: 30, padding: '8px 18px', letterSpacing: 2}}>
				<span style={{width: 16, height: 16, borderRadius: 8, background: '#fff', opacity: blink ? 1 : 0.3}} />
				ALERTA
			</div>
			<div style={{background: '#fff', color: NAVY, fontWeight: 900, fontSize: 64, padding: '10px 24px'}}>{seg.nametag[0]}</div>
			<div style={{background: NAVY, color: '#fff', fontWeight: 600, fontSize: 36, padding: '8px 24px', display: 'inline-block'}}>{seg.nametag[1]}</div>
		</div>
	);
};

// Líneas de velocidad y viñeta roja para el "¡tan tan taaan!"
export const DramaLines: React.FC<{frame: number}> = ({frame}) => {
	const ep = useEp();
	const seg = ep.segmentAt(frame);
	if (!seg.shake) return null;
	const local = frame - seg.from;
	const a = interpolate(local, [0, 4, seg.to - seg.from - 4, seg.to - seg.from], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	return (
		<AbsoluteFill style={{opacity: a, pointerEvents: 'none'}}>
			<AbsoluteFill
				style={{
					background: `repeating-conic-gradient(from ${local * 7}deg at 50% 42%, rgba(255,255,255,0.0) 0deg 5deg, rgba(255,255,255,0.22) 5deg 6deg)`,
					maskImage: 'radial-gradient(circle at 50% 42%, transparent 28%, black 60%)',
					WebkitMaskImage: 'radial-gradient(circle at 50% 42%, transparent 28%, black 60%)',
				}}
			/>
			<AbsoluteFill style={{background: 'radial-gradient(circle at 50% 45%, transparent 45%, rgba(200,0,30,0.45) 100%)'}} />
		</AbsoluteFill>
	);
};
