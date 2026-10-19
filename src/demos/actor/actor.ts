import { createCamera, createGame, createStage } from '@zylem/game-lib/core';
import { createBox } from '@zylem/game-lib/entity';
import { movementControls } from '../_shared/controls';
import { createPlayer } from '../_shared/player';

export default function createDemo() {
  const player = createPlayer({ x: 0, y: 2, z: 0 });
  const floor = createBox({
    size: [30, 1, 30],
    position: [0, -1, 0],
    collision: { static: true },
  });
  const camera = createCamera({ position: [0, 10, 20], target: [0, 0, 0] });
  player.onUpdate(({ me }) => {
    if ((me.getPosition()?.y ?? 0) < -10) {
      me.setPosition(0, 2, 0);
      me.resetVelocity();
    }
  });
  return createGame(
    createStage(
      { gravity: { x: 0, y: -20, z: 0 } },
      camera,
      floor,
      player,
    ).setInputConfiguration(movementControls),
  );
}
