import { ColumnApi } from "../../../columns/columnApi";
import { ColumnModel } from "../../../columns/columnModel";
import { UserComponentFactory } from "../../../components/framework/userComponentFactory";
import { KeyCode } from '../../../constants/keyCode';
import { Autowired, PostConstruct, PreDestroy } from "../../../context/context";
import { DragAndDropService, DragItem, DragSource, DragSourceType } from "../../../dragAndDrop/dragAndDropService";
import { ColDef } from "../../../entities/colDef";
import { Column } from "../../../entities/column";
import { Events } from "../../../events";
import { GridApi } from "../../../gridApi";
import { IMenuFactory } from "../../../interfaces/iMenuFactory";
import { Beans } from "../../../rendering/beans";
import { ColumnHoverService } from "../../../rendering/columnHoverService";
import { SetLeftFeature } from "../../../rendering/features/setLeftFeature";
import { ITooltipParams } from "../../../rendering/tooltipComponent";
import { SortController } from "../../../sortController";
import { getAriaSortState, removeAriaSort, setAriaDescribedBy, setAriaSort } from "../../../utils/aria";
import { addOrRemoveCssClass, setDisplayed } from "../../../utils/dom";
import { AgCheckbox } from "../../../widgets/agCheckbox";
import { RefSelector } from "../../../widgets/componentAnnotations";
import { ManagedFocusFeature } from "../../../widgets/managedFocusFeature";
import { CssClassApplier } from "../cssClassApplier";
import { HoverFeature } from "../hoverFeature";
import { AbstractHeaderCellComp } from "../abstractCell/abstractHeaderCellComp";
import { HeaderCellCtrl, IHeaderCellComp } from "./headerCellCtrl";
import { HeaderComp, IHeaderComp, IHeaderParams } from "./headerComp";
import { SelectAllFeature } from "./selectAllFeature";

export class HeaderCellComp extends AbstractHeaderCellComp {

    private static TEMPLATE = /* html */
        `<div class="ag-header-cell" role="columnheader" unselectable="on" tabindex="-1">
            <div ref="eResize" class="ag-header-cell-resize" role="presentation"></div>
        </div>`;
        // <ag-checkbox ref="cbSelectAll" class="ag-header-select-all" role="presentation"></ag-checkbox>

    @Autowired('gridApi') private gridApi: GridApi;
    @Autowired('columnApi') private columnApi: ColumnApi;
    @Autowired('sortController') private sortController: SortController;
    @Autowired('userComponentFactory') private userComponentFactory: UserComponentFactory;
    @Autowired('beans') protected beans: Beans;

    @RefSelector('eResize') private eResize: HTMLElement;
    @RefSelector('cbSelectAll') private cbSelectAll: AgCheckbox;

    protected readonly column: Column;
    protected readonly pinned: string | null;

    private headerComp: IHeaderComp | undefined;
    private headerCompGui: HTMLElement | undefined;

    private headerCompVersion = 0;

    private colDefHeaderComponent?: string | { new(): any; };
    private colDefHeaderComponentFramework?: any;

    private ctrl: HeaderCellCtrl;

    constructor(ctrl: HeaderCellCtrl) {
        super(HeaderCellComp.TEMPLATE);
        this.column = ctrl.getColumnGroupChild() as Column;
        this.pinned = ctrl.getPinned();
        this.ctrl = ctrl;
    }

    public getColumn(): Column {
        return this.column;
    }

    @PostConstruct
    private postConstruct(): void {

        const eGui = this.getGui();

        const setAttribute = (name: string, value: string | null | undefined, element?: HTMLElement) => {
            const actualElement = element ? element : eGui;
            if (value != null && value != '') {
                actualElement.setAttribute(name, value);
            } else {
                actualElement.removeAttribute(name);
            }
        };

        const compProxy: IHeaderCellComp = {
            focus: ()=> this.getFocusableElement().focus(),
            setWidth: width => eGui.style.width = width,
            addOrRemoveCssClass: (cssClassName, on) => this.addOrRemoveCssClass(cssClassName, on),
            setResizeDisplayed: displayed => setDisplayed(this.eResize, displayed),
            setAriaSort: sort => sort ? setAriaSort(eGui, sort) : removeAriaSort(eGui),
            setColId: id => setAttribute('col-id', id),
            setTitle: title => setAttribute('title', title),
            setAriaDescribedBy: value => setAriaDescribedBy(eGui, value),

            refreshHeaderComp: ()=> this.refreshHeaderComp(),
            temp_getHeaderComp: ()=> this.headerComp
        };

        this.ctrl.setComp(compProxy, this.getGui(), this.eResize);

        const selectAllGui = this.ctrl.getSelectAllGui();
        this.eResize.insertAdjacentElement('afterend', selectAllGui);

        this.appendHeaderComp();
    }

