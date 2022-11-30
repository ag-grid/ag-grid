import { Autowired, Bean, Optional, PostConstruct } from "./context/context";
import { BeanStub } from "./context/beanStub";
import { Column } from "./entities/column";
import { CellFocusedParams, CellFocusedEvent, Events } from "./events";
import { ColumnModel } from "./columns/columnModel";
import { CellPosition } from "./entities/cellPosition";
import { RowNode } from "./entities/rowNode";
import { HeaderPosition } from "./headerRendering/common/headerPosition";
import { RowPositionUtils } from "./entities/rowPosition";
import { IRangeService } from "./interfaces/IRangeService";
import { RowRenderer } from "./rendering/rowRenderer";
import { HeaderNavigationService } from "./headerRendering/common/headerNavigationService";
import { ColumnGroup } from "./entities/columnGroup";
import { ManagedFocusFeature } from "./widgets/managedFocusFeature";
import { getTabIndex } from './utils/browser';
import { makeNull } from './utils/generic';
import { GridCtrl } from "./gridComp/gridCtrl";
import { NavigationService } from "./gridBodyComp/navigationService";
import { RowCtrl } from "./rendering/row/rowCtrl";
import { CtrlsService } from "./ctrlsService";
import { HeaderCellCtrl } from "./headerRendering/cells/column/headerCellCtrl";
import { AbstractHeaderCellCtrl } from "./headerRendering/cells/abstractCell/abstractHeaderCellCtrl";
import { last } from "./utils/array";
import { NavigateToNextHeaderParams, TabToNextHeaderParams } from "./entities/iCallbackParams";
import { WithoutGridCommon } from "./interfaces/iCommon";
import { FOCUSABLE_EXCLUDE, FOCUSABLE_SELECTOR } from "./utils/dom";


@Bean('focusService')
export class FocusService extends BeanStub {

    @Autowired('eGridDiv') private eGridDiv: HTMLElement;
    @Autowired('columnModel') private readonly columnModel: ColumnModel;
    @Autowired('headerNavigationService') private readonly headerNavigationService: HeaderNavigationService;
    @Autowired('rowRenderer') private readonly rowRenderer: RowRenderer;
    @Autowired('rowPositionUtils') private readonly rowPositionUtils: RowPositionUtils;
    @Optional('rangeService') private readonly rangeService: IRangeService;
    @Autowired('navigationService') public navigationService: NavigationService;
    @Autowired('ctrlsService') public ctrlsService: CtrlsService;

    public static AG_KEYBOARD_FOCUS: string = 'ag-keyboard-focus';

    private gridCtrl: GridCtrl;
    private focusedCellPosition: CellPosition | null;
    private focusedHeaderPosition: HeaderPosition | null;

    private static keyboardModeActive: boolean = false;
    private static instancesMonitored: Map<Document, GridCtrl[]> = new Map();

    /**
     * Adds a gridCore to the list of the gridCores monitoring Keyboard Mode
     * in a specific HTMLDocument.
     *
     * @param doc {Document} - The Document containing the gridCore.
     * @param gridCore {GridComp} - The GridCore to be monitored.
     */
    private static addKeyboardModeEvents(doc: Document, controller: GridCtrl): void {
        const docControllers = FocusService.instancesMonitored.get(doc);

        if (docControllers && docControllers.length > 0) {
            if (docControllers.indexOf(controller) === -1) {
                docControllers.push(controller);
            }
        } else {
            FocusService.instancesMonitored.set(doc, [controller]);
            doc.addEventListener('keydown', FocusService.toggleKeyboardMode);
            doc.addEventListener('mousedown', FocusService.toggleKeyboardMode);
        }
    }

    /**
     * Removes a gridCore from the list of the gridCores monitoring Keyboard Mode
     * in a specific HTMLDocument.
     *
     * @param doc {Document} - The Document containing the gridCore.
     * @param gridCore {GridComp} - The GridCore to be removed.
     */
    private static removeKeyboardModeEvents(doc: Document, controller: GridCtrl): void {
        const docControllers = FocusService.instancesMonitored.get(doc);

        let newControllers: GridCtrl[] = [];

        if (docControllers && docControllers.length) {
            newControllers = [...docControllers].filter(
                currentGridCore => currentGridCore !== controller
            );
            FocusService.instancesMonitored.set(doc, newControllers);
        }

        if (newControllers.length === 0) {
            doc.removeEventListener('keydown', FocusService.toggleKeyboardMode);
            doc.removeEventListener('mousedown', FocusService.toggleKeyboardMode);
        }
    }

