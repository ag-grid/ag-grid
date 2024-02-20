import { Component } from "../../widgets/component";
export declare class RowContainerComp extends Component {
    private beans;
    private eViewport;
    private eContainer;
    private readonly name;
    private readonly type;
    private rowComps;
    private domOrder;
    private lastPlacedElement;
    constructor();
    private postConstruct;
    private preDestroy;
    private setRowCtrls;
    appendRow(element: HTMLElement): void;
    private ensureDomOrder;
}
