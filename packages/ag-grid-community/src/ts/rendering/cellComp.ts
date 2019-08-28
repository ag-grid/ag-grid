import { Column } from "../entities/column";
import { CellChangedEvent, RowNode } from "../entities/rowNode";
import { Constants } from "../constants";
import {
    CellClickedEvent,
    CellContextMenuEvent,
    CellDoubleClickedEvent,
    CellEditingStartedEvent,
    CellEditingStoppedEvent,
    CellEvent,
    CellMouseDownEvent,
    CellMouseOutEvent,
    CellMouseOverEvent,
    Events,
    FlashCellsEvent
} from "../events";
import { Beans } from "./beans";
import { Component } from "../widgets/component";
import { ICellEditorComp, ICellEditorParams } from "../interfaces/iCellEditor";
import { ICellRendererComp, ICellRendererParams } from "./cellRenderers/iCellRenderer";
import { CheckboxSelectionComponent } from "./checkboxSelectionComponent";
import { ColDef, NewValueParams } from "../entities/colDef";
import { CellPosition } from "../entities/cellPosition";
import { CellRange, CellRangeType, ISelectionHandle } from "../interfaces/iRangeController";
import { RowComp } from "./rowComp";
import { RowDragComp } from "./rowDragComp";
import { PopupEditorWrapper } from "./cellEditors/popupEditorWrapper";
import { _, Promise } from "../utils";
import { IFrameworkOverrides } from "../interfaces/iFrameworkOverrides";
import { DndSourceComp } from "./dndSourceComp";

export class CellComp extends Component {

    public static DOM_DATA_KEY_CELL_COMP = 'cellComp';

    private static CELL_RENDERER_TYPE_NORMAL = 'cellRenderer';
    private static CELL_RENDERER_TYPE_PINNED = 'pinnedRowCellRenderer';

    private eCellWrapper: HTMLElement;
    private eParentOfValue: HTMLElement;

    private beans: Beans;
    private column: Column;
    private rowNode: RowNode;
    private eParentRow: HTMLElement;
    private cellPosition: CellPosition;
    private rangeCount: number;
    private hasChartRange: boolean;

    private usingWrapper: boolean;

    private includeSelectionComponent: boolean;
    private includeRowDraggingComponent: boolean;
    private includeDndSourceComponent: boolean;

    private cellFocused: boolean;
    private editingCell = false;
    private cellEditorInPopup: boolean;
    private hideEditorPopup: Function | null;

    private lastIPadMouseClickEvent: number;

    // true if we are using a cell renderer
    private usingCellRenderer: boolean;
    // the cellRenderer class to use - this is decided once when the grid is initialised
    private cellRendererType: string;

    // instance of the cellRenderer class
    private cellRenderer: ICellRendererComp | null;
    // the GUI is initially element or string, however once the UI is created, it becomes UI
    private cellRendererGui: HTMLElement | null;
    private cellEditor: ICellEditorComp | null;
    private selectionHandle: ISelectionHandle | null;

    private autoHeightCell: boolean;

    private firstRightPinned: boolean;
    private lastLeftPinned: boolean;

    private rowComp: RowComp;

    private rangeSelectionEnabled: boolean;

    private value: any;
    private valueFormatted: any;
    private colsSpanning: Column[];
    private rowSpan: number;

    private suppressRefreshCell = false;

    private tooltip: any;

    private scope: any = null;

    private readonly printLayout: boolean;

    // every time we go into edit mode, or back again, this gets incremented.
    // it's the components way of dealing with the async nature of framework components,
    // so if a framework component takes a while to be created, we know if the object
    // is still relevant when creating is finished. eg we could click edit / un-edit 20
    // times before the first React edit component comes back - we should discard
    // the first 19.
    private cellEditorVersion = 0;
    private cellRendererVersion = 0;

    constructor(scope: any, beans: Beans, column: Column, rowNode: RowNode, rowComp: RowComp,
                autoHeightCell: boolean, printLayout: boolean) {
        super();
        this.scope = scope;
        this.beans = beans;
        this.column = column;
        this.rowNode = rowNode;
        this.rowComp = rowComp;
        this.autoHeightCell = autoHeightCell;
        this.printLayout = printLayout;

        this.createGridCellVo();

        this.rangeSelectionEnabled = beans.gridOptionsWrapper.isEnableRangeSelection();
        this.cellFocused = this.beans.focusedCellController.isCellFocused(this.cellPosition);
        this.firstRightPinned = this.column.isFirstRightPinned();
        this.lastLeftPinned = this.column.isLastLeftPinned();

        if (this.rangeSelectionEnabled) {
            const { rangeController } = this.beans;
            this.rangeCount = rangeController.getCellRangeCount(this.cellPosition);

            if (this.rangeCount) {
                this.hasChartRange = rangeController.getCellRanges().every(range => _.exists(range.type));
            }
        }

        this.getValueAndFormat();
        this.setUsingWrapper();
        this.chooseCellRenderer();
        this.setupColSpan();
        this.rowSpan = this.column.getRowSpan(this.rowNode);
    }

    public getCreateTemplate(): string {
        const unselectable = !this.beans.gridOptionsWrapper.isEnableCellTextSelection() ? 'unselectable="on"' : '';
        const templateParts: string[] = [];
        const col = this.column;

        const width = this.getCellWidth();
        const left = this.modifyLeftForPrintLayout(this.getCellLeft());

        const valueToRender = this.getInitialValueToRender();
        const valueSanitised = _.get(this.column, 'colDef.template', null) ? valueToRender : _.escape(valueToRender);
        this.tooltip = this.getToolTip();
        const tooltipSanitised = _.escape(this.tooltip);
        const colIdSanitised = _.escape(col.getId());

        let wrapperStartTemplate: string = '';
        let wrapperEndTemplate: string = '';

        const stylesFromColDef = this.preProcessStylesFromColDef();
        const cssClasses = this.getInitialCssClasses();

        const stylesForRowSpanning = this.getStylesForRowSpanning();

        if (this.usingWrapper) {
            wrapperStartTemplate = `<div ref="eCellWrapper" class="ag-cell-wrapper"><span ref="eCellValue" class="ag-cell-value" ${unselectable}>`;
            wrapperEndTemplate = '</span></div>';
        }

        templateParts.push(`<div`);
        templateParts.push(` tabindex="-1"`);
        templateParts.push(` ${unselectable}`); // THIS IS FOR IE ONLY so text selection doesn't bubble outside of the grid
        templateParts.push(` role="gridcell"`);
        templateParts.push(` comp-id="${this.getCompId()}" `);
        templateParts.push(` col-id="${colIdSanitised}"`);
        templateParts.push(` class="${cssClasses.join(' ')}"`);

        if (this.beans.gridOptionsWrapper.isEnableBrowserTooltips() && _.exists(tooltipSanitised)) {
            templateParts.push(`title="${tooltipSanitised}"`);
        }

        templateParts.push(` style="width: ${width}px; left: ${left}px; ${stylesFromColDef} ${stylesForRowSpanning}" >`);
        templateParts.push(wrapperStartTemplate);

        if (_.exists(valueSanitised, true)) {
            templateParts.push(valueSanitised);
        }

        templateParts.push(wrapperEndTemplate);
        templateParts.push(`</div>`);

        return templateParts.join('');
    }

    private getStylesForRowSpanning(): string {
        if (this.rowSpan === 1) {
            return '';
        }

        const singleRowHeight = this.beans.gridOptionsWrapper.getRowHeightAsNumber();
        const totalRowHeight = singleRowHeight * this.rowSpan;

        return `height: ${totalRowHeight}px; z-index: 1;`;
    }

    public afterAttached(): void {
        const querySelector = `[comp-id="${this.getCompId()}"]`;
        const eGui = this.eParentRow.querySelector(querySelector) as HTMLElement;
        this.setGui(eGui);

        // all of these have dependencies on the eGui, so only do them after eGui is set
        this.addDomData();
        this.populateTemplate();
        this.createCellRendererInstance(true);
        this.angular1Compile();

        // if not doing enterprise, then range selection service would be missing
        // so need to check before trying to use it
        if (this.rangeSelectionEnabled) {
            if (this.shouldHaveSelectionHandle()) {
                this.addSelectionHandle();
            }
        }

        if (_.exists(this.tooltip) && !this.beans.gridOptionsWrapper.isEnableBrowserTooltips()) {
            this.beans.tooltipManager.registerTooltip(this);
        }
    }

    public onColumnHover(): void {
        const isHovered = this.beans.columnHoverService.isHovered(this.column);
        _.addOrRemoveCssClass(this.getGui(), 'ag-column-hover', isHovered);
    }

    public onCellChanged(event: CellChangedEvent): void {
        const eventImpactsThisCell = event.column === this.column;
        if (eventImpactsThisCell) {
            this.refreshCell({});
        }
    }

    private getCellLeft(): number {
        let mostLeftCol: Column;
        if (this.beans.gridOptionsWrapper.isEnableRtl() && this.colsSpanning) {
            mostLeftCol = _.last(this.colsSpanning);
        } else {
            mostLeftCol = this.column;
        }
        return mostLeftCol.getLeft();
    }

    private getCellWidth(): number {
        if (!this.colsSpanning) {
            return this.column.getActualWidth();
        }

        let result = 0;
        this.colsSpanning.forEach(col => result += col.getActualWidth());

        return result;
    }

