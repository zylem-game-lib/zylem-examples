import { createGame, createStage, vessel } from '@zylem/game-lib/core';
import { createText } from '@zylem/game-lib/entity';
import {
  createVariable,
  getVariable,
  onVariableChange,
  setVariable,
} from '@zylem/game-lib/globals';
import { movementControls } from '../_shared/controls';

export default function createDemo() {
  const label = createText({
    text: 'Count: 0',
    screenPosition: { x: 0.5, y: 0.5 },
  });
  const panel = vessel().add(label);
  createVariable(panel, 'count', 0);
  const unsubscribe = onVariableChange<number>(panel, 'count', (count) =>
    label.updateText(`Count: ${count}`),
  );
  panel.onUpdate(({ inputs }) => {
    if (inputs.p1.buttons.A.pressed)
      setVariable(panel, 'count', getVariable<number>(panel, 'count')! + 1);
  });
  panel.onCleanup(unsubscribe);
  return createGame(
    createStage({}, panel).setInputConfiguration(movementControls),
  );
}
