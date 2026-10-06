import React from 'react';
import {AbsoluteFill, interpolate, spring, useVideoConfig} from 'remotion';
import {useEp} from '../episode';

// El botón "Run" de ETABS que el junior cree que es todo el curso
export const RunButton: React.FC<{frame: number}> = ({frame}) => {
	const {fps} = useVideoConfig();
	const {timeline, segmentWithOverlay} = useEp();
	const seg = segmentWithOverlay('run');
	const {runPop, runClick} = timeline.sfx;
	if (!seg || frame < runPop || frame >= seg.to) return null;
	const pop = spring({frame: frame - runPop, fps, config: {damping: 10, stiffness: 160}});
	const press = frame >= runClick && frame < runClick + 4 ? 0.88 : 1;
	const cursorIn = interpolate(frame, [runPop + 2, runClick], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const sparkle = interpolate(frame, [runClick, runClick + 8], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

	return (
		<AbsoluteFill>
			<div
				style={{
					position: 'absolute',
					left: 600,
					top: 820,
					transform: `scale(${pop * press}) rotate(-6deg)`,
					transformOrigin: 'center',
					background: 'linear-gradient(180deg, #3ddc6b, #1fa84a)',
					border: '6px solid #fff',
					borderRadius: 24,
					padding: '22px 48px',
					fontFamily: 'Inter, sans-serif',
					fontWeight: 900,
					fontSize: 64,
					color: '#fff',
					boxShadow: `0 16px 40px rgba(0,0,0,0.5), 0 0 ${60 * sparkle}px rgba(80,255,140,${0.8 * sparkle})`,
				}}
			>
				▶ Run
			</div>
			<svg
				width={90}
				height={90}
				viewBox="0 0 24 24"
				style={{position: 'absolute', left: 790 + cursorIn * 160, top: 905 + cursorIn * 200, opacity: pop}}
			>
				<path d="M4 2 L4 19 L8.5 15 L11.5 22 L14.5 20.7 L11.5 14 L17.5 14 Z" fill="#fff" stroke="#111" strokeWidth={1.4} strokeLinejoin="round" />
			</svg>
		</AbsoluteFill>
	);
};
