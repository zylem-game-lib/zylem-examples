import { Zylem } from '@tcool86/zylem';
import shot from '../../assets/space-invaders/shot.png';

const { Sprite } = Zylem.GameEntityType;

export function Bullet({ x = 0, y = -8, health = 2 }) {
	return {
		name: `bullet`,
		type: Sprite,
		images: [shot],
		props: {},
		setup: (entity: any) => {
			entity.setPosition(x, y, 0);
		},
		update: (_delta: number, { entity: bullet, inputs }: any) => {
			const { y } = bullet.getPosition();
			bullet.moveXY(Math.sin(y), 15);
			if (y > 10) {
				bullet.destroy();
			}
		},
		collision: (bullet: any, other: any, { gameState }: any) => {
			if (other.name.includes('invader')) {
				bullet.destroy();
				other.health = 0;
				gameState.globals.score += 10;
			}
		},
		destroy: () => { }
	}
}