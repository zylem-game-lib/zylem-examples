import { ricochetSound } from '@zylem/game-lib/audio';
import {
	BoundaryRicochetCoordinator,
	Ricochet2DBehavior,
	WorldBoundary2DBehavior,
} from '@zylem/game-lib/behavior';
import { createCamera, createGame, createStage } from '@zylem/game-lib/core';
import {
	createBox,
	createSphere,
	createText,
	destroy,
} from '@zylem/game-lib/entity';
import { Color } from 'three';
import { ricochetEntity } from '../_shared/behavior';
import { movementControls } from '../_shared/controls';

export default function createDemo() {
	let lives = 3;
	let score = 0;
	let finished = false;
	const removed = new Set<string>();
	const label = createText({
		text: 'Score: 0 · Lives: 3',
		screenPosition: { x: 0.5, y: 0.05 },
	});
	const paddle = createBox({
		name: 'paddle',
		position: [0, -8, 0],
		size: [3, 0.5, 1],
	});
	const paddleBounds = paddle.use(WorldBoundary2DBehavior, {
		boundaries: { left: -9.5, right: 9.5, top: 10, bottom: -10 },
	});
	paddle.onUpdate(({ me, inputs }) =>
		me.moveX(
			paddleBounds.getMovement(
				finished ? 0 : inputs.p1.axes.Horizontal.value * 12,
				0,
			).moveX,
		),
	);

	const ball = createSphere({
		name: 'ball',
		radius: 0.25,
		color: new Color('#8ee6a1'),
	});
	const bounce = ball.use(Ricochet2DBehavior, {
		minSpeed: 8,
		maxSpeed: 14,
		reflectionMode: 'angled',
		maxAngleDeg: 60,
	});
	// The lower boundary is outside play: missing the paddle costs a life.
	const bounds = ball.use(WorldBoundary2DBehavior, {
		boundaries: { left: -11, right: 11, top: 9, bottom: -100 },
	});
	const walls = new BoundaryRicochetCoordinator(
		ricochetEntity(ball),
		bounds,
		bounce,
	);
	const bricks = Array.from({ length: 32 }, (_, index) =>
		createBox({
			name: 'brick',
			size: [2.2, 0.6, 1],
			position: [-9.1 + (index % 8) * 2.6, 6 - Math.floor(index / 8) * 1.2, 0],
			collision: { static: true },
			color: new Color().setHSL(Math.floor(index / 8) * 0.1, 0.7, 0.6),
		}),
	);

	function serve() {
		ball.setPosition(0, -6, 0);
		ball.moveXY(2, 8);
	}
	function showScore() {
		finished = lives === 0 || removed.size === bricks.length;
		label.updateText(
			finished
				? `${lives ? 'You win!' : 'Game over'} · Score: ${score} · R to restart`
				: `Score: ${score} · Lives: ${lives}`,
		);
	}
	ball.onSetup(serve);
	ball.onUpdate(({ me }) => {
		if (finished) {
			me.resetVelocity();
			return;
		}
		walls.update();
		if ((me.getPosition()?.y ?? 0) < -10) {
			lives--;
			showScore();
			if (!finished) serve();
		}
	});
	ball.onCollision(
		({ entity, other }) => {
			if (finished || removed.has(other.uuid)) return;
			if (other.name !== 'brick' && other.name !== 'paddle') return;
			bounce.applyRicochet({
				entity: ricochetEntity(entity),
				otherEntity: ricochetEntity(other),
				contact: other.name === 'paddle' ? { normal: { x: 0, y: 1 } } : {},
			});
			ricochetSound(800, 0.04);
			if (other.name === 'brick') {
				removed.add(other.uuid);
				destroy(other);
				score += 100;
				showScore();
			}
		},
		{ phase: 'enter' },
	);
	return createGame(
		{ id: 'breakout' },
		createStage(
			{ backgroundColor: '#101729' },
			createCamera({ perspective: 'fixed-2d', zoom: 23 }),
			paddle,
			ball,
			...bricks,
			label,
		).setInputConfiguration(movementControls),
	);
}
