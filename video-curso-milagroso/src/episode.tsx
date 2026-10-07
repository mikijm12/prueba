import React, {createContext, useContext} from 'react';
import type {HexArm, HexExpression} from './three/IngenitoHex';

// Datos de un episodio, generados por scripts/sonido.py a partir de episodios/<ep>/guion.json

export type Cam =
	| 'JUN' | 'ING' | 'JUN_LOW' | 'ING_CLOSE' | 'WIDE' | 'TWO' | 'WIDE_END'
	| 'OFI_JUN' | 'OFI_PC' | 'OFI_ING' | 'OFI_WIDE'
	| 'OBRA_COL' | 'OBRA_JUN' | 'OBRA_DRAMA' | 'OBRA_ING' | 'OBRA_TEO' | 'OBRA_SUP' | 'OBRA_SUP2' | 'OBRA_GROUP' | 'OBRA_WIDE' | 'OBRA_TRIO';
export type SetId = 'obra-noche' | 'oficina' | 'obra-dia';
export type Overlay = 'mockup' | 'run' | 'insta-crop' | 'insta-reveal' | 'end' | 'chat' | 'manual' | 'end-rne' | 'pc' | 'title' | 'nametag';

export type Segment = {
	from: number;
	to: number;
	cam: Cam;
	overlay?: Overlay;
	overlayFrom?: number;
	juniorPose?: 'phone' | 'proud';
	juniorSmile?: number;
	juniorBrow?: number;
	lookUpAt?: number;
	// Ingenito robot (episodio 1)
	ingenitoEyes?: 'normal' | 'skeptic' | 'deadpan' | 'happy';
	// Ingenito hexagonal oficial
	expr?: HexExpression;
	leftArm?: HexArm;
	rightArm?: HexArm;
	book?: boolean;
	// episodio 3
	set?: SetId;
	teoPose?: 'idle' | 'point' | 'crossed' | 'shy' | 'hose' | 'hide';
	teoProp?: 'gaseosa';
	dropOnHat?: boolean;
	supPose?: 'idle' | 'reading';
	supWalk?: boolean;
	shake?: boolean;
	hook?: string;
	titleText?: string;
	nametag?: string[];
};

export type Line = {who: string; text: string; from: number; to: number};

export type ChatMsg = {frame: number; from: 'client' | 'me'; text?: string; photo?: boolean; time: string; typedEnd?: number};

export type Timeline = {
	id: string;
	fps: number;
	durationInFrames: number;
	ingenito: 'robot' | 'hex';
	segments: Segment[];
	lines: Line[];
	sfx: Record<string, any>;
	chat?: ChatMsg[];
	labels?: boolean;
	manual?: {code: string; area: string; title: string; drawing: 'columna' | 'recubrimiento' | 'agua'; stamp: string[]};
	clima?: 'lluvia';
	props?: string[];
};

export type Mouth = Record<string, number[]>;
export type Who = string;

export const makeEpisode = (timeline: Timeline, mouth: Mouth) => {
	const segments = timeline.segments;
	const segmentAt = (frame: number): Segment => segments.find((s) => frame >= s.from && frame < s.to) ?? segments[segments.length - 1];
	return {
		timeline,
		segments,
		segmentAt,
		// Planos consecutivos con la misma cámara comparten un solo movimiento continuo
		camRunAt: (frame: number) => {
			const i = segments.indexOf(segmentAt(frame));
			let a = i;
			let b = i;
			while (a > 0 && segments[a - 1].cam === segments[i].cam) a--;
			while (b < segments.length - 1 && segments[b + 1].cam === segments[i].cam) b++;
			return {from: segments[a].from, to: segments[b].to};
		},
		segmentWithOverlay: (overlay: Overlay) => segments.find((s) => s.overlay === overlay),
		segmentsWithOverlay: (overlay: Overlay) => segments.filter((s) => s.overlay === overlay),
		// Apertura de boca 0..1 por fotograma, calculada del volumen de la voz real
		mouthOpen: (who: Who, frame: number) => mouth[who]?.[frame] ?? 0,
		mouthShape: (who: Who, frame: number) => mouth[who + '_shape']?.[frame] ?? 0,
		isTalking: (who: Who, frame: number) => {
			for (let f = frame - 3; f <= frame + 3; f++) if ((mouth[who]?.[f] ?? 0) > 0.1) return true;
			return false;
		},
		// 0..1 suavizado, para gestos sin saltos
		talkLevel: (who: Who, frame: number) => {
			let n = 0;
			for (let f = frame - 8; f <= frame + 8; f++) if ((mouth[who]?.[f] ?? 0) > 0.1) n++;
			return Math.min(1, n / 8);
		},
	};
};

export type Episode = ReturnType<typeof makeEpisode>;

const Ctx = createContext<Episode | null>(null);
export const EpisodeProvider: React.FC<{ep: Episode; children: React.ReactNode}> = ({ep, children}) => <Ctx.Provider value={ep}>{children}</Ctx.Provider>;
export const useEp = () => {
	const ep = useContext(Ctx);
	if (!ep) throw new Error('useEp fuera de EpisodeProvider');
	return ep;
};
