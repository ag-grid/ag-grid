// Type definitions for @ag-grid-community/core v28.2.1
// Project: https://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { TabGuardComp } from "../widgets/tabGuardComp";
export declare class GridComp extends TabGuardComp {
    private readonly loggerFactory;
    private readonly gridBodyComp;
    private readonly sideBarComp;
    private readonly eRootWrapperBody;
    private logger;
    private eGridDiv;
    private ctrl;
    constructor(eGridDiv: HTMLElement);
    private postConstruct;
    private insertGridIntoDom;
    private updateLayoutClasses;
    private createTemplate;
    getFocusableElement(): HTMLElement;
    protected getFocusableContainers(): HTMLElement[];
}
