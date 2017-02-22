import {Utils as _} from "../utils";
import {Column} from "../entities/column";
import {RowNode} from "../entities/rowNode";
import {GridOptionsWrapper} from "../gridOptionsWrapper";
import {ExpressionService} from "../expressionService";
import {RowRenderer} from "./rowRenderer";
import {TemplateService} from "../templateService";
import {ColumnController, ColumnApi} from "../columnController/columnController";
import {ValueService} from "../valueService";
import {EventService} from "../eventService";
import {Constants} from "../constants";
import {Events, CellEvent} from "../events";
import {RenderedRow} from "./renderedRow";
import {Autowired, PostConstruct, Optional, Context} from "../context/context";
import {GridApi} from "../gridApi";
import {FocusedCellController} from "../focusedCellController";
import {IContextMenuFactory} from "../interfaces/iContextMenuFactory";
import {IRangeController} from "../interfaces/iRangeController";
import {GridCell, GridCellDef} from "../entities/gridCell";
import {FocusService} from "../misc/focusService";
import {ICellEditorComp, ICellEditorParams} from "./cellEditors/iCellEditor";
import {CellEditorFactory} from "./cellEditorFactory";
import {Component} from "../widgets/component";
import {PopupService} from "../widgets/popupService";
import {ICellRenderer, ICellRendererFunc, ICellRendererComp, ICellRendererParams} from "./cellRenderers/iCellRenderer";
import {CellRendererFactory} from "./cellRendererFactory";
import {CellRendererService} from "./cellRendererService";
import {ValueFormatterService} from "./valueFormatterService";
import {CheckboxSelectionComponent} from "./checkboxSelectionComponent";
import {SetLeftFeature} from "./features/setLeftFeature";
import {MethodNotImplementedException} from "../misc/methodNotImplementedException";
import {StylingService} from "../styling/stylingService";
import {ColumnHoverService} from "./columnHoverService";
import {ColumnAnimationService} from "./columnAnimationService";

export class RenderedCell extends Component {

    @Autowired('context') private context: Context;
    @Autowired('columnApi') private columnApi: ColumnApi;
    @Autowired('gridApi') private gridApi: GridApi;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('expressionService') private expressionService: ExpressionService;
    @Autowired('rowRenderer') private rowRenderer: RowRenderer;
    @Autowired('$compile') private $compile: any;
    @Autowired('templateService') private templateService: TemplateService;
    @Autowired('valueService') private valueService: ValueService;
    @Autowired('eventService') private eventService: EventService;
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('columnAnimationService') private columnAnimationService: ColumnAnimationService;
    @Optional('rangeController') private rangeController: IRangeController;
    @Autowired('focusedCellController') private focusedCellController: FocusedCellController;
    @Optional('contextMenuFactory') private contextMenuFactory: IContextMenuFactory;
    @Autowired('focusService') private focusService: FocusService;
    @Autowired('cellEditorFactory') private cellEditorFactory: CellEditorFactory;
    @Autowired('cellRendererFactory') private cellRendererFactory: CellRendererFactory;
    @Autowired('popupService') private popupService: PopupService;
    @Autowired('cellRendererService') private cellRendererService: CellRendererService;
    @Autowired('valueFormatterService') private valueFormatterService: ValueFormatterService;
    @Autowired('stylingService') private stylingService: StylingService;
    @Autowired('columnHoverService') private columnHoverService: ColumnHoverService;

    private static PRINTABLE_CHARACTERS = 'qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM1234567890!"£$%^&*()_+-=[];\'#,./\|<>?:@~{}';

    private eGridCell: HTMLElement; // the outer cell
    private eSpanWithValue: HTMLElement; // inner cell
    private eCellWrapper: HTMLElement;
    private eParentOfValue: HTMLElement;

    private gridCell: GridCell; // this is a pojo, not a gui element

    // we do not use this in this class, however the renderedRow wants to konw this
    private eParentRow: HTMLElement;

    private column: Column;
    private node: RowNode;
    private editingCell: boolean;
    private cellEditorInPopup: boolean;
    private hideEditorPopup: Function;

    // set to null, not false, as we need to set 'ag-cell-no-focus' first time around
    private cellFocused: boolean = null;

    private scope: any;

    private cellEditor: ICellEditorComp;
    private cellRenderer: ICellRendererComp;

    private value: any;
    private usingWrapper: boolean;
    private renderedRow: RenderedRow;

    private firstRightPinned = false;
    private lastLeftPinned = false;