    public onFlashCells(event: FlashCellsEvent): void {
        const cellId = this.beans.cellPositionUtils.createId(this.cellPosition);
        const shouldFlash = event.cells[cellId];
        if (shouldFlash) {
            this.animateCell('highlight');
        }
    }

    private setupColSpan(): void {
        // if no col span is active, then we don't set it up, as it would be wasteful of CPU
        if (_.missing(this.getComponentHolder().colSpan)) {
            return;
        }

        // because we are col spanning, a reorder of the cols can change what cols we are spanning over
        this.addDestroyableEventListener(this.beans.eventService, Events.EVENT_DISPLAYED_COLUMNS_CHANGED, this.onDisplayColumnsChanged.bind(this));
        // because we are spanning over multiple cols, we check for width any time any cols width changes.
        // this is expensive - really we should be explicitly checking only the cols we are spanning over
        // instead of every col, however it would be tricky code to track the cols we are spanning over, so
        // because hardly anyone will be using colSpan, am favouring this easier way for more maintainable code.
        this.addDestroyableEventListener(this.beans.eventService, Events.EVENT_DISPLAYED_COLUMNS_WIDTH_CHANGED, this.onWidthChanged.bind(this));

        this.colsSpanning = this.getColSpanningList();
    }

    public getColSpanningList(): Column[] {
        const colSpan = this.column.getColSpan(this.rowNode);
        const colsSpanning: Column[] = [];

        // if just one col, the col span is just the column we are in
        if (colSpan === 1) {
            colsSpanning.push(this.column);
        } else {
            let pointer: Column | null = this.column;
            const pinned = this.column.getPinned();
            for (let i = 0; pointer && i < colSpan; i++) {
                colsSpanning.push(pointer);
                pointer = this.beans.columnController.getDisplayedColAfter(pointer);
                if (!pointer || _.missing(pointer)) {
                    break;
                }
                // we do not allow col spanning to span outside of pinned areas
                if (pinned !== pointer.getPinned()) {
                    break;
                }
            }
        }

        return colsSpanning;
    }

    private onDisplayColumnsChanged(): void {
        const colsSpanning: Column[] = this.getColSpanningList();
        if (!_.compareArrays(this.colsSpanning, colsSpanning)) {
            this.colsSpanning = colsSpanning;
            this.onWidthChanged();
            this.onLeftChanged(); // left changes when doing RTL
        }
    }

    private getInitialCssClasses(): string[] {
        const cssClasses: string[] = ["ag-cell", "ag-cell-not-inline-editing"];

        // if we are putting the cell into a dummy container, to work out it's height,
        // then we don't put the height css in, as we want cell to fit height in that case.
        if (!this.autoHeightCell) {
            cssClasses.push('ag-cell-with-height');
        }

        const doingFocusCss = !this.beans.gridOptionsWrapper.isSuppressCellSelection();
        if (doingFocusCss && this.cellFocused) {
            // otherwise the class depends on the focus state
            cssClasses.push('ag-cell-focus');
        }

        if (this.firstRightPinned) {
            cssClasses.push('ag-cell-first-right-pinned');
        }
        if (this.lastLeftPinned) {
            cssClasses.push('ag-cell-last-left-pinned');
        }

        if (this.beans.columnHoverService.isHovered(this.column)) {
            cssClasses.push('ag-column-hover');
        }

        _.pushAll(cssClasses, this.preProcessClassesFromColDef());
        _.pushAll(cssClasses, this.preProcessCellClassRules());
        _.pushAll(cssClasses, this.getInitialRangeClasses());

        // if using the wrapper, this class goes on the wrapper instead
        if (!this.usingWrapper) {
            cssClasses.push('ag-cell-value');
        }

        return cssClasses;
    }

    public getInitialValueToRender(): string {
        // if using a cellRenderer, then render the html from the cell renderer if it exists
        if (this.usingCellRenderer) {
            if (typeof this.cellRendererGui === 'string') {
                return this.cellRendererGui as string;
            } else {
                return '';
            }
        }

        const colDef = this.getComponentHolder();
        if (colDef.template) {
            // template is really only used for angular 1 - as people using ng1 are used to providing templates with
            // bindings in it. in ng2, people will hopefully want to provide components, not templates.
            return colDef.template;
        } else if (colDef.templateUrl) {
            // likewise for templateUrl - it's for ng1 really - when we move away from ng1, we can take these out.
            // niall was pro angular 1 when writing template and templateUrl, if writing from scratch now, would
            // not do these, but would follow a pattern that was friendly towards components, not templates.
            const template = this.beans.templateService.getTemplate(colDef.templateUrl, this.refreshCell.bind(this, true));
            if (template) {
                return template;
            } else {
                return '';
            }
        } else {
            return this.getValueToUse();
        }
    }

    public getRenderedRow(): RowComp {
        return this.rowComp;
    }

    public isSuppressNavigable(): boolean {
        return this.column.isSuppressNavigable(this.rowNode);
    }

    public getCellRenderer(): ICellRendererComp | null {
        return this.cellRenderer;
    }

    public getCellEditor(): ICellEditorComp | null {
        return this.cellEditor;
    }

    // + stop editing {forceRefresh: true, suppressFlash: true}
    // + event cellChanged {}
    // + cellRenderer.params.refresh() {} -> method passes 'as is' to the cellRenderer, so params could be anything
    // + rowComp: event dataChanged {animate: update, newData: !update}
    // + rowComp: api refreshCells() {animate: true/false}
    // + rowRenderer: api softRefreshView() {}
    public refreshCell(params?: { suppressFlash?: boolean, newData?: boolean, forceRefresh?: boolean }) {
        // if we are in the middle of 'stopEditing', then we don't refresh here, as refresh gets called explicitly
        if (this.suppressRefreshCell || this.editingCell) {
            return;
        }

        const colDef = this.getComponentHolder();
        const newData = params && params.newData;
        const suppressFlash = (params && params.suppressFlash) || colDef.suppressCellFlash;
        const forceRefresh = params && params.forceRefresh;

        const oldValue = this.value;
        this.getValueAndFormat();

        // for simple values only (not pojo's), see if the value is the same, and if it is, skip the refresh.
        // when never allow skipping after an edit, as after editing, we need to put the GUI back to the way
        // if was before the edit.
        const valuesDifferent = !this.valuesAreEqual(oldValue, this.value);
        const dataNeedsUpdating = forceRefresh || valuesDifferent;

        if (dataNeedsUpdating) {
            // if it's 'new data', then we don't refresh the cellRenderer, even if refresh method is available.
            // this is because if the whole data is new (ie we are showing stock price 'BBA' now and not 'SSD')
            // then we are not showing a movement in the stock price, rather we are showing different stock.
            const cellRendererRefreshed = newData ? false : this.attemptCellRendererRefresh();

            // we do the replace if not doing refresh, or if refresh was unsuccessful.
            // the refresh can be unsuccessful if we are using a framework (eg ng2 or react) and the framework
            // wrapper has the refresh method, but the underlying component doesn't
            if (!cellRendererRefreshed) {
                this.replaceContentsAfterRefresh();
            }

            // we don't want to flash the cells when processing a filter change, as otherwise the UI would
            // be to busy. see comment in FilterManager with regards processingFilterChange
            const processingFilterChange = this.beans.filterManager.isSuppressFlashingCellsBecauseFiltering();

            const flashCell = !suppressFlash && !processingFilterChange &&
                (this.beans.gridOptionsWrapper.isEnableCellChangeFlash() || colDef.enableCellChangeFlash);
            if (flashCell) {
                this.flashCell();
            }

            // need to check rules. note, we ignore colDef classes and styles, these are assumed to be static
            this.postProcessStylesFromColDef();
            this.postProcessClassesFromColDef();
        }

        // we can't readily determine if the data in an angularjs template has changed, so here we just update
        // and recompile (if applicable)
        this.updateAngular1ScopeAndCompile();

        this.refreshToolTip();

        // we do cellClassRules even if the value has not changed, so that users who have rules that
        // look at other parts of the row (where the other part of the row might of changed) will work.
        this.postProcessCellClassRules();
    }

    // user can also call this via API
    public flashCell(): void {
        this.animateCell('data-changed');
    }

    private animateCell(cssName: string): void {
        const fullName = 'ag-cell-' + cssName;
        const animationFullName = 'ag-cell-' + cssName + '-animation';
        const element = this.getGui();
        // we want to highlight the cells, without any animation
        _.addCssClass(element, fullName);
        _.removeCssClass(element, animationFullName);
        // then once that is applied, we remove the highlight with animation
        window.setTimeout(() => {
            _.removeCssClass(element, fullName);
            _.addCssClass(element, animationFullName);
            window.setTimeout(() => {
                // and then to leave things as we got them, we remove the animation
                _.removeCssClass(element, animationFullName);
            }, 1000);
        }, 500);
    }

    private replaceContentsAfterRefresh(): void {
        // otherwise we rip out the cell and replace it
        _.clearElement(this.eParentOfValue);

        // remove old renderer component if it exists
        if (this.cellRenderer && this.cellRenderer.destroy) {
            this.cellRenderer.destroy();
        }
        this.cellRenderer = null;
        this.cellRendererGui = null;

        // populate
        this.putDataIntoCellAfterRefresh();

        this.updateAngular1ScopeAndCompile();
    }

    private updateAngular1ScopeAndCompile() {
        if (this.beans.gridOptionsWrapper.isAngularCompileRows() && this.scope) {
            this.scope.data = {...this.rowNode.data};
            this.angular1Compile();
        }
    }

