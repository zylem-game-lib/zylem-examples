import { createCamera, createGame, createStage } from '@zylem/game-lib/core';
import { createBox } from '@zylem/game-lib/entity';
import { Color } from 'three';

export default function createDemo() {
  const floor = createBox({
    size: [16, 1, 8],
    position: [0, -2, 0],
    collision: { static: true },
    color: new Color('#304554'),
  });
  const boxes = Array.from({ length: 6 }, (_, index) =>
    createBox({
      name: `box-${index}`,
      size: [1.4, 1.4, 1.4],
      position: [(index % 2) - 0.5, index * 1.8, 0],
      collision: { static: false },
      color: new Color().setHSL(index / 9, 0.7, 0.6),
    }),
  );
  return createGame(
    createStage(
      { gravity: { x: 0, y: -9.82, z: 0 } },
      createCamera({ position: [10, 8, 18], target: [0, 2, 0] }),
      floor,
      ...boxes,
    ),
  );
}
