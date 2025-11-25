import { stage, game, THREE, Perspectives } from '@tcool86/zylem';

import { BoardSide } from './board';
import { Paddle } from './paddle';
import { Ball } from './ball';

const { Color, Vector2 } = THREE;
const { Flat2D } = Perspectives;
const paddle1 = Paddle(0, BoardSide.LEFT);
const paddle2 = Paddle(1, BoardSide.RIGHT);
const ball = Ball();

const stage1 = stage({
	perspective: Flat2D,
	backgroundColor: new Color(0, 0, 0),
	// conditions: [
	// 	{
	// 		bindings: ['p1Score', 'p2Score'],
	// 		callback: (globals, game) => {
	// 			const { p1Score, p2Score, winner } = globals;
	// 			if (p1Score.get() === 3) {
	// 				winner.set(1);
	// 			}
	// 			if (p2Score.get() === 3) {
	// 				winner.set(2);
	// 			}
	// 		}
	// 	}
	// ],
	// setup: ({ HUD, globals }) => {
	// 	HUD.addText('0', new Vector2(250, 10), globals.p1Score);
	// 	HUD.addText('0', new Vector2(850, 10), globals.p2Score);
	// 	HUD.addText('', new Vector2(450, 50), globals.winner);
	// },
	children: () => {
		return [
			paddle1,
			paddle2,
			ball,
		];
	}
});

const pong = game({
	id: 'pong',
	globals: {
		p1Score: 0,
		p2Score: 0,
		winner: ''
	},
	stages: [stage1],
});

pong.start();