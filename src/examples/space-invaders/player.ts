import { Zylem } from '@tcool86/zylem';
import { Bullet } from './bullet';
import ship from '../../assets/space-invaders/ship.png';
import shipDamaged from '../../assets/space-invaders/ship-damaged.png';
const { Sprite } = Zylem.GameEntityType;
const { Vector3 } = Zylem.THREE;

const playerSize = new Vector3(2, 2, 0.1);
const playerCollisionSize = new Vector3(0.5, 0.5, 0.1);

export function Player(x = 0, y = -8, health = 2) {
	return {
		name: `player`,
		type: Sprite,
		size: playerSize,
		collisionSize: playerCollisionSize,
		images: [{
			name: 'normal',
			file: ship
		}, {
			name: 'damaged',
			file: shipDamaged
		}],
		props: {
			health: 2,
			bulletRate: 0.4,
			bulletCurrent: 0,
			invulnerable: false,
			invulnerableRate: 3,
			invulnerableCurrent: 0,
		},
		setup: (entity: any) => {
			entity.setPosition(x, y, 0);
		},
		update: (_delta: number, { entity: player, inputs }: any) => {
			const { moveRight, moveLeft, buttonA } = inputs[0];
			const { x, y } = player.getPosition();
			if (moveRight) {
				player.moveX(10);
			} else if (moveLeft) {
				player.moveX(-10);
			} else {
				player.moveX(0);
			}
			player.bulletCurrent += _delta;
			if (buttonA && player.bulletCurrent >= player.bulletRate) {
				player.bulletCurrent = 0;
				player.spawn(Bullet, { x: x, y: y });
			}
			if (player.invulnerable) {
				player.health = 2;
				player.invulnerableCurrent += _delta;
				player.sprites[0].material.opacity = 0.5 + Math.sin(player.invulnerableCurrent * 10);
			}
			if (player.invulnerableCurrent >= player.invulnerableRate) {
				player.invulnerable = false;
				player.invulnerableCurrent = 0;
				player.sprites[0].material.opacity = 1;
			}
			if (player.health <= 1) {
				player.setSprite('damaged');
			} else {
				player.setSprite('normal');
			}
		},
		collision: (player: any, other: any, { gameState }: any) => {
			if (player.health <= 0) {
				gameState.globals.lives--;
				player.health = 2;
				player.invulnerable = true;
			}
		},
		destroy: () => { }
	}
}