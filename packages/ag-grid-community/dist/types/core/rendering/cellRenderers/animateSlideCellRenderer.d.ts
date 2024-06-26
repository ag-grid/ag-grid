import type { BeanCollection } from '../../context/context';
import { Component } from '../../widgets/component';
import type { ICellRenderer } from './iCellRenderer';
export declare class AnimateSlideCellRenderer extends Component implements ICellRenderer {
    private eCurrent;
    private ePrevious;
    private lastValue;
    private refreshCount;
    private filterManager?;
    wireBeans(beans: BeanCollection): void;
    constructor();
    init(params: any): void;
    addSlideAnimation(): void;
    refresh(params: any, isInitialRender?: boolean): boolean;
}
