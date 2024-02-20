import type { Node } from '../scene/node';
import type { Selection } from '../scene/selection';
/**
 * Implements a per-node reset.
 *
 * @param selections contains nodes to be reset
 * @param propsFn callback to determine per-node properties
 */
export declare function resetMotion<N extends Node, T extends Partial<N>, D>(selectionsOrNodes: Selection<N, D>[] | N[], propsFn: (node: N, datum: D) => T): void;
