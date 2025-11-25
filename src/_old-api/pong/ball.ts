import { sphere, THREE, Howl } from "@tcool86/zylem";
import { board } from './board';
import { Vector3 } from "@dimforge/rapier3d-compat";
const { Color } = THREE;

const sound = new Howl({
	src: '/assets/bounce.wav',
	volume: 0.1,
});
const minSpeed = 10.0;
const maxSpeed = 18.0;
const goalBuffer = 25.0;

export async function Ball(startY = 0) {
	let dx = 1;
	let dy = 0;
	let speed = 10;
	const ball = await sphere({
		radius: 0.25,
		color: new Color(1, 1, 1),
	});
	ball.setup = ({ entity }) => {
		entity.rigidBody?.setTranslation(0, startY, 0);
	};
	ball.update = ({ entity: ball, globals }) => {
		const { p1Score, p2Score } = globals;
		const { x, y } = ball.rigidBody?.translation ?? { x: 0, y: 0 };

		if (x > goalBuffer) {
			ball.rigidBody?.setTranslation(0, startY, 0);
			p1Score.set(p1Score.get() + 1);
			speed = minSpeed;
			dy = 0;
		} else if (x < -goalBuffer) {
			ball.rigidBody?.setTranslation(0, startY, 0);
			p2Score.set(p2Score.get() + 1);
			speed = minSpeed;
			dy = 0;
		}

		if (y < board.bottom) {
			ball.rigidBody?.setTranslation(x, board.bottom, 0);
			dy = Math.abs(dy);
		} else if (y > board.top) {
			ball.rigidBody?.setTranslation(x, board.top, 0);
			dy = -(Math.abs(dy));
		}

		const velX = dx * speed;
		ball.rigidBody?.setLinvel(velX, dy, 0);
	};
	// ball.onCollision = (_ball, paddle) => {
	// 	sound.play();
	// 	if (paddle.name === 'left') {
	// 		dx = 1;
	// 	} else if (paddle.name === 'right') {
	// 		dx = -1;
	// 	}
	// 	const paddleSpeed = paddle.getVelocity().y;
	// 	dy += (paddleSpeed / 8);
	// 	dy = Math.min(dy, maxSpeed);
	// 	speed = Math.min(speed + 0.5, maxSpeed);
	// };
	return ball;
}