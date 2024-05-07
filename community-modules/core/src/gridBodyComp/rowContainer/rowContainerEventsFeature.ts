import { KeyCode } from "../../constants/keyCode";
import { BeanStub } from "../../context/beanStub";
import { Autowired, PostConstruct } from "../../context/context";
import { Column } from "../../entities/column";
import { CellKeyDownEvent, Events, FullWidthCellKeyDownEvent } from "../../events";
import { FocusService } from "../../focusService";
import { CellCtrl } from "../../rendering/cell/cellCtrl";
import { RowCtrl } from "../../rendering/row/rowCtrl";
import { getCtrlForEventTarget, isEventSupported, isStopPropagationForAgGrid } from "../../utils/event";
import { isEventFromPrintableCharacter, isUserSuppressingKeyboardEvent, normaliseQwertyAzerty } from "../../utils/keyboard";
import { MouseEventService } from "./../mouseEventService";
import { NavigationService } from "./../navigationService";

export class RowContainerEventsFeature extends BeanStub {

    @Autowired('mouseEventService') private mouseEventService: MouseEventService;
    @Autowired('navigationService') private navigationService: NavigationService;
    @Autowired('focusService') private focusService: FocusService;

    private element: HTMLElement;

    constructor(element: HTMLElement) {
        super();
        this.element = element;
    }

    @PostConstruct
    public postConstruct(): void {
        this.addKeyboardListeners();
        this.addMouseListeners();
    }

    private addKeyboardListeners(): void {
        const eventName = 'keydown';
        const listener = this.processKeyboardEvent.bind(this, eventName);
        this.addManagedListener(this.element, eventName, listener);
    }

    private addMouseListeners(): void {
        const mouseDownEvent = isEventSupported('touchstart') ? 'touchstart' : 'mousedown';
        const eventNames = ['dblclick', 'contextmenu', 'mouseover', 'mouseout', 'click', mouseDownEvent];

        eventNames.forEach(eventName => {
            const listener = this.processMouseEvent.bind(this, eventName);
            this.addManagedListener(this.element, eventName, listener);
        });
    }

    private processMouseEvent(eventName: string, mouseEvent: MouseEvent): void {
        if (
            !this.mouseEventService.isEventFromThisGrid(mouseEvent) ||
            isStopPropagationForAgGrid(mouseEvent)
        ) {
            return;
        }

        const rowComp = this.getRowForEvent(mouseEvent);
        const cellCtrl = this.mouseEventService.getRenderedCellForEvent(mouseEvent)!;

        if (eventName === "contextmenu") {
        } else {
            if (cellCtrl) {
                cellCtrl.onMouseEvent(eventName, mouseEvent);
            }
            if (rowComp) {
                rowComp.onMouseEvent(eventName, mouseEvent);
            }
        }
    }

    private getRowForEvent(event: Event): RowCtrl | null {
        let sourceElement: HTMLElement | null = event.target as HTMLElement | null;

        while (sourceElement) {
            const rowCon = this.gos.getDomData(sourceElement, RowCtrl.DOM_DATA_KEY_ROW_CTRL);
            if (rowCon) {
                return rowCon;
            }

            sourceElement = sourceElement.parentElement;
        }

        return null;
    }

    private getControlsForEventTarget(target: EventTarget | null): { cellCtrl: CellCtrl | null, rowCtrl: RowCtrl | null } {
        return {
            cellCtrl: getCtrlForEventTarget<CellCtrl>(this.gos, target, CellCtrl.DOM_DATA_KEY_CELL_CTRL),
            rowCtrl: getCtrlForEventTarget<RowCtrl>(this.gos, target, RowCtrl.DOM_DATA_KEY_ROW_CTRL)
        }
    }

