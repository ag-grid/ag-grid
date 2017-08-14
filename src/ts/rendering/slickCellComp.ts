import {Component} from "../widgets/component";
import {Beans} from "./beans";
import {Column} from "../entities/column";
import {RowNode} from "../entities/rowNode";
import {SlickRowComp} from "./slickRowComp";
import {_} from "../utils";
import {CellComp, ICellComp} from "./cellComp";
import {GridCell, GridCellDef} from "../entities/gridCell";
import {
    CellClickedEvent, CellContextMenuEvent, CellDoubleClickedEvent, CellEditingStoppedEvent, CellEvent,
    CellMouseOutEvent,
    CellMouseOverEvent, Events
} from "../events";
import {CheckboxSelectionComponent} from "./checkboxSelectionComponent";
import {ICellRendererComp, ICellRendererFunc, ICellRendererParams} from "./cellRenderers/iCellRenderer";
import {ICellEditorComp} from "./cellEditors/iCellEditor";
import {IRowComp} from "./rowComp";
import {Constants} from "../constants";

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
        // this.selectCellRenderer();
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
        } else if (colDef.textCellRenderer) {
            let valueFormatted = this.beans.valueFormatterService.formatValue(
                this.column, this.rowNode, null, this.value);
            let valueFormattedExits = valueFormatted !== null && valueFormatted !== undefined;
            let valueToRender = valueFormattedExits ? valueFormatted : this.value;
            let params = this.createRendererAndRefreshParams(valueToRender, this.cellRendererParams);
            return colDef.textCellRenderer(params);
        } else {
            let valueFormatted = this.beans.valueFormatterService.formatValue(
                this.column, this.rowNode, null, this.value);
            let valueFormattedExits = valueFormatted !== null && valueFormatted !== undefined;
            return valueFormattedExits ? valueFormatted : this.value;
        }
    }

    // + stop editing {dontSkipRefresh: true}
    // + event cellChanged {}
    // + cellRenderer.params.refresh() {} -> method passes 'as is' to the cellRenderer, so params could be anything
    // + rowComp: event dataChanged {animate: update, newData: !update}
    // + rowComp: api refreshCells() {animate: true/false}
    // + rowRenderer: api softRefreshView() {}
    public refreshCell(params?: {suppressFlash?: boolean, newData?: boolean, forceRefresh?: boolean, volatile?: boolean}): void {
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
        _.pushAll(cssClasses, this.getClassesFromRules());
        _.pushAll(cssClasses, this.getRangeClasses());

        template.push(`<div`);
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

    private getClassesFromRules(): string[] {

        let res: string[] = [];

        this.beans.stylingService.processCellClassRules(
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
            },
            (className:string)=>{
                // not catered for
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

    // todo
    private startRowOrCellEdit(): void {
        console.log('startRowOrCellEdit not implemented yet in slick rendering');
    }

    public focusCell(forceBrowserFocus = false): void {
        this.beans.focusedCellController.setFocusedCell(this.gridCell.rowIndex, this.column, this.rowNode.rowPinned, forceBrowserFocus);
    }

    public isEditing(): boolean {
        return false;
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

    private onNavigationKeyPressed(event: KeyboardEvent, key: number): void {
        // if (this.editingCell) {
        //     this.stopRowOrCellEdit();
        // }
        // this.beans.rowRenderer.navigateToNextCell(event, key, this.gridCell.rowIndex, this.column, this.node.rowPinned);
        // // if we don't prevent default, the grid will scroll with the navigation keys
        // event.preventDefault();
    }

    private onTabKeyDown(event: KeyboardEvent): void {
        // if (this.beans.gridOptionsWrapper.isSuppressTabbing()) { return; }
        // this.beans.rowRenderer.onTabKeyDown(this, event);
    }

    private onBackspaceOrDeleteKeyPressed(key: number): void {
        // if (!this.editingCell) {
        //     this.startRowOrCellEdit(key);
        // }
    }

    private onEnterKeyDown(): void {
        // if (this.editingCell) {
        //     this.stopRowOrCellEdit();
        //     this.focusCell(true);
        // } else {
        //     this.startRowOrCellEdit(Constants.KEY_ENTER);
        // }
    }

    private onF2KeyDown(): void {
        // if (!this.editingCell) {
        //     this.startRowOrCellEdit(Constants.KEY_F2);
        // }
    }

    private onEscapeKeyDown(): void {
        // if (this.editingCell) {
        //     this.stopRowOrCellEdit(true);
        //     this.focusCell(true);
        // }
    }

    // todo
    public onKeyPress(event: KeyboardEvent): void {
        console.log('onKeyPress not implemented yet in slick rendering');
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

            // let cbSelectionComponent = new CheckboxSelectionComponent();
            // this.beans.context.wireBean(cbSelectionComponent);
            //
            // let visibleFunc = this.column.getColDef().checkboxSelection;
            // visibleFunc = typeof visibleFunc === 'function' ? visibleFunc : null;
            //
            // cbSelectionComponent.init({rowNode: this.rowNode, column: this.column, visibleFunc: visibleFunc});
            // this.addDestroyFunc( ()=> cbSelectionComponent.destroy() );
            //
            // // put the checkbox in before the value
            // this.eCellWrapper.insertBefore(cbSelectionComponent.getGui(), this.eParentOfValue);

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
            // fixme
            // this.stopRowOrCellEdit();
        }
    }

    // pass in 'true' to cancel the editing.
    public stopRowOrCellEdit(cancel: boolean = false) {
        if (this.beans.gridOptionsWrapper.isFullRowEdit()) {
            //fixme
            // this.rowComp.stopRowEditing(cancel);
        } else {
            this.stopEditing(cancel);
        }
    }

    public stopEditing(cancel = false): void {
        // if (!this.editingCell) {
        //     return;
        // }
        //
        // if (!cancel) {
        //     // also have another option here to cancel after editing, so for example user could have a popup editor and
        //     // it is closed by user clicking outside the editor. then the editor will close automatically (with false
        //     // passed above) and we need to see if the editor wants to accept the new value.
        //     let userWantsToCancel = this.cellEditor.isCancelAfterEnd && this.cellEditor.isCancelAfterEnd();
        //     if (!userWantsToCancel) {
        //         let newValue = this.cellEditor.getValue();
        //         this.beans.valueService.setValue(this.node, this.column, newValue);
        //         this.value = this.getValue();
        //     }
        // }
        //
        // // it is important we set this after setValue() above, as otherwise the cell will flash
        // // when editing stops. the 'refresh' method checks editing, and doesn't refresh editing cells.
        // // thus it will skip the refresh on this cell until the end of this method where we call
        // // refresh directly and we suppress the flash.
        // this.editingCell = false;
        //
        // if (this.cellEditor.destroy) {
        //     this.cellEditor.destroy();
        // }
        //
        // if (this.cellEditorInPopup) {
        //     this.hideEditorPopup();
        //     this.hideEditorPopup = null;
        // } else {
        //     _.removeAllChildren(this.eGridCell);
        //     // put the cell back the way it was before editing
        //     if (this.usingWrapper) {
        //         // if wrapper, then put the wrapper back
        //         this.eGridCell.appendChild(this.eCellWrapper);
        //     } else {
        //         this.beans.cellRendererService.bindToHtml(this.cellRenderer, this.eGridCell);
        //     }
        // }
        //
        // this.setInlineEditingClass();
        //
        // // we suppress the flash, as it is not correct to flash the cell the user has finished editing,
        // // the user doesn't need to flash as they were the one who did the edit, the flash is pointless
        // // (as the flash is meant to draw the user to a change that they didn't manually do themselves).
        // this.refreshCell({forceRefresh: true, suppressFlash: true});
        //
        // let event: CellEditingStoppedEvent = this.createEvent(null, Events.EVENT_CELL_EDITING_STOPPED);
        // this.beans.eventService.dispatchEvent(event);
    }

}
