import idle from '../../assets/platformer/idle.png';
import idleLeft from '../../assets/platformer/idle-left.png';
import run1 from '../../assets/platformer/run-1.png';
import run2 from '../../assets/platformer/run-2.png';
import run1Left from '../../assets/platformer/run-1-left.png';
import run2Left from '../../assets/platformer/run-2-left.png';
import jump from '../../assets/platformer/jump.png';
import jumpLeft from '../../assets/platformer/jump-left.png';
import coin from '../../assets/platformer/coin.png';

export const playerImages = [
	{
		name: 'idle',
		file: idle
	}, {
		name: 'idle-left',
		file: idleLeft
	}, {
		name: 'run-1',
		file: run1
	}, {
		name: 'run-2',
		file: run2
	}, {
		name: 'run-1-left',
		file: run1Left
	}, {
		name: 'run-2-left',
		file: run2Left
	}, {
		name: 'jump',
		file: jump
	}, {
		name: 'jump-left',
		file: jumpLeft
	}
];

export const playerAnimations = [{
	name: 'run',
	frames: ['run-1', 'idle', 'run-2'],
	speed: 0.1,
	loop: true,
}, {
	name: 'run-left',
	frames: ['run-1-left', 'idle-left', 'run-2-left'],
	speed: 0.1,
	loop: true,
}];

export const coinImage = coin;