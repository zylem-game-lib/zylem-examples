import {
  delay,
  moveBy,
  parallel,
  repeatForever,
  rotateBy,
  sequence,
} from '@zylem/game-lib/actions';
import { createGame } from '@zylem/game-lib/core';
import { createBox } from '@zylem/game-lib/entity';
import { Color } from 'three';

export default function createDemo() {
  const box = createBox({ position: [-3, 0, 0], color: new Color('#4fa8ed') });
  box.runAction(
    repeatForever(
      sequence(
        parallel(
          moveBy({ x: 6, duration: 2000 }),
          rotateBy({ z: 180, duration: 2000 }),
        ),
        delay(400),
        parallel(
          moveBy({ x: -6, duration: 2000 }),
          rotateBy({ z: 180, duration: 2000 }),
        ),
        delay(400),
      ),
    ),
  );
  return createGame(box);
}
