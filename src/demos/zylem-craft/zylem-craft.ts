import {
  callFunc,
  delay,
  moveTo,
  repeatForever,
  sequence,
} from '@zylem/game-lib/actions';
import { createCamera, createGame, createStage } from '@zylem/game-lib/core';
import { createBox, createSphere, createText } from '@zylem/game-lib/entity';
import { Color } from 'three';
import { movementControls } from '../_shared/controls';

export default function createDemo() {
  const base = { x: -8, y: -4 };
  const mine = { x: 8, y: 4 };
  let minerals = 0;
  let selected = 0;
  let finished = false;
  const cursor = createSphere({
    name: 'command-cursor',
    radius: 0.25,
    position: [0, 0, 0],
    color: new Color('#ffd166'),
    collision: { static: true, sensor: true },
  });
  const label = createText({ text: '', screenPosition: { x: 0.5, y: 0.06 } });
  const stage = createStage(
    { backgroundColor: '#142e29' },
    createCamera({ perspective: 'fixed-2d', zoom: 22 }),
    cursor,
    label,
    createBox({
      name: 'base',
      position: [base.x, base.y, -1],
      size: [3, 3, 1],
      color: new Color('#498ecb'),
      collision: { static: true },
    }),
    createSphere({
      name: 'crystals',
      position: [mine.x, mine.y, -1],
      radius: 1.5,
      color: new Color('#9ae6dc'),
      collision: { static: true, sensor: true },
    }),
  ).setInputConfiguration(movementControls, {
    p1: {
      key: {
        '1': ['buttons.X'],
        '2': ['buttons.Y'],
        '3': ['buttons.L'],
        '4': ['buttons.R'],
        '5': ['buttons.Select'],
        b: ['buttons.B'],
      },
    },
  });

  function createWorker(index: number) {
    const entity = createBox({
      name: `worker-${index + 1}`,
      position: [base.x + 2 + index, base.y, 0],
      size: [0.7, 0.7, 0.7],
      collision: { sensor: true },
      color: new Color('#9bd2fa'),
    });
    return entity;
  }
  function travelTo(point: { x: number; y: number }) {
    return moveTo({ x: point.x, y: point.y, z: 0, duration: 3500 });
  }

  const workers = [createWorker(0)];
  stage.add(workers[0]!);
  stage.onUpdate(({ inputs, delta }) => {
    if (finished) return;
    const { axes, buttons } = inputs.p1;
    const position = cursor.getPosition();
    if (position)
      cursor.setPosition(
        Math.max(
          -13,
          Math.min(13, position.x + axes.Horizontal.value * 10 * delta),
        ),
        Math.max(
          -8,
          Math.min(8, position.y - axes.Vertical.value * 10 * delta),
        ),
        0,
      );
    [buttons.X, buttons.Y, buttons.L, buttons.R, buttons.Select].forEach(
      (button, index) => {
        if (button.pressed && workers[index]) selected = index;
      },
    );
    const worker = workers[selected]!;
    if (buttons.A.pressed && position) {
      worker.clearActions();
      worker.resetVelocity();
      const gather = Math.hypot(position.x - mine.x, position.y - mine.y) < 2;
      worker.runAction(
        gather
          ? repeatForever(
              sequence(
                travelTo(mine),
                delay(1200),
                travelTo(base),
                callFunc(() => {
                  minerals += 10;
                }),
              ),
            )
          : travelTo(position),
      );
    }

    if (buttons.B.pressed && minerals >= 20 && workers.length < 5) {
      minerals -= 20;
      const recruit = createWorker(workers.length);
      workers.push(recruit);
      stage.add(recruit);
      finished = workers.length === 5;
      if (finished)
        workers.forEach((unit) => {
          unit.clearActions();
          unit.resetVelocity();
        });
    }
    label.updateText(
      finished
        ? 'Squad complete! — R to restart'
        : `Unit ${selected + 1} · Crystals: ${minerals} · Squad: ${workers.length}/5 · Train: 20`,
    );
  });
  return createGame({ id: 'zylem-craft' }, stage);
}
