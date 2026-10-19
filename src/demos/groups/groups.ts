import { moveBy, repeatForever, sequence } from '@zylem/game-lib/actions';
import { createGame, vessel } from '@zylem/game-lib/core';
import { createBox, createSphere } from '@zylem/game-lib/entity';
import { Color } from 'three';

export default function createDemo() {
  function row(y: number, spheres: boolean) {
    const children = Array.from({ length: 3 }, (_, index) => {
      const options = {
        position: [index * 2 - 3, y, 0] as [number, number, number],
        color: new Color(spheres ? '#ffbc69' : '#59b6e8'),
      };
      return spheres ? createSphere(options) : createBox(options);
    });
    // A vessel groups lifecycles, not transforms. Give each child its own action.
    children.forEach((child) =>
      child.runAction(
        repeatForever(
          sequence(
            moveBy({ x: 2, duration: 1800 }),
            moveBy({ x: -2, duration: 1800 }),
          ),
        ),
      ),
    );
    return vessel().add(...children);
  }
  return createGame(row(2, false), row(-2, true));
}
