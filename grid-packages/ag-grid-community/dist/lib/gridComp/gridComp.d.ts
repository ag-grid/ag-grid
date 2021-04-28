import { ManagedFocusComponent } from "../widgets/managedFocusComponent";
export declare class GridComp extends ManagedFocusComponent {
    private columnController;
    private loggerFactory;
    private gridBodyComp;
    private sideBarComp;
    private eRootWrapperBody;
    private logger;
    private eGridDiv;
    private con;
    constructor(eGridDiv: HTMLElement);
    protected postConstruct(): void;
    private insertGridIntoDom;
    private updateLayoutClasses;
    private createTemplate;
    getFocusableElement(): HTMLElement;
    protected getFocusableContainers(): HTMLElement[];
    protected focusInnerElement(fromBottom?: boolean): boolean;
    protected onTabKeyDown(): void;
}
