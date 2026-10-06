export type ShotId = 'A' | 'B' | 'C' | 'D' | 'E';

// A: junior pregunta · B: página del curso · C: Ingenito pregunta · D: junior orgulloso · E: Ingenito sin palabras
export const SHOTS: {id: ShotId; from: number; to: number}[] = [
	{id: 'A', from: 0, to: 74},
	{id: 'B', from: 74, to: 184},
	{id: 'C', from: 184, to: 242},
	{id: 'D', from: 242, to: 284},
	{id: 'E', from: 284, to: 300},
];

export const shotAt = (frame: number) => SHOTS.find((s) => frame >= s.from && frame < s.to) ?? SHOTS[SHOTS.length - 1];
