import { Zylem, Howl } from '@tcool86/zylem';
const { Sphere } = Zylem;
import { board, BoardSide } from './board';
import bounceUrl from '../../assets/bounce.wav';

const sound = new Howl({
	src: bounceUrl,
	volume: 0.1,
});
const minSpeed = 10.0;
const maxSpeed = 18.0;
const goalBuffer = 25.0;

export function Ball(startY = 0) {
	return {
		name: 'ball',
		type: Sphere,
		radius: 0.25,
		props: {
			dx: 1,
			dy: 0,
			speed: 10
		},
		setup(entity: any) {
			entity.setPosition(0, startY, 0);
		},
		update(_delta: any, { entity: ball, globals }: any) {
			const { dx, dy } = ball;
			const { x, y } = ball.getPosition();

			if (x > goalBuffer) {
				ball.setPosition(0, startY, 0);
				globals.p1Score++;;
				ball.speed = minSpeed;
				ball.dy = 0;
			} else if (x < -goalBuffer) {
				ball.setPosition(0, startY, 0);
				globals.p2Score++;
				ball.speed = minSpeed;
				ball.dy = 0;
			}

			if (y < board.bottom) {
				ball.setPosition(x, board.bottom, 0);
				ball.dy = Math.abs(ball.dy);
			} else if (y > board.top) {
				ball.setPosition(x, board.top, 0);
				ball.dy = -(Math.abs(ball.dy));
			}

			const velX = dx * ball.speed;
			ball.moveXY(velX, dy);
		},
		collision: (ball: any, paddle: any) => {
			sound.play();
			if (paddle.side === BoardSide.LEFT) {
				ball.dx = 1;
			} else if (paddle.side === BoardSide.RIGHT) {
				ball.dx = -1;
			}
			const paddleSpeed = paddle.getVelocity().y;
			ball.dy += (paddleSpeed / 8);
			ball.dy = Math.min(ball.dy, maxSpeed);
			ball.speed = Math.min(ball.speed + 0.5, maxSpeed);
		},
		destroy: () => { }
	}
}