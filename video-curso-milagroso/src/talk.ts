import timeline from './timeline.json';

export type Who = 'junior' | 'ingenito';

// Apertura de boca 0..1 sincronizada con los "bips" de voz que genera scripts/audio.py
export const mouthOpen = (who: Who, frame: number): number => {
	for (const line of timeline.lines) {
		if (line.who !== who || line.syllables === 0) continue;
		if (frame < line.from || frame >= line.talkEnd) continue;
		const slot = (line.talkEnd - line.from) / line.syllables;
		const t = (frame - line.from) / slot;
		const phase = t - Math.floor(t);
		// cada sílaba: abre rápido, cierra suave
		return phase < 0.6 ? Math.sin((phase / 0.6) * Math.PI) : 0;
	}
	return 0;
};

export const isTalking = (who: Who, frame: number) =>
	timeline.lines.some((l) => l.who === who && frame >= l.from && frame < l.talkEnd);
