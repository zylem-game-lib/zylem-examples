import { callFunc, delay, sequence } from '@zylem/game-lib/actions';
import {
  ScreenWrapBehavior,
  Shooter2DBehavior,
  ThrusterBehavior,
} from '@zylem/game-lib/behavior';
import {
  createCamera,
  createGame,
  createStage,
  Perspectives,
} from '@zylem/game-lib/core';
import { createSprite, createText, destroy } from '@zylem/game-lib/entity';
import { setGlobal } from '@zylem/game-lib/globals';
import { Color } from 'three';
import { demoAsset } from '../../assets/manifest';
import { withBehavior } from '../_shared/behavior';
import { movementControls } from '../_shared/controls';

const playerShipImg = demoAsset('general/space/player-ship.png');
const playerLaserImg = demoAsset('general/space/player-laser.png');
const meteorBig1 = demoAsset('general/space/asteroids/meteor-big-1.png');
const meteorBig2 = demoAsset('general/space/asteroids/meteor-big-2.png');
const meteorBig3 = demoAsset('general/space/asteroids/meteor-big-3.png');
const meteorBig4 = demoAsset('general/space/asteroids/meteor-big-4.png');

export default function createDemo() {
  const PLAYFIELD_WIDTH = 30;
  const PLAYFIELD_HEIGHT = 20;
  const BULLET_SPEED = 18;
  let finished = false;
  const destroyedAsteroids = new Set<string>();
  const ASTEROID_SPEED = 1.1;
  const BRAKE_DECELERATION = 8;

  const asteroidImages = [
    meteorBig1,
    meteorBig2,
    meteorBig3,
    meteorBig4,
  ] as const;

  function getRotationAngle2D(rotation: {
    x: number;
    y: number;
    z: number;
    w: number;
  }) {
    return Math.atan2(
      2 * (rotation.w * rotation.z + rotation.x * rotation.y),
      1 - 2 * (rotation.y * rotation.y + rotation.z * rotation.z),
    );
  }

  function getForwardDirection(angle: number) {
    return {
      x: Math.sin(-angle),
      y: Math.cos(-angle),
    };
  }

  function createPlayerBullet() {
    const bullet = createSprite({
      name: 'player-bullet',
      images: [{ name: 'player-bullet', file: playerLaserImg }],
      size: { x: 0.35, y: 0.75, z: 1 },
    });

    bullet.runAction(
      sequence(
        delay(1600),
        callFunc(() => destroy(bullet)),
      ),
    );

    bullet.onCollision(
      ({ entity, other, globals }) => {
        if (
          finished ||
          other.name !== 'asteroid' ||
          destroyedAsteroids.has(other.uuid)
        ) {
          return;
        }

        destroyedAsteroids.add(other.uuid);
        destroy(entity);
        destroy(other);
        setGlobal('score', (globals.score as number) + 10);
      },
      { phase: 'enter' },
    );

    return bullet;
  }

  function createAsteroid(index: number) {
    const asteroid = createSprite({
      name: 'asteroid',
      images: [
        {
          name: `asteroid-${index}`,
          file: asteroidImages[index % asteroidImages.length]!,
        },
      ],
      size: { x: 1.6, y: 1.6, z: 1 },
      position: { x: -10 + index * 4.5, y: index % 2 === 0 ? 5 : -4, z: 0 },
    });

    asteroid.use(ScreenWrapBehavior, {
      width: PLAYFIELD_WIDTH,
      height: PLAYFIELD_HEIGHT,
    });

    const travelAngle = (index / 5) * Math.PI * 2 + Math.PI / 8;
    const velocity = {
      x: Math.cos(travelAngle) * ASTEROID_SPEED,
      y: Math.sin(travelAngle) * ASTEROID_SPEED,
    };

    asteroid.onSetup(({ me }) => {
      me.setRotationZ(travelAngle);
    });

    asteroid.onUpdate(({ me }) => {
      me.moveXY(velocity.x, velocity.y);
    });

    return asteroid;
  }

  const baseShip = createSprite({
    name: 'player-ship',
    images: [{ name: 'player-ship', file: playerShipImg }],
    size: { x: 1, y: 1, z: 1 },
    position: { x: 0, y: 0, z: 0 },
  });

  const playerShip = withBehavior(baseShip, ThrusterBehavior, {
    linearThrust: 3.2,
    angularThrust: 3,
    linearDamping: 0.3,
  });

  playerShip.use(ScreenWrapBehavior, {
    width: PLAYFIELD_WIDTH,
    height: PLAYFIELD_HEIGHT,
  });

  const playerShooter = playerShip.use(Shooter2DBehavior, {
    projectileFactory: createPlayerBullet,
    projectileSpeed: BULLET_SPEED,
    cooldownMs: 140,
    spawnOffset: { x: 0, y: 1.1 },
    rotateProjectile: true,
  });

  const camera = createCamera({
    position: { x: 0, y: 0, z: 12 },
    target: { x: 0, y: 0, z: 0 },
    zoom: 18,
    perspective: Perspectives.Fixed2D,
  });

  const stage = createStage(
    {
      backgroundColor: new Color('#04070f'),
    },
    camera,
  );

  playerShip.onUpdate(({ me, inputs, delta }) => {
    if (finished) {
      me.$thruster.thrust = 0;
      me.$thruster.rotate = 0;
      me.resetVelocity();
      return;
    }
    const { Horizontal, Vertical } = inputs.p1.axes;
    const { A } = inputs.p1.buttons;

    if (me.$thruster) {
      me.$thruster.thrustX = 0;
      me.$thruster.thrustY = 0;
      me.$thruster.rotate = Horizontal.value;
      me.$thruster.thrust = Math.max(0, -Vertical.value);
    }

    const brakeInput = Math.max(0, Vertical.value);
    const velocity = me.getVelocity();
    if (brakeInput > 0 && velocity) {
      const scale = Math.max(0, 1 - brakeInput * BRAKE_DECELERATION * delta);
      me.moveXY(velocity.x * scale, velocity.y * scale);
    }

    if (!A.pressed && A.held <= 0) {
      return;
    }

    const sourcePosition = me.getPosition();
    const sourceRotation = me.getRotation();
    if (!sourcePosition || !sourceRotation) {
      return;
    }

    const facingAngle = getRotationAngle2D(sourceRotation);
    const forward = getForwardDirection(facingAngle);
    void playerShooter.fire({
      source: me,
      stage,
      target: {
        x: sourcePosition.x + forward.x,
        y: sourcePosition.y + forward.y,
      },
    });
  });

  const scoreText = createText({
    name: 'scoreText',
    text: 'Score: 0',
    fontSize: 20,
    stickToViewport: true,
    screenPosition: { x: 0.88, y: 0.05 },
  });

  const asteroids = Array.from({ length: 5 }, (_, index) =>
    createAsteroid(index),
  );

  stage.add(playerShip, ...asteroids);
  stage.setInputConfiguration(movementControls);

  const game = createGame(
    {
      id: 'asteroids',
      globals: {
        score: 0,
      },
    },
    stage,
    scoreText,
  ).onGlobalChange<number>('score', (score) => {
    const cleared = destroyedAsteroids.size === asteroids.length;
    finished ||= cleared;
    if (finished && !cleared) return;
    scoreText.updateText(
      finished ? `You win! Score: ${score} — R to restart` : `Score: ${score}`,
    );
  });
  playerShip.onCollision(
    ({ other }) => {
      if (finished || other.name !== 'asteroid') return;
      finished = true;
      scoreText.updateText('Ship lost — R to restart');
    },
    { phase: 'enter' },
  );

  return game;
}
