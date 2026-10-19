import { repeatForever, rotateBy } from '@zylem/game-lib/actions';
import { createCamera, createGame, createStage } from '@zylem/game-lib/core';
import {
  createBox,
  createCone,
  createCylinder,
  createPill,
  createPyramid,
  createSphere,
} from '@zylem/game-lib/entity';

export default function createDemo() {
  const shapes = [
    createBox(),
    createSphere(),
    createCone(),
    createCylinder(),
    createPill(),
    createPyramid(),
  ];
  shapes.forEach((shape, index) => {
    shape.onSetup(({ me }) => me.setPosition((index - 2.5) * 3, 0, 0));
    shape.runAction(repeatForever(rotateBy({ y: 360, duration: 8000 })));
  });
  return createGame(
    createStage(
      {},
      createCamera({ position: [0, 5, 22], target: [0, 0, 0] }),
      ...shapes,
    ),
  );
}
