import { callFunc, delay, sequence } from '@zylem/game-lib/actions';
import {
	Destructible3DBehavior,
	FractureOptions,
	type Destructible3DHandle,
} from '@zylem/game-lib/behavior';
import { createActor, createSphere, destroy } from '@zylem/game-lib/entity';
import { createEnergyShield } from '@zylem/shaders';
import { Color, Vector3 } from 'three';
import { demoAsset } from '../../assets/manifest';
import { destructiblePrebakeWorkerUrl } from '../_shared/destructible-prebake-worker-url';
import {
	SHIP_MODEL_TILT_X,
	SHIP_MODEL_YAW_OFFSET,
	getFirstMesh,
	getModelRoot,
} from './shared';

const fisherShipGlb = demoAsset('general/player-ship.glb');

export type ShipRuntime = {
	entity: ReturnType<typeof createActor>;
	destructible: Destructible3DHandle;
	shield: ReturnType<typeof createSphere>;
	explode: (impactWorld?: Vector3) => boolean;
};

export function setEntityVisibility(
	entity: {
		group?: { visible: boolean } | null;
		mesh?: { visible: boolean } | null;
	},
	visible: boolean,
) {
	if (entity.group) {
		entity.group.visible = visible;
	}
	if (entity.mesh) {
		entity.mesh.visible = visible;
	}
}

export function createShip(): ShipRuntime {
	const ship = createActor({
		name: '3d-asteroids-ship',
		models: [fisherShipGlb],
		scale: { x: 0.85, y: 0.85, z: 0.85 },
		collisionShape: 'bounds',
		collision: {
			size: { x: 0.82, y: 0.96, z: 0.72 },
			position: { x: 0, y: -0.14, z: 0 },
		},
		position: { x: 0, y: 0, z: 0 },
	});
	const shield = createSphere({
		name: '3d-asteroids-ship-shield',
		radius: 1.22,
		position: { x: 0, y: 0, z: 0 },
		material: {
			shader: createEnergyShield(),
			opacity: 0.74,
		},
		collision: {
			static: true,
			sensor: true,
		},
		collisionType: 'ship-shield',
		collisionFilter: [],
	});
	const destructible = ship.use(Destructible3DBehavior, {
		fractureOptions: new FractureOptions({
			fractureMethod: 'voronoi',
			fragmentCount: 10,
			voronoiOptions: {
				mode: '3D',
			},
			seed: 41,
		}),
		prebakeWorkerUrl: destructiblePrebakeWorkerUrl,
		collider: {
			shape: 'cuboid',
		},
		fragmentPhysics: {
			mode: 'independent',
			inheritSourceVelocity: false,
			outwardVelocity: 4.2,
			angularVelocity: 1.8,
		},
	});
	let warmedUp = false;
	let exploded = false;

	ship.onSetup(({ me }) => {
		me.body?.setGravityScale(0, true);
		me.body?.setLinearDamping(0);
		me.setRotation(0, 0, 0);
		bindPrimaryMesh();
	});
	shield.onSetup(() => {
		setEntityVisibility(shield, false);
	});

	ship.listen('entity:model:loaded', () => {
		orientShipModel(ship);
		bindPrimaryMesh();
	});

	function warmupDestructible() {
		if (warmedUp || !ship.mesh) {
			return;
		}

		// Worker prebake keeps Voronoi off the main thread; game-lib dedupes concurrent
		// prebakeAsync calls on this same behavior handle.
		void destructible.prebakeAsync().then(
			() => {
				warmedUp = true;
			},
			(error) => {
				console.warn('Failed to warm destructible ship', error);
			},
		);
	}

	function bindPrimaryMesh() {
		const primaryMesh = getFirstMesh(ship.group);
		if (!primaryMesh) {
			return;
		}

		ship.mesh = primaryMesh;
		warmupDestructible();
	}

	return {
		entity: ship,
		destructible,
		shield,
		explode(impactWorld?: Vector3) {
			if (exploded || !ship.mesh) {
				return false;
			}

			exploded = true;
			destructible.fracture();
			return true;
		},
	};
}

export function orientShipModel(ship: ShipRuntime['entity']) {
	const modelRoot = getModelRoot(ship);
	if (!modelRoot) {
		return;
	}

	modelRoot.rotation.set(SHIP_MODEL_TILT_X, 0, SHIP_MODEL_YAW_OFFSET);
}

export function createProjectile(
	position: Vector3,
	velocity: Vector3,
	sourceUuid: string,
	onAsteroidHit: (
		otherUuid: string,
		hitPosition: Vector3,
		globals: Record<string, unknown>,
	) => boolean,
) {
	const bullet = createSphere({
		name: '3d-asteroids-projectile',
		radius: 0.14,
		position: { x: position.x, y: position.y, z: 0 },
		material: {
			color: new Color('#ffe08a'),
		},
	});

	bullet.onSetup(({ me }) => me.moveXY(velocity.x, velocity.y));
	bullet.runAction(
		sequence(
			delay(1150),
			callFunc(() => destroy(bullet)),
		),
	);

	bullet.onCollision(
		({ entity, other, globals }) => {
			if (other.uuid === sourceUuid) {
				return;
			}

			const hitPosition = entity.getPosition();
			if (!hitPosition) {
				return;
			}

			const didHitAsteroid = onAsteroidHit(
				other.uuid,
				new Vector3(hitPosition.x, hitPosition.y, hitPosition.z ?? 0),
				globals,
			);
			if (didHitAsteroid) {
				destroy(entity, globals);
			}
		},
		{
			phase: 'enter',
		},
	);

	return bullet;
}
