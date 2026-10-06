import timeline from './timeline.json';

export type Cam = 'JUN' | 'ING' | 'JUN_LOW' | 'ING_CLOSE' | 'WIDE' | 'TWO' | 'WIDE_END';
export type Overlay = 'mockup' | 'run' | 'insta-crop' | 'insta-reveal' | 'end';

export type Segment = {
	from: number;
	to: number;
	cam: Cam;
	overlay?: Overlay;
	overlayFrom?: number;
	juniorPose?: 'phone' | 'proud';
	juniorSmile?: number;
	juniorBrow?: number;
	ingenitoEyes?: 'normal' | 'skeptic' | 'deadpan' | 'happy';
	lookUpAt?: number;
};

// Los planos los genera scripts/sonido.py a partir de scripts/guion.json
export const SEGMENTS = timeline.segments as Segment[];

export const segmentAt = (frame: number): Segment =>
	SEGMENTS.find((s) => frame >= s.from && frame < s.to) ?? SEGMENTS[SEGMENTS.length - 1];

// Planos consecutivos con la misma cámara comparten un solo movimiento continuo
export const camRunAt = (frame: number): {from: number; to: number} => {
	const i = SEGMENTS.indexOf(segmentAt(frame));
	let a = i;
	let b = i;
	while (a > 0 && SEGMENTS[a - 1].cam === SEGMENTS[i].cam) a--;
	while (b < SEGMENTS.length - 1 && SEGMENTS[b + 1].cam === SEGMENTS[i].cam) b++;
	return {from: SEGMENTS[a].from, to: SEGMENTS[b].to};
};

export const segmentWithOverlay = (overlay: Overlay) => SEGMENTS.find((s) => s.overlay === overlay);
