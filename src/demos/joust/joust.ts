import { ScreenWrapBehavior } from '@zylem/game-lib/behavior';
import { createCamera, createGame, createStage } from '@zylem/game-lib/core';
import {
  createBox,
  createSphere,
  createText,
  destroy,
} from '@zylem/game-lib/entity';
import { Color } from 'three';
import { movementControls } from '../_shared/controls';

export default function createDemo() {
  let finished = false;
  let verticalSpeed = 0;
  let elapsed = 0;
  const defeated = new Set<string>();
  const label = createText({
    text: 'Defeat 4 riders from above',
    screenPosition: { x: 0.5, y: 0.08 },
  });
  const player = createSphere({
    name: 'player',
    radius: 0.5,
    position: [-8, 2, 0],
    color: new Color('#ffd166'),
  });
  player.use(ScreenWrapBehavior, { width: 28, height: 40 });
  const floor = createBox({
    name: 'floor',
    size: [30, 1, 2],
    position: [0, -6, 0],
    collision: { static: true },
    color: new Color('#665172'),
  });
  const riders = Array.from({ length: 4 }, (_, index) => {
    const rider = createSphere({
      name: 'rider',
      radius: 0.5,
      position: [-2 + index * 4, 0, 0],
      color: new Color('#d96785'),
    });
    rider.use(ScreenWrapBehavior, { width: 28, height: 40 });
    rider.onUpdate(({ me }) => {
      if (finished) {
        me.resetVelocity();
        return;
      }
      me.moveXY(index % 2 ? -2 : 2, Math.cos(elapsed * 1.4 + index) * 2);
    });
    return rider;
  });
  player.onUpdate(({ me, inputs, delta }) => {
    if (finished) {
      me.resetVelocity();
      return;
    }
    elapsed += delta;
    if (inputs.p1.buttons.A.pressed) verticalSpeed = 6;
    verticalSpeed = Math.max(-8, verticalSpeed - 12 * delta);
    const y = me.getPosition()?.y ?? 0;
    if (y < -5 && verticalSpeed < 0) verticalSpeed = 0;
    if (y > 6 && verticalSpeed > 0) verticalSpeed = 0;
    me.moveXY(inputs.p1.axes.Horizontal.value * 6, verticalSpeed);
  });
  player.onCollision(
    ({ entity, other }) => {
      if (finished || other.name !== 'rider' || defeated.has(other.uuid))
        return;
      const playerY = entity.getPosition()?.y ?? 0;
      const rivalY = other.getPosition()?.y ?? 0;
      if (playerY > rivalY + 0.1) {
        defeated.add(other.uuid);
        destroy(other);
        verticalSpeed = 5;
        finished = defeated.size === riders.length;
        label.updateText(
          finished
            ? 'You win! — R to restart'
            : `Riders defeated: ${defeated.size}/4`,
        );
      } else {
        finished = true;
        label.updateText('Defeated! — R to restart');
      }
    },
    { phase: 'enter' },
  );
  return createGame(
    { id: 'joust' },
    createStage(
      { backgroundColor: '#1a1832' },
      createCamera({ perspective: 'fixed-2d', zoom: 16 }),
      floor,
      player,
      ...riders,
      label,
    ).setInputConfiguration(movementControls),
  );
}
