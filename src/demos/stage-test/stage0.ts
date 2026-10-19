import { createStage } from '@zylem/game-lib/core';
import { createText } from '@zylem/game-lib/entity';
import { Color } from 'three';

export function createStageZero() {
  return createStage(
    {
      backgroundColor: new Color(Color.NAMES.black),
    },
    () =>
      createText({
        name: 'startGameText',
        text: 'Press Space to start the game',
        fontSize: 20,
        stickToViewport: true,
        screenPosition: { x: 0.5, y: 0.5 },
      }),
  );
}
