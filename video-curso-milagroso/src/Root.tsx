import React from 'react';
import {Composition} from 'remotion';
import {Episodio} from './Episodio';
import {IngenitoPreview} from './IngenitoPreview';
import {makeEpisode, Mouth, Timeline} from './episode';
import ep1Timeline from './episodios/ep1/timeline.json';
import ep1Mouth from './episodios/ep1/mouth.json';
import ep2Timeline from './episodios/ep2/timeline.json';
import ep2Mouth from './episodios/ep2/mouth.json';

const EPISODES = [
	{id: 'CursoMilagroso', ep: makeEpisode(ep1Timeline as unknown as Timeline, ep1Mouth as Mouth)},
	{id: 'LaConsultita', ep: makeEpisode(ep2Timeline as unknown as Timeline, ep2Mouth as Mouth)},
];

export const RemotionRoot: React.FC = () => (
	<>
		{EPISODES.map(({id, ep}) => (
			<Composition
				key={id}
				id={id}
				component={() => <Episodio ep={ep} />}
				durationInFrames={ep.timeline.durationInFrames}
				fps={ep.timeline.fps}
				width={1080}
				height={1920}
			/>
		))}
		<Composition id="IngenitoPreview" component={IngenitoPreview} durationInFrames={30} fps={30} width={1920} height={1080} />
	</>
);
