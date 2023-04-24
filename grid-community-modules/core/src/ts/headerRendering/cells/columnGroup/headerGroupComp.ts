import { ColumnModel } from "../../../columns/columnModel";
import { Autowired } from "../../../context/context";
import { ColumnGroup } from "../../../entities/columnGroup";
import { ProvidedColumnGroup } from "../../../entities/providedColumnGroup";
import { IComponent } from "../../../interfaces/iComponent";
import { AgGridCommon } from "../../../interfaces/iCommon";
import { setDisplayed } from "../../../utils/dom";
import { isStopPropagationForAgGrid, stopPropagationForAgGrid } from "../../../utils/event";
import { doOnce } from "../../../utils/function";
import { exists } from "../../../utils/generic";
import { createIconNoSpan } from "../../../utils/icon";
import { escapeString } from "../../../utils/string";
import { Component } from "../../../widgets/component";
import { RefSelector } from "../../../widgets/componentAnnotations";
import { TouchListener } from "../../../widgets/touchListener";

export interface IHeaderGroupParams<TData = any, TContext = any> extends AgGridCommon<TData, TContext> {
    /** The column group the header is for. */
    columnGroup: ColumnGroup;
    /**
     * The text label to render.
     * If the column is using a headerValueGetter, the displayName will take this into account.
     */
    displayName: string;
    /** Opens / closes the column group */
    setExpanded: (expanded: boolean) => void;
}

export interface IHeaderGroup { }

export interface IHeaderGroupComp extends IHeaderGroup, IComponent<IHeaderGroupParams> { }

export class HeaderGroupComp extends Component implements IHeaderGroupComp {

    @Autowired("columnModel") private columnModel: ColumnModel;

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

        this.checkWarnings();

        this.setupLabel();
        this.addGroupExpandIcon();
        this.setupExpandIcons();
    }

    private checkWarnings(): void {
        const paramsAny = this.params as any;

        if (paramsAny.template) {
            const message = `AG Grid: A template was provided for Header Group Comp - templates are only supported for Header Comps (not groups)`;
            doOnce(() => console.warn(message), 'HeaderGroupComp.templateNotSupported');
        }
    }

    private setupExpandIcons(): void {
        this.addInIcon("columnGroupOpened", "agOpened");
        this.addInIcon("columnGroupClosed", "agClosed");

        const expandAction = (event: MouseEvent) => {
            if (isStopPropagationForAgGrid(event)) {
                return;
            }

            const newExpandedValue = !this.params.columnGroup.isExpanded();
            this.columnModel.setColumnGroupOpened(this.params.columnGroup.getProvidedColumnGroup(), newExpandedValue, "uiColumnExpanded");
        };

        this.addTouchAndClickListeners(this.eCloseIcon, expandAction);
        this.addTouchAndClickListeners(this.eOpenIcon, expandAction);

        const stopPropagationAction = (event: MouseEvent) => {
            stopPropagationForAgGrid(event);
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

        const providedColumnGroup = this.params.columnGroup.getProvidedColumnGroup();
        this.addManagedListener(providedColumnGroup, ProvidedColumnGroup.EVENT_EXPANDED_CHANGED, this.updateIconVisibility.bind(this));
        this.addManagedListener(providedColumnGroup, ProvidedColumnGroup.EVENT_EXPANDABLE_CHANGED, this.updateIconVisibility.bind(this));
    }

    private addTouchAndClickListeners(eElement: HTMLElement, action: (event: MouseEvent) => void): void {
        const touchListener = new TouchListener(eElement, true);

        this.addManagedListener(touchListener, TouchListener.EVENT_TAP, action);
        this.addDestroyFunc(() => touchListener.destroy());
        this.addManagedListener(eElement, "click", action);
    }

    private updateIconVisibility(): void {
        const columnGroup = this.params.columnGroup;
        if (columnGroup.isExpandable()) {
            const expanded = this.params.columnGroup.isExpanded();
            setDisplayed(this.eOpenIcon, expanded);
            setDisplayed(this.eCloseIcon, !expanded);
        } else {
            setDisplayed(this.eOpenIcon, false);
            setDisplayed(this.eCloseIcon, false);
        }
    }

    private addInIcon(iconName: string, refName: string): void {
        const eIcon = createIconNoSpan(iconName, this.gridOptionsService, null);
        if (eIcon) {
            this.getRefElement(refName).appendChild(eIcon);
        }
    }

    private addGroupExpandIcon() {
        if (!this.params.columnGroup.isExpandable()) {
            setDisplayed(this.eOpenIcon, false);
            setDisplayed(this.eCloseIcon, false);
            return;
        }
    }

    private setupLabel(): void {
        // no renderer, default text render
        const { displayName, columnGroup } = this.params;

        if (exists(displayName)) {
            const displayNameSanitised = escapeString(displayName);
            this.getRefElement('agLabel').innerHTML = displayNameSanitised!;
        }

        this.addOrRemoveCssClass('ag-sticky-label', !!columnGroup.getColGroupDef()?.stickyLabel);
    }
}
