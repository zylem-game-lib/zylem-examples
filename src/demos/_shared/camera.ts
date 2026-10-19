import type { createCamera, StageEntity } from '@zylem/game-lib/core';
import type { GameEntity } from '@zylem/game-lib/entity';

/** Camera declarations still name the old StageEntity; public entities work at runtime. */
export function trackEntity(
  camera: ReturnType<typeof createCamera>,
  entity: Pick<GameEntity<any>, 'getPosition' | 'group' | 'uuid'>,
) {
  camera.addTarget(entity as unknown as StageEntity);
}
