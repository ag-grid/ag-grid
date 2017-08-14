import {Component} from "../widgets/component";
import {Beans} from "./beans";
import {Column} from "../entities/column";
import {RowNode} from "../entities/rowNode";
import {SlickRowComp} from "./slickRowComp";
import {_} from "../utils";
import {CellComp, ICellComp} from "./cellComp";
import {GridCell, GridCellDef} from "../entities/gridCell";
import {
    CellClickedEvent, CellContextMenuEvent, CellDoubleClickedEvent, CellEditingStartedEvent, CellEditingStoppedEvent,
    CellEvent,
    CellMouseOutEvent,
    CellMouseOverEvent, Events, VirtualRowRemovedEvent
} from "../events";
import {CheckboxSelectionComponent} from "./checkboxSelectionComponent";
import {ICellRendererComp, ICellRendererFunc, ICellRendererParams} from "./cellRenderers/iCellRenderer";
import {ICellEditorComp, ICellEditorParams} from "./cellEditors/iCellEditor";
import {IRowComp} from "./rowComp";
import {Constants} from "../constants";
import {NewValueParams} from "../entities/colDef";

export class SlickCellComp extends Component implements ICellComp {

    private eCellWrapper: HTMLElement;
    private eParentOfValue: HTMLElement;

    private beans: Beans;
    private column: Column;
    private rowNode: RowNode;
    private eParentRow: HTMLElement;
    private active = true;
    private gridCell: GridCell;
    private rangeCount: number;
    private usingWrapper: boolean;

    private cellFocused: boolean;
    private editingCell: boolean;
    private cellEditorInPopup: boolean;
    private hideEditorPopup: Function;

    // the cellRenderer class to use
    private cellRendererKey: {new(): ICellRendererComp} | ICellRendererFunc | string;
    private cellRendererParams: any;

    // instance of the cellRenderer class
    private cellRenderer: ICellRendererComp;
    private cellEditor: ICellEditorComp;

    private rowComp: SlickRowComp;

    private value: any;

    //todo: this is not getting set yet
    private scope: null;

    constructor(beans: Beans, column: Column, rowNode: RowNode, rowComp: SlickRowComp) {
        super();
        this.beans = beans;
        this.column = column;
        this.rowNode = rowNode;
        this.rowComp = rowComp;

        this.value = this.getValue();
        this.selectCellRenderer();
        this.createGridCell();
        this.setUsingWrapper();
    }

    public getInitialValueToRender(): string {
        // if using a cellRenderer, then there is no initial value to render,
        // todo: unless the result is a string
        if (this.cellRendererKey) { return ''; }

        let colDef = this.column.getColDef();
        if (colDef.template) {
            // template is really only used for angular 1 - as people using ng1 are used to providing templates with
            // bindings in it. in ng2, people will hopefully want to provide components, not templates.
            return colDef.template;
        } else if (colDef.templateUrl) {
            // likewise for templateUrl - it's for ng1 really - when we move away from ng1, we can take these out.
            // niall was pro angular 1 when writing template and templateUrl, if writing from scratch now, would
            // not do these, but would follow a pattern that was friendly towards components, not templates.
            let template = this.beans.templateService.getTemplate(colDef.templateUrl, this.refreshCell.bind(this, true));
            if (template) {
                return template;
            } else {
                return '';
            }
        // } else if (colDef.textCellRenderer) {
            // let valueFormatted = this.beans.valueFormatterService.formatValue(
            //     this.column, this.rowNode, null, this.value);
            // let valueFormattedExits = valueFormatted !== null && valueFormatted !== undefined;
            // let valueToRender = valueFormattedExits ? valueFormatted : this.value;
            // let params = this.createRendererAndRefreshParams(valueToRender, this.cellRendererParams);
            // return colDef.textCellRenderer(params);
        } else {
            let valueFormatted = this.beans.valueFormatterService.formatValue(
                this.column, this.rowNode, null, this.value);
            let valueFormattedExits = valueFormatted !== null && valueFormatted !== undefined;
            return valueFormattedExits ? valueFormatted : this.value;
        }
    }

    public getRenderedRow(): IRowComp {
        return this.rowComp;
    }

    public isSuppressNavigable(): boolean {
        return this.column.isSuppressNavigable(this.rowNode);
    }

