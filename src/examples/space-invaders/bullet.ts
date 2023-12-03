import { Zylem } from '@tcool86/zylem';
import shot from '../../assets/space-invaders/shot.png';

const { Vector3 } = Zylem.THREE;
const { Sprite } = Zylem.GameEntityType;
const { destroy } = Zylem;

const bulletSize = new Vector3(0.1, 0.1, 0.1);

export function Bullet({ x = 0, y = -8, health = 2 }) {
	return {
		name: `bullet`,
		type: Sprite,
		size: bulletSize,
		images: [shot],
		props: {},
		setup: (entity: any) => {
			entity.setPosition(x, y, 0);
		},
		update: (_delta: number, { entity: bullet, inputs }: any) => {
			const { y } = bullet.getPosition();
			bullet.moveXY(Math.sin(y), 15);
			if (y > 10) {
				destroy(bullet);
			}
		},
		collision: (bullet: any, other: any, { gameState }: any) => {
			if (other.name.includes('invader')) {
				destroy(bullet);
				destroy(other);
				gameState.globals.score += 10;
			}
		},
		destroy: () => { }
	}
}