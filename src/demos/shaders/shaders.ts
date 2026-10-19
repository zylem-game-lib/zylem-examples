import { createCamera, createGame, createStage } from '@zylem/game-lib/core';
import { createSphere } from '@zylem/game-lib/entity';
import { bricks, marble } from '@zylem/shaders';
import { Color } from 'three';
import { color, mix, positionLocal, sin, time } from 'three/tsl';

export default function createDemo() {
  const surfaces = [
    bricks({ color: new Color('#de8254'), background: new Color('#41333c') }),
    marble({ color: new Color('#59b2de'), background: new Color('#e7eff8') }),
    // A custom TSL shader: animate the blend between two colors across the surface.
    mix(
      color('#9a65db'),
      color('#57e1c3'),
      sin(positionLocal.y.mul(4).add(time)).mul(0.5).add(0.5),
    ),
  ];
  const spheres = surfaces.map((colorNode, index) =>
    createSphere({
      radius: 1.5,
      position: [(index - 1) * 4, 0, 0],
      material: { shader: { colorNode } },
    }),
  );
  return createGame(
    createStage(
      {},
      createCamera({ position: [0, 2, 16], target: [0, 0, 0] }),
      ...spheres,
    ),
  );
}