    // + stop editing {dontSkipRefresh: true}
    // + event cellChanged {}
    // + cellRenderer.params.refresh() {} -> method passes 'as is' to the cellRenderer, so params could be anything
    // + rowComp: event dataChanged {animate: update, newData: !update}
    // + rowComp: api refreshCells() {animate: true/false}
    // + rowRenderer: api softRefreshView() {}
    public refreshCell(params?: {suppressFlash?: boolean, newData?: boolean, forceRefresh?: boolean, volatile?: boolean}) {

        if (this.editingCell) { return; }

        let newData = params && params.newData;
        let suppressFlash = params && params.suppressFlash;
        let volatile = params && params.volatile;
        let forceRefresh = params && params.forceRefresh;

        // if only refreshing volatile cells, then skip the refresh if we are not volatile
        if (volatile && !this.isVolatile()) { return; }

        let oldValue = this.value;
        this.value = this.getValue();

        // for simple values only (not pojo's), see if the value is the same, and if it is, skip the refresh.
        // when never allow skipping after an edit, as after editing, we need to put the GUI back to the way
        // if was before the edit.
        let skipRefresh = !forceRefresh && this.valuesAreEqual(oldValue, this.value);
        if (skipRefresh) {
            return;
        }

        let cellRendererRefreshed: boolean;

        // if it's 'new data', then we don't refresh the cellRenderer, even if refresh method is available.
        // this is because if the whole data is new (ie we are showing stock price 'BBA' now and not 'SSD')
        // then we are not showing a movement in the stock price, rather we are showing different stock.
        if (newData || suppressFlash) {
            cellRendererRefreshed = false;
        } else {
            cellRendererRefreshed = this.attemptCellRendererRefresh();
        }

        // we do the replace if not doing refresh, or if refresh was unsuccessful.
        // the refresh can be unsuccessful if we are using a framework (eg ng2 or react) and the framework
        // wrapper has the refresh method, but the underlying component doesn't
        if (!cellRendererRefreshed) {
            this.replaceCellContent();
        }

        if (!suppressFlash) {
            this.flashCell();
        }

        // need to check rules. note, we ignore colDef classes and styles, these are assumed to be static
        this.postProcessCellClassRules();
    }

    private flashCell(): void {
        if (this.beans.gridOptionsWrapper.isEnableCellChangeFlash() || this.column.getColDef().enableCellChangeFlash) {
            this.animateCell('data-changed');
        }
    }

    private animateCell(cssName: string): void {
        let fullName = 'ag-cell-' + cssName;
        let animationFullName = 'ag-cell-' + cssName + '-animation';
        let eGui = this.getGui();
        // we want to highlight the cells, without any animation
        _.addCssClass(eGui, fullName);
        _.removeCssClass(eGui, animationFullName);
        // then once that is applied, we remove the highlight with animation
        setTimeout( ()=> {
            _.removeCssClass(eGui, fullName);
            _.addCssClass(eGui, animationFullName);
            setTimeout( ()=> {
                // and then to leave things as we got them, we remove the animation
                _.removeCssClass(eGui, animationFullName);
            }, 1000);
        }, 500);
    }

    private replaceCellContent(): void {
        // otherwise we rip out the cell and replace it
        _.removeAllChildren(this.eParentOfValue);

        // remove old renderer component if it exists
        if (this.cellRenderer && this.cellRenderer.destroy) {
            this.cellRenderer.destroy();
        }
        this.cellRenderer = null;

        this.populateCell();

        // if angular compiling, then need to also compile the cell again (angular compiling sucks, please wait...)
        if (this.beans.gridOptionsWrapper.isAngularCompileRows()) {
            this.beans.$compile(this.getGui())(this.scope);
        }
    }

    private populateCell() {
        // populate
        this.putDataIntoCell();
        // style
        // this.addStylesFromColDef();
        // this.addClassesFromColDef();
        this.postProcessCellClassRules();
    }

    private addStylesFromColDef() {
        // todo
        // remember - when adding styles to html, need to convert from camel case
    }

    private addClassesFromColDef() {
        // todo
    }

    private putDataIntoCell() {
        // template gets preference, then cellRenderer, then do it ourselves
        let colDef = this.column.getColDef();

        if (colDef.template) {
            // template is really only used for angular 1 - as people using ng1 are used to providing templates with
            // bindings in it. in ng2, people will hopefully want to provide components, not templates.
            this.eParentOfValue.innerHTML = colDef.template;
        } else if (colDef.templateUrl) {
            // likewise for templateUrl - it's for ng1 really - when we move away from ng1, we can take these out.
            // niall was pro angular 1 when writing template and templateUrl, if writing from scratch now, would
            // not do these, but would follow a pattern that was friendly towards components, not templates.
            let template = this.beans.templateService.getTemplate(colDef.templateUrl, this.refreshCell.bind(this, true));
            if (template) {
                this.eParentOfValue.innerHTML = template;
            }
            // use cell renderer if it exists
        } else if (this.cellRendererKey) {
            this.useCellRenderer();
        } else {
            let valueFormatted = this.beans.valueFormatterService.formatValue(this.column, this.rowNode, this.scope, this.value);
            let valueFormattedExits = valueFormatted !== null && valueFormatted !== undefined;
            let valueToRender = valueFormattedExits ? valueFormatted : this.value;
            if (valueToRender!==null && valueToRender!==undefined) {
                this.eParentOfValue.innerText = valueToRender;
            }
        }
        if (colDef.tooltipField) {
            let data = this.rowNode.data;
            if (_.exists(data)) {
                let tooltip = _.getValueUsingField(data, colDef.tooltipField, this.column.isTooltipFieldContainsDots());
                if (_.exists(tooltip)) {
                    this.eParentOfValue.setAttribute('title', tooltip);
                }
            }
        }
    }

