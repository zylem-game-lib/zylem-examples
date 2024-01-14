import { Zylem, THREE } from '@tcool86/zylem';
import { Ground } from "./ground";
import { Player } from "./player";
import { coinImage } from './assets';

const { create, ThirdPerson, Sprite } = Zylem;
const { Color, Vector3 } = THREE;

export function Coin({ position = new Vector3(0, 0, 0) }) {
	return {
		name: `coin`,
		type: Sprite,
		images: [coinImage],
		setup: (entity: any) => {
			entity.setPosition(position.x, position.y, position.z);
		},
		collision: (coin: any, other: any, { gameState }: any) => {
			if (other.name === 'player') {
				gameState.globals.score += 100;
				coin.destroy();
			}
		}
	}
}

const game = create({
	id: 'platformer',
	globals: {
		score: 0,
		lives: 3,
		time: 0,
		actualTime: 0,
	},
	stages: [
		{
			id: 'level-1',
			perspective: ThirdPerson,
			gravity: new Vector3(0, -10, 0),
			backgroundColor: new Color(0xA1ADFF),
			conditions: [
				(globals, game) => {
					if (globals.lives <= 0) {
						game.reset();
					}
				}
			],
			setup: ({ scene, HUD }) => {
				// TODO: fix HUD for perspective camera
				HUD.createText({
					text: '0',
					binding: 'score',
					position: { x: -10, y: 10, z: 10 }
				});
				HUD.createText({
					text: '0',
					binding: 'time',
					position: { x: 15, y: 10, z: 10 }
				});
			},
			children: ({ gameState }) => {
				return [
					Player(),
					Coin({ position: new Vector3(10, 0, 0) }),
					Ground({}),
					Ground({ position: new Vector3(30, -4, 0) }),
					Ground({ position: new Vector3(-30, -4, 0) }),
				];
			},
			update: (delta, { camera, stage, inputs, globals }) => {
				const player = stage.getEntityByName('player');
				const { x, y } = player.getPosition();
				camera.moveCamera(new Vector3(x, y, 0));
				const { actualTime } = globals;
				globals.actualTime = actualTime + delta;
				globals.time = Math.round(actualTime);
			}
		}
	],
});

export default game;