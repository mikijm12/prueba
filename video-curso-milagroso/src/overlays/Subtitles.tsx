import React from 'react';
import {AbsoluteFill} from 'remotion';
import {useEp} from '../episode';

// Nombre y color de cada personaje (solo en episodios con "labels")
const SPEAKERS: Record<string, {name: string; color: string}> = {
	junior: {name: 'PRACTICANTE', color: '#ffd34d'},
	ingenito: {name: 'INGENITO', color: '#2fe8c8'},
	teo: {name: 'DON TEO · MAESTRO DE OBRA', color: '#ff9a52'},
	supervisora: {name: 'SUPERVISORA', color: '#ff86d6'},
};

export const Subtitles: React.FC<{frame: number}> = ({frame}) => {
	const {timeline, segmentAt} = useEp();
	const line = timeline.lines.find((l) => frame >= l.from && frame < l.to);
	if (!line) return null;
	const caption = line.who === 'caption';
	const seg = segmentAt(frame);
	if (seg.overlay === 'end-rne') return null;
	// sube el subtítulo cuando una tarjeta ocupa la pantalla
	const overCard =
		(seg.overlay?.startsWith('insta') || seg.overlay === 'chat' || seg.overlay === 'manual') && frame >= (seg.overlayFrom ?? seg.from);

	if (timeline.labels) {
		const sp = SPEAKERS[line.who];
		return (
			<AbsoluteFill style={{alignItems: 'center', top: overCard ? 50 : 1400}}>
				<div
					style={{
						maxWidth: 940,
						background: 'rgba(8,12,40,0.78)',
						borderRadius: 22,
						padding: '16px 28px 20px',
						textAlign: 'center',
						fontFamily: 'Inter, "Noto Color Emoji", sans-serif',
						borderTop: sp ? `6px solid ${sp.color}` : undefined,
					}}
				>
					{sp && <div style={{color: sp.color, fontWeight: 900, fontSize: 28, letterSpacing: 2, marginBottom: 6}}>{sp.name}</div>}
					<div style={{color: caption ? '#cfd6ff' : '#fff', fontWeight: caption ? 500 : 700, fontStyle: caption ? 'italic' : 'normal', fontSize: 52, lineHeight: 1.22}}>
						{line.text}
					</div>
				</div>
			</AbsoluteFill>
		);
	}

	return (
		<AbsoluteFill style={{alignItems: 'center', top: overCard ? 120 : 320}}>
			<div
				style={{
					maxWidth: 860,
					textAlign: 'center',
					fontFamily: 'Inter, sans-serif',
					fontWeight: caption ? 500 : 600,
					fontStyle: caption ? 'italic' : 'normal',
					fontSize: caption ? 46 : 54,
					lineHeight: 1.2,
					color: caption ? '#cfd6ff' : '#fff',
					textShadow: '0 3px 10px rgba(0,0,0,0.85), 0 0 2px rgba(0,0,0,0.9)',
				}}
			>
				{line.text}
			</div>
		</AbsoluteFill>
	);
};