    public attemptCellRendererRefresh(): boolean {
        if (_.missing(this.cellRenderer) || _.missing(this.cellRenderer.refresh)) {
            return false;
        }

        // if the cell renderer has a refresh method, we call this instead of doing a refresh
        // note: should pass in params here instead of value?? so that client has formattedValue
        let valueFormatted = this.formatValue(this.value);
        let cellRendererParams = this.column.getColDef().cellRendererParams;
        let params = this.createRendererAndRefreshParams(valueFormatted, cellRendererParams);
        let result: boolean | void = this.cellRenderer.refresh(params);

        if (result===false) {
            // if result from renderer is false
            return false;
        } else {
            // if result from renderer is true OR undefined
            return true;
        }

        // NOTE on undefined: previous version of the cellRenderer.refresh() interface
        // returned nothing, if the method existed, we assumed it refreshed. so for
        // backwards compatibility, we assume if method exists and returns nothing,
        // that it was successful.
    }

    public isVolatile() {
        return this.column.getColDef().volatile;
    }

    private valuesAreEqual(val1: any, val2: any): boolean {

        // if the user provided an equals method, use that, otherwise do simple comparison
        let colDef = this.column.getColDef();
        let equalsMethod: (valueA: any, valueB: any) => boolean = colDef ? colDef.equals : null;

        if (equalsMethod) {
            return equalsMethod(val1, val2);
        } else {
            return val1 === val2;
        }
    }

    public getCreateTemplate(): string {
        let template: string[] = [];
        let col = this.column;

        let width = col.getActualWidth();
        let left = col.getLeft();

        let valueToRender = this.getInitialValueToRender();
        let tooltip = this.getToolTip();

        let cssClasses: string[] = ["ag-cell", "ag-cell-no-focus", "ag-cell-not-inline-editing"];
        let wrapperStart: string;
        let wrapperEnd: string;

        this.cellFocused = this.beans.focusedCellController.isCellFocused(this.gridCell);
        cssClasses.push(this.cellFocused ? 'ag-cell-focus' : 'ag-cell-no-focus');

        if (this.usingWrapper) {
            wrapperStart = '<span ref="eCellWrapper" class="ag-cell-wrapper"><span ref="eCellValue" class="ag-cell-value">';
            wrapperEnd = '</span></span>';
        } else {
            cssClasses.push('ag-cell-value');
        }

        _.pushAll(cssClasses, this.getClassesFromColDef());
        _.pushAll(cssClasses, this.preProcessCellClassRules());
        _.pushAll(cssClasses, this.getRangeClasses());

        template.push(`<div`);
        template.push(` tabindex="-1"`);
        template.push(` role="gridcell"`);
        template.push(` colid="${col.getId()}"`);
        template.push(` class="${cssClasses.join(' ')}"`);
        template.push(  tooltip ? ` title="${tooltip}"` : ``);
        template.push(` style="width: ${width}px; left: ${left}px;" >`);
        template.push(wrapperStart);
        template.push(valueToRender);
        template.push(wrapperEnd);
        template.push(`</div>`);

        return template.join('');
    }

    private getToolTip(): string {
        let colDef = this.column.getColDef();
        let data = this.rowNode.data;
        if (colDef.tooltipField && _.exists(data)) {
            return _.getValueUsingField(data, colDef.tooltipField, this.column.isTooltipFieldContainsDots());
        } else {
            return null;
        }
    }

    private getClassesFromColDef(): string[] {

        let res: string[] = [];

        this.beans.stylingService.processStaticCellClasses(
            this.column.getColDef(),
            {
                value: this.value,
                data: this.rowNode.data,
                node: this.rowNode,
                colDef: this.column.getColDef(),
                rowIndex: this.rowNode.rowIndex,
                api: this.beans.gridOptionsWrapper.getApi(),
                context: this.beans.gridOptionsWrapper.getContext()
            },
            (className:string)=>{
                res.push(className);
            }
        );

        return res;
    }

    private processCellClassRules(onApplicableClass:(className:string)=>void, onNotApplicableClass?:(className:string)=>void): void {
        this.beans.stylingService.processCellClassRules(
            this.column.getColDef(),
            {
                value: this.value,
                data: this.rowNode.data,
                node: this.rowNode,
                colDef: this.column.getColDef(),
                rowIndex: this.gridCell.rowIndex,
                api: this.beans.gridOptionsWrapper.getApi(),
                context: this.beans.gridOptionsWrapper.getContext()
            }, onApplicableClass, onNotApplicableClass);
    }

