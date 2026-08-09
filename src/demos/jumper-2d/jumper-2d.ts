import { Color } from 'three';
import { createBox, createSprite } from '@zylem/game-lib/entity';
import {
	createCamera,
	createFollowTarget,
	createGame,
	createStage,
	Perspectives,
} from '@zylem/game-lib/core';
import { bricks } from '@zylem/shaders';
import { Platformer2DBehavior, Platformer2DState } from '@zylem/game-lib/behavior';
import {
	mergeInputConfigs,
	useArrowsForAxes,
	useWASDForAxes,
} from '@zylem/game-lib/input';
import {
	ZYLEM_MAN_ANIMATIONS,
	ZYLEM_MAN_METRICS,
	ZYLEM_MAN_SHEET,
} from '../../assets/zylem-man-atlas';

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
	QUAD_HEIGHT * (0.5 - ZYLEM_MAN_METRICS.baseline / ZYLEM_MAN_METRICS.cellHeight);

const BODY_RADIUS = 0.35;
const BODY_HALF_HEIGHT = FOOT_OFFSET - BODY_RADIUS;

// ── Movement feel ───────────────────────────────────────────────────────────

/** Top speed tapping a direction. */
const WALK_SPEED = 5.5;
/** Top speed with the dash button held; also the runtime's speed multiplier. */
const DASH_SPEED = 9.5;
const GROUND_ACCEL = 22;
const AIR_ACCEL = 16;
const GROUND_FRICTION = 30;
const AIR_FRICTION = 4;
/** Turnaround braking. The gap against GROUND_ACCEL is what sells the skid. */
const SKID_DECEL = 55;
const DUCK_FRICTION = 40;

const INPUT_DEADZONE = 0.2;
/** Below this the character reads as standing still. */
const IDLE_SPEED = 0.25;
/** Above this the run cycle replaces the walk cycle. */
const RUN_THRESHOLD = 6.2;
/** Minimum speed for a direction reversal to read as a skid rather than a turn. */
const SKID_SPEED = 2.5;
/** How long the landing crouch shows after touching down, in seconds. */
const LANDING_TIME = 0.09;

/** The sheet has no dedicated skid pose; the launch lunge reads closest. */
const SKID_FRAME = 'jump-0';
const RISING_FRAME = 'jump-1';
const FALLING_FRAME = 'jump-2';
const LANDING_FRAME = 'jump-3';

const GROUND_TOP = -5;

function approach(value: number, target: number, maxDelta: number): number {
	return value < target
		? Math.min(value + maxDelta, target)
		: Math.max(value - maxDelta, target);
}

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

	const player = createSprite({
		name: 'zylem-man',
		position: { x: -14, y: GROUND_TOP + FOOT_OFFSET + 1, z: 0 },
		size: { x: QUAD_WIDTH, y: QUAD_HEIGHT, z: 1 },
		collisionSize: { x: BODY_RADIUS * 2, y: FOOT_OFFSET * 2, z: BODY_RADIUS * 2 },
		sheet: ZYLEM_MAN_SHEET,
		animations: ZYLEM_MAN_ANIMATIONS,
	});

	const platformer = player.use(Platformer2DBehavior, {
		// moveX carries the whole velocity curve, so runSpeed is a plain scale
		// factor rather than a second speed tier. See the update loop.
		walkSpeed: DASH_SPEED,
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
	});

	let velocityX = 0;
	let facingLeft = false;
	let landingTimer = 0;
	let wasGrounded = true;

	player.onUpdate(({ me, inputs, delta }) => {
		const { p1 } = inputs;
		const intent = (me as any).$platformer2D;
		if (!intent) return;

		const grounded = platformer.isGrounded();
		const axis = p1.axes.Horizontal.value;
		const direction = Math.abs(axis) > INPUT_DEADZONE ? Math.sign(axis) : 0;
		const dashHeld = p1.buttons.B.held > 0 || p1.shoulders.LTrigger.held > 0;
		const ducking = grounded && p1.axes.Vertical.value > 0.5;
		const reversing =
			direction !== 0 && velocityX !== 0 && Math.sign(velocityX) !== direction;
		const skidding = grounded && reversing && Math.abs(velocityX) > SKID_SPEED;

		if (ducking) {
			velocityX = approach(velocityX, 0, DUCK_FRICTION * delta);
		} else if (direction === 0) {
			const friction = grounded ? GROUND_FRICTION : AIR_FRICTION;
			velocityX = approach(velocityX, 0, friction * delta);
		} else {
			const topSpeed = dashHeld ? DASH_SPEED : WALK_SPEED;
			const accel = reversing ? SKID_DECEL : grounded ? GROUND_ACCEL : AIR_ACCEL;
			velocityX += direction * accel * delta;

			// Letting go of dash bleeds the extra speed off gradually instead of
			// snapping down to the walk cap.
			if (Math.sign(velocityX) === direction && Math.abs(velocityX) > topSpeed) {
				const friction = grounded ? GROUND_FRICTION : AIR_FRICTION;
				velocityX = approach(velocityX, direction * topSpeed, friction * delta);
			}
		}
		velocityX = Math.min(DASH_SPEED, Math.max(-DASH_SPEED, velocityX));

		// The runtime applies `moveX * runSpeed` with no acceleration of its own,
		// so `run` stays pinned and the fractional axis carries the momentum model.
		intent.run = true;
		intent.moveX = velocityX / DASH_SPEED;
		intent.jump = p1.buttons.A.held > 0;

		if (grounded && !wasGrounded) landingTimer = LANDING_TIME;
		if (landingTimer > 0) landingTimer -= delta;
		wasGrounded = grounded;

		if (skidding) {
			facingLeft = velocityX < 0;
		} else if (direction !== 0 && !ducking) {
			facingLeft = direction < 0;
		}
		me.setFlipX(facingLeft);

		const speed = Math.abs(velocityX);
		if (!grounded) {
			const rising = platformer.getState() === Platformer2DState.Jumping;
			me.setSprite(rising ? RISING_FRAME : FALLING_FRAME);
		} else if (ducking) {
			me.setAnimation('duck', delta);
		} else if (skidding) {
			me.setSprite(SKID_FRAME);
		} else if (landingTimer > 0) {
			me.setSprite(LANDING_FRAME);
		} else if (speed > RUN_THRESHOLD) {
			me.setAnimation('run', delta * (speed / DASH_SPEED));
		} else if (speed > IDLE_SPEED) {
			me.setAnimation('walk', delta * (speed / WALK_SPEED));
		} else {
			me.setAnimation('idle', delta);
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

	player.onSetup(({ me }: any) => {
		camera.addTarget(me);
	});

	const stage = createStage(
		{
			backgroundColor: new Color('#1a2238'),
		},
		camera,
	);
	stage.add(ground, ...walls, ...steps, ...platforms, player);
	stage.setInputConfiguration(
		mergeInputConfigs(useArrowsForAxes('p1'), useWASDForAxes('p1')),
	);

	const game = createGame(
		{
			id: 'jumper-2d',
			debug: true,
		},
		stage,
	);

	return game;
}
