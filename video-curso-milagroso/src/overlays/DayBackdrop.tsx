import React, {useMemo} from 'react';
import {AbsoluteFill, random} from 'remotion';

// Cielo de día con sol, nubes y ciudad lejana (para la obra de día)
export const DayBackdrop: React.FC<{frame: number}> = ({frame}) => {
	const buildings = useMemo(
		() =>
			Array.from({length: 16}, (_, i) => ({
				x: -80 + i * 82 + random(`dx${i}`) * 30,
				w: 60 + random(`dw${i}`) * 70,
				h: 160 + random(`dh${i}`) * 300,
			})),
		[]
	);
	return (
		<AbsoluteFill style={{background: 'linear-gradient(180deg, #4aa3f0 0%, #8cc8f7 45%, #d9eefc 72%, #efe6d6 100%)', overflow: 'hidden'}}>
			<div
				style={{
					position: 'absolute',
					left: 760,
					top: 150,
					width: 170,
					height: 170,
					borderRadius: '50%',
					background: 'radial-gradient(circle, #fffbe8 0%, #fff1b0 45%, rgba(255,236,160,0) 72%)',
					filter: 'blur(2px)',
				}}
			/>
			{[0, 1, 2].map((i) => (
				<div
					key={i}
					style={{
						position: 'absolute',
						top: 260 + i * 120,
						left: ((frame * (0.4 + i * 0.15) + i * 380) % 1500) - 300,
						width: 260 + i * 60,
						height: 70,
						borderRadius: 60,
						background: 'rgba(255,255,255,0.85)',
						filter: 'blur(6px)',
					}}
				/>
			))}
			<svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0, filter: 'blur(3px)'}}>
				{buildings.map((b, i) => (
					<rect key={i} x={b.x} y={1180 - b.h} width={b.w} height={b.h + 800} fill={i % 2 ? '#b9c6d6' : '#a9b8cc'} />
				))}
				<g stroke="#8392a8" strokeWidth={8} fill="none">
					<line x1={180} y1={520} x2={180} y2={1180} />
					<line x1={-60} y1={545} x2={360} y2={545} />
				</g>
			</svg>
		</AbsoluteFill>
	);
};