    private postProcessCellClassRules(): void{
        this.processCellClassRules(
            (className:string)=>{
                _.addCssClass(this.getGui(), className);
            },
            (className:string)=>{
                _.removeCssClass(this.getGui(), className);
            }
        );
    }

    private preProcessCellClassRules(): string[] {

        let res: string[] = [];

        this.processCellClassRules(
            (className:string)=>{
                res.push(className);
            },
            (className:string)=>{
                // not catered for, if creating, no need
                // to remove class as it was never there
            }
        );

        return res;
    }

    public setUsingWrapper(): void {
        // if boolean set, then just use it
        let colDef = this.column.getColDef();

        // never allow selection on pinned rows
        if (this.rowNode.rowPinned) {
            this.usingWrapper = false;
        } else if (typeof colDef.checkboxSelection === 'boolean') {
            this.usingWrapper = <boolean> colDef.checkboxSelection;
        } else if (typeof colDef.checkboxSelection === 'function') {
            this.usingWrapper = true;
        } else {
            this.usingWrapper = false;
        }
    }

    private selectCellRenderer(): void {
        // template gets preference, then cellRenderer, then do it ourselves
        let colDef = this.column.getColDef();

        // templates are for ng1, ideally we wouldn't have these, they are ng1 support
        // inside the core which is bad
        if (colDef.template || colDef.templateUrl) { return; }

        let cellRenderer = this.column.getCellRenderer();
        let floatingCellRenderer = this.column.getFloatingCellRenderer();

        if (floatingCellRenderer && this.rowNode.rowPinned) {
            this.cellRendererKey = floatingCellRenderer;
            this.cellRendererParams = colDef.pinnedRowCellRendererParams;
        } else if (cellRenderer) {
            this.cellRendererKey = cellRenderer;
            this.cellRendererParams = colDef.cellRendererParams;
        }
    }

    private useCellRenderer(): void {
        let noCellRenderer = !this.cellRendererKey;
        if (noCellRenderer) { return; }

        let valueFormatted = this.beans.valueFormatterService.formatValue(
            this.column, this.rowNode, null, this.value);
        let valueFormattedExits = valueFormatted !== null && valueFormatted !== undefined;
        let valueToRender = valueFormattedExits ? valueFormatted : this.value;

        let params = this.createRendererAndRefreshParams(valueToRender, this.cellRendererParams);

        this.cellRenderer = this.beans.cellRendererService.useCellRenderer(
            this.column.getColDef(), this.eParentOfValue, params);
    }

    private createRendererAndRefreshParams(valueFormatted: string, cellRendererParams: {}): ICellRendererParams {

        let params = <ICellRendererParams> {
            value: this.value,
            valueFormatted: valueFormatted,
            getValue: this.getValue.bind(this),
            setValue: (value: any) => { this.beans.valueService.setValue(this.rowNode, this.column, value) },
            formatValue: this.formatValue.bind(this),
            data: this.rowNode.data,
            node: this.rowNode,
            colDef: this.column.getColDef(),
            column: this.column,
            $scope: this.scope,
            rowIndex: this.gridCell.rowIndex,
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
            addRowCompListener: this.rowComp.addEventListener.bind(this.rowComp),
            addRenderedRowListener: (eventType: string, listener: Function) => {
                console.warn('ag-Grid: since ag-Grid .v11, params.addRenderedRowListener() is now params.addRowCompListener()');
                this.rowComp.addEventListener(eventType, listener);
            }
        };

        if (cellRendererParams) {
            _.assign(params, cellRendererParams);
        }

        return params;
    }

    private formatValue(value: any): any {
        let valueFormatted = this.beans.valueFormatterService.formatValue(this.column, this.rowNode, this.scope, value);
        let valueFormattedExists = valueFormatted !== null && valueFormatted !== undefined;
        return valueFormattedExists ? valueFormatted : value;
    }

    private getValue(): any {
        let isOpenGroup = this.rowNode.group && this.rowNode.expanded && !this.rowNode.footer;
        if (isOpenGroup && this.beans.gridOptionsWrapper.isGroupIncludeFooter()) {
            // if doing grouping and footers, we don't want to include the agg value
            // in the header when the group is open
            return this.beans.valueService.getValue(this.column, this.rowNode, true);
        } else {
            return this.beans.valueService.getValue(this.column, this.rowNode);
        }
    }

    public onMouseEvent(eventName: string, mouseEvent: MouseEvent): void {
        switch (eventName) {
            case 'click': this.onCellClicked(mouseEvent); break;
            case 'mousedown': this.onMouseDown(); break;
            case 'dblclick': this.onCellDoubleClicked(mouseEvent); break;
            case 'contextmenu': this.onContextMenu(mouseEvent); break;
            case 'mouseout': this.onMouseOut(mouseEvent); break;
            case 'mouseover': this.onMouseOver(mouseEvent); break;
        }
    }

