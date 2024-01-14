import { Zylem, THREE } from '@tcool86/zylem';
import { playerAnimations, playerImages } from './assets';

const { Sprite } = Zylem;
const { Vector3 } = THREE;

enum JumpState {
	Idle,
	Jumping,
	Falling,
};

export function Player() {
	return {
		name: `player`,
		type: Sprite,
		images: playerImages,
		animations: playerAnimations,
		size: new Vector3(2, 2, 1),
		props: {
			jumpState: JumpState.Idle,
			jumpTime: 0.25,
			jumpTimer: 0,
			jumpVelocity: 16,
			gravity: -9.8,
			onGround: false,
			movingLeft: false,
		},
		setup: (entity: any) => {
			entity.setPosition(0, 0, 0);
		},
		update: (_delta: number, { entity: player, inputs }: any) => {
			const { moveLeft, moveRight, buttonA, buttonB } = inputs[0];
			let { x: velX, y: velY } = player.getVelocity();

			if (!player.onGround) {
				velY += player.gravity * _delta;
			}

			if (player.jumpState === JumpState.Idle) {
				const useIdleSprite = player.movingLeft ? 'idle-left' : 'idle';
				player.setSprite(useIdleSprite);
			}

			if (moveLeft) {
				velX = -10;
				player.movingLeft = true;
				player.setAnimation('run-left', _delta);
			} else if (moveRight) {
				velX = 10;
				player.movingLeft = false;
				player.setAnimation('run', _delta);
			} else {
				velX = 0;
			}

			if (
				buttonA &&
				player.jumpTimer <= player.jumpTime &&
				player.jumpState !== JumpState.Falling &&
				player.onGround
			) {
				velY = player.jumpVelocity;
				player.jumpState = JumpState.Jumping;
				player.jumpTimer += _delta;
				player.onGround = false;
			}

			if (player.jumpState === JumpState.Jumping || player.jumpState === JumpState.Falling) {
				const useJumpSprite = player.movingLeft ? 'jump-left' : 'jump';
				player.setSprite(useJumpSprite);
			}

			if (player.jumpTimer > player.jumpTime || !buttonA) {
				player.jumpState = JumpState.Falling;
			}

			player.moveXY(velX, velY);

			if (player.onGround) {
				player.jumpTimer = 0;
			}
		},
		collision: (entity: any, other: any) => {
			if (other.name === 'ground') {
				entity.jumpState = JumpState.Idle;
				entity.onGround = true;
				entity.jumpTimer = 0;
			}
		}
	}
}