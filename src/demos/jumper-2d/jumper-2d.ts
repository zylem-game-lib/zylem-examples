import { Platformer2DBehavior } from '@zylem/game-lib/behavior';
import {
	createCamera,
	createFollowTarget,
	createGame,
	createStage,
	Perspectives,
} from '@zylem/game-lib/core';
import {
	createBox,
	createSprite,
	createText,
	createZone,
} from '@zylem/game-lib/entity';
import { bricks } from '@zylem/shaders';
import { Color } from 'three';
import {
	ZYLEM_MAN_ANIMATIONS,
	ZYLEM_MAN_METRICS,
	ZYLEM_MAN_SHEET,
} from '../../assets/zylem-man-atlas';
import { withBehavior } from '../_shared/behavior';
import { trackEntity } from '../_shared/camera';
import { movementControls } from '../_shared/controls';

// ── Character dimensions, derived from the packed atlas ─────────────────────

/** World height of the character standing upright. */
const CHARACTER_HEIGHT = 1.8;
/** Cells carry transparent padding, so the quad is taller than the character. */
const QUAD_HEIGHT =
	CHARACTER_HEIGHT *
	(ZYLEM_MAN_METRICS.cellHeight / ZYLEM_MAN_METRICS.standingHeight);
const QUAD_WIDTH =
	QUAD_HEIGHT * (ZYLEM_MAN_METRICS.cellWidth / ZYLEM_MAN_METRICS.cellHeight);
/** Distance from the sprite's centre down to the shared foot line. */
const FOOT_OFFSET =
	QUAD_HEIGHT *
	(0.5 - ZYLEM_MAN_METRICS.baseline / ZYLEM_MAN_METRICS.cellHeight);

const BODY_RADIUS = 0.35;
const BODY_HALF_HEIGHT = FOOT_OFFSET - BODY_RADIUS;

const WALK_SPEED = 5.5;
const DASH_SPEED = 9.5;
const RISING_FRAME = 'jump-1';
const FALLING_FRAME = 'jump-2';
const GROUND_TOP = -5;

