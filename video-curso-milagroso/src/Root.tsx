import React from 'react';
import {Composition} from 'remotion';
import {CursoMilagroso} from './CursoMilagroso';
import {IngenitoPreview} from './IngenitoPreview';
import timeline from './timeline.json';

export const RemotionRoot: React.FC = () => (
	<>
		<Composition
			id="CursoMilagroso"
			component={CursoMilagroso}
			durationInFrames={timeline.durationInFrames}
			fps={timeline.fps}
			width={1080}
			height={1920}
		/>
		<Composition id="IngenitoPreview" component={IngenitoPreview} durationInFrames={30} fps={30} width={1920} height={1080} />
	</>
);
