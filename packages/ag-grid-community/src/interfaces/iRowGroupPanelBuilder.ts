import type { Component } from '../widgets/component';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface IRowGroupPanelBuilder {
    /**
     * @param horizontal  rendered as a header drop zone vs. embedded in the tool panel.
     * @param embedded    true when the drop zone is hosted inside another focus container
     *                    (e.g. the Toolbar) and should not register its own tab hand-off.
     */
    createRowGroupDropZone(horizontal: boolean, embedded?: boolean): Component;
    createPivotDropZone(horizontal: boolean, embedded?: boolean): Component;
}
