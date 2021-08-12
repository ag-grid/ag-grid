import { Component } from '../widgets/component';
import { HeaderRootComp } from '../headerRendering/headerRootComp';
export declare class GridBodyComp extends Component {
    private resizeObserverService;
    private rangeService;
    private eBodyViewport;
    private eTop;
    private eBottom;
    headerRootComp: HeaderRootComp;
    private ctrl;
    constructor();
    private init;
    private setRowAnimationCssOnBodyViewport;
    getFloatingTopBottom(): HTMLElement[];
}
