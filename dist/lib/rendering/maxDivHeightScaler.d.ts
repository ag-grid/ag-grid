// Type definitions for ag-grid-community v21.1.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { BeanStub } from "../context/beanStub";
import { GridPanel } from "../gridPanel/gridPanel";
/**
 * This class solves the 'max height' problem, where the user might want to show more data than
 * the max div height actually allows.
 */
export declare class MaxDivHeightScaler extends BeanStub {
    private eventService;
    private gridOptionsWrapper;
    private gridPanel;
    private maxDivHeight;
    private scaling;
    private modelHeight;
    private uiContainerHeight;
    private pixelsToShave;
    private offset;
    private scrollY;
    private uiBodyHeight;
    private maxScrollY;
    private scrollBarWidth;
    private postConstruct;
    registerGridComp(gridPanel: GridPanel): void;
    isScaling(): boolean;
    getOffset(): number;
    updateOffset(): void;
    private calculateOffset;
    private clearOffset;
    private setOffset;
    setModelHeight(modelHeight: number): void;
    getUiContainerHeight(): number;
    getRealPixelPosition(modelPixel: number): number;
    private getUiBodyHeight;
    getScrollPositionForPixel(rowTop: number): number;
}
