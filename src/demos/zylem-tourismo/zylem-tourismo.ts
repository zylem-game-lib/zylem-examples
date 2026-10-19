import { createCamera, createGame, createStage } from '@zylem/game-lib/core';
import { createBox, createText, createZone } from '@zylem/game-lib/entity';
import { Color } from 'three';
import { movementControls } from '../_shared/controls';

export default function createDemo() {
  const corners = [
    { x: 10, y: -6 },
    { x: 10, y: 6 },
    { x: -10, y: 6 },
    { x: -10, y: -6 },
  ];
  let speed = 0;
  let heading = 0;
  let nextCheckpoint = 0;
  let laps = 0;
  let elapsed = 0;
  let finished = false;
  const car = createBox({
    name: 'car',
    position: [-10, -6, 0],
    size: [1.6, 0.8, 0.6],
    color: new Color('#e56767'),
  });
  const label = createText({
    text: 'Lap 1/3 · Next gate: 1',
    screenPosition: { x: 0.5, y: 0.05 },
  });
  const gates = corners
    .map((point, index) => {
      const zone = createZone({
        position: [point.x, point.y, 0],
        size: [4, 4, 2],
      });
      zone.onEnter(({ visitor }) => {
        if (finished || visitor.uuid !== car.uuid || index !== nextCheckpoint)
          return;
        nextCheckpoint = (nextCheckpoint + 1) % corners.length;
        if (nextCheckpoint === 0) laps++;
        finished = laps === 3;
      });
      return [
        zone,
        createText({
          text: String(index + 1),
          position: [point.x, point.y, 1],
          fontSize: 22,
          stickToViewport: false,
        }),
      ];
    })
    .flat();
  car.onUpdate(({ me, inputs, delta }) => {
    if (finished) {
      me.resetVelocity();
      label.updateText(`Finished in ${elapsed.toFixed(1)} s — R to race again`);
      return;
    }
    elapsed += delta;
    const { Horizontal, Vertical } = inputs.p1.axes;
    speed = Math.max(-4, Math.min(14, speed - Vertical.value * 12 * delta));
    speed *= Math.exp(-0.5 * delta);
    heading -=
      Horizontal.value *
      2.2 *
      delta *
      Math.min(1, Math.abs(speed) / 3) *
      Math.sign(speed);
    me.setRotationZ(heading);
    me.moveXY(Math.cos(heading) * speed, Math.sin(heading) * speed);
    const p = me.getPosition();
    if (p && (Math.abs(p.x) > 16 || Math.abs(p.y) > 11)) {
      const last = corners[(nextCheckpoint + 3) % corners.length]!;
      me.setPosition(last.x, last.y, 0);
      speed = 0;
    }
    label.updateText(
      `Lap ${laps + 1}/3 · Next gate: ${nextCheckpoint + 1} · ${elapsed.toFixed(1)} s`,
    );
  });
  const infield = createBox({
    size: [14, 6, 1],
    position: [0, 0, 0],
    collision: { static: true },
    color: new Color('#438266'),
  });
  const road = createBox({
    size: [32, 22, 0.2],
    position: [0, 0, -2],
    collision: { static: true },
    color: new Color('#343e4d'),
  });
  return createGame(
    { id: 'zylem-tourismo' },
    createStage(
      { backgroundColor: '#19362d' },
      createCamera({ perspective: 'fixed-2d', zoom: 25 }),
      road,
      infield,
      car,
      ...gates,
      label,
    ).setInputConfiguration(movementControls),
  );
}