    private refreshHeaderComp(): void {
        // if no header comp created yet, it's cos of async creation, so first version is yet
        // to get here, in which case nothing to refresh
        if (!this.headerComp) { return; }

        const colDef = this.column.getColDef();
        const newHeaderCompConfigured =
            this.colDefHeaderComponent != colDef.headerComponent
            || this.colDefHeaderComponentFramework != colDef.headerComponentFramework;

        const headerCompRefreshed = newHeaderCompConfigured ? false : this.attemptHeaderCompRefresh();

        if (headerCompRefreshed) {
            // we do this as a refresh happens after colDefs change, and it's possible the column has had it's
            // draggable property toggled. no need to call this if not refreshing, as setDragSource is done
            // as part of appendHeaderComp
            this.ctrl.setDragSource(this.headerCompGui!);
        } else {
            this.appendHeaderComp();
        }        
    }

    @PreDestroy
    private destroyHeaderComp(): void {
        if (this.headerComp) {
            this.getGui().removeChild(this.headerCompGui!);
            this.headerComp = this.destroyBean(this.headerComp);
            this.headerCompGui = undefined;
        }
    }

    public attemptHeaderCompRefresh(): boolean {
        // if no refresh method, then we want to replace the headerComp
        if (!this.headerComp!.refresh) { return false; }

        // if the cell renderer has a refresh method, we call this instead of doing a refresh
        const params = this.createParams();

        // take any custom params off of the user
        const finalParams = this.userComponentFactory.mergeParamsWithApplicationProvidedParams(this.getComponentHolder(), 'headerComponent', params);

        const res = this.headerComp!.refresh(finalParams);

        return res;
    }

    public getComponentHolder(): ColDef {
        return this.column.getColDef();
    }

    private appendHeaderComp(): void {
        this.headerCompVersion++;

        const colDef = this.column.getColDef();
        this.colDefHeaderComponent = colDef.headerComponent;
        this.colDefHeaderComponentFramework = colDef.headerComponentFramework;

        const params = this.createParams();
        const callback = this.afterHeaderCompCreated.bind(this, this.headerCompVersion);
        this.userComponentFactory.newHeaderComponent(params)!.then(callback);

        this.ctrl.setDragSource(this.headerCompGui!);
    }

    private createParams(): IHeaderParams {

        const colDef = this.column.getColDef();

        const params = {
            column: this.column,
            displayName: this.ctrl.temp_getDisplayName(),
            enableSorting: colDef.sortable,
            enableMenu: this.ctrl.isMenuEnabled(),
            showColumnMenu: (source: HTMLElement) => {
                this.gridApi.showColumnMenuAfterButtonClick(this.column, source);
            },
            progressSort: (multiSort?: boolean) => {
                this.sortController.progressSort(this.column, !!multiSort, "uiColumnSorted");
            },
            setSort: (sort: string, multiSort?: boolean) => {
                this.sortController.setSortForColumn(this.column, sort, !!multiSort, "uiColumnSorted");
            },
            api: this.gridApi,
            columnApi: this.columnApi,
            context: this.gridOptionsWrapper.getContext(),
            eGridHeader: this.getGui()
        } as IHeaderParams;
        return params;
    }

    private afterHeaderCompCreated(version: number, headerComp: IHeaderComp): void {

        if (version != this.headerCompVersion || !this.isAlive()) {
            this.destroyBean(headerComp);
            return;
        }

        this.destroyHeaderComp();

        this.headerComp = headerComp;
        this.headerCompGui = headerComp.getGui();
        this.getGui().appendChild(this.headerCompGui);
    }
}
