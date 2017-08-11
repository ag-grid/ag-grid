import {Component} from "../widgets/component";
import {Beans} from "./beans";
import {Column} from "../entities/column";
import {RowNode} from "../entities/rowNode";
import {SlickRowComp} from "./slickRowComp";
import {_} from "../utils";
import {SetLeftFeature} from "./features/setLeftFeature";
import {CellComp, ICellComp} from "./cellComp";
import {GridCell, GridCellDef} from "../entities/gridCell";
import {
    CellClickedEvent, CellContextMenuEvent, CellDoubleClickedEvent, CellEvent, CellMouseOutEvent,
    CellMouseOverEvent, Events
} from "../events";
import {CheckboxSelectionComponent} from "./checkboxSelectionComponent";

export class SlickCellComp extends Component implements ICellComp {

    private eCellWrapper: HTMLElement;
    private eParentOfValue: HTMLElement;

    private beans: Beans;
    private column: Column;
    private rowNode: RowNode;
    private slickRowComp: SlickRowComp;
    private eParentRow: HTMLElement;
    private active = true;
    private gridCell: GridCell;
    private rangeCount: number;
    private usingWrapper: boolean;

    //todo: this is not getting set yet
    private value: any;
    //todo: this is not getting set yet
    private scope: null;

    constructor(beans: Beans, column: Column, rowNode: RowNode, slickRowComp: SlickRowComp) {
        super();
        this.beans = beans;
        this.column = column;
        this.rowNode = rowNode;
        this.slickRowComp = slickRowComp;

        this.createGridCell();
        this.setUsingWrapper();
    }

    public getCreateTemplate(): string {
        let template: string[] = [];
        let col = this.column;

        let width = col.getActualWidth();
        let left = col.getLeft();
        let value = this.getValue(col);
        let valueFormatted = this.beans.valueFormatterService.formatValue(col, this.rowNode, null, value);
        let valueFormattedExits = valueFormatted !== null && valueFormatted !== undefined;
        let valueToRender = valueFormattedExits ? valueFormatted : value;

        let cssClasses: string[] = ["ag-cell", "ag-cell-no-focus", "ag-cell-not-inline-editing"];
        let wrapperStart: string;
        let wrapperEnd: string;

        // let cssWrapperClasses: string[] = [];

        if (this.usingWrapper) {
            wrapperStart = '<span ref="eCellWrapper" class="ag-cell-wrapper"><span ref="eCellValue" class="ag-cell-value">';
            wrapperEnd = '</span></span>';
        } else {
            cssClasses.push('ag-cell-value');
        }

        _.pushAll(cssClasses, this.getClassesFromColDef(col, value));
        _.pushAll(cssClasses, this.getClassesFromRules(col, value));
        _.pushAll(cssClasses, this.getRangeClasses());

        template.push(`<div`);
        template.push(` role="gridcell"`);
        template.push(` colid="${col.getId()}"`);
        template.push(` class="${cssClasses.join(' ')}"`);
        template.push(` style="width: ${width}px; left: ${left}px;" >`);
        template.push(wrapperStart);
        template.push(valueToRender);
        template.push(wrapperEnd);
        template.push(`</div>`);

        return template.join('');
    }

    private getClassesFromColDef(column: Column, value: any): string[] {

        let res: string[] = [];

        this.beans.stylingService.processStaticCellClasses(
            column.getColDef(),
            {
                value: value,
                data: this.rowNode.data,
                node: this.rowNode,
                colDef: column.getColDef(),
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

    private getClassesFromRules(column: Column, value: any): string[] {

        let res: string[] = [];

        this.beans.stylingService.processCellClassRules(
            column.getColDef(),
            {
                value: value,
                data: this.rowNode.data,
                node: this.rowNode,
                colDef: column.getColDef(),
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


    /*    private putDataIntoCell() {
            // template gets preference, then cellRenderer, then do it ourselves
            let colDef = this.column.getColDef();

            let cellRenderer = this.column.getCellRenderer();
            let floatingCellRenderer = this.column.getFloatingCellRenderer();

            let valueFormatted = this.beans.valueFormatterService.formatValue(this.column, this.rowNode, this.scope, this.value);

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
            } else if (floatingCellRenderer && this.node.rowPinned) {
                // if floating, then give preference to floating cell renderer
                this.useCellRenderer(floatingCellRenderer, colDef.pinnedRowCellRendererParams, valueFormatted);
            } else if (cellRenderer) {
                // if we insert undefined, then it displays as the string 'undefined', ugly!
                let valueFormattedExits = valueFormatted !== null && valueFormatted !== undefined;
                let valueToRender = valueFormattedExits ? valueFormatted : this.value;
                this.useCellRenderer(cellRenderer, colDef.cellRendererParams, valueToRender);
            } else {
                let valueFormattedExits = valueFormatted !== null && valueFormatted !== undefined;
                let valueToRender = valueFormattedExits ? valueFormatted : this.value;
                if (valueToRender!==null && valueToRender!==undefined) {
                    this.eParentOfValue.innerText = valueToRender;
                }
            }
            if (colDef.tooltipField) {
                let data = this.node.data;
                if (_.exists(data)) {
                    let tooltip = _.getValueUsingField(data, colDef.tooltipField, this.column.isTooltipFieldContainsDots());
                    if (_.exists(tooltip)) {
                        this.eParentOfValue.setAttribute('title', tooltip);
                    }
                }
            }
        }*/

    private getValue(column: Column): any {
        let isOpenGroup = this.rowNode.group && this.rowNode.expanded && !this.rowNode.footer;
        if (isOpenGroup && this.beans.gridOptionsWrapper.isGroupIncludeFooter()) {
            // if doing grouping and footers, we don't want to include the agg value
            // in the header when the group is open
            return this.beans.valueService.getValue(column, this.rowNode, true);
        } else {
            return this.beans.valueService.getValue(column, this.rowNode);
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

    // todo
    public onKeyDown(event: KeyboardEvent): void {
        console.log('onKeyDown not implemented yet in slick rendering');
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

    // public getGui(): HTMLElement {
    //     let res = super.getGui();
    //     if (!res) {
    //         res = this.slickRowComp.getElementForCell(this.column);
    //         this.setGui(res);
    //     }
    //     return res;
    // }

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
        this.addDestroyableEventListener(this.column, Column.EVENT_LEFT_CHANGED, this.onLeftChanged.bind(this));
        this.addDestroyableEventListener(this.column, Column.EVENT_WIDTH_CHANGED, this.onWidthChanged.bind(this));

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

}
