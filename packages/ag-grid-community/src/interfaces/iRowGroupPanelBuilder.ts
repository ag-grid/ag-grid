import type { Component } from '../widgets/component';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface IRowGroupPanelBuilder {
    createRowGroupDropZone(horizontal: boolean): Component;
    createPivotDropZone(horizontal: boolean): Component;
}
