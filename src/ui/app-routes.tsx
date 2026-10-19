import type { RouteDefinition } from '@solidjs/router';
import { exampleRoutePaths } from '../examples-config';
import { HOME_ROUTE } from '../router-config';
import ExampleWorkspace from './ExampleWorkspace';

export const appRoutes: RouteDefinition[] = [
  {
    path: HOME_ROUTE,
    component: ExampleWorkspace,
  },
  ...exampleRoutePaths.map((routePath) => ({
    path: routePath,
    component: ExampleWorkspace,
  })),
];