    private processKeyboardEvent(eventName: string, keyboardEvent: KeyboardEvent): void {
        const { cellCtrl, rowCtrl } = this.getControlsForEventTarget(keyboardEvent.target);

        if (keyboardEvent.defaultPrevented) { return; }
        if (cellCtrl) {
            this.processCellKeyboardEvent(cellCtrl, eventName, keyboardEvent);
        } else if (rowCtrl && rowCtrl.isFullWidth()) {
            this.processFullWidthRowKeyboardEvent(rowCtrl, eventName, keyboardEvent);
        }
    }

    private processCellKeyboardEvent(cellCtrl: CellCtrl, eventName: string, keyboardEvent: KeyboardEvent): void {
        const rowNode = cellCtrl.getRowNode();
        const column = cellCtrl.getColumn();
        const editing = cellCtrl.isEditing();

        const gridProcessingAllowed = !isUserSuppressingKeyboardEvent(this.gos, keyboardEvent, rowNode, column, editing);

        if (gridProcessingAllowed) {
            if (eventName === 'keydown') {
                // first see if it's a scroll key, page up / down, home / end etc
                const wasScrollKey = !editing && this.navigationService.handlePageScrollingKey(keyboardEvent);

                // if not a scroll key, then we pass onto cell
                if (!wasScrollKey) {
                    cellCtrl.onKeyDown(keyboardEvent);
                }

                // perform clipboard and undo / redo operations
                this.doGridOperations(keyboardEvent, cellCtrl.isEditing());

                if (isEventFromPrintableCharacter(keyboardEvent)) {
                    cellCtrl.processCharacter(keyboardEvent);
                }
            }
        }

        if (eventName === 'keydown') {
            const cellKeyDownEvent: CellKeyDownEvent = cellCtrl.createEvent(keyboardEvent, Events.EVENT_CELL_KEY_DOWN);
            this.eventService.dispatchEvent(cellKeyDownEvent);
        }

    }

    private processFullWidthRowKeyboardEvent(rowComp: RowCtrl, eventName: string, keyboardEvent: KeyboardEvent) {
        const rowNode = rowComp.getRowNode();
        const focusedCell = this.focusService.getFocusedCell();
        const column = (focusedCell && focusedCell.column) as Column;
        const gridProcessingAllowed = !isUserSuppressingKeyboardEvent(this.gos, keyboardEvent, rowNode, column, false);

        if (gridProcessingAllowed) {
            const key = keyboardEvent.key;
            if (eventName === 'keydown') {
                switch (key) {
                    case KeyCode.PAGE_HOME:
                    case KeyCode.PAGE_END:
                    case KeyCode.PAGE_UP:
                    case KeyCode.PAGE_DOWN:
                        this.navigationService.handlePageScrollingKey(keyboardEvent, true);
                        break;
    
                    case KeyCode.UP:
                    case KeyCode.DOWN:
                        rowComp.onKeyboardNavigate(keyboardEvent);
                        break;
                    case KeyCode.TAB:
                        rowComp.onTabKeyDown(keyboardEvent);
                        break;
                    default:
                }
            }
        }

        if (eventName === 'keydown') {
            const cellKeyDownEvent: FullWidthCellKeyDownEvent = rowComp.createRowEvent(Events.EVENT_CELL_KEY_DOWN, keyboardEvent);
            this.eventService.dispatchEvent(cellKeyDownEvent);
        }
    }

    private doGridOperations(keyboardEvent: KeyboardEvent, editing: boolean): void {
        // check if ctrl or meta key pressed
        if (!keyboardEvent.ctrlKey && !keyboardEvent.metaKey) { return; }

        // if the cell the event came from is editing, then we do not
        // want to do the default shortcut keys, otherwise the editor
        // (eg a text field) would not be able to do the normal cut/copy/paste
        if (editing) { return; }

        // for copy / paste, we don't want to execute when the event
        // was from a child grid (happens in master detail)
        if (!this.mouseEventService.isEventFromThisGrid(keyboardEvent)) { return; }

        const keyCode = normaliseQwertyAzerty(keyboardEvent);

    }




}