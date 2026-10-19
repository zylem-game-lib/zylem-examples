import { createGame, createStage, vessel } from '@zylem/game-lib/core';
import { createSphere, createText, destroy } from '@zylem/game-lib/entity';
import { movementControls } from '../_shared/controls';

export default function createDemo() {
  const status = createText({
    text: 'Waiting for setup',
    screenPosition: { x: 0.5, y: 0.15 },
  });
  const group = vessel().add(createSphere());
  let elapsed = 0;
  let removed = false;
  group.onSetup(() => status.updateText('Vessel ready'));
  group.onUpdate(({ delta }) => {
    elapsed += delta;
    status.updateText(`Vessel updating: ${elapsed.toFixed(1)} s`);
  });
  group.onDestroy(() => status.updateText('Vessel destroyed — R to restart'));
  const stage = createStage({}, group, status).setInputConfiguration(
    movementControls,
  );
  stage.onUpdate(({ inputs }) => {
    if (!removed && inputs.p1.buttons.A.pressed) {
      removed = true;
      destroy(group);
    }
  });
  return createGame(stage);
}
