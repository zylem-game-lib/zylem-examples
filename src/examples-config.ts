import type { Game } from '@zylem/game-lib/core';
import {
	catalog,
	EXAMPLE_SECTION_ORDER,
	type ExampleSectionName,
} from './example-catalog';
import {
	getDemoRoutePath,
	getDemoRouteSlug,
	normalizePathname,
} from './router-config';

export {
	EXAMPLE_SECTION_ORDER,
	type ExampleSectionName,
} from './example-catalog';
export type GameModule = { default: () => Game<any> };
export interface ExampleConfig {
	id: string;
	name: string;
	path: string;
	section: ExampleSectionName;
	routeSlug: string;
	routePath: string;
	description: string;
	controls: string;
	load: () => Promise<GameModule>;
}
export interface ExampleSection {
	name: ExampleSectionName;
	examples: ExampleConfig[];
}

const modules = import.meta.glob<GameModule>('./demos/*/*.ts');
function entry(
	id: string,
	name: string,
	source: string,
	section: ExampleSectionName,
	description = '',
	controls = '',
): ExampleConfig {
	const path = `./demos/${source}/${source}.ts`;
	const load = modules[path];
	if (!load) throw new Error(`Missing example entrypoint: ${path}`);
	return {
		id,
		name,
		path,
		section,
		description,
		controls,
		routeSlug: getDemoRouteSlug(id),
		routePath: getDemoRoutePath(id),
		load,
	};
}

export const examples = catalog.map(
	({ id, name, source, section, description, controls }) =>
		entry(id, name, source, section, description, controls),
);
export const exampleSections: ExampleSection[] = EXAMPLE_SECTION_ORDER.map(
	(name) => ({
		name,
		examples: examples.filter((example) => example.section === name),
	}),
);

// Bookmarked routes continue to work, without adding experiments to the sidebar.
const byRoute = new Map(
	examples.map((example) => [example.routePath, example]),
);
for (const [index, definition] of catalog.entries()) {
	for (const id of definition.legacyIds ?? [])
		byRoute.set(getDemoRoutePath(id), examples[index]!);
}
for (const path of Object.keys(modules)) {
	const match = path.match(/\/([^/_][^/]*)\/\1\.ts$/);
	const id = match?.[1];
	if (id && !byRoute.has(getDemoRoutePath(id))) {
		const name = id
			.split('-')
			.map((word) => word[0]!.toUpperCase() + word.slice(1))
			.join(' ');
		byRoute.set(
			getDemoRoutePath(id),
			entry(id, name, id, 'Basic', 'Retained experimental demo.'),
		);
	}
}
export const exampleRoutePaths = [...byRoute.keys()];
export const getExampleByRoutePath = (pathname: string) =>
	byRoute.get(normalizePathname(pathname)) ?? null;
