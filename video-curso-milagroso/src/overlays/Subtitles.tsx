import React from 'react';
import {AbsoluteFill} from 'remotion';
import timeline from '../timeline.json';
import {segmentAt} from '../shots';

export const Subtitles: React.FC<{frame: number}> = ({frame}) => {
	const line = timeline.lines.find((l) => frame >= l.from && frame < l.to);
	if (!line) return null;
	const caption = line.who === 'caption';
	const seg = segmentAt(frame);
	// sube el subtítulo cuando la tarjeta de Instagram ocupa la pantalla
	const overCard = seg.overlay?.startsWith('insta') && frame >= (seg.overlayFrom ?? seg.from);
	return (
		<AbsoluteFill style={{alignItems: 'center', top: overCard ? 150 : 320}}>
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