    private angular1Compile(): void {
        // if angular compiling, then need to also compile the cell again (angular compiling sucks, please wait...)
        if (this.beans.gridOptionsWrapper.isAngularCompileRows()) {
            const eGui = this.getGui();

            // only compile the node if it hasn't already been done
            // this prevents "orphaned" node leaks
            if (!eGui.classList.contains('ng-scope') || eGui.childElementCount === 0) {
                const compiledElement = this.beans.$compile(eGui)(this.scope);
                this.addDestroyFunc(() => {
                    compiledElement.remove();
                });
            }
        }
    }

    private postProcessStylesFromColDef() {
        const stylesToUse = this.processStylesFromColDef();
        if (stylesToUse) {
            _.addStylesToElement(this.getGui(), stylesToUse);
        }
    }

    private preProcessStylesFromColDef(): string {
        const stylesToUse = this.processStylesFromColDef();
        return _.cssStyleObjectToMarkup(stylesToUse);
    }

    private processStylesFromColDef(): any {
        const colDef = this.getComponentHolder();
        if (colDef.cellStyle) {
            let cssToUse: any;
            if (typeof colDef.cellStyle === 'function') {
                const cellStyleParams = {
                    value: this.value,
                    data: this.rowNode.data,
                    node: this.rowNode,
                    colDef: colDef,
                    column: this.column,
                    $scope: this.scope,
                    context: this.beans.gridOptionsWrapper.getContext(),
                    api: this.beans.gridOptionsWrapper.getApi()
                };
                const cellStyleFunc = colDef.cellStyle as Function;
                cssToUse = cellStyleFunc(cellStyleParams);
            } else {
                cssToUse = colDef.cellStyle;
            }

            return cssToUse;
        }
    }

    private postProcessClassesFromColDef() {
        this.processClassesFromColDef(className => _.addCssClass(this.getGui(), className));
    }

    private preProcessClassesFromColDef(): string[] {
        const res: string[] = [];
        this.processClassesFromColDef(className => res.push(className));
        return res;
    }

    private processClassesFromColDef(onApplicableClass: (className: string) => void): void {
        const colDef = this.getComponentHolder();

        this.beans.stylingService.processStaticCellClasses(
            colDef,
            {
                value: this.value,
                data: this.rowNode.data,
                node: this.rowNode,
                colDef: colDef,
                rowIndex: this.rowNode.rowIndex,
                $scope: this.scope,
                api: this.beans.gridOptionsWrapper.getApi(),
                columnApi: this.beans.gridOptionsWrapper.getColumnApi(),
                context: this.beans.gridOptionsWrapper.getContext()
            },
            onApplicableClass
        );
    }

    private putDataIntoCellAfterRefresh() {
        // template gets preference, then cellRenderer, then do it ourselves
        const colDef = this.getComponentHolder();

        if (colDef.template) {
            // template is really only used for angular 1 - as people using ng1 are used to providing templates with
            // bindings in it. in ng2, people will hopefully want to provide components, not templates.
            this.eParentOfValue.innerHTML = colDef.template;
        } else if (colDef.templateUrl) {
            // likewise for templateUrl - it's for ng1 really - when we move away from ng1, we can take these out.
            // niall was pro angular 1 when writing template and templateUrl, if writing from scratch now, would
            // not do these, but would follow a pattern that was friendly towards components, not templates.
            const template = this.beans.templateService.getTemplate(colDef.templateUrl, this.refreshCell.bind(this, true));
            if (template) {
                this.eParentOfValue.innerHTML = template;
            }
        } else {
            // we can switch from using a cell renderer back to the default if a user
            // is using cellRendererSelect
            this.chooseCellRenderer();

            if (this.usingCellRenderer) {
                this.createCellRendererInstance();
            } else {
                const valueToUse = this.getValueToUse();
                if (valueToUse !== null && valueToUse !== undefined) {
                    this.eParentOfValue.innerHTML = _.escape(valueToUse);
                }
            }
        }
    }

    public attemptCellRendererRefresh(): boolean {
        if (_.missing(this.cellRenderer) || !this.cellRenderer || _.missing(this.cellRenderer.refresh)) {
            return false;
        }

        // if the cell renderer has a refresh method, we call this instead of doing a refresh
        const params = this.createCellRendererParams();

        // take any custom params off of the user
        const finalParams = this.beans.userComponentFactory.createFinalParams(this.getComponentHolder(), this.cellRendererType, params);

        const result: boolean | void = this.cellRenderer.refresh(finalParams);

        // NOTE on undefined: previous version of the cellRenderer.refresh() interface
        // returned nothing, if the method existed, we assumed it refreshed. so for
        // backwards compatibility, we assume if method exists and returns nothing,
        // that it was successful.
        return result === true || result === undefined;
    }

    private refreshToolTip() {
        const newTooltip = this.getToolTip();

        if (this.tooltip === newTooltip) {
            return;
        }

        const hasNewTooltip = _.exists(newTooltip);
        const hadTooltip = _.exists(this.tooltip);

        if (hasNewTooltip && this.tooltip === newTooltip.toString()) {
            return;
        }

        this.tooltip = newTooltip;

        if (this.beans.gridOptionsWrapper.isEnableBrowserTooltips()) {
            if (hasNewTooltip) {
                const tooltipSanitised = _.escape(this.tooltip);
                this.eParentOfValue.setAttribute('title', tooltipSanitised!);
            } else {
                this.eParentOfValue.removeAttribute('title');
            }
        } else {
            if (hadTooltip) {
                if (!hasNewTooltip) {
                    this.beans.tooltipManager.unregisterTooltip(this);
                }
            } else if (hasNewTooltip) {
                this.beans.tooltipManager.registerTooltip(this);
            }
        }
    }

    private valuesAreEqual(val1: any, val2: any): boolean {

        // if the user provided an equals method, use that, otherwise do simple comparison
        const colDef = this.getComponentHolder();
        const equalsMethod: ((valueA: any, valueB: any) => boolean) | null | undefined = colDef ? colDef.equals : null;

        if (equalsMethod) {
            return equalsMethod(val1, val2);
        }

        return val1 === val2;
    }

    private getToolTip(): string | null {
        const colDef = this.getComponentHolder();
        const data = this.rowNode.data;

        if (colDef.tooltipField && _.exists(data)) {
            return _.getValueUsingField(data, colDef.tooltipField, this.column.isTooltipFieldContainsDots());
        }
        const valueGetter = colDef.tooltipValueGetter || colDef.tooltip;
        if (valueGetter) {
            return valueGetter({
                api: this.beans.gridOptionsWrapper.getApi(),
                columnApi: this.beans.gridOptionsWrapper.getColumnApi(),
                colDef: colDef,
                column: this.getColumn(),
                context: this.beans.gridOptionsWrapper.getContext(),
                value: this.value,
                valueFormatted: this.valueFormatted,
                rowIndex: this.cellPosition.rowIndex,
                node: this.rowNode,
                data: this.rowNode.data,
                $scope: this.scope,
            });
        }

        return null;
    }

    public getTooltipText(escape: boolean = true) {
        return escape ? _.escape(this.tooltip) : this.tooltip;
    }

    private processCellClassRules(onApplicableClass: (className: string) => void, onNotApplicableClass?: (className: string) => void): void {
        const colDef = this.getComponentHolder();

        this.beans.stylingService.processClassRules(
            colDef.cellClassRules,
            {
                value: this.value,
                data: this.rowNode.data,
                node: this.rowNode,
                colDef: colDef,
                rowIndex: this.cellPosition.rowIndex,
                api: this.beans.gridOptionsWrapper.getApi(),
                columnApi: this.beans.gridOptionsWrapper.getColumnApi(),
                $scope: this.scope,
                context: this.beans.gridOptionsWrapper.getContext()
            }, onApplicableClass, onNotApplicableClass);
    }

    private postProcessCellClassRules(): void {
        this.processCellClassRules(
            (className: string) => {
                _.addCssClass(this.getGui(), className);
            },
            (className: string) => {
                _.removeCssClass(this.getGui(), className);
            }
        );
    }

    private preProcessCellClassRules(): string[] {
        const res: string[] = [];

        this.processCellClassRules(
            (className: string) => {
                res.push(className);
            },
            (className: string) => {
                // not catered for, if creating, no need
                // to remove class as it was never there
            }
        );

        return res;
    }

    // a wrapper is used when we are putting a selection checkbox in the cell with the value
    public setUsingWrapper(): void {
        const colDef = this.getComponentHolder();

        // never allow selection or dragging on pinned rows
        if (this.rowNode.rowPinned) {
            this.usingWrapper = false;
            this.includeSelectionComponent = false;
            this.includeRowDraggingComponent = false;
            this.includeDndSourceComponent = false;
            return;
        }

        const cbSelectionIsFunc = typeof colDef.checkboxSelection === 'function';
        const rowDraggableIsFunc = typeof colDef.rowDrag === 'function';
        const dndSourceIsFunc = typeof colDef.dndSource === 'function';

        this.includeSelectionComponent = cbSelectionIsFunc || colDef.checkboxSelection === true;
        this.includeRowDraggingComponent = rowDraggableIsFunc || colDef.rowDrag === true;
        this.includeDndSourceComponent = dndSourceIsFunc || colDef.dndSource === true;

        this.usingWrapper = this.includeRowDraggingComponent || this.includeSelectionComponent || this.includeDndSourceComponent;
    }

