import {
  createSongPlayer,
  ricochetSound,
  type SongDefinition,
} from '@zylem/game-lib/audio';
import { createCamera, createGame, createStage } from '@zylem/game-lib/core';
import { createBox, createSphere, createText } from '@zylem/game-lib/entity';
import { movementControls } from '../_shared/controls';

const song: SongDefinition = {
  id: 'example-loop',
  name: 'Four notes',
  bpm: 100,
  timeSignature: { numerator: 4, denominator: 4 },
  lengthBars: 1,
  loop: { enabled: true, start: 0, end: 4 },
  instruments: [
    {
      id: 'lead',
      name: 'Lead',
      preset: 'synth',
      oscillator: 'triangle',
      volume: -18,
    },
  ],
  tracks: [
    { id: 'melody', name: 'Melody', kind: 'instrument', instrumentId: 'lead' },
  ],
  clips: [
    {
      id: 'phrase',
      kind: 'notes',
      trackId: 'melody',
      start: 0,
      length: 4,
      notes: [60, 64, 67, 72].map((pitch, start) => ({
        pitch,
        start,
        duration: 0.5,
      })),
    },
  ],
};

export default function createDemo() {
  const music = createSongPlayer(song);
  const status = createText({
    text: 'Space: start music',
    screenPosition: { x: 0.5, y: 0.1 },
  });
  const floor = createBox({
    name: 'floor',
    size: [12, 1, 6],
    position: [0, -2, 0],
    collision: { static: true },
  });
  const ball = createSphere({
    radius: 0.5,
    position: [0, 3, 0],
    collision: { static: false },
  });
  ball.onCollision(
    ({ entity, other }) => {
      if (other.name !== 'floor') return;
      ricochetSound(700, 0.07);
      entity.moveY(8);
    },
    { phase: 'enter' },
  );
  let pending = false;
  const stage = createStage(
    { gravity: { x: 0, y: -9.82, z: 0 } },
    createCamera({ position: [0, 3, 14], target: [0, 0, 0] }),
    ball,
    floor,
    status,
  ).setInputConfiguration(movementControls);
  stage.onUpdate(({ inputs }) => {
    if (!inputs.p1.buttons.A.pressed || pending) return;
    if (music.state === 'playing') {
      music.stop();
      status.updateText('Space: start music');
    } else {
      pending = true;
      void music
        .play()
        .then(() => status.updateText('Space: stop music'))
        .catch(() =>
          status.updateText('Audio unavailable — press Space to retry'),
        )
        .finally(() => {
          pending = false;
        });
    }
  });
  ball.onCleanup(() => music.dispose());
  return createGame(stage);
}
