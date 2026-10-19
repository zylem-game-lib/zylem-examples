import { createGame, createStage } from '@zylem/game-lib/core';
import { createSphere, createText } from '@zylem/game-lib/entity';
import { Color } from 'three';
import { movementControls } from '../_shared/controls';

function scene(name: string, color: string) {
  // Factories create fresh entities whenever the stage is entered.
  return createStage(
    { backgroundColor: new Color(color) },
    () => createSphere(),
    () => createText({ text: name, screenPosition: { x: 0.5, y: 0.1 } }),
  ).setInputConfiguration(movementControls);
}

export default function createDemo() {
  const game = createGame(
    scene('Morning', '#25465f'),
    scene('Evening', '#553563'),
  );
  game.onUpdate(({ inputs }) => {
    if (inputs.p1.buttons.A.pressed) void game.nextStage();
    if (inputs.p1.buttons.Select.pressed) void game.previousStage();
  });
  return game;
}
