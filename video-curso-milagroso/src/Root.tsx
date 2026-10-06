import React from 'react';
import {Composition} from 'remotion';
import {CursoMilagroso} from './CursoMilagroso';
import timeline from './timeline.json';

export const RemotionRoot: React.FC = () => (
	<Composition
		id="CursoMilagroso"
		component={CursoMilagroso}
		durationInFrames={timeline.durationInFrames}
		fps={timeline.fps}
		width={1080}
		height={1920}
	/>
);
