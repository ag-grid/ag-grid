import type { BeanCollection } from '../../context/context';
import type { ComponentSelector } from '../../widgets/component';
import { Component } from '../../widgets/component';
export declare class RowContainerComp extends Component {
    private beans;
    wireBeans(beans: BeanCollection): void;
    private readonly eViewport;
    private readonly eContainer;
    private readonly name;
    private readonly options;
    private rowComps;
    private domOrder;
    private lastPlacedElement;
    constructor();
    postConstruct(): void;
    destroy(): void;
    private setRowCtrls;
    appendRow(element: HTMLElement): void;
    private ensureDomOrder;
}
export declare const RowContainerSelector: ComponentSelector;
