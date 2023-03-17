import { BeanStub } from "../context/beanStub";
import { LoggerFactory } from "../logger";
/**
 * This class solves the 'max height' problem, where the user might want to show more data than
 * the max div height actually allows.
 */
export declare class RowContainerHeightService extends BeanStub {
    private ctrlsService;
    private maxDivHeight;
    private stretching;
    private modelHeight;
    private uiContainerHeight;
    private pixelsToShave;
    private divStretchOffset;
    private scrollY;
    private uiBodyHeight;
    private maxScrollY;
    private logger;
    agWire(loggerFactory: LoggerFactory): void;
    private postConstruct;
    isStretching(): boolean;
    getDivStretchOffset(): number;
    updateOffset(): void;
    private calculateOffset;
    private setUiContainerHeight;
    private clearOffset;
    private setDivStretchOffset;
    setModelHeight(modelHeight: number | null): void;
    getUiContainerHeight(): number | null;
    getRealPixelPosition(modelPixel: number): number;
    private getUiBodyHeight;
    getScrollPositionForPixel(rowTop: number): number;
}
