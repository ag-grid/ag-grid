import type { AgSingletonBean } from 'ag-stack';

import type { BeanCollection } from './context';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface Bean extends AgSingletonBean<BeanCollection> {}

/**
 * For any Bean that is required via auto wired or extracted by name from the Context must have a beanName
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export type NamedBean = Required<Pick<Bean, 'beanName'>>;
