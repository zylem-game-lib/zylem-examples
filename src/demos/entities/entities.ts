import { repeatForever, rotateBy } from '@zylem/game-lib/actions';
import { createGame } from '@zylem/game-lib/core';
import {
  boxCollision,
  boxMesh,
  create,
  sphereCollision,
  sphereMesh,
} from '@zylem/game-lib/entity';
import { Color } from 'three';

export default function createDemo() {
  // Visuals and colliders belong to one entity and share its transform.
  const toy = create({ name: 'compound-toy' })
    .add(
      boxMesh({ size: [2, 1, 1], material: { color: new Color('#398ce6') } }),
    )
    .add(boxCollision({ size: [2, 1, 1] }))
    .add(
      sphereMesh({
        radius: 0.6,
        position: [0, 1, 0],
        material: { color: new Color('#ffd166') },
      }),
    )
    .add(sphereCollision({ radius: 0.6, offset: [0, 1, 0] }));
  toy.runAction(repeatForever(rotateBy({ y: 360, duration: 6000 })));
  return createGame(toy);
}
