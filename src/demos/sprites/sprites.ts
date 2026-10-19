import { createCamera, createGame, createStage } from '@zylem/game-lib/core';
import { createSprite } from '@zylem/game-lib/entity';
import {
  ZYLEM_MAN_ANIMATIONS,
  ZYLEM_MAN_SHEET,
} from '../../assets/zylem-man-atlas';
import { movementControls } from '../_shared/controls';

export default function createDemo() {
  const hero = createSprite({
    sheet: ZYLEM_MAN_SHEET,
    animations: ZYLEM_MAN_ANIMATIONS,
    size: [4, 4, 1],
  });
  let running = false;
  hero.onUpdate(({ me, inputs, delta }) => {
    if (inputs.p1.buttons.A.pressed) running = !running;
    const direction = inputs.p1.axes.Horizontal.value;
    if (direction !== 0) me.setFlipX(direction < 0);
    me.setAnimation(running ? 'run' : 'idle', delta);
  });
  return createGame(
    createStage(
      {},
      createCamera({ perspective: 'fixed-2d', zoom: 8 }),
      hero,
    ).setInputConfiguration(movementControls),
  );
}