    private chooseCellRenderer(): void {
        // template gets preference, then cellRenderer, then do it ourselves
        const colDef = this.getComponentHolder();

        // templates are for ng1, ideally we wouldn't have these, they are ng1 support
        // inside the core which is bad
        if (colDef.template || colDef.templateUrl) {
            this.usingCellRenderer = false;
            return;
        }

        const params = this.createCellRendererParams();
        const cellRenderer = this.beans.userComponentFactory.lookupComponentClassDef(colDef, 'cellRenderer', params);
        const pinnedRowCellRenderer = this.beans.userComponentFactory.lookupComponentClassDef(colDef, 'pinnedRowCellRenderer', params);

        if (pinnedRowCellRenderer && this.rowNode.rowPinned) {
            this.cellRendererType = CellComp.CELL_RENDERER_TYPE_PINNED;
            this.usingCellRenderer = true;
        } else if (cellRenderer) {
            this.cellRendererType = CellComp.CELL_RENDERER_TYPE_NORMAL;
            this.usingCellRenderer = true;
        } else {
            this.usingCellRenderer = false;
        }
    }

    private createCellRendererInstance(useTaskService = false): void {
        if (!this.usingCellRenderer) { return; }

        // never use task service if angularCompileRows=true, as that assume the cell renderers
        // are finished when the row is created. also we never use it if animation frame service
        // is turned off.
        // and lastly we never use it if doing auto-height, as the auto-height service checks the
        // row height directly after the cell is created, it doesn't wait around for the tasks to complete
        const angularCompileRows = this.beans.gridOptionsWrapper.isAngularCompileRows();
        const suppressAnimationFrame = this.beans.gridOptionsWrapper.isSuppressAnimationFrame();
        if (angularCompileRows || suppressAnimationFrame || this.autoHeightCell) { useTaskService = false; }

        const params = this.createCellRendererParams();

        this.cellRendererVersion++;
        const callback = this.afterCellRendererCreated.bind(this, this.cellRendererVersion);

        const cellRendererTypeNormal = this.cellRendererType === CellComp.CELL_RENDERER_TYPE_NORMAL;

        const task = () => {
            // this can return null in the event that the user has switched from a renderer component to nothing, for example
            // when using a cellRendererSelect to return a component or null depending on row data etc
            let componentPromise: Promise<ICellRendererComp>;
            if (cellRendererTypeNormal) {
                componentPromise = this.beans.userComponentFactory.newCellRenderer(this.getComponentHolder(), params);
            } else {
                componentPromise = this.beans.userComponentFactory.newPinnedRowCellRenderer(this.getComponentHolder(), params);
            }

            if (componentPromise) {
                componentPromise.then(callback);
            }
        };

        if (useTaskService) {
            this.beans.taskQueue.addP2Task(task);
        } else {
            task();
        }
    }

    private afterCellRendererCreated(cellRendererVersion: number, cellRenderer: ICellRendererComp): void {
        // see if daemon
        if (!this.isAlive() || (cellRendererVersion !== this.cellRendererVersion)) {
            if (cellRenderer.destroy) {
                cellRenderer.destroy();
            }
            return;
        }

        this.cellRenderer = cellRenderer;
        this.cellRendererGui = this.cellRenderer.getGui();

        if (_.missing(this.cellRendererGui)) {
            return;
        }

        // if async components, then it's possible the user started editing since
        // this call was made
        if (!this.editingCell) {
            this.eParentOfValue.appendChild(this.cellRendererGui);
        }
    }

    private createCellRendererParams(): ICellRendererParams {
        const params = {
            value: this.value,
            valueFormatted: this.valueFormatted,
            getValue: this.getValue.bind(this),
            setValue: (value: any) => {
                this.beans.valueService.setValue(this.rowNode, this.column, value);
            },
            formatValue: this.formatValue.bind(this),
            data: this.rowNode.data,
            node: this.rowNode,
            colDef: this.getComponentHolder(),
            column: this.column,
            $scope: this.scope,
            rowIndex: this.cellPosition.rowIndex,
            api: this.beans.gridOptionsWrapper.getApi(),
            columnApi: this.beans.gridOptionsWrapper.getColumnApi(),
            context: this.beans.gridOptionsWrapper.getContext(),
            refreshCell: this.refreshCell.bind(this),

            eGridCell: this.getGui(),
            eParentOfValue: this.eParentOfValue,

            // these bits are not documented anywhere, so we could drop them?
            // it was in the olden days to allow user to register for when rendered
            // row was removed (the row comp was removed), however now that the user
            // can provide components for cells, the destroy method gets call when this
            // happens so no longer need to fire event.
            addRowCompListener: this.rowComp ? this.rowComp.addEventListener.bind(this.rowComp) : null,
            addRenderedRowListener: (eventType: string, listener: Function) => {
                console.warn('ag-Grid: since ag-Grid .v11, params.addRenderedRowListener() is now params.addRowCompListener()');
                if (this.rowComp) {
                    this.rowComp.addEventListener(eventType, listener);
                }
            }
        } as ICellRendererParams;

        return params;
    }

    private formatValue(value: any): any {
        const valueFormatted = this.beans.valueFormatterService.formatValue(this.column, this.rowNode, this.scope, value);
        const valueFormattedExists = valueFormatted !== null && valueFormatted !== undefined;
        return valueFormattedExists ? valueFormatted : value;
    }

    private getValueToUse(): any {
        const valueFormattedExists = this.valueFormatted !== null && this.valueFormatted !== undefined;
        return valueFormattedExists ? this.valueFormatted : this.value;
    }

    private getValueAndFormat(): void {
        this.value = this.getValue();
        this.valueFormatted = this.beans.valueFormatterService.formatValue(this.column, this.rowNode, this.scope, this.value);
    }

    private getValue(): any {
        // if we don't check this, then the grid will render leaf groups as open even if we are not
        // allowing the user to open leaf groups. confused? remember for pivot mode we don't allow
        // opening leaf groups, so we have to force leafGroups to be closed in case the user expanded
        // them via the API, or user user expanded them in the UI before turning on pivot mode
        const lockedClosedGroup = this.rowNode.leafGroup && this.beans.columnController.isPivotMode();

        const isOpenGroup = this.rowNode.group && this.rowNode.expanded && !this.rowNode.footer && !lockedClosedGroup;

        // are we showing group footers
        const groupFootersEnabled = this.beans.gridOptionsWrapper.isGroupIncludeFooter();

        // if doing footers, we normally don't show agg data at group level when group is open
        const groupAlwaysShowAggData = this.beans.gridOptionsWrapper.isGroupSuppressBlankHeader();

        // if doing grouping and footers, we don't want to include the agg value
        // in the header when the group is open
        const ignoreAggData = (isOpenGroup && groupFootersEnabled) && !groupAlwaysShowAggData;

        return this.beans.valueService.getValue(this.column, this.rowNode, false, ignoreAggData);
    }

    public onMouseEvent(eventName: string, mouseEvent: MouseEvent): void {
        if (_.isStopPropagationForAgGrid(mouseEvent)) {
            return;
        }

        switch (eventName) {
            case 'click':
                this.onCellClicked(mouseEvent);
                break;
            case 'mousedown':
                this.onMouseDown(mouseEvent);
                break;
            case 'dblclick':
                this.onCellDoubleClicked(mouseEvent);
                break;
            case 'mouseout':
                this.onMouseOut(mouseEvent);
                break;
            case 'mouseover':
                this.onMouseOver(mouseEvent);
                break;
        }
    }

    public dispatchCellContextMenuEvent(event: Event) {
        const colDef = this.getComponentHolder();
        const cellContextMenuEvent: CellContextMenuEvent = this.createEvent(event, Events.EVENT_CELL_CONTEXT_MENU);
        this.beans.eventService.dispatchEvent(cellContextMenuEvent);

        if (colDef.onCellContextMenu) {
            // to make the callback async, do in a timeout
            window.setTimeout(() => (colDef.onCellContextMenu as any)(cellContextMenuEvent), 0);
        }
    }

    public createEvent(domEvent: Event | null, eventType: string): CellEvent {
        const event: CellEvent = {
            node: this.rowNode,
            data: this.rowNode.data,
            value: this.value,
            column: this.column,
            colDef: this.getComponentHolder(),
            context: this.beans.gridOptionsWrapper.getContext(),
            api: this.beans.gridApi,
            columnApi: this.beans.columnApi,
            rowPinned: this.rowNode.rowPinned,
            event: domEvent,
            type: eventType,
            rowIndex: this.rowNode.rowIndex
        };

        // because we are hacking in $scope for angular 1, we have to de-reference
        if (this.scope) {
            (event as any).$scope = this.scope;
        }

        return event;
    }

    private onMouseOut(mouseEvent: MouseEvent): void {
        const cellMouseOutEvent: CellMouseOutEvent = this.createEvent(mouseEvent, Events.EVENT_CELL_MOUSE_OUT);
        this.beans.eventService.dispatchEvent(cellMouseOutEvent);
        this.beans.columnHoverService.clearMouseOver();
    }

    private onMouseOver(mouseEvent: MouseEvent): void {
        const cellMouseOverEvent: CellMouseOverEvent = this.createEvent(mouseEvent, Events.EVENT_CELL_MOUSE_OVER);
        this.beans.eventService.dispatchEvent(cellMouseOverEvent);
        this.beans.columnHoverService.setMouseOver([this.column]);
    }

