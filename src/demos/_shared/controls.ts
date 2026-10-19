import {
  mergeInputConfigs,
  useArrowsForAxes,
  useWASDForAxes,
} from '@zylem/game-lib/input';

/** Explicit keyboard bindings; gamepad buttons still work through Zylem. */
export const movementControls = mergeInputConfigs(
  useArrowsForAxes('p1'),
  useWASDForAxes('p1'),
  {
    p1: {
      key: {
        ' ': ['buttons.A'],
        Shift: ['buttons.B'],
        Enter: ['buttons.Start'],
        Backspace: ['buttons.Select'],
      },
    },
  },
);
