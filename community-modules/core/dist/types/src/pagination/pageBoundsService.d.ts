import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
export declare class PageBoundsService extends BeanStub implements NamedBean {
    beanName: "pageBoundsService";
    private rowModel;
    private topRowBounds;
    private bottomRowBounds;
    private pixelOffset;
    wireBeans(beans: BeanCollection): void;
    getFirstRow(): number;
    getLastRow(): number;
    getCurrentPageHeight(): number;
    getCurrentPagePixelRange(): {
        pageFirstPixel: number;
        pageLastPixel: number;
    };
    calculateBounds(topDisplayedRowIndex: number, bottomDisplayedRowIndex: number): void;
    getPixelOffset(): number;
    private calculatePixelOffset;
}
