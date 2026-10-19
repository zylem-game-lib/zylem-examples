import { callFunc, delay, sequence } from '@zylem/game-lib/actions';
import {
  ScreenWrapBehavior,
  Shooter2DBehavior,
  TopDownMovementBehavior,
  TopDownShooterCoordinator,
} from '@zylem/game-lib/behavior';
import {
  createCamera,
  createGame,
  createStage,
  Perspectives,
} from '@zylem/game-lib/core';
import { createSprite, createText, destroy } from '@zylem/game-lib/entity';
import { setGlobal } from '@zylem/game-lib/globals';
import {
  mergeInputConfigs,
  useArrowsForSecondaryAxes,
  useWASDForAxes,
} from '@zylem/game-lib/input';
import { Color } from 'three';
import { demoAsset } from '../../assets/manifest';
import { withBehavior } from '../_shared/behavior';

const playerShipImg = demoAsset('general/space/player-ship.png');
const enemyShipImg = demoAsset('general/space/enemy-ship.png');
const playerLaserImg = demoAsset('general/space/player-laser.png');

export default function createDemo() {
  const PLAYFIELD_WIDTH = 28;
  const PLAYFIELD_HEIGHT = 18;
  let finished = false;
  const defeated = new Set<string>();
  const ENEMY_SPEED = 2.4;
  const PLAYER_SPEED = 8.5;

  let playerInvulnerabilityMs = 0;

  function createRobotronBullet() {
    const bullet = createSprite({
      name: 'robotron-bullet',
      images: [{ name: 'robotron-bullet', file: playerLaserImg }],
      size: { x: 0.35, y: 0.75, z: 1 },
    });

    bullet.runAction(
      sequence(
        delay(1500),
        callFunc(() => destroy(bullet)),
      ),
    );

    bullet.onCollision(
      ({ entity, other, globals }) => {
        if (
          finished ||
          other.name !== 'robotron-enemy' ||
          defeated.has(other.uuid)
        ) {
          return;
        }

        defeated.add(other.uuid);
        destroy(entity);
        destroy(other);
        setGlobal('score', (globals.score as number) + 25);
      },
      { phase: 'enter' },
    );

    return bullet;
  }

  function createEnemy(index: number, player: ReturnType<typeof createSprite>) {
    const enemy = createSprite({
      name: 'robotron-enemy',
      images: [{ name: `robotron-enemy-${index}`, file: enemyShipImg }],
      size: { x: 1, y: 1, z: 1 },
      position: {
        x: index < 4 ? -10 + index * 3 : -10 + (index - 4) * 3,
        y: index < 4 ? 6 : -6,
        z: 0,
      },
    });

    enemy.use(ScreenWrapBehavior, {
      width: PLAYFIELD_WIDTH,
      height: PLAYFIELD_HEIGHT,
    });

    enemy.onUpdate(({ me }) => {
      if (finished) {
        me.resetVelocity();
        return;
      }
      const playerPosition = player.getPosition();
      const enemyPosition = me.getPosition();
      if (!playerPosition || !enemyPosition) {
        return;
      }

      const dx = playerPosition.x - enemyPosition.x;
      const dy = playerPosition.y - enemyPosition.y;
      const distance = Math.hypot(dx, dy);
      if (distance <= 1e-6) {
        return;
      }

      const moveX = (dx / distance) * ENEMY_SPEED;
      const moveY = (dy / distance) * ENEMY_SPEED;
      me.moveXY(moveX, moveY);
      me.setRotationZ(Math.atan2(-(dx / distance), dy / distance));
    });

    return enemy;
  }

  const basePlayer = createSprite({
    name: 'robotron-player',
    images: [{ name: 'robotron-player', file: playerShipImg }],
    size: { x: 1, y: 1, z: 1 },
    position: { x: 0, y: 0, z: 0 },
  });

  const player = withBehavior(basePlayer, TopDownMovementBehavior, {
    moveSpeed: PLAYER_SPEED,
  });

  player.use(ScreenWrapBehavior, {
    width: PLAYFIELD_WIDTH,
    height: PLAYFIELD_HEIGHT,
  });

  const playerShooter = player.use(Shooter2DBehavior, {
    projectileFactory: createRobotronBullet,
    projectileSpeed: 22,
    cooldownMs: 110,
    spawnOffset: { x: 0, y: 0.9 },
    rotateProjectile: true,
  });

  const enemies = Array.from({ length: 8 }, (_, index) =>
    createEnemy(index, player),
  );

  const camera = createCamera({
    position: { x: 0, y: 0, z: 12 },
    target: { x: 0, y: 0, z: 0 },
    zoom: 18,
    perspective: Perspectives.Fixed2D,
  });

  const stage = createStage(
    {
      backgroundColor: new Color('#090d14'),
    },
    camera,
  );

  const playerCoordinator = new TopDownShooterCoordinator(
    player,
    playerShooter,
    stage,
  );

  player.onUpdate(({ me, delta, inputs }) => {
    if (finished) {
      me.$topDownMovement.moveX = 0;
      me.$topDownMovement.moveY = 0;
      me.resetVelocity();
      return;
    }
    playerInvulnerabilityMs = Math.max(
      0,
      playerInvulnerabilityMs - delta * 1000,
    );

    const { Horizontal, Vertical, SecondaryHorizontal, SecondaryVertical } =
      inputs.p1.axes;
    const aimX = SecondaryHorizontal.value;
    const aimY = -SecondaryVertical.value;
    playerCoordinator.update({
      moveX: Horizontal.value,
      moveY: -Vertical.value,
      aimX,
      aimY,
      shootPressed: false,
      shootHeld: Math.hypot(aimX, aimY) > 0.2,
    });
  });

  player.onCollision(({ entity, other, globals }) => {
    if (
      finished ||
      other.name !== 'robotron-enemy' ||
      playerInvulnerabilityMs > 0
    ) {
      return;
    }

    playerInvulnerabilityMs = 900;
    setGlobal('lives', Math.max(0, (globals.lives as number) - 1));
    entity.setPosition(0, 0, 0);
  });

  const scoreText = createText({
    name: 'robotronScore',
    text: 'Score: 0',
    fontSize: 20,
    stickToViewport: true,
    screenPosition: { x: 0.87, y: 0.05 },
  });

  const livesText = createText({
    name: 'robotronLives',
    text: 'Lives: 3',
    fontSize: 20,
    stickToViewport: true,
    screenPosition: { x: 0.12, y: 0.05 },
  });

  stage.add(player, ...enemies);
  stage.setInputConfiguration(
    mergeInputConfigs(useWASDForAxes('p1'), useArrowsForSecondaryAxes('p1')),
  );

  const game = createGame(
    {
      id: 'robotron',
      globals: {
        score: 0,
        lives: 3,
      },
    },
    stage,
    scoreText,
    livesText,
  )
    .onGlobalChange<number>('score', (score) => {
      const cleared = defeated.size === enemies.length;
      finished ||= cleared;
      if (finished && !cleared) return;
      scoreText.updateText(
        finished ? 'Arena cleared! — R to restart' : `Score: ${score}`,
      );
    })
    .onGlobalChange<number>('lives', (lives) => {
      finished ||= lives === 0;
      livesText.updateText(
        finished ? 'Game over — R to restart' : `Lives: ${lives}`,
      );
    });

  return game;
}
