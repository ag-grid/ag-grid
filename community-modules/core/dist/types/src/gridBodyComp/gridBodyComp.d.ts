import type { BeanCollection } from '../context/context';
import type { ComponentSelector } from '../widgets/component';
import { Component } from '../widgets/component';
export declare class GridBodyComp extends Component {
    private resizeObserverService;
    private rangeService?;
    wireBeans(beans: BeanCollection): void;
    private readonly eBodyViewport;
    private readonly eStickyTop;
    private readonly eStickyBottom;
    private readonly eTop;
    private readonly eBottom;
    private readonly eBody;
    private ctrl;
    constructor();
    postConstruct(): void;
    private setRowAnimationCssOnBodyViewport;
    getFloatingTopBottom(): HTMLElement[];
}
export declare const GridBodySelector: ComponentSelector;
