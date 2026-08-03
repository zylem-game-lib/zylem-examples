/**
 * Vite resolves this module worker entry for {@link Destructible3DBehavior} prebake.
 *
 * The worker source is vendored at `src/workers/destructible-prebake/`.
 * The `?worker&url` Vite import suffix makes Vite emit the worker as a
 * separate, browser-loadable module in both `vite dev` and `vite build`.
 */
import workerUrl from '../../workers/destructible-prebake/worker.ts?worker&url';

export const destructiblePrebakeWorkerUrl = workerUrl;