    constructor(column: Column, node: RowNode, scope: any, renderedRow: RenderedRow) {
        super('<div/>');

        // because we reference eGridCell everywhere in this class,
        // we keep a local reference
        this.eGridCell = this.getGui();

        this.column = column;

        this.node = node;
        this.scope = scope;
        this.renderedRow = renderedRow;

        this.setupGridCell();
    }

    private createGridCell(): void {
        let gridCellDef = <GridCellDef> {
            rowIndex: this.node.rowIndex,
            floating: this.node.floating,
            column: this.column
        };
        this.gridCell = new GridCell(gridCellDef);
    }

    private setupGridCell(): void {
        var listener = () => {
            // when index changes, this influences items that need the index, so we update the
            // grid cell so they are working off the new index.
            this.createGridCell();
            // when the index of the row changes, ie means the cell may have lost of gained focus
            this.checkCellFocused();
        };

        this.addDestroyableEventListener(this.node, RowNode.EVENT_ROW_INDEX_CHANGED, listener);

        this.createGridCell();
    }

    public getGridCell(): GridCell {
        return this.gridCell;
    }

    public setFocusInOnEditor(): void {
        if (this.editingCell && this.cellEditor && this.cellEditor.focusIn) {
            this.cellEditor.focusIn();
        }
    }

    public setFocusOutOnEditor(): void {
        if (this.editingCell && this.cellEditor && this.cellEditor.focusOut) {
            this.cellEditor.focusOut();
        }
    }

    public destroy(): void {
        super.destroy();

        if (this.eParentRow) {
            this.eParentRow.removeChild(this.getGui());
            this.eParentRow = null;
        }

        if (this.cellEditor && this.cellEditor.destroy) {
            this.cellEditor.destroy();
        }
        if (this.cellRenderer && this.cellRenderer.destroy) {
            this.cellRenderer.destroy();
        }
    }

    private setPinnedClasses(): void {
        var firstPinnedChangedListener = () => {
            if (this.firstRightPinned !== this.column.isFirstRightPinned()) {
                this.firstRightPinned = this.column.isFirstRightPinned();
                _.addOrRemoveCssClass(this.eGridCell, 'ag-cell-first-right-pinned', this.firstRightPinned);
            }

            if (this.lastLeftPinned !== this.column.isLastLeftPinned()) {
                this.lastLeftPinned = this.column.isLastLeftPinned();
                _.addOrRemoveCssClass(this.eGridCell, 'ag-cell-last-left-pinned', this.lastLeftPinned);
            }
        };

        this.addDestroyableEventListener(this.column, Column.EVENT_FIRST_RIGHT_PINNED_CHANGED, firstPinnedChangedListener);
        this.addDestroyableEventListener(this.column, Column.EVENT_LAST_LEFT_PINNED_CHANGED, firstPinnedChangedListener);

        firstPinnedChangedListener();
    }

    public getParentRow(): HTMLElement {
        return this.eParentRow;
    }

    public setParentRow(eParentRow: HTMLElement): void {
        this.eParentRow = eParentRow;
    }

    public setupCheckboxSelection(): void {
        // if boolean set, then just use it
        let colDef = this.column.getColDef();

        // never allow selection on floating rows
        if (this.node.floating) {
            this.usingWrapper = false;
        } else if (typeof colDef.checkboxSelection === 'boolean') {
            this.usingWrapper = <boolean> colDef.checkboxSelection;
        } else if (typeof colDef.checkboxSelection === 'function') {
            this.usingWrapper = true;
        } else {
            this.usingWrapper = false;
        }
    }

    public getColumn(): Column {
        return this.column;
    }

    private getValue(): any {
        var data = this.getDataForRow();
        return this.valueService.getValueUsingSpecificData(this.column, data, this.node);
    }

    private getDataForRow() {
        if (this.node.footer) {
            // if footer, we always show the data
            return this.node.data;
        } else if (this.node.group) {
            // if header and header is expanded, we show data in footer only
            var footersEnabled = this.gridOptionsWrapper.isGroupIncludeFooter();
            var suppressHideHeader = this.gridOptionsWrapper.isGroupSuppressBlankHeader();
            if (this.node.expanded && footersEnabled && !suppressHideHeader) {
                return undefined;
            } else {
                return this.node.data;
            }
        } else {
            // otherwise it's a normal node, just return data as normal
            return this.node.data;
        }
    }

