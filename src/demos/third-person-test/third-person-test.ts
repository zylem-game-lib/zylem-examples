import { repeatForever, rotateBy } from '@zylem/game-lib/actions';
import { createCamera, createGame, createStage } from '@zylem/game-lib/core';
import { createSphere, createText, createZone } from '@zylem/game-lib/entity';
import { Color } from 'three';
import { demoAsset } from '../../assets/manifest';
import { playgroundPlane, playgroundPlatforms } from '../../utils';
import { trackEntity } from '../_shared/camera';
import { movementControls } from '../_shared/controls';
import { createPlayer } from '../_shared/player';

export default function createDemo() {
	const spawn = { x: 0, y: 3, z: 0 };
	const player = createPlayer(spawn);
	const camera = createCamera({
		position: [0, 8, 12],
		perspective: 'third-person',
	});
	player.onSetup(() => {
		trackEntity(camera, player);
	});
	const status = createText({
		text: 'Reach the golden goal',
		screenPosition: { x: 0.5, y: 0.08 },
	});
	const goal = createSphere({
		radius: 0.7,
		position: [0, 16, 0],
		color: new Color('#ffd166'),
	});
	goal.runAction(repeatForever(rotateBy({ y: 360, duration: 2000 })));
	const finish = createZone({ position: [0, 16, 0], size: [4, 4, 4] });
	finish.onEnter(({ visitor }) => {
		if (visitor.uuid === player.uuid)
			status.updateText('Course complete! — R to restart');
	});
	player.onUpdate(({ me }) => {
		if ((me.getPosition()?.y ?? 0) < -8) {
			me.setPosition(spawn.x, spawn.y, spawn.z);
			me.resetVelocity();
		}
	});
	return createGame(
		{ id: 'zario-64' },
		createStage(
			{
				gravity: { x: 0, y: -20, z: 0 },
				backgroundImage: demoAsset('general/skybox-default.png'),
			},
			camera,
			playgroundPlane('dirt'),
			...playgroundPlatforms(),
			player,
			goal,
			finish,
			status,
		).setInputConfiguration(movementControls),
	);
}
