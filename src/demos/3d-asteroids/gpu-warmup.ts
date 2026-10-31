import type { Camera, Mesh, Object3D, Sprite } from 'three';

type CompileRenderer = {
	compileAsync: (scene: Object3D, camera: Camera) => Promise<unknown>;
};

type StageRendererHost = {
	wrappedStage?: {
		rendererManager?: { renderer?: CompileRenderer | null } | null;
		scene?: { scene?: Object3D | null } | null;
		cameraRef?: { camera?: Camera | null } | null;
	} | null;
};

/**
 * WebGPU builds a pipeline the first time a mesh is actually drawn. Objects
 * that stay hidden until gameplay (the hit shield, thrusters, bursts) pay
 * that cost on the frame they turn on. Revealing them with frustum culling
 * off, off camera, lets `compileAsync` do the work during startup instead.
 */
export function revealForCompile(root: Object3D): () => void {
	const snapshots: Array<{
		object: Object3D;
		visible: boolean;
		frustumCulled: boolean | null;
	}> = [];

	root.traverse((object) => {
		const drawable = object as Mesh | Sprite;
		const frustumCulled = isDrawable(drawable) ? drawable.frustumCulled : null;
		snapshots.push({ object, visible: object.visible, frustumCulled });
		if (frustumCulled !== null) {
			drawable.frustumCulled = false;
		}
		object.visible = true;
	});

	return () => {
		for (const snapshot of snapshots) {
			snapshot.object.visible = snapshot.visible;
			if (snapshot.frustumCulled !== null) {
				(snapshot.object as Mesh).frustumCulled = snapshot.frustumCulled;
			}
		}
	};
}

export function readStageRenderer(stage: StageRendererHost | null | undefined): {
	renderer: CompileRenderer;
	scene: Object3D;
	camera: Camera;
} | null {
	const wrapped = stage?.wrappedStage;
	const renderer = wrapped?.rendererManager?.renderer;
	const scene = wrapped?.scene?.scene;
	const camera = wrapped?.cameraRef?.camera;
	if (!renderer?.compileAsync || !scene || !camera) {
		return null;
	}
	return { renderer, scene, camera };
}

export async function compileScene(
	stage: StageRendererHost | null | undefined,
	roots: Array<Object3D | null | undefined>,
): Promise<void> {
	const context = readStageRenderer(stage);
	if (!context) {
		return;
	}

	const restores = roots.filter((root): root is Object3D => Boolean(root)).map(revealForCompile);
	try {
		await context.renderer.compileAsync(context.scene, context.camera);
	} finally {
		for (const restore of restores) {
			restore();
		}
	}
}

function isDrawable(object: Object3D): object is Mesh | Sprite {
	return Boolean((object as Mesh).isMesh || (object as Sprite).isSprite || (object as { isPoints?: boolean }).isPoints);
}
