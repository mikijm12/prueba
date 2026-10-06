import React from 'react';
import {AbsoluteFill, interpolate, spring, useVideoConfig} from 'remotion';
import {useEp} from '../episode';

const FONT = 'Inter, sans-serif';

export const EndCard: React.FC<{frame: number}> = ({frame}) => {
	const {fps} = useVideoConfig();
	const seg = useEp().segmentWithOverlay('end');
	if (!seg || frame < seg.from) return null;
	const local = frame - seg.from;
	const a = spring({frame: local - 4, fps, config: {damping: 14}});
	const b = spring({frame: local - 14, fps, config: {damping: 14}});
	const c = spring({frame: local - 26, fps, config: {damping: 12}});
	const shade = interpolate(local, [0, 12], [0, 1], {extrapolateRight: 'clamp'});

	return (
		<AbsoluteFill style={{background: `linear-gradient(180deg, rgba(4,8,36,0) 35%, rgba(4,8,36,${0.92 * shade}) 62%)`}}>
			<div style={{position: 'absolute', left: 0, right: 0, top: 1240, textAlign: 'center', fontFamily: FONT}}>
				<div style={{fontWeight: 900, fontSize: 112, letterSpacing: -2, color: '#fff', opacity: a, transform: `translateY(${(1 - a) * 60}px)`}}>
					C<span style={{color: '#ffc21a'}}>Ingeniería</span>
				</div>
				<div
					style={{
						margin: '22px auto 0',
						maxWidth: 820,
						fontWeight: 600,
						fontSize: 50,
						lineHeight: 1.2,
						color: '#e6e9ff',
						opacity: b,
						transform: `translateY(${(1 - b) * 40}px)`,
					}}
				>
					Cursos con ingenieros que <span style={{color: '#ffc21a'}}>sí han pisado obra.</span>
				</div>
				<div
					style={{
						margin: '48px auto 0',
						display: 'inline-block',
						padding: '24px 54px',
						borderRadius: 60,
						background: '#25d366',
						color: '#fff',
						fontWeight: 800,
						fontSize: 42,
						transform: `scale(${c})`,
						boxShadow: '0 12px 30px rgba(0,0,0,0.4)',
					}}
				>
					Escríbenos por WhatsApp
				</div>
			</div>
		</AbsoluteFill>
	);
};