    private onCellDoubleClicked(mouseEvent: MouseEvent) {
        const colDef = this.getComponentHolder();
        // always dispatch event to eventService
        const cellDoubleClickedEvent: CellDoubleClickedEvent = this.createEvent(mouseEvent, Events.EVENT_CELL_DOUBLE_CLICKED);
        this.beans.eventService.dispatchEvent(cellDoubleClickedEvent);

        // check if colDef also wants to handle event
        if (typeof colDef.onCellDoubleClicked === 'function') {
            // to make the callback async, do in a timeout
            window.setTimeout(() => (colDef.onCellDoubleClicked as any)(cellDoubleClickedEvent), 0);
        }

        const editOnDoubleClick = !this.beans.gridOptionsWrapper.isSingleClickEdit()
            && !this.beans.gridOptionsWrapper.isSuppressClickEdit();
        if (editOnDoubleClick) {
            this.startRowOrCellEdit();
        }
    }

    // called by rowRenderer when user navigates via tab key
    public startRowOrCellEdit(keyPress?: number | null, charPress?: string): void {
        if (this.beans.gridOptionsWrapper.isFullRowEdit()) {
            this.rowComp.startRowEditing(keyPress, charPress, this);
        } else {
            this.startEditingIfEnabled(keyPress, charPress, true);
        }
    }

    public isCellEditable() {
        return this.column.isCellEditable(this.rowNode);
    }

    // either called internally if single cell editing, or called by rowRenderer if row editing
    public startEditingIfEnabled(keyPress: number | null = null, charPress: string | null = null, cellStartedEdit = false): void {

        // don't do it if not editable
        if (!this.isCellEditable()) {
            return;
        }

        // don't do it if already editing
        if (this.editingCell) {
            return;
        }

        this.editingCell = true;

        this.cellEditorVersion++;
        const callback = this.afterCellEditorCreated.bind(this, this.cellEditorVersion);

        const params = this.createCellEditorParams(keyPress, charPress, cellStartedEdit);
        this.createCellEditor(params).then(callback);

        // if we don't do this, and editor component is async, then there will be a period
        // when the component isn't present and keyboard navigation won't work - so example
        // of user hitting tab quickly (more quickly than renderers getting created) won't work
        const cellEditorAsync = _.missing(this.cellEditor);
        if (cellEditorAsync && cellStartedEdit) {
            this.focusCell(true);
        }
    }

    private createCellEditor(params: ICellEditorParams): Promise<ICellEditorComp> {

        const cellEditorPromise: Promise<ICellEditorComp> = this.beans.userComponentFactory.newCellEditor(
            this.column.getColDef(), params);

        return cellEditorPromise.map(cellEditor => {

            const isPopup = cellEditor.isPopup && cellEditor.isPopup();

            if (!isPopup) {
                return cellEditor;
            }

            if (this.beans.gridOptionsWrapper.isFullRowEdit()) {
                console.warn('ag-Grid: popup cellEditor does not work with fullRowEdit - you cannot use them both ' +
                    '- either turn off fullRowEdit, or stop using popup editors.');
            }

            // if a popup, then we wrap in a popup editor and return the popup
            const popupEditorWrapper = new PopupEditorWrapper(cellEditor);
            this.beans.context.wireBean(popupEditorWrapper);
            popupEditorWrapper.init(params);
            return popupEditorWrapper;
        });
    }

    private afterCellEditorCreated(cellEditorVersion: number, cellEditor: ICellEditorComp): void {

        // if editingCell=false, means user cancelled the editor before component was ready.
        // if versionMismatch, then user cancelled the edit, then started the edit again, and this
        //   is the first editor which is now stale.
        const versionMismatch = cellEditorVersion !== this.cellEditorVersion;
        if (versionMismatch || !this.editingCell) {
            if (cellEditor.destroy) {
                cellEditor.destroy();
            }
            return;
        }

        if (cellEditor.isCancelBeforeStart && cellEditor.isCancelBeforeStart()) {
            if (cellEditor.destroy) {
                cellEditor.destroy();
            }
            this.editingCell = false;
            return;
        }

        if (!cellEditor.getGui) {
            console.warn(`ag-Grid: cellEditor for column ${this.column.getId()} is missing getGui() method`);

            // no getGui, for React guys, see if they attached a react component directly
            if ((cellEditor as any).render) {
                console.warn(`ag-Grid: we found 'render' on the component, are you trying to set a React renderer but added it as colDef.cellEditor instead of colDef.cellEditorFmk?`);
            }

            if (cellEditor.destroy) {
                cellEditor.destroy();
            }

            this.editingCell = false;
            return;
        }

        this.cellEditor = cellEditor;

        this.cellEditorInPopup = cellEditor.isPopup !== undefined && cellEditor.isPopup();
        this.setInlineEditingClass();

        if (this.cellEditorInPopup) {
            this.addPopupCellEditor();
        } else {
            this.addInCellEditor();
        }

        if (cellEditor.afterGuiAttached) {
            cellEditor.afterGuiAttached();
        }

        const event: CellEditingStartedEvent = this.createEvent(null, Events.EVENT_CELL_EDITING_STARTED);
        this.beans.eventService.dispatchEvent(event);
    }

    private addInCellEditor(): void {
        _.clearElement(this.getGui());
        if (this.cellEditor) {
            this.getGui().appendChild(this.cellEditor.getGui());
        }

        this.angular1Compile();
    }

    private addPopupCellEditor(): void {
        const ePopupGui = this.cellEditor ? this.cellEditor.getGui() : null;

        this.hideEditorPopup = this.beans.popupService.addAsModalPopup(
            ePopupGui,
            true,
            // callback for when popup disappears
            () => {
                this.onPopupEditorClosed();
            }
        );

        this.beans.popupService.positionPopupOverComponent({
            column: this.column,
            rowNode: this.rowNode,
            type: 'popupCellEditor',
            eventSource: this.getGui(),
            ePopup: ePopupGui,
            keepWithinBounds: true
        });

        this.angular1Compile();
    }

    private onPopupEditorClosed(): void {
        // we only call stopEditing if we are editing, as
        // it's possible the popup called 'stop editing'
        // before this, eg if 'enter key' was pressed on
        // the editor.

        if (this.editingCell) {
            // note: this only happens when use clicks outside of the grid. if use clicks on another
            // cell, then the editing will have already stopped on this cell
            this.stopRowOrCellEdit();

            // we only focus cell again if this cell is still focused. it is possible
            // it is not focused if the user cancelled the edit by clicking on another
            // cell outside of this one
            if (this.beans.focusedCellController.isCellFocused(this.cellPosition)) {
                this.focusCell(true);
            }
        }
    }

    // if we are editing inline, then we don't have the padding in the cell (set in the themes)
    // to allow the text editor full access to the entire cell
    private setInlineEditingClass(): void {

        // ag-cell-inline-editing - appears when user is inline editing
        // ag-cell-not-inline-editing - appears when user is no inline editing
        // ag-cell-popup-editing - appears when user is editing cell in popup (appears on the cell, not on the popup)

        // note: one of {ag-cell-inline-editing, ag-cell-not-inline-editing} is always present, they toggle.
        //       however {ag-cell-popup-editing} shows when popup, so you have both {ag-cell-popup-editing}
        //       and {ag-cell-not-inline-editing} showing at the same time.

        const editingInline = this.editingCell && !this.cellEditorInPopup;
        const popupEditorShowing = this.editingCell && this.cellEditorInPopup;
        _.addOrRemoveCssClass(this.getGui(), "ag-cell-inline-editing", editingInline);
        _.addOrRemoveCssClass(this.getGui(), "ag-cell-not-inline-editing", !editingInline);
        _.addOrRemoveCssClass(this.getGui(), "ag-cell-popup-editing", popupEditorShowing);
        _.addOrRemoveCssClass(this.getGui().parentNode as HTMLElement, "ag-row-inline-editing", editingInline);
        _.addOrRemoveCssClass(this.getGui().parentNode as HTMLElement, "ag-row-not-inline-editing", !editingInline);
    }

    private createCellEditorParams(keyPress: number | null, charPress: string | null, cellStartedEdit: boolean): ICellEditorParams {
        const params: ICellEditorParams = {
            value: this.getValue(),
            keyPress: keyPress,
            charPress: charPress,
            column: this.column,
            colDef: this.column.getColDef(),
            rowIndex: this.cellPosition.rowIndex,
            node: this.rowNode,
            data: this.rowNode.data,
            api: this.beans.gridOptionsWrapper.getApi(),
            cellStartedEdit: cellStartedEdit,
            columnApi: this.beans.gridOptionsWrapper.getColumnApi(),
            context: this.beans.gridOptionsWrapper.getContext(),
            $scope: this.scope,
            onKeyDown: this.onKeyDown.bind(this),
            stopEditing: this.stopEditingAndFocus.bind(this),
            eGridCell: this.getGui(),
            parseValue: this.parseValue.bind(this),
            formatValue: this.formatValue.bind(this)
        };

        return params;
    }

    // cell editors call this, when they want to stop for reasons other
    // than what we pick up on. eg selecting from a dropdown ends editing.
    private stopEditingAndFocus(suppressNavigateAfterEdit = false): void {
        this.stopRowOrCellEdit();
        this.focusCell(true);
        if (!suppressNavigateAfterEdit) {
            this.navigateAfterEdit();
        }
    }

    private parseValue(newValue: any): any {
        const colDef = this.getComponentHolder();
        const params: NewValueParams = {
            node: this.rowNode,
            data: this.rowNode.data,
            oldValue: this.value,
            newValue: newValue,
            colDef: colDef,
            column: this.column,
            api: this.beans.gridOptionsWrapper.getApi(),
            columnApi: this.beans.gridOptionsWrapper.getColumnApi(),
            context: this.beans.gridOptionsWrapper.getContext()
        };

        const valueParser = colDef.valueParser;
        return _.exists(valueParser) ? this.beans.expressionService.evaluate(valueParser, params) : newValue;
    }

