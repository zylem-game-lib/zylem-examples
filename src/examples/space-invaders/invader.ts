import { Zylem } from '@tcool86/zylem';

import invader1 from '../../assets/space-invaders/invader-1.png';
import invader2 from '../../assets/space-invaders/invader-2.png';
import invaderShot from '../../assets/space-invaders/invader-shot.png';

const { Sprite } = Zylem.GameEntityType;

function InvaderBullet({ x = 0, y = -8 }) {
	return {
		name: `bullet`,
		type: Sprite,
		images: [invaderShot],
		props: {},
		setup: (entity: any) => {
			entity.setPosition(x, y, 0);
		},
		update: (_delta: number, { entity: bullet, inputs }: any) => {
			const { y } = bullet.getPosition();
			bullet.moveXY(Math.sin(y) * 8, -15);
			if (y < -10) {
				bullet.destroy();
			}
		},
		collision: (bullet: any, other: any, { gameState }: any) => {
			if (other.name.includes('player')) {
				bullet.destroy();
				other.health--;
			}
		},
		destroy: () => { }
	}
}

export function Invader(x = 0, y = 0) {
	return {
		name: `invader_${x}_${y}`,
		type: Sprite,
		size: new Zylem.THREE.Vector3(2, 2, 1),
		collisionSize: new Zylem.THREE.Vector3(1, 1, 1),
		images: [invader1, invader2],
		props: {
			animationRate: 1,
			animationCurrent: 0,
			dropRate: 2.0,
			dropCurrent: 0,
			direction: 1,
			speed: 5,
			fireRate: 2,
			fireChance: 12,
			fireCurrent: 0,
			health: 1,
			alive: true,
		},
		setup: (entity: any) => {
			entity.setPosition(x, y, 0);
		},
		update: (_delta: number, { entity: invader, inputs }: any) => {
			// TODO: look into why destroyed objects still get updated
			if (!invader.alive) {
				return;
			}
			if (invader.health < 1 && invader.alive) {
				invader.health = 0;
				invader.alive = false;
				invader.destroy();
				return;
			}
			const { x, y } = invader.getPosition();
			if (invader.animationCurrent < invader.animationRate) {
				invader.animationCurrent += _delta;
			} else {
				invader.sprites[invader.spriteIndex].visible = false;
				invader.spriteIndex = invader.spriteIndex === 0 ? 1 : 0;
				invader.animationCurrent = 0;
				invader.sprites[invader.spriteIndex].visible = true;
			}
			if (invader.dropCurrent < invader.dropRate) {
				invader.dropCurrent += _delta;
			} else {
				invader.dropCurrent = 0;
				invader.direction = invader.direction === 1 ? -1 : 1;
				invader.moveY(-invader.speed);
				return;
			}
			invader.moveX(invader.speed * invader.direction);
			if (invader.fireCurrent < invader.fireRate) {
				invader.fireCurrent += _delta;
			} else {
				invader.fireCurrent = 0;
				const chance = Math.floor(Math.random() * invader.fireChance);
				if (chance <= 6) {
					invader.spawn(InvaderBullet, { x: x, y: y });
				}
			}
		},
		collision: (invader: any, other: any) => {
			if (other.name === 'player') {
				invader.health = 0;
				other.health--;
			}
		},
		destroy: (gameState: any) => {
			gameState.globals.invaders--;
		}
	}
}