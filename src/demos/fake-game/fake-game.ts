import { createGame, createStage } from '@zylem/game-lib/core';
import { createText } from '@zylem/game-lib/entity';
import { setGlobal } from '@zylem/game-lib/globals';
import { movementControls } from '../_shared/controls';

export default function createDemo() {
  function screen(message: string) {
    return createStage({}, () =>
      createText({ text: message, screenPosition: { x: 0.5, y: 0.5 } }),
    ).setInputConfiguration(movementControls);
  }
  const title = screen('Fake game — Space to start');
  const play = createStage({}, () => {
    let collected = 0;
    const label = createText({
      text: 'Collect 3 imaginary coins — Space',
      screenPosition: { x: 0.5, y: 0.5 },
    });
    label.onUpdate(({ inputs }) => {
      if (inputs.p1.buttons.A.pressed && collected < 3) {
        label.updateText(`Coins: ${++collected}/3`);
        setGlobal('coins', collected);
        if (collected === 3) void game.nextStage();
      }
    });
    return label;
  }).setInputConfiguration(movementControls);
  const results = screen('You collected 3 coins! — Enter to play again');
  const game = createGame(
    { id: 'fake-game', globals: { coins: 0 } },
    title,
    play,
    results,
  );
  title.onUpdate(({ inputs }) => {
    if (inputs.p1.buttons.A.pressed) void game.nextStage();
  });
  results.onUpdate(({ inputs }) => {
    if (inputs.p1.buttons.Start.pressed) void game.reset();
  });
  return game;
}
