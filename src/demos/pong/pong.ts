import { pingPongBeep } from '@zylem/game-lib/audio';
import {
	BoundaryRicochetCoordinator,
	Ricochet2DBehavior,
	WorldBoundary2DBehavior,
} from '@zylem/game-lib/behavior';
import { createCamera, createGame, createStage } from '@zylem/game-lib/core';
import { createBox, createSphere, createText } from '@zylem/game-lib/entity';
import { Color } from 'three';
import { ricochetEntity } from '../_shared/behavior';

export default function createDemo() {
	const bounds = { left: -15, right: 15, top: 5, bottom: -5 };
	const score = [0, 0];
	let finished = false;
	const label = createText({
		text: '0 : 0',
		fontSize: 28,
		screenPosition: { x: 0.5, y: 0.08 },
	});
	const ball = createSphere({ name: 'ball', radius: 0.18 });
	const bounce = ball.use(Ricochet2DBehavior, {
		minSpeed: 5,
		maxSpeed: 10,
		speedMultiplier: 1.05,
		reflectionMode: 'angled',
		maxAngleDeg: 60,
	});
	const boundary = ball.use(WorldBoundary2DBehavior, { boundaries: bounds });
	const walls = new BoundaryRicochetCoordinator(
		ricochetEntity(ball),
		boundary,
		bounce,
	);
	const paddleSize = { x: 0.25, y: 1.6, z: 1 };

	function paddle(x: number, player: 'p1' | 'p2') {
		const entity = createBox({
			name: 'paddle',
			position: [x, 0, 0],
			size: paddleSize,
		});
		const limits = entity.use(WorldBoundary2DBehavior, {
			boundaries: { ...bounds, top: 4.2, bottom: -4.2 },
		});
		entity.onUpdate(({ me, inputs }) => {
			const { Up, Down } = inputs[player].directions;
			const speed = finished
				? 0
				: ((Up.held ? 1 : 0) - (Down.held ? 1 : 0) ||
						-inputs[player].axes.Vertical.value) * 7;
			me.moveXY(0, limits.getMovement(0, speed).moveY);
		});
		return entity;
	}

	ball.onSetup(({ me }) => me.moveXY(5, 1));
	ball.onCollision(
		({ entity, other }) => {
			if (finished || other.name !== 'paddle') return;
			bounce.applyRicochet({
				entity: ricochetEntity(entity),
				otherEntity: ricochetEntity(other),
				otherSize: paddleSize,
				contact: {
					normal: { x: (other.getPosition()?.x ?? 0) < 0 ? 1 : -1, y: 0 },
				},
			});
			pingPongBeep();
		},
		{ phase: 'enter' },
	);
	ball.onUpdate(({ me }) => {
		if (finished) {
			me.resetVelocity();
			return;
		}
		walls.update();
		const x = me.getPosition()?.x ?? 0;
		if (Math.abs(x) < 12) return;
		const scorer = x > 0 ? 0 : 1;
		score[scorer] = score[scorer]! + 1;
		finished = score[scorer]! >= 3;
		label.updateText(
			finished
				? `Player ${scorer + 1} wins! — R to restart`
				: `${score[0]} : ${score[1]}`,
		);
		me.setPosition(0, 0, 0);
		me.moveXY(finished ? 0 : x > 0 ? -5 : 5, finished ? 0 : 1);
	});
	const stage = createStage(
		{ backgroundColor: new Color('#090f19') },
		createCamera({ perspective: 'fixed-2d', zoom: 13 }),
		ball,
		paddle(-8, 'p1'),
		paddle(8, 'p2'),
		label,
	);
	return createGame(
		{
			id: 'pong',
			input: {
				p1: { key: { w: ['directions.Up'], s: ['directions.Down'] } },
				p2: {
					key: { ArrowUp: ['directions.Up'], ArrowDown: ['directions.Down'] },
				},
			},
		},
		stage,
	);
}
