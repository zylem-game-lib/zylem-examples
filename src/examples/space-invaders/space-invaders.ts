import { Zylem, THREE } from '@tcool86/zylem';
import { Invader } from "./invader";
import { Player } from "./player";
const { Color } = THREE;
const { Flat2D } = Zylem;

const game = Zylem.create({
	id: 'space-invaders',
	globals: {
		score: 0,
		lives: 3,
		invaders: 0,
	},
	stages: [{
		perspective: Flat2D,
		backgroundColor: Color.NAMES.black,
		conditions: [
			(globals, game) => {
				if (globals.lives === 0) {
					game.reset();
				}
				if (globals.invaders === 0) {
					const previousScore = globals.score;
					game.reset();
					globals.score = previousScore;
				}
			}
		],
		setup: ({ scene, HUD }) => {
			HUD.createText({
				text: '0',
				binding: 'score',
				position: { x: 0, y: 10, z: 0 }
			});
			HUD.createText({
				text: '0',
				binding: 'lives',
				position: { x: -15, y: -10, z: 0 }
			});
		},
		children: ({ gameState }) => {
			const invaders: any[] = [];
			for (let i = -10; i <= 8; i += 2) {
				for (let j = 10; j >= 4; j -= 2) {
					const invader = Invader(i, j);
					invaders.push(invader);
					if (gameState) {
						gameState.globals.invaders++;
					}
				}
			}
			return [
				Player(),
				...invaders
			]
		},
	}],
});

export default game;