import { Zylem } from '@tcool86/zylem';
import { Paddle } from './paddle';
import { Ball } from './ball';
import { Brick } from './brick';

const { Color, Vector3 } = Zylem.THREE;
// TODO: expose perspective type
// const { PerspectiveType } = Zylem;

const breakout = Zylem.create({
	id: 'breakout',
	// @ts-ignore TODO: expose perspective type
	perspective: 'flat-2d',
	globals: {
		score: 0,
		level: 1,
		lives: 3,
		bricks: 0
	},
	stage: {
		backgroundColor: Color.NAMES.black,
		conditions: [
			(globals, game) => {
				if (globals.score > 0 && globals.bricks === 0) {
					game.reset();
				}
				if (globals.lives === 0) {
					game.reset();
				}
			}
		],
		setup: (scene, HUD) => {
			HUD.createText({
				text: '0',
				binding: 'score',
				position: new Vector3(0, 10, 0)
			});
			HUD.createText({
				text: '0',
				binding: 'lives',
				position: new Vector3(-15, -10, 0)
			});
		},
		children: ({ gameState }) => {
			const bricks: any[] = [];
			for (let i = -8; i <= 8; i += 4) {
				for (let j = 8; j >= 4; j -= 2) {
					const brick = Brick(i, j);
					bricks.push(brick);
					if (gameState) {
						gameState.globals.bricks++;
					}
				}
			}
			return [
				Paddle(),
				Ball(),
				...bricks
			]
		}
	}
});

export default breakout;
