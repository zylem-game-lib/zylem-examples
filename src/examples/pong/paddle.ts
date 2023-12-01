import { Zylem } from '@tcool86/zylem';
import { board, BoardSide } from './board';
const { Vector3 } = Zylem.THREE;
const { Box } = Zylem.GameEntityType;

const paddleSpeed = 20.0;
const paddleSize = new Vector3(0.5, 4, 1);

export function Paddle(inputKey: any, side: BoardSide, y = 0) {
	return {
		name: `paddle_${side}`,
		type: Box,
		size: paddleSize,
		props: {
			side: side,
		},
		setup: (entity: any) => {
			entity.setPosition(board[side], y, 0);
		},
		update: (_delta: number, { entity: paddle, inputs }: any) => {
			const { y } = paddle.getPosition();
			const { moveUp, moveDown, buttonW, buttonY } = inputs[inputKey];
			// console.log(inputs);
			// TODO: kind of hacky should handle this better
			let upPressed = (inputKey) ? buttonW : moveUp;
			let downPressed = (inputKey) ? buttonY : moveDown;
			const canMoveUp = y < board.top;
			const canMoveDown = y > board.bottom;
			if (upPressed && canMoveUp) {
				paddle.moveY(paddleSpeed);
			} else if (downPressed && canMoveDown) {
				paddle.moveY(-paddleSpeed);
			} else {
				paddle.moveY(0);
			}
		},
		destroy: () => { }
	}
}