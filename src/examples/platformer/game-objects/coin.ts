import { sprite, THREE, Howl } from '@tcool86/zylem';
import { coinImage } from '../assets';
const sound = new Howl({
	src: '/assets/coin-sound.mp3',
	volume: 0.1,
	preload: true,
	rate: 3.0,
});
const { Vector3 } = THREE;

export function Coin({ position = new Vector3(0, 0, 0) }) {
	return sprite({
		name: `coin`,
		collisionSize: new Vector3(0.5, 0.5, 1),
		images: [{
			name: 'coin',
			file: coinImage
		}],
		setup: ({ entity }) => {
			entity.setPosition(position.x, position.y, position.z);
		},
		collision: (coin: any, other: any, globals) => {
			const { score } = globals;
			if (other.name === 'player') {
				sound.play();
				score.set(score.get() + 100);
				coin.destroy();
			}
		},
	})
}