    public focusCell(forceBrowserFocus = false): void {
        this.beans.focusedCellController.setFocusedCell(this.cellPosition.rowIndex, this.column, this.rowNode.rowPinned, forceBrowserFocus);
    }

    public setFocusInOnEditor(): void {
        if (this.editingCell) {
            if (this.cellEditor && this.cellEditor.focusIn) {
                // if the editor is present, then we just focus it
                this.cellEditor.focusIn();
            } else {
                // if the editor is not present, it means async cell editor (eg React fibre)
                // and we are trying to set focus before the cell editor is present, so we
                // focus the cell instead
                this.focusCell(true);
            }
        }
    }

    public isEditing(): boolean {
        return this.editingCell;
    }

    public onKeyDown(event: KeyboardEvent): void {
        const key = event.which || event.keyCode;

        switch (key) {
            case Constants.KEY_ENTER:
                this.onEnterKeyDown();
                break;
            case Constants.KEY_F2:
                this.onF2KeyDown();
                break;
            case Constants.KEY_ESCAPE:
                this.onEscapeKeyDown();
                break;
            case Constants.KEY_TAB:
                this.onTabKeyDown(event);
                break;
            case Constants.KEY_BACKSPACE:
            case Constants.KEY_DELETE:
                this.onBackspaceOrDeleteKeyPressed(key);
                break;
            case Constants.KEY_DOWN:
            case Constants.KEY_UP:
            case Constants.KEY_RIGHT:
            case Constants.KEY_LEFT:
                this.onNavigationKeyPressed(event, key);
                break;
        }
    }

    public setFocusOutOnEditor(): void {
        if (this.editingCell && this.cellEditor && this.cellEditor.focusOut) {
            this.cellEditor.focusOut();
        }
    }

    private onNavigationKeyPressed(event: KeyboardEvent, key: number): void {
        if (this.editingCell) { return; }

        if (event.shiftKey && this.rangeSelectionEnabled) {
            this.onShiftRangeSelect(key);
        } else {
            this.beans.rowRenderer.navigateToNextCell(event, key, this.cellPosition, true);
        }
        // if we don't prevent default, the grid will scroll with the navigation keys
        event.preventDefault();
    }

    private onShiftRangeSelect(key: number): void {
        const endCell = this.beans.rangeController.extendLatestRangeInDirection(key);

        if (endCell) {
            this.beans.rowRenderer.ensureCellVisible(endCell);
        }
    }

    private onTabKeyDown(event: KeyboardEvent): void {
        this.beans.rowRenderer.onTabKeyDown(this, event);
    }

    private onBackspaceOrDeleteKeyPressed(key: number): void {
        if (!this.editingCell) {
            this.startRowOrCellEdit(key);
        }
    }

    private onEnterKeyDown(): void {
        if (this.editingCell || this.rowComp.isEditing()) {
            this.stopEditingAndFocus();
        } else {
            if (this.beans.gridOptionsWrapper.isEnterMovesDown()) {
                this.beans.rowRenderer.navigateToNextCell(null, Constants.KEY_DOWN, this.cellPosition, false);
            } else {
                this.startRowOrCellEdit(Constants.KEY_ENTER);
            }
        }
    }

    private navigateAfterEdit(): void {
        const fullRowEdit = this.beans.gridOptionsWrapper.isFullRowEdit();
        if (fullRowEdit) {
            return;
        }

        const enterMovesDownAfterEdit = this.beans.gridOptionsWrapper.isEnterMovesDownAfterEdit();

        if (enterMovesDownAfterEdit) {
            this.beans.rowRenderer.navigateToNextCell(null, Constants.KEY_DOWN, this.cellPosition, false);
        }
    }

    private onF2KeyDown(): void {
        if (!this.editingCell) {
            this.startRowOrCellEdit(Constants.KEY_F2);
        }
    }

    private onEscapeKeyDown(): void {
        if (this.editingCell) {
            this.stopRowOrCellEdit(true);
            this.focusCell(true);
        }
    }

    public onKeyPress(event: KeyboardEvent): void {
        // check this, in case focus is on a (for example) a text field inside the cell,
        // in which cse we should not be listening for these key pressed
        const eventTarget = _.getTarget(event);
        const eventOnChildComponent = eventTarget !== this.getGui();
        if (eventOnChildComponent || this.editingCell) {
            return;
        }

        const pressedChar = String.fromCharCode(event.charCode);
        if (pressedChar === ' ') {
            this.onSpaceKeyPressed(event);
        } else {
            if (_.isEventFromPrintableCharacter(event)) {
                this.startRowOrCellEdit(null, pressedChar);
                // if we don't prevent default, then the keypress also gets applied to the text field
                // (at least when doing the default editor), but we need to allow the editor to decide
                // what it wants to do. we only do this IF editing was started - otherwise it messes
                // up when the use is not doing editing, but using rendering with text fields in cellRenderer
                // (as it would block the the user from typing into text fields).
                event.preventDefault();
            }
        }
    }

    private onSpaceKeyPressed(event: KeyboardEvent): void {
        if (!this.editingCell && this.beans.gridOptionsWrapper.isRowSelection()) {
            const selected = this.rowNode.isSelected();
            this.rowNode.setSelected(!selected);
        }
        // prevent default as space key, by default, moves browser scroll down
        event.preventDefault();
    }

    private onMouseDown(mouseEvent: MouseEvent): void {
        // we only need to pass true to focusCell in when the browser is IE
        // and we are trying to focus a cell (has ag-cell class), otherwise
        // we pass false, as we don't want the cell to focus also get the browser
        // focus. if we did, then the cellRenderer could have a text field in it,
        // for example, and as the user clicks on the text field, the text field,
        // the focus doesn't get to the text field, instead to goes to the div
        // behind, making it impossible to select the text field.
        let forceBrowserFocus = false;
        const {button, ctrlKey, metaKey, shiftKey, target} = mouseEvent;
        const { eventService, rangeController } = this.beans;

        if (rangeController) {
            const cellInRange = rangeController.isCellInAnyRange(this.getCellPosition());

            if (cellInRange && button === 2) {
                return;
            }
        }

        if (_.isBrowserIE()) {
            if ((target as HTMLElement).classList.contains('ag-cell')) {
                forceBrowserFocus = true;
            }
        }

        if (!shiftKey || (rangeController && !rangeController.getCellRanges().length)) {
            this.focusCell(forceBrowserFocus);
        } else {
            // if a range is being changed, we need to make sure the focused cell does not change.
            mouseEvent.preventDefault();
        }

        // if we are clicking on a checkbox, we need to make sure the cell wrapping that checkbox
        // is focused but we don't want to change the range selection, so return here.
        if (_.isElementChildOfClass(target as HTMLElement, 'ag-selection-checkbox', 3)) {
            return;
        }

        // if it's a right click, then if the cell is already in range,
        // don't change the range, however if the cell is not in a range,
        // we set a new range
        const leftMouseButtonClick = _.isLeftClick(mouseEvent);
        if (leftMouseButtonClick && rangeController) {
            const thisCell = this.cellPosition;
            if (shiftKey) {
                rangeController.extendLatestRangeToCell(thisCell);
            } else {
                const ctrlKeyPressed = ctrlKey || metaKey;
                rangeController.setRangeToCell(thisCell, ctrlKeyPressed);
            }
        }

        const cellMouseDownEvent: CellMouseDownEvent = this.createEvent(mouseEvent, Events.EVENT_CELL_MOUSE_DOWN);
        eventService.dispatchEvent(cellMouseDownEvent);
    }

    // returns true if on iPad and this is second 'click' event in 200ms
    private isDoubleClickOnIPad(): boolean {
        if (!_.isUserAgentIPad()) {
            return false;
        }

        const nowMillis = new Date().getTime();
        const res = nowMillis - this.lastIPadMouseClickEvent < 200;
        this.lastIPadMouseClickEvent = nowMillis;

        return res;
    }

    private onCellClicked(mouseEvent: MouseEvent): void {

        // iPad doesn't have double click - so we need to mimic it do enable editing for
        // iPad.
        if (this.isDoubleClickOnIPad()) {
            this.onCellDoubleClicked(mouseEvent);
            mouseEvent.preventDefault(); // if we don't do this, then iPad zooms in
            return;
        }

        const cellClickedEvent: CellClickedEvent = this.createEvent(mouseEvent, Events.EVENT_CELL_CLICKED);
        this.beans.eventService.dispatchEvent(cellClickedEvent);

        const colDef = this.getComponentHolder();

        if (colDef.onCellClicked) {
            // to make callback async, do in a timeout
            window.setTimeout(() => (colDef.onCellClicked as any)(cellClickedEvent), 0);
        }

        const editOnSingleClick = (this.beans.gridOptionsWrapper.isSingleClickEdit() || colDef.singleClickEdit)
            && !this.beans.gridOptionsWrapper.isSuppressClickEdit();
        if (editOnSingleClick) {
            this.startRowOrCellEdit();
        }

        _.doIeFocusHack(this.getGui());
    }

    private createGridCellVo(): void {
        this.cellPosition = {
            rowIndex: this.rowNode.rowIndex,
            rowPinned: this.rowNode.rowPinned,
            column: this.column
        };
    }