    /**
     * This method will be called by `keydown` and `mousedown` events on all Documents monitoring
     * KeyboardMode. It will then fire a KEYBOARD_FOCUS, MOUSE_FOCUS on each gridCore present in
     * the Document allowing each gridCore to maintain a state for KeyboardMode.
     *
     * @param event {KeyboardEvent | MouseEvent | TouchEvent} - The event triggered.
     */
    private static toggleKeyboardMode(event: KeyboardEvent | MouseEvent | TouchEvent): void {
        const isKeyboardActive = FocusService.keyboardModeActive;
        const isKeyboardEvent = event.type === 'keydown';

        if (isKeyboardEvent) {
            // the following keys should not toggle keyboard mode.
            if (event.ctrlKey || event.metaKey || event.altKey) { return; }
        }

        if (isKeyboardActive && isKeyboardEvent || !isKeyboardActive && !isKeyboardEvent) { return; }

        FocusService.keyboardModeActive = isKeyboardEvent;
        const doc = (event.target as HTMLElement).ownerDocument;

        if (!doc) { return; }

        const controllersForDoc = FocusService.instancesMonitored.get(doc);

        if (controllersForDoc) {
            controllersForDoc.forEach(controller => {
                controller.dispatchEvent({ type: isKeyboardEvent ? Events.EVENT_KEYBOARD_FOCUS : Events.EVENT_MOUSE_FOCUS });
            });
        }
    }

