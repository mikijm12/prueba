import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {Scene3D} from './three/Scene3D';
import {NightBackdrop} from './overlays/NightBackdrop';
import {CourseMockup} from './overlays/CourseMockup';
import {Subtitles} from './overlays/Subtitles';
import {RunButton} from './overlays/RunButton';
import {shotAt} from './shots';

export const CursoMilagroso: React.FC = () => {
	const frame = useCurrentFrame();
	const {width, height} = useVideoConfig();
	const shot = shotAt(frame).id;
	const inMockup = shot === 'B';

	return (
		<AbsoluteFill style={{backgroundColor: '#040824'}}>
			<NightBackdrop frame={frame} shot={shot} />
			<AbsoluteFill style={{filter: inMockup ? 'blur(6px)' : undefined}}>
				<ThreeCanvas width={width} height={height} camera={{fov: 35, near: 0.1, far: 60}} gl={{alpha: true, antialias: true}}>
					<Scene3D frame={frame} />
				</ThreeCanvas>
			</AbsoluteFill>
			{/* viñeta */}
			<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 55%, rgba(0,0,0,0) 55%, rgba(0,0,20,0.55) 100%)'}} />
			{inMockup && <CourseMockup frame={frame} />}
			<RunButton frame={frame} />
			<Subtitles frame={frame} />
		</AbsoluteFill>
	);
};
