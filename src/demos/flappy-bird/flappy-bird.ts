import { createCamera, createGame, createStage } from '@zylem/game-lib/core';
import { createBox, createSphere, createText } from '@zylem/game-lib/entity';
import { Color } from 'three';
import { movementControls } from '../_shared/controls';

export default function createDemo() {
  let velocity = 0;
  let started = false;
  let finished = false;
  let score = 0;
  const label = createText({
    text: 'Space to flap',
    screenPosition: { x: 0.5, y: 0.08 },
  });
  const bird = createSphere({
    name: 'bird',
    radius: 0.35,
    position: [-5, 0, 0],
    color: new Color('#ffd166'),
  });
  const gaps = [-1, 1.5, 0, -1.5, 1];
  const pipes = Array.from({ length: 4 }, (_, index) => {
    const gap = gaps[index]!;
    const pair = [-1, 1].map((side) =>
      createBox({
        name: 'pipe',
        size: [1.4, 10, 1],
        position: [5 + index * 7, gap + side * 7, 0],
        color: new Color('#57c59a'),
      }),
    );
    return { pair, x: 5 + index * 7, passed: false, sequence: index };
  });
  function lose() {
    finished = true;
    label.updateText(`Score: ${score} — R to retry`);
  }
  bird.onCollision(
    ({ other }) => {
      if (other.name === 'pipe') lose();
    },
    { phase: 'enter' },
  );
  bird.onUpdate(({ me, inputs, delta }) => {
    if (finished) {
      me.resetVelocity();
      return;
    }
    if (inputs.p1.buttons.A.pressed) {
      started = true;
      velocity = 6;
    }
    if (!started) return;
    velocity = Math.max(-10, velocity - 16 * delta);
    me.moveXY(0, velocity);
    const y = me.getPosition()?.y ?? 0;
    if (Math.abs(y) > 6.5) lose();
  });
  const stage = createStage(
    { backgroundColor: '#143d59' },
    createCamera({ perspective: 'fixed-2d', zoom: 15 }),
    bird,
    label,
    ...pipes.flatMap((pipe) => pipe.pair),
  ).setInputConfiguration(movementControls);
  stage.onUpdate(({ delta }) => {
    if (!started || finished) return;
    for (const pipe of pipes) {
      pipe.x -= 4 * delta;
      if (!pipe.passed && pipe.x < -6.1) {
        pipe.passed = true;
        label.updateText(`Score: ${++score}`);
      }
      if (pipe.x < -15) {
        pipe.x += 28;
        pipe.passed = false;
        pipe.sequence += 4;
      }
      const gap = gaps[pipe.sequence % gaps.length]!;
      pipe.pair.forEach((part, index) =>
        part.setPosition(pipe.x, gap + (index === 0 ? -7 : 7), 0),
      );
    }
  });
  return createGame({ id: 'flappy-bird' }, stage);
}