    private addRangeSelectedListener(): void {
        if (!this.rangeController) {
            return;
        }
        var rangeCountLastTime: number = 0;
        var rangeSelectedListener = () => {

            var rangeCount = this.rangeController.getCellRangeCount(this.gridCell);
            if (rangeCountLastTime !== rangeCount) {
                _.addOrRemoveCssClass(this.eGridCell, 'ag-cell-range-selected', rangeCount!==0);
                _.addOrRemoveCssClass(this.eGridCell, 'ag-cell-range-selected-1', rangeCount===1);
                _.addOrRemoveCssClass(this.eGridCell, 'ag-cell-range-selected-2', rangeCount===2);
                _.addOrRemoveCssClass(this.eGridCell, 'ag-cell-range-selected-3', rangeCount===3);
                _.addOrRemoveCssClass(this.eGridCell, 'ag-cell-range-selected-4', rangeCount>=4);
                rangeCountLastTime = rangeCount;
            }
        };
        this.eventService.addEventListener(Events.EVENT_RANGE_SELECTION_CHANGED, rangeSelectedListener);
        this.addDestroyFunc( ()=> {
            this.eventService.removeEventListener(Events.EVENT_RANGE_SELECTION_CHANGED, rangeSelectedListener);
        });
        rangeSelectedListener();
    }

    private addHighlightListener(): void {
        if (!this.rangeController) {
            return;
        }

        var clipboardListener = (event: any) => {
            var cellId = this.gridCell.createId();
            var shouldFlash = event.cells[cellId];
            if (shouldFlash) {
                this.animateCellWithHighlight();
            }
        };
        this.eventService.addEventListener(Events.EVENT_FLASH_CELLS, clipboardListener);
        this.addDestroyFunc( ()=> {
            this.eventService.removeEventListener(Events.EVENT_FLASH_CELLS, clipboardListener);
        });
    }

    private addChangeListener(): void {
        var cellChangeListener = (event: any) => {
            if (event.column === this.column) {
                this.refreshCell();
                this.animateCellWithDataChanged();
            }
        };
        this.addDestroyableEventListener(this.node, RowNode.EVENT_CELL_CHANGED, cellChangeListener);
    }

    private animateCellWithDataChanged(): void {
        if (this.gridOptionsWrapper.isEnableCellChangeFlash() || this.column.getColDef().enableCellChangeFlash) {
            this.animateCell('data-changed');
        }
    }

    private animateCellWithHighlight(): void {
        this.animateCell('highlight');
    }

    private animateCell(cssName: string): void {
        var fullName = 'ag-cell-' + cssName;
        var animationFullName = 'ag-cell-' + cssName + '-animation';
        // we want to highlight the cells, without any animation
        _.addCssClass(this.eGridCell, fullName);
        _.removeCssClass(this.eGridCell, animationFullName);
        // then once that is applied, we remove the highlight with animation
        setTimeout( ()=> {
            _.removeCssClass(this.eGridCell, fullName);
            _.addCssClass(this.eGridCell, animationFullName);
            setTimeout( ()=> {
                // and then to leave things as we got them, we remove the animation
                _.removeCssClass(this.eGridCell, animationFullName);
            }, 1000);
        }, 500);
    }

    private addCellFocusedListener(): void {
        var cellFocusedListener = this.checkCellFocused.bind(this);

        this.eventService.addEventListener(Events.EVENT_CELL_FOCUSED, cellFocusedListener);
        this.addDestroyFunc( ()=> {
            this.eventService.removeEventListener(Events.EVENT_CELL_FOCUSED, cellFocusedListener);
        });
        cellFocusedListener();
    }

    private checkCellFocused(event?: any): void {
        var cellFocused = this.focusedCellController.isCellFocused(this.gridCell);

        // see if we need to change the classes on this cell
        if (cellFocused !== this.cellFocused) {
            _.addOrRemoveCssClass(this.eGridCell, 'ag-cell-focus', cellFocused);
            _.addOrRemoveCssClass(this.eGridCell, 'ag-cell-no-focus', !cellFocused);
            this.cellFocused = cellFocused;
        }

        // if this cell was just focused, see if we need to force browser focus, his can
        // happen if focus is programmatically set.
        if (cellFocused && event && event.forceBrowserFocus) {
            this.eGridCell.focus();
        }

        // if another cell was focused, and we are editing, then stop editing
        var fullRowEdit = this.gridOptionsWrapper.isFullRowEdit();
        if (!cellFocused && !fullRowEdit && this.editingCell) {
            this.stopRowOrCellEdit();
        }
    }

    private setWidthOnCell(): void {
        var widthChangedListener = () => {
            this.eGridCell.style.width = this.column.getActualWidth() + "px";
        };

        this.column.addEventListener(Column.EVENT_WIDTH_CHANGED, widthChangedListener);
        this.addDestroyFunc( () => {
            this.column.removeEventListener(Column.EVENT_WIDTH_CHANGED, widthChangedListener);
        });

        widthChangedListener();
    }

