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
import {Events} from "../events";
import {RenderedRow} from "./renderedRow";
import {Autowired, PostConstruct, Optional, Context} from "../context/context";
import {GridApi} from "../gridApi";
import {FocusedCellController} from "../focusedCellController";
import {IContextMenuFactory} from "../interfaces/iContextMenuFactory";
import {IRangeController} from "../interfaces/iRangeController";
import {GridCell} from "../entities/gridCell";
import {FocusService} from "../misc/focusService";
import {ICellEditor, ICellEditorParams} from "./cellEditors/iCellEditor";
import {CellEditorFactory} from "./cellEditorFactory";
import {Component} from "../widgets/component";
import {PopupService} from "../widgets/popupService";
import {ICellRenderer, ICellRendererFunc} from "./cellRenderers/iCellRenderer";
import {CellRendererFactory} from "./cellRendererFactory";
import {CellRendererService} from "./cellRendererService";
import {ValueFormatterService} from "./valueFormatterService";
import {CheckboxSelectionComponent} from "./checkboxSelectionComponent";
import {SetLeftFeature} from "./features/setLeftFeature";
import {MethodNotImplementedException} from "../misc/methodNotImplementedException";

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
    @Optional('rangeController') private rangeController: IRangeController;
    @Autowired('focusedCellController') private focusedCellController: FocusedCellController;
    @Optional('contextMenuFactory') private contextMenuFactory: IContextMenuFactory;
    @Autowired('focusService') private focusService: FocusService;
    @Autowired('cellEditorFactory') private cellEditorFactory: CellEditorFactory;
    @Autowired('cellRendererFactory') private cellRendererFactory: CellRendererFactory;
    @Autowired('popupService') private popupService: PopupService;
    @Autowired('cellRendererService') private cellRendererService: CellRendererService;
    @Autowired('valueFormatterService') private valueFormatterService: ValueFormatterService;

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
    private rowIndex: number;
    private editingCell: boolean;
    private cellEditorInPopup: boolean;
    private hideEditorPopup: Function;

    private scope: any;

    private cellEditor: ICellEditor;
    private cellRenderer: ICellRenderer;

    private value: any;
    private checkboxSelection: boolean;
    private renderedRow: RenderedRow;

    private firstRightPinned = false;
    private lastLeftPinned = false;

    constructor(column: Column, node: RowNode, rowIndex: number, scope: any, renderedRow: RenderedRow) {
        super('<div/>');

        // because we reference eGridCell everywhere in this class,
        // we keep a local reference
        this.eGridCell = this.getGui();

        this.column = column;

        this.node = node;
        this.rowIndex = rowIndex;
        this.scope = scope;
        this.renderedRow = renderedRow;

        this.gridCell = new GridCell(rowIndex, node.floating, column);
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

        this.column.addEventListener(Column.EVENT_FIRST_RIGHT_PINNED_CHANGED, firstPinnedChangedListener);
        this.column.addEventListener(Column.EVENT_LAST_LEFT_PINNED_CHANGED, firstPinnedChangedListener);
        this.addDestroyFunc( () => {
            this.column.removeEventListener(Column.EVENT_FIRST_RIGHT_PINNED_CHANGED, firstPinnedChangedListener);
            this.column.removeEventListener(Column.EVENT_LAST_LEFT_PINNED_CHANGED, firstPinnedChangedListener);
        });

        firstPinnedChangedListener();
    }

    public getParentRow(): HTMLElement {
        return this.eParentRow;
    }

    public setParentRow(eParentRow: HTMLElement): void {
        this.eParentRow = eParentRow;
    }

    public calculateCheckboxSelection(): boolean {
        // never allow selection on floating rows
        if (this.node.floating) {
            return false;
        }

        // if boolean set, then just use it
        var colDef = this.column.getColDef();
        if (typeof colDef.checkboxSelection === 'boolean') {
            return <boolean> colDef.checkboxSelection;
        }

        // if function, then call the function to find out. we first check colDef for
        // a function, and if missing then check gridOptions, so colDef has precedence
        var selectionFunc: (params: any)=>boolean;
        if (typeof colDef.checkboxSelection === 'function') {
            selectionFunc = <(params: any)=>boolean> colDef.checkboxSelection;
        }
        if (!selectionFunc && this.gridOptionsWrapper.getCheckboxSelection()) {
            selectionFunc = this.gridOptionsWrapper.getCheckboxSelection();
        }
        if (selectionFunc) {
            var params = this.createParams();
            return selectionFunc(params);
        }

        return false;
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
        // set to null, not false, as we need to set 'ag-cell-no-focus' first time around
        var cellFocusedLastTime: boolean = null;
        var cellFocusedListener = (event?: any) => {
            var cellFocused = this.focusedCellController.isCellFocused(this.gridCell);
            // see if we need to change the classes on this cell
            if (cellFocused !== cellFocusedLastTime) {
                _.addOrRemoveCssClass(this.eGridCell, 'ag-cell-focus', cellFocused);
                _.addOrRemoveCssClass(this.eGridCell, 'ag-cell-no-focus', !cellFocused);
                cellFocusedLastTime = cellFocused;
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
        };

        this.eventService.addEventListener(Events.EVENT_CELL_FOCUSED, cellFocusedListener);
        this.addDestroyFunc( ()=> {
            this.eventService.removeEventListener(Events.EVENT_CELL_FOCUSED, cellFocusedListener);
        });
        cellFocusedListener();
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
        this.checkboxSelection = this.calculateCheckboxSelection();

        this.setWidthOnCell();
        this.setPinnedClasses();
        this.addRangeSelectedListener();
        this.addHighlightListener();
        this.addChangeListener();
        this.addCellFocusedListener();
        this.addKeyDownListener();
        this.addKeyPressListener();
        this.addSuppressShortcutKeyListenersWhileEditing();

        var setLeftFeature = new SetLeftFeature(this.column, this.eGridCell);
        this.addDestroyFunc(setLeftFeature.destroy.bind(setLeftFeature));

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
        if (this.editingCell) {
            this.stopRowOrCellEdit(true);

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

    private onNavigationKeyPressed(event: any, key: number): void {
        if (this.editingCell) {
            this.stopRowOrCellEdit();
        }
        this.rowRenderer.navigateToNextCell(key, this.rowIndex, this.column, this.node.floating);
        // if we don't prevent default, the grid will scroll with the navigation keys
        event.preventDefault();
    }

    private addKeyPressListener(): void {
        var keyPressListener = (event: KeyboardEvent)=> {
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
        };
        this.eGridCell.addEventListener('keypress', keyPressListener);
        this.addDestroyFunc( () => {
            this.eGridCell.removeEventListener('keypress', keyPressListener);
        });
    }

    private onKeyDown(event: KeyboardEvent): void {
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

    private addKeyDownListener(): void {
        var editingKeyListener = this.onKeyDown.bind(this);
        this.eGridCell.addEventListener('keydown', editingKeyListener);
        this.addDestroyFunc( () => {
            this.eGridCell.removeEventListener('keydown', editingKeyListener);
        });
    }

    private createCellEditorParams(keyPress: number, charPress: string, cellStartedEdit: boolean): ICellEditorParams {
        var params: ICellEditorParams = {
            value: this.getValue(),
            keyPress: keyPress,
            charPress: charPress,
            column: this.column,
            node: this.node,
            api: this.gridOptionsWrapper.getApi(),
            cellStartedEdit: cellStartedEdit,
            columnApi: this.gridOptionsWrapper.getColumnApi(),
            context: this.gridOptionsWrapper.getContext(),
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

    private createCellEditor(keyPress: number, charPress: string, cellStartedEdit: boolean): ICellEditor {

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
                // we only call stopEditing if we are editing, as
                // it's possible the popup called 'stop editing'
                // before this, eg if 'enter key' was pressed on
                // the editor
                if (this.editingCell) {
                    this.onPopupEditorClosed();
                }
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
        this.focusedCellController.setFocusedCell(this.rowIndex, this.column, this.node.floating, forceBrowserFocus);
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

        // also have another option here to cancel after editing, so for example user could have a popup editor and
        // it is closed by user clicking outside the editor. then the editor will close automatically (with false
        // passed above) and we need to see if the editor wants to accept the new value.
        var cancelAfterEnd = this.cellEditor.isCancelAfterEnd && this.cellEditor.isCancelAfterEnd();

        var acceptNewValue = !cancel && !cancelAfterEnd;

        if (acceptNewValue) {
            var newValue = this.cellEditor.getValue();
            this.valueService.setValue(this.node, this.column, newValue);
            this.value = this.getValue();
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
            if (this.checkboxSelection) {
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
    }

    private createParams(): any {
        var params = {
            node: this.node,
            data: this.node.data,
            value: this.value,
            rowIndex: this.rowIndex,
            colDef: this.column.getColDef(),
            $scope: this.scope,
            context: this.gridOptionsWrapper.getContext(),
            api: this.gridApi,
            columnApi: this.columnApi
        };
        return params;
    }

    private createEvent(event: any): any {
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

        // never allow editing of groups
        if (this.node.group) {
            return false;
        }

        return this.column.isCellEditable(this.node);
    }

    private addSuppressShortcutKeyListenersWhileEditing(): void {
        var keyDownListener = (event: any)=> {
            if (this.editingCell) {
                var metaKey = event.ctrlKey || event.metaKey;
                var keyOfInterest = [Constants.KEY_A, Constants.KEY_C, Constants.KEY_V, Constants.KEY_D].indexOf(event.which) >= 0;
                if (metaKey && keyOfInterest) {
                    event.stopPropagation();
                }
            }
        };
        this.addDestroyableEventListener(this.eGridCell, 'keydown', keyDownListener);
    }

    public onMouseEvent(eventName: string, mouseEvent: MouseEvent): void {
        switch (eventName) {
            case 'click': this.onCellClicked(mouseEvent); break;
            case 'mousedown': this.onMouseDown(); break;
            case 'dblclick': this.onCellDoubleClicked(mouseEvent); break;
            case 'contextmenu': this.onContextMenu(mouseEvent); break;
        }
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

        if (!this.gridOptionsWrapper.isSingleClickEdit()) {
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

        if (this.gridOptionsWrapper.isSingleClickEdit()) {
            this.startRowOrCellEdit();
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
        var colDef = this.column.getColDef();
        if (colDef.cellClass) {
          var classToUse: any;

            if (typeof colDef.cellClass === 'function') {
                var cellClassParams = {
                    value: this.value,
                    data: this.node.data,
                    node: this.node,
                    colDef: colDef,
                    $scope: this.scope,
                    context: this.gridOptionsWrapper.getContext(),
                    api: this.gridOptionsWrapper.getApi()
                };
                var cellClassFunc = <(cellClassParams: any) => string|string[]> colDef.cellClass;
                classToUse = cellClassFunc(cellClassParams);
            } else {
                classToUse = colDef.cellClass;
            }

            if (typeof classToUse === 'string') {
                _.addCssClass(this.eGridCell, classToUse);
            } else if (Array.isArray(classToUse)) {
                classToUse.forEach( (cssClassItem: string)=> {
                    _.addCssClass(this.eGridCell, cssClassItem);
                });
            }
        }
    }

    private addClassesFromRules() {
        var colDef = this.column.getColDef();
        var classRules = colDef.cellClassRules;
        if (typeof classRules === 'object' && classRules !== null) {

            var params = {
                value: this.value,
                data: this.node.data,
                node: this.node,
                colDef: colDef,
                rowIndex: this.rowIndex,
                api: this.gridOptionsWrapper.getApi(),
                context: this.gridOptionsWrapper.getContext()
            };

            var classNames = Object.keys(classRules);
            for (var i = 0; i < classNames.length; i++) {
                var className = classNames[i];
                var rule = classRules[className];
                var resultOfRule: any;
                if (typeof rule === 'string') {
                    resultOfRule = this.expressionService.evaluate(rule, params);
                } else if (typeof rule === 'function') {
                    resultOfRule = rule(params);
                }
                if (resultOfRule) {
                    _.addCssClass(this.eGridCell, className);
                } else {
                    _.removeCssClass(this.eGridCell, className);
                }
            }
        }
    }

    private createParentOfValue() {
        if (this.checkboxSelection) {
            this.eCellWrapper = document.createElement('span');
            _.addCssClass(this.eCellWrapper, 'ag-cell-wrapper');
            this.eGridCell.appendChild(this.eCellWrapper);

            var cbSelectionComponent = new CheckboxSelectionComponent();
            this.context.wireBean(cbSelectionComponent);
            cbSelectionComponent.init({rowNode: this.node});
            this.eCellWrapper.appendChild(cbSelectionComponent.getGui());
            this.addDestroyFunc( ()=> cbSelectionComponent.destroy() );

            // eventually we call eSpanWithValue.innerHTML = xxx, so cannot include the checkbox (above) in this span
            this.eSpanWithValue = document.createElement('span');
            _.addCssClass(this.eSpanWithValue, 'ag-cell-value');

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

        function doRefresh(): void {
            // if the cell renderer has a refresh method, we call this instead of doing a refresh
            // note: should pass in params here instead of value?? so that client has formattedValue
            var valueFormatted = that.formatValue(that.value);
            var cellRendererParams = that.column.getColDef().cellRendererParams;
            var params = that.createRendererAndRefreshParams(valueFormatted, cellRendererParams);
            that.cellRenderer.refresh(params);

            // need to check rules. note, we ignore colDef classes and styles, these are assumed to be static
            that.addClassesFromRules();
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

    private putDataIntoCell() {
        // template gets preference, then cellRenderer, then do it ourselves
        var colDef = this.column.getColDef();

        var cellRenderer = this.column.getCellRenderer();
        var floatingCellRenderer = this.column.getFloatingCellRenderer();

        var valueFormatted = this.valueFormatterService.formatValue(this.column, this.node, this.scope, this.rowIndex, this.value);

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
            var valueToRender = _.exists(valueFormatted) ? valueFormatted : this.value;
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
        return this.valueFormatterService.formatValue(this.column, this.node, this.scope, this.rowIndex, value);
    }

    private createRendererAndRefreshParams(valueFormatted: string, cellRendererParams: {}): any {
        var params = {
            value: this.value,
            valueFormatted: valueFormatted,
            valueGetter: this.getValue,
            formatValue: this.formatValue.bind(this),
            data: this.node.data,
            node: this.node,
            colDef: this.column.getColDef(),
            column: this.column,
            $scope: this.scope,
            rowIndex: this.rowIndex,
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
    
    private useCellRenderer(cellRendererKey: {new(): ICellRenderer} | ICellRendererFunc | string, cellRendererParams: {}, valueFormatted: string): void {

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