    public getCellPosition(): CellPosition {
        return this.cellPosition;
    }

    public getParentRow(): HTMLElement {
        return this.eParentRow;
    }

    public setParentRow(eParentRow: HTMLElement): void {
        this.eParentRow = eParentRow;
    }

    public getColumn(): Column {
        return this.column;
    }

    public getComponentHolder(): ColDef {
        return this.column.getColDef();
    }

    public detach(): void {
        this.eParentRow.removeChild(this.getGui());
    }

    // if the row is also getting destroyed, then we don't need to remove from dom,
    // as the row will also get removed, so no need to take out the cells from the row
    // if the row is going (removing is an expensive operation, so only need to remove
    // the top part)
    public destroy(): void {
        super.destroy();

        if (this.cellEditor && this.cellEditor.destroy) {
            this.cellEditor.destroy();
            this.cellEditor = null;
        }

        if (this.cellRenderer && this.cellRenderer.destroy) {
            this.cellRenderer.destroy();
            this.cellRenderer = null;
        }

        if (this.selectionHandle) {
            this.selectionHandle.destroy();
        }
    }

    public onLeftChanged(): void {
        const left = this.modifyLeftForPrintLayout(this.getCellLeft());
        this.getGui().style.left = left + 'px';
    }

    private modifyLeftForPrintLayout(leftPosition: number): number {
        if (!this.printLayout) {
            return leftPosition;
        }

        if (this.column.getPinned() === Column.PINNED_LEFT) {
            return leftPosition;
        }

        if (this.column.getPinned() === Column.PINNED_RIGHT) {
            const leftWidth = this.beans.columnController.getPinnedLeftContainerWidth();
            const bodyWidth = this.beans.columnController.getBodyContainerWidth();
            return leftWidth + bodyWidth + leftPosition;
        }

        // is in body
        const leftWidth = this.beans.columnController.getPinnedLeftContainerWidth();
        return leftWidth + leftPosition;
    }

    public onWidthChanged(): void {
        const width = this.getCellWidth();
        this.getGui().style.width = width + 'px';
    }

    private getRangeBorders(): {
        top: boolean,
        right: boolean,
        bottom: boolean,
        left: boolean
    } {
        const isRtl = this.beans.gridOptionsWrapper.isEnableRtl();

        let top = false;
        let right = false;
        let bottom = false;
        let left = false;

        const thisCol = this.cellPosition.column;
        const rangeController = this.beans.rangeController;

        let leftCol: Column;
        let rightCol: Column;

        if (isRtl) {
            leftCol = this.beans.columnController.getDisplayedColAfter(thisCol);
            rightCol = this.beans.columnController.getDisplayedColBefore(thisCol);
        } else {
            leftCol = this.beans.columnController.getDisplayedColBefore(thisCol);
            rightCol = this.beans.columnController.getDisplayedColAfter(thisCol);
        }

        const ranges: CellRange[] = rangeController.getCellRanges().filter(
            range => rangeController.isCellInSpecificRange(this.cellPosition, range)
        );

        // this means we are the first column in the grid
        if (!leftCol) {
            left = true;
        }

        // this means we are the last column in the grid
        if (!rightCol) {
            right = true;
        }

        for (let i = 0; i < ranges.length; i++) {
            if (top && right && bottom && left) { break; }

            const range = ranges[i];
            const startRow = rangeController.getRangeStartRow(range);
            const endRow = rangeController.getRangeEndRow(range);

            if (!top && this.beans.rowPositionUtils.sameRow(startRow, this.cellPosition)) {
                top = true;
            }
            if (!bottom && this.beans.rowPositionUtils.sameRow(endRow, this.cellPosition)) {
                bottom = true;
            }
            if (!left && range.columns.indexOf(leftCol) < 0) {
                left = true;
            }
            if (!right && range.columns.indexOf(rightCol) < 0) {
                right = true;
            }
        }

        return { top, right, bottom, left };
    }

    private getInitialRangeClasses(): string[] {
        const res: string[] = [];

        if (!this.rangeSelectionEnabled || !this.rangeCount) {
            return res;
        }

        const { beans } = this;
        const { rangeController } = beans;

        res.push('ag-cell-range-selected');

        if (this.hasChartRange) {
            res.push('ag-cell-range-chart');
        }

        const count = Math.min(this.rangeCount, 4);

        res.push(`ag-cell-range-selected-${count}`);

        if (this.rangeCount === 1 && !rangeController.isMoreThanOneCell()) {
            res.push('ag-cell-range-single-cell');
        }

        if (this.rangeCount > 0) {
            const borders = this.getRangeBorders();

            if (borders.top) { res.push('ag-cell-range-top'); }
            if (borders.right) { res.push('ag-cell-range-right'); }
            if (borders.bottom) { res.push('ag-cell-range-bottom'); }
            if (borders.left) { res.push('ag-cell-range-left'); }
        }

        if (!!this.selectionHandle) {
            res.push('ag-cell-range-handle');
        }

        return res;
    }

    public onRowIndexChanged(): void {
        // when index changes, this influences items that need the index, so we update the
        // grid cell so they are working off the new index.
        this.createGridCellVo();
        // when the index of the row changes, ie means the cell may have lost or gained focus
        this.onCellFocused();
        // check range selection
        this.onRangeSelectionChanged();
    }

    public onRangeSelectionChanged(): void {
        if (!this.beans.enterprise) {
            return;
        }

        const { beans, cellPosition, rangeCount } = this;
        const { rangeController } = beans;

        const newRangeCount = rangeController.getCellRangeCount(cellPosition);
        const element = this.getGui();

        if (rangeCount !== newRangeCount) {
            _.addOrRemoveCssClass(element, 'ag-cell-range-selected', newRangeCount !== 0);
            _.addOrRemoveCssClass(element, 'ag-cell-range-selected-1', newRangeCount === 1);
            _.addOrRemoveCssClass(element, 'ag-cell-range-selected-2', newRangeCount === 2);
            _.addOrRemoveCssClass(element, 'ag-cell-range-selected-3', newRangeCount === 3);
            _.addOrRemoveCssClass(element, 'ag-cell-range-selected-4', newRangeCount >= 4);
            this.rangeCount = newRangeCount;
        }

        const hasChartRange = this.rangeCount && rangeController.getCellRanges().every(range => _.exists(range.type));

        if (this.hasChartRange !== hasChartRange) {
            _.addOrRemoveCssClass(element, 'ag-cell-range-chart', hasChartRange);
            this.hasChartRange = hasChartRange;
        }

        this.updateRangeBorders();

        const isSingleCell = this.rangeCount === 1 && !rangeController.isMoreThanOneCell();
        _.addOrRemoveCssClass(element, 'ag-cell-range-single-cell', isSingleCell);

        this.refreshHandle();

        _.addOrRemoveCssClass(element, 'ag-cell-range-handle', !!this.selectionHandle);
    }

    private shouldHaveSelectionHandle(): boolean {
        const { gridOptionsWrapper, rangeController } = this.beans;
        const el = this.getGui();
        const cellRanges = rangeController.getCellRanges();
        const rangesLen = cellRanges.length;

        if (!rangesLen) { return false; }

        const lastRange = _.last(cellRanges);
        const isFirstRangeCategory = cellRanges[0].type === CellRangeType.DIMENSION;

        let handlesAllowed = (
            gridOptionsWrapper.isEnableFillHandle() ||
            gridOptionsWrapper.isEnableRangeHandle() ||
            this.hasChartRange && !isFirstRangeCategory
            ) && rangesLen === 1;

        if (!handlesAllowed && this.hasChartRange) {
            const cellPosition = this.getCellPosition();
            handlesAllowed =
                isFirstRangeCategory &&
                rangesLen === 2 &&
                rangeController.isCellInSpecificRange(
                    this.getCellPosition(), lastRange
                );

            const isCategory =
                isFirstRangeCategory &&
                rangeController.isCellInSpecificRange(
                    cellPosition, cellRanges[0]
                );

            _.addOrRemoveCssClass(el, 'ag-cell-range-chart-category', isCategory);
        }

        return this.rangeCount &&
               handlesAllowed &&
               lastRange.endRow != null &&
               this.beans.rangeController.isContiguousRange(lastRange) &&
               (
                    _.containsClass(el, 'ag-cell-range-single-cell') ||
                    (_.containsClass(el, 'ag-cell-range-bottom') && _.containsClass(el, 'ag-cell-range-right'))
               );
    }

    private addSelectionHandle() {
        const { gridOptionsWrapper, context, rangeController } = this.beans;
        const cellRangeType = _.last(rangeController.getCellRanges()).type;
        const type = (gridOptionsWrapper.isEnableFillHandle() && _.missing(cellRangeType)) ? 'fill' : 'range';

        if (this.selectionHandle && this.selectionHandle.getType() !== type) {
            this.selectionHandle.destroy();
            this.selectionHandle = undefined;
        }

        if (!this.selectionHandle) {
            this.selectionHandle = context.createComponentFromElement(
                document.createElement(`ag-${type}-handle`)
            ) as any as ISelectionHandle;
        }

        this.selectionHandle.refresh(this);
    }

    public updateRangeBordersIfRangeCount(): void {
        // we only need to update range borders if we are in a range
        if (this.rangeCount > 0) {
            this.updateRangeBorders();
            this.refreshHandle();
        }
    }