    private createEvent(domEvent: Event, eventType: string): CellEvent {
        let event: CellEvent = {
            node: this.rowNode,
            data: this.rowNode.data,
            value: this.value,
            column: this.column,
            colDef: this.column.getColDef(),
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
            (<any>event).$scope = this.scope;
        }

        return event;
    }

    private onMouseOut(mouseEvent: MouseEvent): void {
        let cellMouseOutEvent: CellMouseOutEvent = this.createEvent(mouseEvent, Events.EVENT_CELL_MOUSE_OUT);
        this.beans.eventService.dispatchEvent(cellMouseOutEvent);
    }

    private onMouseOver(mouseEvent: MouseEvent): void {
        let cellMouseOverEvent: CellMouseOverEvent = this.createEvent(mouseEvent, Events.EVENT_CELL_MOUSE_OVER);
        this.beans.eventService.dispatchEvent(cellMouseOverEvent);
    }

    private onContextMenu(mouseEvent: MouseEvent): void {

        // to allow us to debug in chrome, we ignore the event if ctrl is pressed.
        // not everyone wants this, so first 'if' below allows to turn this hack off.
        if (!this.beans.gridOptionsWrapper.isAllowContextMenuWithControlKey()) {
            // then do the check
            if (mouseEvent.ctrlKey || mouseEvent.metaKey) {
                return;
            }
        }


        let colDef = this.column.getColDef();
        let cellContextMenuEvent: CellContextMenuEvent = this.createEvent(mouseEvent, Events.EVENT_CELL_CONTEXT_MENU);
        this.beans.eventService.dispatchEvent(cellContextMenuEvent);

        if (colDef.onCellContextMenu) {
            colDef.onCellContextMenu(cellContextMenuEvent);
        }

        if (this.beans.contextMenuFactory && !this.beans.gridOptionsWrapper.isSuppressContextMenu()) {
            this.beans.contextMenuFactory.showMenu(this.rowNode, this.column, this.value, mouseEvent);
            mouseEvent.preventDefault();
        }
    }

    private onCellDoubleClicked(mouseEvent: MouseEvent) {
        let colDef = this.column.getColDef();
        // always dispatch event to eventService
        let cellDoubleClickedEvent: CellDoubleClickedEvent = this.createEvent(mouseEvent, Events.EVENT_CELL_DOUBLE_CLICKED);
        this.beans.eventService.dispatchEvent(cellDoubleClickedEvent);

        // check if colDef also wants to handle event
        if (typeof colDef.onCellDoubleClicked === 'function') {
            colDef.onCellDoubleClicked(cellDoubleClickedEvent);
        }

        let editOnDoubleClick = !this.beans.gridOptionsWrapper.isSingleClickEdit()
            && !this.beans.gridOptionsWrapper.isSuppressClickEdit();
        if (editOnDoubleClick) {
            this.startRowOrCellEdit();
        }
    }

