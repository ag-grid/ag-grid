import type { Component, ComponentSelector } from '../widgets/component';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface IWatermark {
    getWatermarkSelector(): ComponentSelector<Component>;
}
