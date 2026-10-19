import {
	CooldownBehavior,
	FirstPersonBehavior,
	FirstPersonShooterCoordinator,
	Jumper3DBehavior,
	type FirstPersonShooterEntity,
} from '@zylem/game-lib/behavior';
import {
	createCamera,
	createGame,
	createStage,
	FirstPersonPerspective,
	Perspectives,
} from '@zylem/game-lib/core';
import {
	createActor,
	createSphere,
	createText,
	destroy,
} from '@zylem/game-lib/entity';
import {
	screenCenterLookDeltas,
	useScreenCenterLook,
	useWASDForAxes,
} from '@zylem/game-lib/input';
import { Color, Euler, Raycaster, Vector3 } from 'three';
import { demoAsset } from '../../assets/manifest';
import { withBehavior } from '../_shared/behavior';
import { createArenaLevel, createFloor } from './level';

const lookOptions = { maxLookDegrees: 180, lookSensitivity: 2 };

export default function createDemo() {
	const camera = createCamera({
		perspective: Perspectives.FirstPerson,
		position: [0, 2.85, 5],
		skipDebugOrbit: true,
		damping: 1,
	});
	camera.setPerspective(Perspectives.FirstPerson, {
		initialPosition: [0, 2.85, 5],
		initialLookAt: [0, 2.85, 0],
		pitchLimit: Math.PI / 2,
	});
	const pistol = createActor({
		name: 'pistol',
		models: [demoAsset('general/player-gun.glb')],
		scale: [0.42, 0.42, 0.42],
	});
	const player = withBehavior(
		createActor({
			name: 'player',
			position: [0, 0.9, 5],
			collision: { static: false, size: [1.6, 1.8, 0.6] },
		}),
		Jumper3DBehavior,
		{
			jumpHeight: 2.5,
			gravity: 20,
			maxJumps: 2,
			coyoteTimeMs: 100,
			jumpBufferMs: 80,
		},
	);
	const controller = player.use(FirstPersonBehavior, {
		perspective: camera.getPerspective<FirstPersonPerspective>(),
		walkSpeed: 8,
		runSpeed: 16,
		lookSensitivity: lookOptions.lookSensitivity,
		eyeHeight: 1.95,
		viewmodel: {
			entity: pistol,
			offset: [0.25, -0.52, -0.4],
			rotation: new Euler(0, -1.6, -0.08),
			cameraObject: camera.cameraRef.camera,
		},
	});
	// The coordinator accepts the two behavior inputs attached above.
	const movement = new FirstPersonShooterCoordinator(
		player as typeof player & FirstPersonShooterEntity,
		controller,
	);
	const weapon = player.use(CooldownBehavior, {
		cooldowns: { fire: { duration: 0.2 } },
	});
	const targets = [
		[-6, 3, -5],
		[0, 3, -12],
		[7, 3, -8],
		[-10, 3, 8],
		[10, 3, 12],
	].map(([x, y, z], index) =>
		createSphere({
			name: `target-${index}`,
			radius: 0.8,
			position: [x!, y!, z!],
			color: new Color('#e8a64a'),
			collision: { static: true },
		}),
	);
	const remaining = new Set(targets);
	const score = createText({
		text: 'Targets: 0/5',
		screenPosition: { x: 0.5, y: 0.08 },
	});
	const crosshair = createText({
		text: '+',
		screenPosition: { x: 0.5, y: 0.5 },
		fontSize: 24,
	});
	const ray = new Raycaster();
	const origin = new Vector3();
	const direction = new Vector3();
	const floor = createFloor();
	const walls = createArenaLevel();
	const stage = createStage(
		{
			gravity: { x: 0, y: -20, z: 0 },
			backgroundImage: demoAsset('general/skybox-default.png'),
		},
		camera,
		floor,
		...walls,
		player,
		pistol,
		...targets,
		score,
		crosshair,
	).setInputConfiguration(
		useWASDForAxes('p1'),
		useScreenCenterLook('p1', lookOptions),
		{
			p1: {
				key: { ' ': ['buttons.A'], Shift: ['buttons.B'], f: ['buttons.X'] },
			},
		},
	);

	stage.onUpdate(({ inputs }) => {
		const { p1 } = inputs;
		const pointer = p1.pointer ?? { centerX: 0, centerY: 0 };
		const look = screenCenterLookDeltas(
			pointer.centerX,
			pointer.centerY,
			controller.getYaw(),
			controller.getPitch(),
			lookOptions,
		);
		movement.update({
			moveX: p1.axes.Horizontal.value,
			moveZ: -p1.axes.Vertical.value,
			...look,
			sprint: p1.buttons.B.held > 0,
			jumpPressed: p1.buttons.A.pressed,
			jumpHeld: p1.buttons.A.held > 0,
			jumpReleased: p1.buttons.A.released,
		});
		if (!p1.buttons.X.held || !weapon.isReady('fire') || remaining.size === 0)
			return;
		weapon.fire('fire');
		const view = camera.cameraRef.camera;
		view.getWorldPosition(origin);
		view.getWorldDirection(direction);
		ray.set(origin, direction);
		// Include walls so targets cannot be shot through the arena.
		const objects = [...remaining, floor, ...walls].flatMap((entity) =>
			entity.group ? [entity.group] : [],
		);
		const hit = ray.intersectObjects(objects, true)[0];
		if (!hit) return;
		const target = [...remaining].find((entity) => {
			let object = hit.object;
			while (object.parent && object !== entity.group) object = object.parent;
			return object === entity.group;
		});
		if (target) {
			remaining.delete(target);
			destroy(target);
			score.updateText(
				remaining.size
					? `Targets: ${5 - remaining.size}/5`
					: 'All targets cleared! — R to restart',
			);
		}
	});
	return createGame({ id: 'zylem-strike' }, stage);
}
