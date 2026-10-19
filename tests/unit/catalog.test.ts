import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { catalog, EXAMPLE_SECTION_ORDER } from '../../src/example-catalog.ts';

const expected = {
  'Game Demos': [
    'Zario 64',
    'Zario',
    'Escape Zylocity',
    'Zylem Invaders',
    'Zylem Strike',
    'Zylem Craft',
    'Zylem Tourismo',
  ],
  Remakes: [
    'Pong',
    'Breakout',
    'Asteroids',
    'Robotron',
    'Joust',
    'Flappy Bird',
    'Fake game',
  ],
  Basic: [
    'Entities',
    'Stages',
    'Actions',
    'Behaviors',
    'Basic',
    'Input',
    'Stage Test',
    'Vessel Test',
    'State/UI',
    'Boxes',
    'Basic Entities',
    'Groups',
    'Sprites',
    'Actor',
    'Sounds',
    'Shaders',
  ],
};

test('the curated catalog matches the requested names and order', () => {
  assert.deepEqual(EXAMPLE_SECTION_ORDER, Object.keys(expected));
  for (const section of EXAMPLE_SECTION_ORDER) {
    assert.deepEqual(
      catalog
        .filter((entry) => entry.section === section)
        .map((entry) => entry.name),
      expected[section],
    );
  }
});

test('every entry has a source, controls, objective and a unique route', () => {
  const routes = new Set<string>();
  for (const entry of catalog) {
    assert.ok(entry.controls && entry.description, entry.id);
    assert.ok(
      existsSync(
        new URL(
          `../../src/demos/${entry.source}/${entry.source}.ts`,
          import.meta.url,
        ),
      ),
      entry.source,
    );
    for (const route of [entry.id, ...(entry.legacyIds ?? [])]) {
      assert.ok(!routes.has(route), `Duplicate route: ${route}`);
      routes.add(route);
    }
  }
});
