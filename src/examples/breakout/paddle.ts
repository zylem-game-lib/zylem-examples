import { Zylem, THREE } from '@tcool86/zylem';
import { board } from './board';
const { Box } = Zylem;
const { Vector3 } = THREE;

const paddleSpeed = 20.0;
const paddleSize = new Vector3(4, 0.5, 1);

export function Paddle() {
	return {
		name: `paddle`,
		type: Box,
		size: paddleSize,
		props: {},
		setup: (entity: any) => {
			entity.setPosition(0, -10, 0);
		},
		update: (_delta: number, { entity: paddle, inputs }: any) => {
			const { x } = paddle.getPosition();
			const { moveRight, moveLeft } = inputs[0];
			const canMoveRight = x < board.right;
			const canMoveLeft = x > board.left;
			if (moveRight && canMoveRight) {
				paddle.moveX(paddleSpeed);
			} else if (moveLeft && canMoveLeft) {
				paddle.moveX(-paddleSpeed);
			} else {
				paddle.moveX(0);
			}
		},
		destroy: () => { }
	}
}