export default function createDemo() {
	const terrainShader = {
		colorNode: bricks({
			scale: 1.6,
			color: new Color('#4c956c'),
			background: new Color('#2f6b4a'),
		}),
	};
	const platformShader = {
		colorNode: bricks({
			scale: 2.2,
			color: new Color('#f4a259'),
			background: new Color('#c47a3a'),
		}),
	};
	const stepShader = {
		colorNode: bricks({
			scale: 2.8,
			color: new Color('#e07a5f'),
			background: new Color('#a8533d'),
		}),
	};

	const ground = createBox({
		name: 'ground',
		size: { x: 100, y: 2, z: 2 },
		position: { x: 30, y: GROUND_TOP - 2, z: 0 },
		collision: { static: true },
		material: { shader: terrainShader },
	});

	const walls = [-19, 78].map((x) =>
		createBox({
			name: `wall-${x}`,
			size: { x: 2, y: 10, z: 2 },
			position: { x, y: GROUND_TOP + 4, z: 0 },
			collision: { static: true },
			material: { shader: terrainShader },
		}),
	);

	// Shallow rises the character walks straight over via KCC autostep.
	const steps = [0, 1, 2].map((index) =>
		createBox({
			name: `step-${index}`,
			size: { x: 3, y: 0.25, z: 2 },
			position: { x: -4 + index * 3, y: GROUND_TOP + 0.2 + index * 0.3, z: 0 },
			collision: { static: true },
			material: { shader: stepShader },
		}),
	);

	const platforms = [
		{ x: 9, y: -3.2, width: 5 },
		{ x: 17, y: -1.2, width: 4 },
		{ x: 24.5, y: 0.8, width: 4 },
		{ x: 33, y: -1.5, width: 6 },
		{ x: 41, y: -3.5, width: 3 },
		{ x: 56, y: -3.0, width: 8 },
	].map((spec, index) =>
		createBox({
			name: `platform-${index}`,
			size: { x: spec.width, y: 0.75, z: 2 },
			position: { x: spec.x, y: spec.y, z: 0 },
			collision: { static: true },
			material: { shader: platformShader },
		}),
	);

	const player = withBehavior(
		createSprite({
			name: 'zylem-man',
			position: { x: -14, y: GROUND_TOP + FOOT_OFFSET + 1, z: 0 },
			size: { x: QUAD_WIDTH, y: QUAD_HEIGHT, z: 1 },
			collisionSize: {
				x: BODY_RADIUS * 2,
				y: FOOT_OFFSET * 2,
				z: BODY_RADIUS * 2,
			},
			sheet: ZYLEM_MAN_SHEET,
			animations: ZYLEM_MAN_ANIMATIONS,
		}),
		Platformer2DBehavior,
		{
			walkSpeed: WALK_SPEED,
			runSpeed: DASH_SPEED,
			jumpForce: 14,
			gravity: 34,
			maxJumps: 1,
			coyoteTime: 0.08,
			jumpBufferTime: 0.1,
			jumpCutMultiplier: 0.45,
			autostep: { maxHeight: 0.35, minWidth: 0.05 },
			snapToGroundDistance: 0.2,
			useAttachedCollider: false,
			shape: { halfHeight: BODY_HALF_HEIGHT, radius: BODY_RADIUS },
		},
	);

	player.onUpdate(({ me, inputs, delta }) => {
		const { axes, buttons } = inputs.p1;
		me.$platformer2D.moveX = axes.Horizontal.value;
		me.$platformer2D.run = buttons.B.held > 0;
		me.$platformer2D.jump = buttons.A.held > 0;
		if (axes.Horizontal.value !== 0) me.setFlipX(axes.Horizontal.value < 0);
		if (!me.platformer2DState.grounded)
			me.setSprite(me.platformer2DState.jumping ? RISING_FRAME : FALLING_FRAME);
		else
			me.setAnimation(
				Math.abs(axes.Horizontal.value) < 0.1
					? 'idle'
					: buttons.B.held > 0
						? 'run'
						: 'walk',
				delta,
			);
	});

	const status = createText({
		text: 'Reach the flag on the right',
		screenPosition: { x: 0.5, y: 0.08 },
	});
	const flag = createBox({
		position: [72, -2, 0],
		size: [0.3, 6, 0.3],
		color: new Color('#ffd166'),
		collision: { static: true },
	});
	const finish = createZone({ position: [70, -2, 0], size: [3, 7, 2] });
	finish.onEnter(({ visitor }) => {
		if (visitor.uuid === player.uuid)
			status.updateText('Course complete! — R to restart');
	});
	player.onUpdate(({ me }) => {
		if ((me.getPosition()?.y ?? 0) < -12) {
			me.setPosition(-14, GROUND_TOP + FOOT_OFFSET + 1, 0);
			me.resetVelocity();
		}
	});

	const camera = createCamera({
		// Vertical frustum height in world units. Roughly seven character
		// heights, which matches how tightly a SNES platformer frames its hero.
		zoom: CHARACTER_HEIGHT * 7,
		perspective: Perspectives.Fixed2D,
		behaviors: {
			// The follow behavior aims the camera at the target itself, so any
			// vertical offset would tilt the orthographic view and skew the plane.
			follow: createFollowTarget({
				offset: { x: 0, y: 0, z: 12 },
				lerpFactor: 0.12,
			}),
		},
	});

	player.onSetup(({ me }) => {
		trackEntity(camera, me);
	});

	const stage = createStage(
		{
			backgroundColor: new Color('#1a2238'),
		},
		camera,
	);
	stage.add(
		ground,
		...walls,
		...steps,
		...platforms,
		player,
		flag,
		finish,
		status,
	);
	stage.setInputConfiguration(movementControls);

	const game = createGame(
		{
			id: 'zario',
			debug: true,
		},
		stage,
	);

	return game;
}
