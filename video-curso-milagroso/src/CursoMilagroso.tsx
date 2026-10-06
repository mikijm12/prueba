import React from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {Scene3D} from './three/Scene3D';
import {NightBackdrop} from './overlays/NightBackdrop';
import {CourseMockup} from './overlays/CourseMockup';
import {Subtitles} from './overlays/Subtitles';
import {RunButton} from './overlays/RunButton';
import {InstaPost} from './overlays/InstaPost';
import {EndCard} from './overlays/EndCard';
import {segmentAt} from './shots';

export const CursoMilagroso: React.FC = () => {
	const frame = useCurrentFrame();
	const {width, height} = useVideoConfig();
	const seg = segmentAt(frame);
	const blurBg =
		seg.overlay === 'mockup' ||
		((seg.overlay === 'insta-crop' || seg.overlay === 'insta-reveal') && frame >= (seg.overlayFrom ?? seg.from));

	return (
		<AbsoluteFill style={{backgroundColor: '#040824'}}>
			{/* voces, música y efectos generados por scripts/sonido.py */}
			<Audio src={staticFile('audio.wav')} />
			<NightBackdrop frame={frame} cam={seg.cam} />
			<AbsoluteFill style={{filter: blurBg ? 'blur(6px)' : undefined}}>
				<ThreeCanvas width={width} height={height} camera={{fov: 35, near: 0.1, far: 60}} gl={{alpha: true, antialias: true}}>
					<Scene3D frame={frame} />
				</ThreeCanvas>
			</AbsoluteFill>
			{/* viñeta */}
			<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 55%, rgba(0,0,0,0) 55%, rgba(0,0,20,0.55) 100%)'}} />
			{seg.overlay === 'mockup' && <CourseMockup frame={frame} />}
			<RunButton frame={frame} />
			<InstaPost frame={frame} />
			<EndCard frame={frame} />
			<Subtitles frame={frame} />
		</AbsoluteFill>
	);
};
