import { game, stage, Perspectives, THREE } from '@tcool86/zylem';
import { Ship } from './ship';
import { Rock } from './rock';
import backgroundImage from '../../assets/asteroids/space-bg.png';

const { Color, Vector2 } = THREE;
const { Flat2D } = Perspectives;

const stage1 = stage({
	perspective: Flat2D,
	backgroundImage: backgroundImage,
	backgroundColor: new Color('#000'),
	conditions: [
		{
			bindings: ['score', 'lives'],
			callback: (globals, game) => {
				const { lives } = globals;
				if (lives.get() <= 0) {
					game.reset();
				}
			}
		}
	],
	setup: ({ HUD }) => {
		HUD.addText('0', {
			binding: 'score',
			update: (element, value) => {
				element.updateText(`Score: ${value}`);
			},
			position: new Vector2(200, 5)
		});
		HUD.addText('0', {
			binding: 'lives',
			update: (element, value) => {
				element.updateText(`Lives: ${value}`);
			},
			position: new Vector2(400, 5)
		});
	},
	children: () => {
		return [
			Ship(),
			Rock({ x: -14, y: -4, startingHealth: 4 }),
			Rock({ x: 10, y: 10, startingHealth: 4 }),
			Rock({ x: -16, y: 7, startingHealth: 4 }),
			Rock({ x: -2, y: -12, startingHealth: 4 }),
		]
	},
});

const asteroids = game({
	id: 'asteroids',
	globals: {
		score: 0,
		lives: 3,
	},
	stages: [stage1]
});

asteroids.start();