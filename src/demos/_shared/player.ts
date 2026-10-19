import { Platformer3DBehavior } from '@zylem/game-lib/behavior';
import { createActor } from '@zylem/game-lib/entity';
import { demoAsset } from '../../assets/manifest';
import { withBehavior } from './behavior';

/** The same animated actor is used by the actor lesson and Zario 64. */
export function createPlayer(position: { x: number; y: number; z: number }) {
  const player = withBehavior(
    createActor({
      name: 'player',
      position,
      scale: [0.02, 0.02, 0.02],
      models: [demoAsset('general/player/idle.fbx')],
      animations: [
        { key: 'idle', path: demoAsset('general/player/idle.fbx') },
        { key: 'walking', path: demoAsset('general/player/walking.fbx') },
        { key: 'running', path: demoAsset('general/player/running.fbx') },
        { key: 'jumping', path: demoAsset('general/player/jumping-up.fbx') },
      ],
      stripRootMotionY: true,
      collision: { size: [1, 3.8, 0.5], static: false },
      collisionShape: 'capsule',
    }),
    Platformer3DBehavior,
    { walkSpeed: 6, runSpeed: 12, jumpForce: 12, maxJumps: 2, gravity: 20 },
  );
  player.onUpdate(({ inputs, me }) => {
    const { axes, buttons } = inputs.p1;
    me.$platformer.moveX = axes.Horizontal.value;
    me.$platformer.moveZ = axes.Vertical.value;
    me.$platformer.jump = buttons.A.held > 0;
    me.$platformer.run = buttons.B.held > 0;
    if (Math.hypot(axes.Horizontal.value, axes.Vertical.value) > 0.1) {
      me.setRotationY(Math.atan2(axes.Horizontal.value, axes.Vertical.value));
    }
    const key = !me.platformerState.grounded
      ? 'jumping'
      : Math.hypot(axes.Horizontal.value, axes.Vertical.value) < 0.1
        ? 'idle'
        : buttons.B.held > 0
          ? 'running'
          : 'walking';
    me.playAnimation({ key, pauseAtEnd: key === 'jumping' });
  });
  return player;
}
