import { Component } from "../../widgets/component";
import { IComponent } from "../../interfaces/iComponent";
import { ColumnGroup } from "../../entities/columnGroup";
import { ColumnApi } from "../../columnController/columnApi";
import { ColumnController } from "../../columnController/columnController";
import { GridOptionsWrapper } from "../../gridOptionsWrapper";
import { Autowired } from "../../context/context";
import { TouchListener } from "../../widgets/touchListener";
import { RefSelector } from "../../widgets/componentAnnotations";
import { OriginalColumnGroup } from "../../entities/originalColumnGroup";
import { GridApi } from "../../gridApi";
import { _ } from "../../utils";

export interface IHeaderGroupParams {
    columnGroup: ColumnGroup;
    displayName: string;
    setExpanded: (expanded: boolean) => void;
    api: GridApi;
    columnApi: ColumnApi;
    context: any;
}

export interface IHeaderGroup { }

export interface IHeaderGroupComp extends IHeaderGroup, IComponent<IHeaderGroupParams> { }

export class HeaderGroupComp extends Component implements IHeaderGroupComp {

    @Autowired("columnController") private columnController: ColumnController;
    @Autowired("gridOptionsWrapper") private gridOptionsWrapper: GridOptionsWrapper;

    static TEMPLATE = /* html */
        `<div class="ag-header-group-cell-label" ref="agContainer" role="presentation">
            <span ref="agLabel" class="ag-header-group-text" role="presentation"></span>
            <span ref="agOpened" class="ag-header-icon ag-header-expand-icon ag-header-expand-icon-expanded"></span>
            <span ref="agClosed" class="ag-header-icon ag-header-expand-icon ag-header-expand-icon-collapsed"></span>
        </div>`;

    private params: IHeaderGroupParams;

    @RefSelector("agOpened") private eOpenIcon: HTMLElement;
    @RefSelector("agClosed") private eCloseIcon: HTMLElement;

    constructor() {
        super(HeaderGroupComp.TEMPLATE);
    }

    // this is a user component, and IComponent has "public destroy()" as part of the interface.
    // so we need to override destroy() just to make the method public.
    public destroy(): void {
        super.destroy();
    }

    public init(params: IHeaderGroupParams): void {
        this.params = params;

        this.setupLabel();
        this.addGroupExpandIcon();
        this.setupExpandIcons();
    }

    private setupExpandIcons(): void {
        this.addInIcon("columnGroupOpened", "agOpened");
        this.addInIcon("columnGroupClosed", "agClosed");

        const expandAction = (event: MouseEvent) => {
            if (_.isStopPropagationForAgGrid(event)) {
                return;
            }

            const newExpandedValue = !this.params.columnGroup.isExpanded();
            this.columnController.setColumnGroupOpened(this.params.columnGroup.getOriginalColumnGroup(), newExpandedValue, "uiColumnExpanded");
        };

        this.addTouchAndClickListeners(this.eCloseIcon, expandAction);
        this.addTouchAndClickListeners(this.eOpenIcon, expandAction);

        const stopPropagationAction = (event: MouseEvent) => {
            _.stopPropagationForAgGrid(event);
        };

        // adding stopPropagation to the double click for the icons prevents double click action happening
        // when the icons are clicked. if the icons are double clicked, then the groups should open and
        // then close again straight away. if we also listened to double click, then the group would open,
        // close, then open, which is not what we want. double click should only action if the user double
        // clicks outside of the icons.
        this.addManagedListener(this.eCloseIcon, "dblclick", stopPropagationAction);
        this.addManagedListener(this.eOpenIcon, "dblclick", stopPropagationAction);

        this.addManagedListener(this.getGui(), "dblclick", expandAction);

        this.updateIconVisibility();

        const originalColumnGroup = this.params.columnGroup.getOriginalColumnGroup();
        this.addManagedListener(originalColumnGroup, OriginalColumnGroup.EVENT_EXPANDED_CHANGED, this.updateIconVisibility.bind(this));
        this.addManagedListener(originalColumnGroup, OriginalColumnGroup.EVENT_EXPANDABLE_CHANGED, this.updateIconVisibility.bind(this));
    }

    private addTouchAndClickListeners(eElement: HTMLElement, action: (event: MouseEvent) => void): void {
        const touchListener = new TouchListener(eElement);

        this.addManagedListener(touchListener, TouchListener.EVENT_TAP, action);
        this.addDestroyFunc(() => touchListener.destroy());
        this.addManagedListener(eElement, "click", action);
    }

    private updateIconVisibility(): void {
        const columnGroup = this.params.columnGroup;
        if (columnGroup.isExpandable()) {
            const expanded = this.params.columnGroup.isExpanded();
            _.setDisplayed(this.eOpenIcon, expanded);
            _.setDisplayed(this.eCloseIcon, !expanded);
        } else {
            _.setDisplayed(this.eOpenIcon, false);
            _.setDisplayed(this.eCloseIcon, false);
        }
    }

    private addInIcon(iconName: string, refName: string): void {
        const eIcon = _.createIconNoSpan(iconName, this.gridOptionsWrapper, null);
        this.getRefElement(refName).appendChild(eIcon);
    }

    private addGroupExpandIcon() {
        if (!this.params.columnGroup.isExpandable()) {
            _.setDisplayed(this.eOpenIcon, false);
            _.setDisplayed(this.eCloseIcon, false);
            return;
        }
    }

    private setupLabel(): void {
        // no renderer, default text render
        const displayName = this.params.displayName;

        if (_.exists(displayName)) {
            const displayNameSanitised = _.escape(displayName);
            this.getRefElement("agLabel").innerHTML = displayNameSanitised;
        }
    }
}