    // called by rowRenderer when user navigates via tab key
    public startRowOrCellEdit(keyPress?: number, charPress?: string): void {
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
    public startEditingIfEnabled(keyPress: number = null, charPress: string = null, cellStartedEdit = false) {

        // don't do it if not editable
        if (!this.isCellEditable()) { return; }

        // don't do it if already editing
        if (this.editingCell) { return; }

        let cellEditor = this.createCellEditor(keyPress, charPress, cellStartedEdit);
        if (cellEditor.isCancelBeforeStart && cellEditor.isCancelBeforeStart()) {
            if (cellEditor.destroy) {
                cellEditor.destroy();
            }
            return false;
        }

        if (!cellEditor.getGui) {
            console.warn(`ag-Grid: cellEditor for column ${this.column.getId()} is missing getGui() method`);

            // no getGui, for React guys, see if they attached a react component directly
            if ((<any>cellEditor).render) {
                console.warn(`ag-Grid: we found 'render' on the component, are you trying to set a React renderer but added it as colDef.cellEditor instead of colDef.cellEditorFmk?`);
            }

            return false;
        }

        this.cellEditor = cellEditor;
        this.editingCell = true;

        this.cellEditorInPopup = this.cellEditor.isPopup && this.cellEditor.isPopup();
        this.setInlineEditingClass();

        if (this.cellEditorInPopup) {
            this.addPopupCellEditor();
        } else {
            this.addInCellEditor();
        }

        if (cellEditor.afterGuiAttached) {
            cellEditor.afterGuiAttached();
        }

        let event: CellEditingStartedEvent = this.createEvent(null, Events.EVENT_CELL_EDITING_STARTED);
        this.beans.eventService.dispatchEvent(event);

        return true;
    }

    private addInCellEditor(): void {
        _.removeAllChildren(this.getGui());
        this.getGui().appendChild(this.cellEditor.getGui());

        if (this.beans.gridOptionsWrapper.isAngularCompileRows()) {
            this.beans.$compile(this.getGui())(this.scope);
        }
    }

    private addPopupCellEditor(): void {
        let ePopupGui = this.cellEditor.getGui();

        this.hideEditorPopup = this.beans.popupService.addAsModalPopup(
            ePopupGui,
            true,
            // callback for when popup disappears
            ()=> {
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

        if (this.beans.gridOptionsWrapper.isAngularCompileRows()) {
            this.beans.$compile(ePopupGui)(this.scope);
        }
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
            if (this.beans.focusedCellController.isCellFocused(this.gridCell)) {
                this.focusCell(true);
            }
        }
    }

    // if we are editing inline, then we don't have the padding in the cell (set in the themes)
    // to allow the text editor full access to the entire cell
    private setInlineEditingClass(): void {
        let editingInline = this.editingCell && !this.cellEditorInPopup;
        _.addOrRemoveCssClass(this.getGui(), 'ag-cell-inline-editing', editingInline);
        _.addOrRemoveCssClass(this.getGui(), 'ag-cell-not-inline-editing', !editingInline);
    }

    private createCellEditor(keyPress: number, charPress: string, cellStartedEdit: boolean): ICellEditorComp {

        let params = this.createCellEditorParams(keyPress, charPress, cellStartedEdit);

        let cellEditor = this.beans.cellEditorFactory.createCellEditor(this.column.getCellEditor(), params);

        return cellEditor;
    }

    private createCellEditorParams(keyPress: number, charPress: string, cellStartedEdit: boolean): ICellEditorParams {
        let params: ICellEditorParams = {
            value: this.getValue(),
            keyPress: keyPress,
            charPress: charPress,
            column: this.column,
            rowIndex: this.gridCell.rowIndex,
            node: this.rowNode,
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

        let colDef = this.column.getColDef();
        if (colDef.cellEditorParams) {
            _.assign(params, colDef.cellEditorParams);
        }

        return params;
    }

    // cell editors call this, when they want to stop for reasons other
    // than what we pick up on. eg selecting from a dropdown ends editing.
    private stopEditingAndFocus(): void {
        this.stopRowOrCellEdit();
        this.focusCell(true);
    }

    private parseValue(newValue: any): any {
        let params: NewValueParams = {
            node: this.rowNode,
            data: this.rowNode.data,
            oldValue: this.value,
            newValue: newValue,
            colDef: this.column.getColDef(),
            column: this.column,
            api: this.beans.gridOptionsWrapper.getApi(),
            columnApi: this.beans.gridOptionsWrapper.getColumnApi(),
            context: this.beans.gridOptionsWrapper.getContext()
        };

        let valueParser = this.column.getColDef().valueParser;
        return _.exists(valueParser) ? this.beans.expressionService.evaluate(valueParser, params) : newValue;
    }

    public focusCell(forceBrowserFocus = false): void {
        this.beans.focusedCellController.setFocusedCell(this.gridCell.rowIndex, this.column, this.rowNode.rowPinned, forceBrowserFocus);
    }

    public setFocusInOnEditor(): void {
        if (this.editingCell && this.cellEditor && this.cellEditor.focusIn) {
            this.cellEditor.focusIn();
        }
    }

    public isEditing(): boolean {
        return this.editingCell;
    }

    public onKeyDown(event: KeyboardEvent): void {
        let key = event.which || event.keyCode;

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
        if (this.editingCell) {
            this.stopRowOrCellEdit();
        }
        this.beans.rowRenderer.navigateToNextCell(event, key, this.gridCell.rowIndex, this.column, this.rowNode.rowPinned);
        // if we don't prevent default, the grid will scroll with the navigation keys
        event.preventDefault();
    }

    private onTabKeyDown(event: KeyboardEvent): void {
        if (this.beans.gridOptionsWrapper.isSuppressTabbing()) { return; }
        this.beans.rowRenderer.onTabKeyDown(this, event);
    }

    private onBackspaceOrDeleteKeyPressed(key: number): void {
        if (!this.editingCell) {
            this.startRowOrCellEdit(key);
        }
    }

    private onEnterKeyDown(): void {
        if (this.editingCell) {
            this.stopRowOrCellEdit();
            this.focusCell(true);
        } else {
            this.startRowOrCellEdit(Constants.KEY_ENTER);
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
        let eventTarget = _.getTarget(event);
        let eventOnChildComponent = eventTarget!==this.getGui();
        if (eventOnChildComponent) { return; }

        if (!this.editingCell) {
            let pressedChar = String.fromCharCode(event.charCode);
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
    }

    private onSpaceKeyPressed(event: KeyboardEvent): void {
        if (!this.editingCell && this.beans.gridOptionsWrapper.isRowSelection()) {
            let selected = this.rowNode.isSelected();
            this.rowNode.setSelected(!selected);
        }
        // prevent default as space key, by default, moves browser scroll down
        event.preventDefault();
    }

    private onMouseDown(): void {
        // we pass false to focusCell, as we don't want the cell to focus
        // also get the browser focus. if we did, then the cellRenderer could
        // have a text field in it, for example, and as the user clicks on the
        // text field, the text field, the focus doesn't get to the text
        // field, instead to goes to the div behind, making it impossible to
        // select the text field.
        this.focusCell(false);

        // if it's a right click, then if the cell is already in range,
        // don't change the range, however if the cell is not in a range,
        // we set a new range
        if (this.beans.rangeController) {
            let thisCell = this.gridCell;
            let cellAlreadyInRange = this.beans.rangeController.isCellInAnyRange(thisCell);
            if (!cellAlreadyInRange) {
                this.beans.rangeController.setRangeToCell(thisCell);
            }
        }
    }

    private onCellClicked(mouseEvent: MouseEvent): void {
        let cellClickedEvent: CellClickedEvent = this.createEvent(mouseEvent, Events.EVENT_CELL_CLICKED);
        this.beans.eventService.dispatchEvent(cellClickedEvent);

        let colDef = this.column.getColDef();

        if (colDef.onCellClicked) {
            colDef.onCellClicked(cellClickedEvent);
        }

        let editOnSingleClick = this.beans.gridOptionsWrapper.isSingleClickEdit()
            && !this.beans.gridOptionsWrapper.isSuppressClickEdit();
        if (editOnSingleClick) {
            this.startRowOrCellEdit();
        }

        this.doIeFocusHack();
    }

    // https://ag-grid.com/forum/showthread.php?tid=4362
    // when in IE or Edge, when you are editing a cell, then click on another cell,
    // the other cell doesn't keep focus, so navigation keys, type to start edit etc
    // don't work. appears that when you update the dom in IE it looses focus
    private doIeFocusHack(): void {
        if (_.isBrowserIE() || _.isBrowserEdge()) {
            if (_.missing(document.activeElement) || document.activeElement===document.body) {
                // console.log('missing focus');
                this.getGui().focus();
            }
        }
    }

    private createGridCell(): void {
        let gridCellDef = <GridCellDef> {
            rowIndex: this.rowNode.rowIndex,
            floating: this.rowNode.rowPinned,
            column: this.column
        };
        this.gridCell = new GridCell(gridCellDef);
    }

    public getGridCell(): GridCell {
        return this.gridCell;
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

    public detach(): void {
        this.eParentRow.removeChild(this.getGui());
    }

    public destroy(): void {
        this.active = false;
    }

    private onLeftChanged(): void {
        let left = this.column.getLeft();
        this.getGui().style.left = left + 'px';
    }

    private onWidthChanged(): void {
        let width = this.column.getActualWidth();
        this.getGui().style.width = width + 'px';
    }

    private getRangeClasses(): string[] {
        let res: string[] = [];
        if (!this.beans.enterprise) { return res; }
        this.rangeCount = this.beans.rangeController.getCellRangeCount(this.gridCell);
        if (this.rangeCount!==0) { res.push('ag-cell-range-selected'); }
        if (this.rangeCount===1) { res.push('ag-cell-range-selected-1'); }
        if (this.rangeCount===2) { res.push('ag-cell-range-selected-2'); }
        if (this.rangeCount===3) { res.push('ag-cell-range-selected-3'); }
        if (this.rangeCount>=4) { res.push('ag-cell-range-selected-4'); }
        return res;
    }

    private onRangeSelectionChanged(): void {
        let newRangeCount = this.beans.rangeController.getCellRangeCount(this.gridCell);
        let eGui = this.getGui();
        if (this.rangeCount !== newRangeCount) {
            _.addOrRemoveCssClass(eGui, 'ag-cell-range-selected', newRangeCount!==0);
            _.addOrRemoveCssClass(eGui, 'ag-cell-range-selected-1', newRangeCount===1);
            _.addOrRemoveCssClass(eGui, 'ag-cell-range-selected-2', newRangeCount===2);
            _.addOrRemoveCssClass(eGui, 'ag-cell-range-selected-3', newRangeCount===3);
            _.addOrRemoveCssClass(eGui, 'ag-cell-range-selected-4', newRangeCount>=4);
            this.rangeCount = newRangeCount;
        }
    }

    public afterAttached(): void {
        let querySelector = `[colid="${this.column.getId()}"]`;
        let eGui = <HTMLElement> this.eParentRow.querySelector(querySelector);
        this.setGui(eGui);

        // all of these have dependencies on the eGui, so only do them after eGui is set
        this.addDomData();
        this.addSelectionCheckbox();
        this.useCellRenderer();

        this.addDestroyableEventListener(this.column, Column.EVENT_LEFT_CHANGED, this.onLeftChanged.bind(this));
        this.addDestroyableEventListener(this.column, Column.EVENT_WIDTH_CHANGED, this.onWidthChanged.bind(this));
        this.addDestroyableEventListener(this.beans.eventService, Events.EVENT_CELL_FOCUSED, this.onCellFocused.bind(this));

        // range controller not present if using ag-Grid free
        if (this.beans.enterprise && this.beans.gridOptionsWrapper.isEnableRangeSelection()) {
            this.addDestroyableEventListener(this.beans.eventService, Events.EVENT_RANGE_SELECTION_CHANGED, this.onRangeSelectionChanged.bind(this))
        }
    }

    private addSelectionCheckbox(): void {
        if (this.usingWrapper) {
            this.eParentOfValue = this.getRefElement('eCellValue');
            this.eCellWrapper = this.getRefElement('eCellWrapper');

            let cbSelectionComponent = new CheckboxSelectionComponent();
            this.beans.context.wireBean(cbSelectionComponent);

            let visibleFunc = this.column.getColDef().checkboxSelection;
            visibleFunc = typeof visibleFunc === 'function' ? visibleFunc : null;

            cbSelectionComponent.init({rowNode: this.rowNode, column: this.column, visibleFunc: visibleFunc});
            this.addDestroyFunc( ()=> cbSelectionComponent.destroy() );

            // put the checkbox in before the value
            this.eCellWrapper.insertBefore(cbSelectionComponent.getGui(), this.eParentOfValue);

        } else {
            this.eParentOfValue = this.getGui();
        }
    }

    private addDomData(): void {
        let eGui = this.getGui();
        this.beans.gridOptionsWrapper.setDomData(eGui, CellComp.DOM_DATA_KEY_CELL_COMP, this);
        this.addDestroyFunc( ()=>
            this.beans.gridOptionsWrapper.setDomData(eGui, CellComp.DOM_DATA_KEY_CELL_COMP, null)
        );
    }

    private onCellFocused(event?: any): void {
        let cellFocused = this.beans.focusedCellController.isCellFocused(this.gridCell);

        // see if we need to change the classes on this cell
        if (cellFocused !== this.cellFocused) {
            _.addOrRemoveCssClass(this.getGui(), 'ag-cell-focus', cellFocused);
            _.addOrRemoveCssClass(this.getGui(), 'ag-cell-no-focus', !cellFocused);
            this.cellFocused = cellFocused;
        }

        // if this cell was just focused, see if we need to force browser focus, his can
        // happen if focus is programmatically set.
        if (cellFocused && event && event.forceBrowserFocus) {
            this.getGui().focus();
        }

        // if another cell was focused, and we are editing, then stop editing
        let fullRowEdit = this.beans.gridOptionsWrapper.isFullRowEdit();
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

        if (!cancel) {
            // also have another option here to cancel after editing, so for example user could have a popup editor and
            // it is closed by user clicking outside the editor. then the editor will close automatically (with false
            // passed above) and we need to see if the editor wants to accept the new value.
            let userWantsToCancel = this.cellEditor.isCancelAfterEnd && this.cellEditor.isCancelAfterEnd();
            if (!userWantsToCancel) {
                let newValue = this.cellEditor.getValue();
                this.beans.valueService.setValue(this.rowNode, this.column, newValue);
                this.value = this.getValue();
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

        if (this.cellEditorInPopup) {
            this.hideEditorPopup();
            this.hideEditorPopup = null;
        } else {
            _.removeAllChildren(this.getGui());
            // put the cell back the way it was before editing
            if (this.usingWrapper) {
                // if wrapper, then put the wrapper back
                this.getGui().appendChild(this.eCellWrapper);
            } else {
                // if cellRenderer, then put the gui back in. if the renderer has
                // a refresh, it will be called. however if it doesn't, then later
                // the renderer will be destroyed and a new one will be created.
                if (this.cellRenderer) {
                    this.beans.cellRendererService.bindToHtml(this.cellRenderer, this.getGui());
                }
            }
        }

        this.setInlineEditingClass();

        // we suppress the flash, as it is not correct to flash the cell the user has finished editing,
        // the user doesn't need to flash as they were the one who did the edit, the flash is pointless
        // (as the flash is meant to draw the user to a change that they didn't manually do themselves).
        this.refreshCell({forceRefresh: true, suppressFlash: true});

        let event: CellEditingStoppedEvent = this.createEvent(null, Events.EVENT_CELL_EDITING_STOPPED);
        this.beans.eventService.dispatchEvent(event);
    }

}
