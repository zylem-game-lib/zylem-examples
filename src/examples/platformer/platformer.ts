import { game } from '@tcool86/zylem';
import { LevelOne } from "./level-1";

const platformer = game({
	id: 'platformer',
	globals: {
		score: 0,
		lives: 3,
		time: 0,
		actualTime: 0,
	},
	stages: [
		LevelOne(),
	],
});

platformer.start();