    @PostConstruct
    private init(): void {
        const clearFocusedCellListener = this.clearFocusedCell.bind(this);

        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_PIVOT_MODE_CHANGED, clearFocusedCellListener);
        this.addManagedListener(this.eventService, Events.EVENT_NEW_COLUMNS_LOADED, this.onColumnEverythingChanged.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_GROUP_OPENED, clearFocusedCellListener);
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_ROW_GROUP_CHANGED, clearFocusedCellListener);

        this.ctrlsService.whenReady(p => {
            this.gridCtrl = p.gridCtrl;
            const doc = this.gridOptionsService.getDocument();
            FocusService.addKeyboardModeEvents(doc, this.gridCtrl);
            this.addDestroyFunc(() => this.unregisterGridCompController(this.gridCtrl));
        });
    }

    public unregisterGridCompController(gridCompController: GridCtrl): void {
        const doc = this.gridOptionsService.getDocument();

        FocusService.removeKeyboardModeEvents(doc, gridCompController);
    }

    public onColumnEverythingChanged(): void {
        // if the columns change, check and see if this column still exists. if it does, then
        // we can keep the focused cell. if it doesn't, then we need to drop the focused cell.
        if (!this.focusedCellPosition) { return; }

        const col = this.focusedCellPosition.column;
        const colFromColumnModel = this.columnModel.getGridColumn(col.getId());

        if (col !== colFromColumnModel) {
            this.clearFocusedCell();
        }
    }

    public isKeyboardMode(): boolean {
        return FocusService.keyboardModeActive;
    }

    // we check if the browser is focusing something, and if it is, and
    // it's the cell we think is focused, then return the cell. so this
    // methods returns the cell if a) we think it has focus and b) the
    // browser thinks it has focus. this then returns nothing if we
    // first focus a cell, then second click outside the grid, as then the
    // grid cell will still be focused as far as the grid is concerned,
    // however the browser focus will have moved somewhere else.
    public getFocusCellToUseAfterRefresh(): CellPosition | null {
        const eDocument = this.gridOptionsService.getDocument();
        if (this.gridOptionsService.is('suppressFocusAfterRefresh') || !this.focusedCellPosition) {
            return null;
        }

        // we check that the browser is actually focusing on the grid, if it is not, then
        // we have nothing to worry about. we check for ROW data, as this covers both focused Rows (for Full Width Rows)
        // and Cells (covers cells as cells live in rows)
        if (this.isDomDataMissingInHierarchy(eDocument.activeElement, RowCtrl.DOM_DATA_KEY_ROW_CTRL)) {
            return null;
        }

        return this.focusedCellPosition;
    }

    public getFocusHeaderToUseAfterRefresh(): HeaderPosition | null {
        const eDocument = this.gridOptionsService.getDocument();
        if (this.gridOptionsService.is('suppressFocusAfterRefresh') || !this.focusedHeaderPosition) {
            return null;
        }

        // we check that the browser is actually focusing on the grid, if it is not, then
        // we have nothing to worry about
        if (this.isDomDataMissingInHierarchy(eDocument.activeElement, AbstractHeaderCellCtrl.DOM_DATA_KEY_HEADER_CTRL)) {
            return null;
        }

        return this.focusedHeaderPosition;
    }

    private isDomDataMissingInHierarchy(eBrowserCell: Node | null, key: string): boolean {
        let ePointer = eBrowserCell;

        while (ePointer) {
            const data = this.gridOptionsService.getDomData(ePointer, key);

            if (data) {
                return false;
            }

            ePointer = ePointer.parentNode;
        }

        return true;
    }

    public clearFocusedCell(): void {
        this.focusedCellPosition = null;
        this.onCellFocused(false, false);
    }

    public getFocusedCell(): CellPosition | null {
        return this.focusedCellPosition;
    }

    public setFocusedCell(params: CellFocusedParams): void {
        const {
            column,
            rowIndex,
            rowPinned,
            forceBrowserFocus = false,
            preventScrollOnBrowserFocus = false
        } = params;

        const gridColumn = this.columnModel.getGridColumn(column!);

        // if column doesn't exist, then blank the focused cell and return. this can happen when user sets new columns,
        // and the focused cell is in a column that no longer exists. after columns change, the grid refreshes and tries
        // to re-focus the focused cell.
        if (!gridColumn) {
            this.focusedCellPosition = null;
            return;
        }

        this.focusedCellPosition = gridColumn ? {
            rowIndex: rowIndex!,
            rowPinned: makeNull(rowPinned),
            column: gridColumn
        } : null;

        this.onCellFocused(forceBrowserFocus, preventScrollOnBrowserFocus);
    }

    public isCellFocused(cellPosition: CellPosition): boolean {
        if (this.focusedCellPosition == null) { return false; }

        return this.focusedCellPosition.column === cellPosition.column &&
            this.isRowFocused(cellPosition.rowIndex, cellPosition.rowPinned);
    }

    public isRowNodeFocused(rowNode: RowNode): boolean {
        return this.isRowFocused(rowNode.rowIndex!, rowNode.rowPinned);
    }

    public isHeaderWrapperFocused(headerCtrl: HeaderCellCtrl): boolean {
        if (this.focusedHeaderPosition == null) { return false; }

        const column = headerCtrl.getColumnGroupChild();
        const headerRowIndex = headerCtrl.getRowIndex();
        const pinned = headerCtrl.getPinned();

        const { column: focusedColumn, headerRowIndex: focusedHeaderRowIndex } = this.focusedHeaderPosition;

        return column === focusedColumn &&
            headerRowIndex === focusedHeaderRowIndex &&
            pinned == focusedColumn.getPinned();
    }

    public clearFocusedHeader(): void {
        this.focusedHeaderPosition = null;
    }

    public getFocusedHeader(): HeaderPosition | null {
        return this.focusedHeaderPosition;
    }

    public setFocusedHeader(headerRowIndex: number, column: ColumnGroup | Column): void {
        this.focusedHeaderPosition = { headerRowIndex, column };
    }

    public focusHeaderPosition(params: {
        headerPosition: HeaderPosition | null;
        direction?: 'Before' | 'After' | null;
        fromTab?: boolean;
        allowUserOverride?: boolean;
        event?: KeyboardEvent;
    }): boolean {
        const { direction, fromTab, allowUserOverride, event } = params;
        let { headerPosition } = params;

        if (allowUserOverride) {
            const currentPosition = this.getFocusedHeader();
            const headerRowCount = this.headerNavigationService.getHeaderRowCount();

            if (fromTab) {
                const userFunc = this.gridOptionsService.getCallback('tabToNextHeader');
                if (userFunc) {
                    const params: WithoutGridCommon<TabToNextHeaderParams> = {
                        backwards: direction === 'Before',
                        previousHeaderPosition: currentPosition,
                        nextHeaderPosition: headerPosition,
                        headerRowCount,
                    };
                    headerPosition = userFunc(params);
                }
            } else {
                const userFunc = this.gridOptionsService.getCallback('navigateToNextHeader');
                if (userFunc && event) {
                    const params: WithoutGridCommon<NavigateToNextHeaderParams> = {
                        key: event.key,
                        previousHeaderPosition: currentPosition,
                        nextHeaderPosition: headerPosition,
                        headerRowCount,
                        event,
                    };
                    headerPosition = userFunc(params);
                }
            }
        }

        if (!headerPosition) { return false; }

        if (headerPosition.headerRowIndex === -1) {
            return this.focusGridView(headerPosition.column as Column);
        }

        this.headerNavigationService.scrollToColumn(headerPosition.column, direction);

        const headerRowContainerCtrl = this.ctrlsService.getHeaderRowContainerCtrl(headerPosition.column.getPinned());

        // this will automatically call the setFocusedHeader method above
        const focusSuccess = headerRowContainerCtrl.focusHeader(headerPosition.headerRowIndex, headerPosition.column, event);

        return focusSuccess;
    }

    public focusFirstHeader(): boolean {
        let firstColumn: Column | ColumnGroup = this.columnModel.getAllDisplayedColumns()[0];
        if (!firstColumn) { return false; }

        if (firstColumn.getParent()) {
            firstColumn = this.columnModel.getColumnGroupAtLevel(firstColumn, 0)!;
        }

        return this.focusHeaderPosition({
            headerPosition: { headerRowIndex: 0, column: firstColumn }
        });
    }

    public focusLastHeader(event?: KeyboardEvent): boolean {
        const headerRowIndex = this.headerNavigationService.getHeaderRowCount() - 1;
        const column = last(this.columnModel.getAllDisplayedColumns());

        return this.focusHeaderPosition({
            headerPosition: { headerRowIndex, column },
            event
        });
    }

    public isAnyCellFocused(): boolean {
        return !!this.focusedCellPosition;
    }

    public isRowFocused(rowIndex: number, floating?: string | null): boolean {
        if (this.focusedCellPosition == null) { return false; }

        return this.focusedCellPosition.rowIndex === rowIndex && this.focusedCellPosition.rowPinned === makeNull(floating);
    }

    public findFocusableElements(rootNode: HTMLElement, exclude?: string | null, onlyUnmanaged = false): HTMLElement[] {
        const focusableString = FOCUSABLE_SELECTOR;
        let excludeString = FOCUSABLE_EXCLUDE;

        if (exclude) {
            excludeString += ', ' + exclude;
        }

        if (onlyUnmanaged) {
            excludeString += ', [tabindex="-1"]';
        }

        const nodes = Array.prototype.slice.apply(rootNode.querySelectorAll(focusableString)) as HTMLElement[];
        const excludeNodes = Array.prototype.slice.apply(rootNode.querySelectorAll(excludeString)) as HTMLElement[];

        if (!excludeNodes.length) {
            return nodes;
        }

        const diff = (a: HTMLElement[], b: HTMLElement[]) => a.filter(element => b.indexOf(element) === -1);
        return diff(nodes, excludeNodes);
    }

    public focusInto(rootNode: HTMLElement, up = false, onlyUnmanaged = false): boolean {
        const focusableElements = this.findFocusableElements(rootNode, null, onlyUnmanaged);
        const toFocus = up ? last(focusableElements) : focusableElements[0];

        if (toFocus) {
            toFocus.focus();
            return true;
        }

        return false;
    }

    public findNextFocusableElement(rootNode: HTMLElement = this.eGridDiv, onlyManaged?: boolean | null, backwards?: boolean): HTMLElement | null {
        const focusable = this.findFocusableElements(rootNode, onlyManaged ? ':not([tabindex="-1"])' : null);
        const eDocument = this.gridOptionsService.getDocument();
        const activeEl = eDocument.activeElement as HTMLElement;
        let currentIndex: number;

        if (onlyManaged) {
            currentIndex = focusable.findIndex(el => el.contains(activeEl));
        } else {
            currentIndex = focusable.indexOf(activeEl);
        }

        const nextIndex = currentIndex + (backwards ? -1 : 1);

        if (nextIndex < 0 || nextIndex >= focusable.length) {
            return null;
        }

        return focusable[nextIndex];
    }

    public isFocusUnderManagedComponent(rootNode: HTMLElement): boolean {
        const eDocument = this.gridOptionsService.getDocument();
        const managedContainers = rootNode.querySelectorAll(`.${ManagedFocusFeature.FOCUS_MANAGED_CLASS}`);

        if (!managedContainers.length) { return false; }

        for (let i = 0; i < managedContainers.length; i++) {
            if (managedContainers[i].contains(eDocument.activeElement)) {
                return true;
            }
        }

        return false;
    }

    public findTabbableParent(node: HTMLElement | null, limit: number = 5): HTMLElement | null {
        let counter = 0;

        while (node && getTabIndex(node) === null && ++counter <= limit) {
            node = node.parentElement;
        }

        if (getTabIndex(node) === null) { return null; }

        return node;
    }

    private onCellFocused(forceBrowserFocus: boolean, preventScrollOnBrowserFocus: boolean): void {
        const event: WithoutGridCommon<CellFocusedEvent> = {
            type: Events.EVENT_CELL_FOCUSED,
            forceBrowserFocus: forceBrowserFocus,
            preventScrollOnBrowserFocus: preventScrollOnBrowserFocus,
            rowIndex: null,
            column: null,
            floating: null,
            rowPinned: null,
            isFullWidthCell: false
        };

        if (this.focusedCellPosition) {
            const rowIndex = event.rowIndex = this.focusedCellPosition.rowIndex;
            const rowPinned = event.rowPinned = this.focusedCellPosition.rowPinned;

            event.column = this.focusedCellPosition.column;

            const rowCtrl = this.rowRenderer.getRowByPosition({ rowIndex, rowPinned });

            if (rowCtrl) {
                event.isFullWidthCell = rowCtrl.isFullWidth();
            }
        }

        this.eventService.dispatchEvent(event);
    }

    public focusGridView(column?: Column, backwards?: boolean): boolean {
        // if suppressCellFocus is `true`, it means the user does not want to
        // navigate between the cells using tab. Instead, we put focus on either
        // the header or after the grid, depending on whether tab or shift-tab was pressed.
        if (this.gridOptionsService.is('suppressCellFocus')) {

            if (backwards) {
                return this.focusLastHeader();
            }

            return this.focusNextGridCoreContainer(false);
        }

        const nextRow = backwards
            ? this.rowPositionUtils.getLastRow()
            : this.rowPositionUtils.getFirstRow();

        if (!nextRow) { return false; }

        const { rowIndex, rowPinned } = nextRow;
        const focusedHeader = this.getFocusedHeader();

        if (!column && focusedHeader) {
            column = focusedHeader.column as Column;
        }

        if (rowIndex == null || !column) { return false; }

        this.navigationService.ensureCellVisible({ rowIndex, column, rowPinned });

        this.setFocusedCell({
            rowIndex,
            column,
            rowPinned: makeNull(rowPinned),
            forceBrowserFocus: true
        });

        if (this.rangeService) {
            const cellPosition = { rowIndex, rowPinned, column };
            this.rangeService.setRangeToCell(cellPosition);
        }

        return true;
    }

    public focusNextGridCoreContainer(backwards: boolean): boolean {
        if (this.gridCtrl.focusNextInnerContainer(backwards)) {
            return true;
        }

        if (!backwards && !this.gridCtrl.isDetailGrid()) {
            this.gridCtrl.forceFocusOutOfContainer();
        }

        return false;
    }
}
