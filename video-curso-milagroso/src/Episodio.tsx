import React from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {Scene3D} from './three/Scene3D';
import {Episode, EpisodeProvider} from './episode';
import {NightBackdrop} from './overlays/NightBackdrop';
import {CourseMockup} from './overlays/CourseMockup';
import {Subtitles} from './overlays/Subtitles';
import {RunButton} from './overlays/RunButton';
import {InstaPost} from './overlays/InstaPost';
import {EndCard} from './overlays/EndCard';
import {WhatsAppChat} from './overlays/WhatsAppChat';
import {ManualPage} from './overlays/ManualPage';
import {EndCardRNE} from './overlays/EndCardRNE';
import {DayBackdrop} from './overlays/DayBackdrop';
import {HookText, PcScreen, TitleCard, NameTag, DramaLines} from './overlays/EpisodeExtras';

const BLUR_OVERLAYS = new Set(['mockup', 'insta-crop', 'insta-reveal', 'chat', 'manual', 'pc']);

export const Episodio: React.FC<{ep: Episode}> = ({ep}) => {
	const frame = useCurrentFrame();
	const {width, height} = useVideoConfig();
	const seg = ep.segmentAt(frame);
	const blurBg = seg.overlay !== undefined && BLUR_OVERLAYS.has(seg.overlay) && frame >= (seg.overlayFrom ?? seg.from);

	return (
		<EpisodeProvider ep={ep}>
			<AbsoluteFill style={{backgroundColor: '#040824'}}>
				{/* voces, música y efectos generados por scripts/sonido.py */}
				<Audio src={staticFile(`${ep.timeline.id}/audio.wav`)} />
				{seg.set === 'obra-dia' ? <DayBackdrop frame={frame} /> : <NightBackdrop frame={frame} cam={seg.cam} />}
				<AbsoluteFill style={{filter: blurBg ? 'blur(6px)' : undefined}}>
					<ThreeCanvas width={width} height={height} camera={{fov: 35, near: 0.1, far: 60}} gl={{alpha: true, antialias: true}}>
						<Scene3D frame={frame} ep={ep} />
					</ThreeCanvas>
				</AbsoluteFill>
				{/* viñeta */}
				<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 55%, rgba(0,0,0,0) 55%, rgba(0,0,20,0.55) 100%)'}} />
				{seg.overlay === 'mockup' && <CourseMockup frame={frame} />}
				<RunButton frame={frame} />
				<InstaPost frame={frame} />
				<DramaLines frame={frame} />
				<WhatsAppChat frame={frame} />
				<PcScreen frame={frame} />
				<NameTag frame={frame} />
				<ManualPage frame={frame} />
				<EndCard frame={frame} />
				<EndCardRNE frame={frame} />
				<Subtitles frame={frame} />
				<HookText frame={frame} />
				<TitleCard frame={frame} />
			</AbsoluteFill>
		</EpisodeProvider>
	);
};
