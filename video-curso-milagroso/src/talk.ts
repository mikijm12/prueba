import mouth from './mouth.json';

export type Who = 'junior' | 'ingenito';

// Apertura de boca 0..1 por fotograma, calculada del volumen de la voz real (scripts/sonido.py)
export const mouthOpen = (who: Who, frame: number): number => mouth[who][frame] ?? 0;

export const isTalking = (who: Who, frame: number) => {
	const m = mouth[who];
	for (let f = frame - 3; f <= frame + 3; f++) {
		if ((m[f] ?? 0) > 0.1) return true;
	}
	return false;
};

// 0..1 suavizado: qué tanto está hablando alrededor de este fotograma (para gestos sin saltos)
export const talkLevel = (who: Who, frame: number) => {
	const m = mouth[who];
	let n = 0;
	for (let f = frame - 8; f <= frame + 8; f++) {
		if ((m[f] ?? 0) > 0.1) n++;
	}
	return Math.min(1, n / 8);
};
