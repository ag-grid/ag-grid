import type { Component } from '../widgets/component';

export interface IRowGroupPanelBuilder {
    createRowGroupDropZone(horizontal: boolean): Component;
    createPivotDropZone(horizontal: boolean): Component;
}
