import { Zylem, THREE } from '@tcool86/zylem';
import { Ship } from './ship';
import { Rock } from './rock';
import backgroundImage from '../../assets/asteroids/space-bg.png';

const { Flat2D } = Zylem;
const { Color } = THREE;

const game = Zylem.create({
	id: 'asteroids',
	globals: {
		score: 0,
		lives: 3,
	},
	stages: [{
		perspective: Flat2D,
		backgroundColor: Color.NAMES.black,
		backgroundImage: backgroundImage,
		conditions: [
			(globals, game) => {
				if (globals.lives <= 0) {
					game.reset();
				}
			}
		],
		setup: ({ scene, HUD }) => {
			HUD.createText({
				text: '0',
				binding: 'score',
				position: { x: 0, y: 10, z: 10 }
			});
			HUD.createText({
				text: '0',
				binding: 'lives',
				position: { x: -15, y: -10, z: 10 }
			});
		},
		children: ({ gameState }) => {
			return [
				Ship(),
				Rock({ x: -14, y: -4, startingHealth: 4 }),
				Rock({ x: 10, y: 10, startingHealth: 4 }),
				Rock({ x: -16, y: 7, startingHealth: 4 }),
				Rock({ x: -2, y: -12, startingHealth: 4 }),
			]
		},
	}],
});

export default game;