    @PostConstruct
    public init(): void {
        this.value = this.getValue();

        this.setupCheckboxSelection();

        this.setWidthOnCell();
        this.setPinnedClasses();
        this.addRangeSelectedListener();
        this.addHighlightListener();
        this.addChangeListener();
        this.addCellFocusedListener();
        this.addColumnHoverListener();

        this.addDomData();

        // this.addSuppressShortcutKeyListenersWhileEditing();
        this.addFeature(this.context, new SetLeftFeature(this.column, this.eGridCell));

        // only set tab index if cell selection is enabled
        if (!this.gridOptionsWrapper.isSuppressCellSelection()) {
            this.eGridCell.setAttribute("tabindex", "-1");
        }

        // these are the grid styles, don't change between soft refreshes
        this.addClasses();
        this.setInlineEditingClass();
        this.createParentOfValue();
        this.populateCell();
    }

    private addColumnHoverListener(): void {
        this.addDestroyableEventListener(this.eventService, Events.EVENT_COLUMN_HOVER_CHANGED, this.onColumnHover.bind(this));
        this.onColumnHover();
    }

    private onColumnHover(): void {
        var isHovered = this.columnHoverService.isHovered(this.column);
        _.addOrRemoveCssClass(this.getGui(), 'ag-column-hover', isHovered)
    }

