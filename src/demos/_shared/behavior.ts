import type { BehaviorDescriptor } from '@zylem/game-lib/behavior';
import type { GameEntity } from '@zylem/game-lib/entity';

/**
 * @zylem/behaviors' useBehavior declaration still expects its internal entity
 * type. Attach through game-lib's public API and retain the descriptor's input
 * interface. Remove this adapter when the packages share structural types.
 */
export function withBehavior<
  E extends GameEntity<any>,
  O extends Record<string, any>,
  H extends Record<string, any>,
  I,
>(
  entity: E,
  descriptor: BehaviorDescriptor<O, H, I>,
  options?: Partial<O>,
): E & I {
  entity.use(descriptor, options);
  return entity as E & I;
}

/** Ricochet still declares a legacy collider field; the WASM host has no collider object. */
export function ricochetEntity<E extends GameEntity<any>>(entity: E) {
  return Object.assign(entity, { collider: undefined });
}
