import { WorldBoundary2DBehavior } from '@zylem/game-lib/behavior';
import { createCamera, createGame, createStage } from '@zylem/game-lib/core';
import { createSphere } from '@zylem/game-lib/entity';
import { movementControls } from '../_shared/controls';

export default function createDemo() {
  const ball = createSphere({ radius: 0.4 });
  const boundary = ball.use(WorldBoundary2DBehavior, {
    boundaries: { left: -6, right: 6, bottom: -4, top: 4 },
  });
  ball.onUpdate(({ me, inputs }) => {
    const { Horizontal, Vertical } = inputs.p1.axes;
    const { moveX, moveY } = boundary.getMovement(
      Horizontal.value * 6,
      -Vertical.value * 6,
    );
    me.moveXY(moveX, moveY); // Velocity in world units per second, without delta.
  });
  const stage = createStage(
    {},
    createCamera({ perspective: 'fixed-2d', zoom: 10 }),
    ball,
  ).setInputConfiguration(movementControls);
  return createGame(stage);
}