    private addDomData(): void {
        var domDataKey = this.gridOptionsWrapper.getDomDataKey();
        var gridCellNoType = <any>this.eGridCell;
        gridCellNoType[domDataKey] = {
            renderedCell: this
        };
        this.addDestroyFunc( ()=> gridCellNoType[domDataKey] = null );
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
            if (this.focusedCellController.isCellFocused(this.gridCell)) {
                this.focusCell(true);
            }
        }
    }

    public isEditing(): boolean {
        return this.editingCell;
    }

    private onTabKeyDown(event: KeyboardEvent): void {
        if (this.gridOptionsWrapper.isSuppressTabbing()) { return; }
        this.rowRenderer.onTabKeyDown(this, event);
    }

    private onBackspaceOrDeleteKeyPressed(key: number): void {
        if (!this.editingCell) {
            this.startRowOrCellEdit(key);
        }
    }

    private onSpaceKeyPressed(event: KeyboardEvent): void {
        if (!this.editingCell && this.gridOptionsWrapper.isRowSelection()) {
            var selected = this.node.isSelected();
            this.node.setSelected(!selected);
        }
        // prevent default as space key, by default, moves browser scroll down
        event.preventDefault();
    }

    private onNavigationKeyPressed(event: KeyboardEvent, key: number): void {
        if (this.editingCell) {
            this.stopRowOrCellEdit();
        }
        this.rowRenderer.navigateToNextCell(event, key, this.gridCell.rowIndex, this.column, this.node.floating);
        // if we don't prevent default, the grid will scroll with the navigation keys
        event.preventDefault();
    }

    public onKeyPress(event: KeyboardEvent): void {
        // check this, in case focus is on a (for example) a text field inside the cell,
        // in which cse we should not be listening for these key pressed
        var eventTarget = _.getTarget(event);
        var eventOnChildComponent = eventTarget!==this.getGui();
        if (eventOnChildComponent) { return; }

        if (!this.editingCell) {
            var pressedChar = String.fromCharCode(event.charCode);
            if (pressedChar === ' ') {
                this.onSpaceKeyPressed(event);
            } else {
                if (RenderedCell.PRINTABLE_CHARACTERS.indexOf(pressedChar)>=0) {
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

    public onKeyDown(event: KeyboardEvent): void {
        var key = event.which || event.keyCode;

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

    private createCellEditorParams(keyPress: number, charPress: string, cellStartedEdit: boolean): ICellEditorParams {
        var params: ICellEditorParams = {
            value: this.getValue(),
            keyPress: keyPress,
            charPress: charPress,
            column: this.column,
            rowIndex: this.gridCell.rowIndex,
            node: this.node,
            api: this.gridOptionsWrapper.getApi(),
            cellStartedEdit: cellStartedEdit,
            columnApi: this.gridOptionsWrapper.getColumnApi(),
            context: this.gridOptionsWrapper.getContext(),
            $scope: this.scope,
            onKeyDown: this.onKeyDown.bind(this),
            stopEditing: this.stopEditingAndFocus.bind(this),
            eGridCell: this.eGridCell
        };

        var colDef = this.column.getColDef();
        if (colDef.cellEditorParams) {
            _.assign(params, colDef.cellEditorParams);
        }

        return params;
    }

    private createCellEditor(keyPress: number, charPress: string, cellStartedEdit: boolean): ICellEditorComp {

        var params = this.createCellEditorParams(keyPress, charPress, cellStartedEdit);

        var cellEditor = this.cellEditorFactory.createCellEditor(this.column.getCellEditor(), params);

        return cellEditor;
    }

    // cell editors call this, when they want to stop for reasons other
    // than what we pick up on. eg selecting from a dropdown ends editing.
    private stopEditingAndFocus(): void {
        this.stopRowOrCellEdit();
        this.focusCell(true);
    }

    // called by rowRenderer when user navigates via tab key
    public startRowOrCellEdit(keyPress?: number, charPress?: string): void {
        if (this.gridOptionsWrapper.isFullRowEdit()) {
            this.renderedRow.startRowEditing(keyPress, charPress, this);
        } else {
            this.startEditingIfEnabled(keyPress, charPress, true);
        }
    }

    // either called internally if single cell editing, or called by rowRenderer if row editing
    public startEditingIfEnabled(keyPress: number = null, charPress: string = null, cellStartedEdit = false) {

        // don't do it if not editable
        if (!this.isCellEditable()) { return; }

        // don't do it if already editing
        if (this.editingCell) { return; }

        var cellEditor = this.createCellEditor(keyPress, charPress, cellStartedEdit);
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

        this.eventService.dispatchEvent(Events.EVENT_CELL_EDITING_STARTED, this.createParams());

        return true;
    }

    private addInCellEditor(): void {
        _.removeAllChildren(this.eGridCell);
        this.eGridCell.appendChild(this.cellEditor.getGui());

        if (this.gridOptionsWrapper.isAngularCompileRows()) {
            this.$compile(this.eGridCell)(this.scope);
        }
    }

    private addPopupCellEditor(): void {
        var ePopupGui = this.cellEditor.getGui();

        this.hideEditorPopup = this.popupService.addAsModalPopup(
            ePopupGui,
            true,
            // callback for when popup disappears
            ()=> {
                this.onPopupEditorClosed();
            }
        );

        this.popupService.positionPopupOverComponent({
            eventSource: this.eGridCell,
            ePopup: ePopupGui,
            keepWithinBounds: true
        });

        if (this.gridOptionsWrapper.isAngularCompileRows()) {
            this.$compile(ePopupGui)(this.scope);
        }
    }

    public focusCell(forceBrowserFocus = false): void {
        this.focusedCellController.setFocusedCell(this.gridCell.rowIndex, this.column, this.node.floating, forceBrowserFocus);
    }

    // pass in 'true' to cancel the editing.
    public stopRowOrCellEdit(cancel: boolean = false) {
        if (this.gridOptionsWrapper.isFullRowEdit()) {
            this.renderedRow.stopRowEditing(cancel);
        } else {
            this.stopEditing(cancel);
        }
    }

    public stopEditing(cancel = false): void {
        if (!this.editingCell) {
            return;
        }

        this.editingCell = false;

        if (!cancel) {
            // also have another option here to cancel after editing, so for example user could have a popup editor and
            // it is closed by user clicking outside the editor. then the editor will close automatically (with false
            // passed above) and we need to see if the editor wants to accept the new value.
            var userWantsToCancel = this.cellEditor.isCancelAfterEnd && this.cellEditor.isCancelAfterEnd();
            if (!userWantsToCancel) {
                var newValue = this.cellEditor.getValue();
                this.valueService.setValue(this.node, this.column, newValue);
                this.value = this.getValue();
            }
        }

        if (this.cellEditor.destroy) {
            this.cellEditor.destroy();
        }

        if (this.cellEditorInPopup) {
            this.hideEditorPopup();
            this.hideEditorPopup = null;
        } else {
            _.removeAllChildren(this.eGridCell);
            // put the cell back the way it was before editing
            if (this.usingWrapper) {
                // if wrapper, then put the wrapper back
                this.eGridCell.appendChild(this.eCellWrapper);
            } else {
                // if cellRenderer, then put the gui back in. if the renderer has
                // a refresh, it will be called. however if it doesn't, then later
                // the renderer will be destroyed and a new one will be created.
                if (this.cellRenderer) {
                    this.eGridCell.appendChild(this.cellRenderer.getGui());
                }
            }
        }

        this.setInlineEditingClass();

        this.refreshCell();

        this.eventService.dispatchEvent(Events.EVENT_CELL_EDITING_STOPPED, this.createParams());
    }

    private createParams(): any {
        var params = {
            node: this.node,
            data: this.node.data,
            value: this.value,
            rowIndex: this.gridCell.rowIndex,
            column: this.column,
            colDef: this.column.getColDef(),
            $scope: this.scope,
            context: this.gridOptionsWrapper.getContext(),
            api: this.gridApi,
            columnApi: this.columnApi
        };
        return params;
    }

    private createEvent(event: any): CellEvent {
        var agEvent = this.createParams();
        agEvent.event = event;
        return agEvent;
    }

    public getRenderedRow(): RenderedRow {
        return this.renderedRow;
    }

    public isSuppressNavigable(): boolean {
        return this.column.isSuppressNavigable(this.node);
    }

    public isCellEditable() {

        // only allow editing of groups if the user has this option enabled
        if (this.node.group && !this.gridOptionsWrapper.isEnableGroupEdit()) {
            return false;
        }

        return this.column.isCellEditable(this.node);
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

    private onMouseOut(mouseEvent: MouseEvent): void {
        var agEvent = this.createEvent(mouseEvent);
        this.eventService.dispatchEvent(Events.EVENT_CELL_MOUSE_OUT, agEvent);
    }

    private onMouseOver(mouseEvent: MouseEvent): void {
        var agEvent = this.createEvent(mouseEvent);
        this.eventService.dispatchEvent(Events.EVENT_CELL_MOUSE_OVER, agEvent);
    }

    private onContextMenu(mouseEvent: MouseEvent): void {

        // to allow us to debug in chrome, we ignore the event if ctrl is pressed,
        // thus the normal menu is displayed
        if (mouseEvent.ctrlKey || mouseEvent.metaKey) {
            return;
        }

        var colDef = this.column.getColDef();
        var agEvent: any = this.createEvent(mouseEvent);
        this.eventService.dispatchEvent(Events.EVENT_CELL_CONTEXT_MENU, agEvent);

        if (colDef.onCellContextMenu) {
            colDef.onCellContextMenu(agEvent);
        }

        if (this.contextMenuFactory && !this.gridOptionsWrapper.isSuppressContextMenu()) {
            this.contextMenuFactory.showMenu(this.node, this.column, this.value, mouseEvent);
            mouseEvent.preventDefault();
        }
    }

    private onCellDoubleClicked(mouseEvent: MouseEvent) {
        var colDef = this.column.getColDef();
        // always dispatch event to eventService
        var agEvent: any = this.createEvent(mouseEvent);
        this.eventService.dispatchEvent(Events.EVENT_CELL_DOUBLE_CLICKED, agEvent);

        // check if colDef also wants to handle event
        if (typeof colDef.onCellDoubleClicked === 'function') {
            colDef.onCellDoubleClicked(agEvent);
        }

        let editOnDoubleClick = !this.gridOptionsWrapper.isSingleClickEdit()
            && !this.gridOptionsWrapper.isSuppressClickEdit();
        if (editOnDoubleClick) {
            this.startRowOrCellEdit();
        }
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
        if (this.rangeController) {
            var thisCell = this.gridCell;
            var cellAlreadyInRange = this.rangeController.isCellInAnyRange(thisCell);
            if (!cellAlreadyInRange) {
                this.rangeController.setRangeToCell(thisCell);
            }
        }
    }

    private onCellClicked(mouseEvent: MouseEvent): void {
        var agEvent = this.createEvent(mouseEvent);
        this.eventService.dispatchEvent(Events.EVENT_CELL_CLICKED, agEvent);

        var colDef = this.column.getColDef();

        if (colDef.onCellClicked) {
            colDef.onCellClicked(agEvent);
        }

        let editOnSingleClick = this.gridOptionsWrapper.isSingleClickEdit()
            && !this.gridOptionsWrapper.isSuppressClickEdit();
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

    // if we are editing inline, then we don't have the padding in the cell (set in the themes)
    // to allow the text editor full access to the entire cell
    private setInlineEditingClass(): void {
        var editingInline = this.editingCell && !this.cellEditorInPopup;
        _.addOrRemoveCssClass(this.eGridCell, 'ag-cell-inline-editing', editingInline);
        _.addOrRemoveCssClass(this.eGridCell, 'ag-cell-not-inline-editing', !editingInline);
    }

    private populateCell() {
        // populate
        this.putDataIntoCell();
        // style
        this.addStylesFromColDef();
        this.addClassesFromColDef();
        this.addClassesFromRules();
    }

    private addStylesFromColDef() {
        var colDef = this.column.getColDef();
        if (colDef.cellStyle) {
            var cssToUse: any;
            if (typeof colDef.cellStyle === 'function') {
                var cellStyleParams = {
                    value: this.value,
                    data: this.node.data,
                    node: this.node,
                    colDef: colDef,
                    column: this.column,
                    $scope: this.scope,
                    context: this.gridOptionsWrapper.getContext(),
                    api: this.gridOptionsWrapper.getApi()
              };
                var cellStyleFunc = <Function>colDef.cellStyle;
                cssToUse = cellStyleFunc(cellStyleParams);
            } else {
                cssToUse = colDef.cellStyle;
            }

            if (cssToUse) {
                _.addStylesToElement(this.eGridCell, cssToUse);
            }
        }
    }

    private addClassesFromColDef() {
        this.stylingService.processStaticCellClasses(
            this.column.getColDef(),
            {
                value: this.value,
                data: this.node.data,
                node: this.node,
                colDef: this.column.getColDef(),
                rowIndex: this.gridCell.rowIndex,
                api: this.gridOptionsWrapper.getApi(),
                context: this.gridOptionsWrapper.getContext()
            },
            (className:string)=>{
                _.addCssClass(this.eGridCell, className);
            }
        );
    }

    private createParentOfValue() {
        if (this.usingWrapper) {
            this.eCellWrapper = document.createElement('span');
            _.addCssClass(this.eCellWrapper, 'ag-cell-wrapper');
            this.eGridCell.appendChild(this.eCellWrapper);

            var cbSelectionComponent = new CheckboxSelectionComponent();
            this.context.wireBean(cbSelectionComponent);

            let visibleFunc = this.column.getColDef().checkboxSelection;
            visibleFunc = typeof visibleFunc === 'function' ? visibleFunc : null;

            cbSelectionComponent.init({rowNode: this.node, column: this.column, visibleFunc: visibleFunc});
            this.addDestroyFunc( ()=> cbSelectionComponent.destroy() );

            // eventually we call eSpanWithValue.innerHTML = xxx, so cannot include the checkbox (above) in this span
            this.eSpanWithValue = document.createElement('span');
            _.addCssClass(this.eSpanWithValue, 'ag-cell-value');

            this.eCellWrapper.appendChild(cbSelectionComponent.getGui());
            this.eCellWrapper.appendChild(this.eSpanWithValue);

            this.eParentOfValue = this.eSpanWithValue;
        } else {
            _.addCssClass(this.eGridCell, 'ag-cell-value');
            this.eParentOfValue = this.eGridCell;
        }
    }

    public isVolatile() {
        return this.column.getColDef().volatile;
    }

    public refreshCell(animate = false, newData = false) {

        this.value = this.getValue();

        var refreshFailed = false;
        var that = this;

        // if it's 'new data', then we don't refresh the cellRenderer, even if refresh method is available.
        // this is because if the whole data is new (ie we are showing stock price 'BBA' now and not 'SSD')
        // then we are not showing a movement in the stock price, rather we are showing different stock.
        var attemptRefresh = !newData && this.cellRenderer && this.cellRenderer.refresh;

        if (attemptRefresh) {
            try {
                doRefresh();
            } catch (e) {
                if (e instanceof MethodNotImplementedException) {
                    refreshFailed = true;
                } else {
                    throw e;
                }
            }
        }

        // we do the replace if not doing refresh, or if refresh was unsuccessful.
        // the refresh can be unsuccessful if we are using a framework (eg ng2 or react) and the framework
        // wrapper has the refresh method, but the underlying component doesn't
        if (!attemptRefresh || refreshFailed) {
            doReplace();
        }

        if (animate) {
            this.animateCellWithDataChanged();
        }

        // need to check rules. note, we ignore colDef classes and styles, these are assumed to be static
        this.addClassesFromRules();

        function doRefresh(): void {
            // if the cell renderer has a refresh method, we call this instead of doing a refresh
            // note: should pass in params here instead of value?? so that client has formattedValue
            var valueFormatted = that.formatValue(that.value);
            var cellRendererParams = that.column.getColDef().cellRendererParams;
            var params = that.createRendererAndRefreshParams(valueFormatted, cellRendererParams);
            that.cellRenderer.refresh(params);
        }

        function doReplace(): void {
            // otherwise we rip out the cell and replace it
            _.removeAllChildren(that.eParentOfValue);

            // remove old renderer component if it exists
            if (that.cellRenderer && that.cellRenderer.destroy) {
                that.cellRenderer.destroy();
            }
            that.cellRenderer = null;

            that.populateCell();

            // if angular compiling, then need to also compile the cell again (angular compiling sucks, please wait...)
            if (that.gridOptionsWrapper.isAngularCompileRows()) {
                that.$compile(that.eGridCell)(that.scope);
            }
        }
    }

    private addClassesFromRules() :void{
        this.stylingService.processCellClassRules(
            this.column.getColDef(),
            {
                value: this.value,
                data: this.node.data,
                node: this.node,
                colDef: this.column.getColDef(),
                rowIndex: this.gridCell.rowIndex,
                api: this.gridOptionsWrapper.getApi(),
                context: this.gridOptionsWrapper.getContext()
            },
            (className:string)=>{
                _.addCssClass(this.eGridCell, className);
            },
            (className:string)=>{
                _.removeCssClass(this.eGridCell, className);
            }
        );
    }

    private putDataIntoCell() {
        // template gets preference, then cellRenderer, then do it ourselves
        var colDef = this.column.getColDef();

        var cellRenderer = this.column.getCellRenderer();
        var floatingCellRenderer = this.column.getFloatingCellRenderer();

        var valueFormatted = this.valueFormatterService.formatValue(this.column, this.node, this.scope, this.gridCell.rowIndex, this.value);

        if (colDef.template) {
            // template is really only used for angular 1 - as people using ng1 are used to providing templates with
            // bindings in it. in ng2, people will hopefully want to provide components, not templates.
            this.eParentOfValue.innerHTML = colDef.template;
        } else if (colDef.templateUrl) {
            // likewise for templateUrl - it's for ng1 really - when we move away from ng1, we can take these out.
            // niall was pro angular 1 when writing template and templateUrl, if writing from scratch now, would
            // not do these, but would follow a pattern that was friendly towards components, not templates.
            var template = this.templateService.getTemplate(colDef.templateUrl, this.refreshCell.bind(this, true));
            if (template) {
                this.eParentOfValue.innerHTML = template;
            }
        // use cell renderer if it exists
        } else if (floatingCellRenderer && this.node.floating) {
            // if floating, then give preference to floating cell renderer
            this.useCellRenderer(floatingCellRenderer, colDef.floatingCellRendererParams, valueFormatted);
        } else if (cellRenderer) {
            // use normal cell renderer
            this.useCellRenderer(cellRenderer, colDef.cellRendererParams, valueFormatted);
        } else {
            // if we insert undefined, then it displays as the string 'undefined', ugly!
            var valueFormattedExits = valueFormatted !== null && valueFormatted !== undefined;
            var valueToRender = valueFormattedExits ? valueFormatted : this.value;
            if (_.exists(valueToRender) && valueToRender !== '') {
                // not using innerHTML to prevent injection of HTML
                // https://developer.mozilla.org/en-US/docs/Web/API/Element/innerHTML#Security_considerations
                this.eParentOfValue.textContent = valueToRender.toString();
            }
        }
        if (colDef.tooltipField) {
            var data = this.getDataForRow();
            if (_.exists(data)) {
                var tooltip = _.getValueUsingField(data, colDef.tooltipField, this.column.isTooltipFieldContainsDots());
                if (_.exists(tooltip)) {
                        this.eParentOfValue.setAttribute('title', tooltip);
                }
            }
        }
    }

    private formatValue(value: any): any {
        return this.valueFormatterService.formatValue(this.column, this.node, this.scope, this.gridCell.rowIndex, value);
    }

    private createRendererAndRefreshParams(valueFormatted: string, cellRendererParams: {}): ICellRendererParams {
        var params = <ICellRendererParams> {
            value: this.value,
            valueFormatted: valueFormatted,
            valueGetter: this.getValue,
            formatValue: this.formatValue.bind(this),
            data: this.node.data,
            node: this.node,
            colDef: this.column.getColDef(),
            column: this.column,
            $scope: this.scope,
            rowIndex: this.gridCell.rowIndex,
            api: this.gridOptionsWrapper.getApi(),
            columnApi: this.gridOptionsWrapper.getColumnApi(),
            context: this.gridOptionsWrapper.getContext(),
            refreshCell: this.refreshCell.bind(this),
            eGridCell: this.eGridCell,
            eParentOfValue: this.eParentOfValue,
            addRenderedRowListener: this.renderedRow.addEventListener.bind(this.renderedRow)
        };

        if (cellRendererParams) {
            _.assign(params, cellRendererParams);
        }

        return params;
    }

    private useCellRenderer(cellRendererKey: {new(): ICellRendererComp} | ICellRendererFunc | string, cellRendererParams: {}, valueFormatted: string): void {

        var params = this.createRendererAndRefreshParams(valueFormatted, cellRendererParams);

        this.cellRenderer = this.cellRendererService.useCellRenderer(cellRendererKey, this.eParentOfValue, params);
    }

    private addClasses() {
        _.addCssClass(this.eGridCell, 'ag-cell');
        this.eGridCell.setAttribute("colId", this.column.getColId());

        if (this.node.group && this.node.footer) {
            _.addCssClass(this.eGridCell, 'ag-footer-cell');
        }
        if (this.node.group && !this.node.footer) {
            _.addCssClass(this.eGridCell, 'ag-group-cell');
        }

    }

}