    private refreshHandle(): void {
        const shouldHaveSelectionHandle = this.shouldHaveSelectionHandle();

        if (this.selectionHandle && !shouldHaveSelectionHandle) {
            this.selectionHandle.destroy();
            this.selectionHandle = null;
        }

        if (shouldHaveSelectionHandle) {
            this.addSelectionHandle();
        }
    }

    private updateRangeBorders(): void {
        const rangeBorders = this.getRangeBorders();
        const isSingleCell = this.rangeCount === 1 && !this.beans.rangeController.isMoreThanOneCell();

        const isTop = !isSingleCell && rangeBorders.top;
        const isRight = !isSingleCell && rangeBorders.right;
        const isBottom = !isSingleCell && rangeBorders.bottom;
        const isLeft = !isSingleCell && rangeBorders.left;

        const element = this.getGui();

        _.addOrRemoveCssClass(element, 'ag-cell-range-top', isTop);
        _.addOrRemoveCssClass(element, 'ag-cell-range-right', isRight);
        _.addOrRemoveCssClass(element, 'ag-cell-range-bottom', isBottom);
        _.addOrRemoveCssClass(element, 'ag-cell-range-left', isLeft);
    }

    public onFirstRightPinnedChanged(): void {
        const firstRightPinned = this.column.isFirstRightPinned();
        if (this.firstRightPinned !== firstRightPinned) {
            this.firstRightPinned = firstRightPinned;
            _.addOrRemoveCssClass(this.getGui(), 'ag-cell-first-right-pinned', firstRightPinned);
        }
    }

    public onLastLeftPinnedChanged(): void {
        const lastLeftPinned = this.column.isLastLeftPinned();
        if (this.lastLeftPinned !== lastLeftPinned) {
            this.lastLeftPinned = lastLeftPinned;
            _.addOrRemoveCssClass(this.getGui(), 'ag-cell-last-left-pinned', lastLeftPinned);
        }
    }

    private populateTemplate(): void {
        if (this.usingWrapper) {

            this.eParentOfValue = this.getRefElement('eCellValue');
            this.eCellWrapper = this.getRefElement('eCellWrapper');

            if (this.includeRowDraggingComponent) {
                this.addRowDragging();
            }
            if (this.includeDndSourceComponent) {
                this.addDndSource();
            }
            if (this.includeSelectionComponent) {
                this.addSelectionCheckbox();
            }
        } else {
            this.eParentOfValue = this.getGui();
        }
    }

    protected getFrameworkOverrides(): IFrameworkOverrides {
        return this.beans.frameworkOverrides;
    }

    private addRowDragging(): void {

        const pagination = this.beans.gridOptionsWrapper.isPagination();
        const rowDragManaged = this.beans.gridOptionsWrapper.isRowDragManaged();
        const clientSideRowModelActive = this.beans.gridOptionsWrapper.isRowModelDefault();

        if (rowDragManaged) {
            // row dragging only available in default row model
            if (!clientSideRowModelActive) {
                _.doOnce(() => console.warn('ag-Grid: managed row dragging is only allowed in the Client Side Row Model'),
                    'CellComp.addRowDragging');
                return;
            }

            if (pagination) {
                _.doOnce(() => console.warn('ag-Grid: managed row dragging is not possible when doing pagination'),
                    'CellComp.addRowDragging');
                return;
            }
        }

        const rowDraggingComp = new RowDragComp(this.rowNode, this.column, this.getValueToUse(), this.beans);
        this.addFeature(this.beans.context, rowDraggingComp);

        // put the checkbox in before the value
        this.eCellWrapper.insertBefore(rowDraggingComp.getGui(), this.eParentOfValue);
    }

    private addDndSource(): void {

        const dndSourceComp = new DndSourceComp(this.rowNode, this.column, this.getValueToUse(), this.beans, this.getGui());
        this.addFeature(this.beans.context, dndSourceComp);

        // put the checkbox in before the value
        this.eCellWrapper.insertBefore(dndSourceComp.getGui(), this.eParentOfValue);
    }

    private addSelectionCheckbox(): void {

        const cbSelectionComponent = new CheckboxSelectionComponent();
        this.beans.context.wireBean(cbSelectionComponent);

        let visibleFunc = this.getComponentHolder().checkboxSelection;
        visibleFunc = typeof visibleFunc === 'function' ? visibleFunc : null;

        cbSelectionComponent.init({rowNode: this.rowNode, column: this.column, visibleFunc: visibleFunc});
        this.addDestroyFunc(() => cbSelectionComponent.destroy());

        // put the checkbox in before the value
        this.eCellWrapper.insertBefore(cbSelectionComponent.getGui(), this.eParentOfValue);
    }

    private addDomData(): void {
        const element = this.getGui();
        this.beans.gridOptionsWrapper.setDomData(element, CellComp.DOM_DATA_KEY_CELL_COMP, this);
        this.addDestroyFunc(() =>
            this.beans.gridOptionsWrapper.setDomData(element, CellComp.DOM_DATA_KEY_CELL_COMP, null)
        );
    }

    public onCellFocused(event?: any): void {
        const cellFocused = this.beans.focusedCellController.isCellFocused(this.cellPosition);

        // see if we need to change the classes on this cell
        if (cellFocused !== this.cellFocused) {

            // if we are not doing cell selection, then the focus class does not change
            const doingFocusCss = !this.beans.gridOptionsWrapper.isSuppressCellSelection();
            if (doingFocusCss) {
                _.addOrRemoveCssClass(this.getGui(), 'ag-cell-focus', cellFocused);
            }

            this.cellFocused = cellFocused;
        }

        // if this cell was just focused, see if we need to force browser focus, his can
        // happen if focus is programmatically set.
        if (cellFocused && event && event.forceBrowserFocus) {
            const eGui = this.getGui();
            eGui.focus();
            _.doIeFocusHack(eGui);
        }

        // if another cell was focused, and we are editing, then stop editing
        const fullRowEdit = this.beans.gridOptionsWrapper.isFullRowEdit();
        if (!cellFocused && !fullRowEdit && this.editingCell) {
            this.stopRowOrCellEdit();
        }
    }

    // pass in 'true' to cancel the editing.
    public stopRowOrCellEdit(cancel: boolean = false) {
        if (this.beans.gridOptionsWrapper.isFullRowEdit()) {
            this.rowComp.stopRowEditing(cancel);
        } else {
            this.stopEditing(cancel);
        }
    }

    public stopEditing(cancel = false): void {
        if (!this.editingCell) {
            return;
        }

        // if no cell editor, this means due to async, that the cell editor never got initialised,
        // so we just carry on regardless as if the editing was never started.
        if (!this.cellEditor) {
            this.editingCell = false;
            return;
        }

        let newValueExists = false;
        let newValue: any;

        if (!cancel) {
            // also have another option here to cancel after editing, so for example user could have a popup editor and
            // it is closed by user clicking outside the editor. then the editor will close automatically (with false
            // passed above) and we need to see if the editor wants to accept the new value.
            const userWantsToCancel = this.cellEditor.isCancelAfterEnd && this.cellEditor.isCancelAfterEnd();
            if (!userWantsToCancel) {
                newValue = this.cellEditor.getValue();
                newValueExists = true;
            }
        }

        // it is important we set this after setValue() above, as otherwise the cell will flash
        // when editing stops. the 'refresh' method checks editing, and doesn't refresh editing cells.
        // thus it will skip the refresh on this cell until the end of this method where we call
        // refresh directly and we suppress the flash.
        this.editingCell = false;

        if (this.cellEditor.destroy) {
            this.cellEditor.destroy();
        }

        // important to clear this out - as parts of the code will check for
        // this to see if an async cellEditor has yet to be created
        this.cellEditor = null;

        if (this.cellEditorInPopup && this.hideEditorPopup) {
            this.hideEditorPopup();
            this.hideEditorPopup = null;
        } else {
            _.clearElement(this.getGui());
            // put the cell back the way it was before editing
            if (this.usingWrapper) {
                // if wrapper, then put the wrapper back
                this.getGui().appendChild(this.eCellWrapper);
            } else {
                // if cellRenderer, then put the gui back in. if the renderer has
                // a refresh, it will be called. however if it doesn't, then later
                // the renderer will be destroyed and a new one will be created.
                if (this.cellRenderer) {
                    // we know it's a dom element (not a string) because we converted
                    // it after the gui was attached if it was a string.
                    const eCell = this.cellRendererGui as HTMLElement;

                    // can be null if cell was previously null / contained empty string,
                    // this will result in new value not being rendered.
                    if (eCell) {
                        this.getGui().appendChild(eCell);
                    }
                }
            }
        }

        this.setInlineEditingClass();

        if (newValueExists) {
            // we suppressRefreshCell because the call to rowNode.setDataValue() results in change detection
            // getting triggered, which results in all cells getting refreshed. we do not want this refresh
            // to happen on this call as we want to call it explicitly below. otherwise refresh gets called twice.
            // if we only did this refresh (and not the one below) then the cell would flash and not be forced.
            this.suppressRefreshCell = true;
            this.rowNode.setDataValue(this.column, newValue);
            this.suppressRefreshCell = false;
        }

        // we suppress the flash, as it is not correct to flash the cell the user has finished editing,
        // the user doesn't need to flash as they were the one who did the edit, the flash is pointless
        // (as the flash is meant to draw the user to a change that they didn't manually do themselves).
        this.refreshCell({forceRefresh: true, suppressFlash: true});

        const event: CellEditingStoppedEvent = this.createEvent(null, Events.EVENT_CELL_EDITING_STOPPED);
        this.beans.eventService.dispatchEvent(event);
    }

}
