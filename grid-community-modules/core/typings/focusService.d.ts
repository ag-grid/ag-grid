import { BeanStub } from "./context/beanStub";
import { Column } from "./entities/column";
import { CellFocusedParams } from "./events";
import { CellPosition } from "./entities/cellPositionUtils";
import { RowNode } from "./entities/rowNode";
import { HeaderPosition } from "./headerRendering/common/headerPosition";
import { ColumnGroup } from "./entities/columnGroup";
import { GridCtrl } from "./gridComp/gridCtrl";
import { NavigationService } from "./gridBodyComp/navigationService";
import { CtrlsService } from "./ctrlsService";
import { HeaderCellCtrl } from "./headerRendering/cells/column/headerCellCtrl";
export declare class FocusService extends BeanStub {
    private eGridDiv;
    private readonly columnModel;
    private readonly headerNavigationService;
    private readonly rowRenderer;
    private readonly rowPositionUtils;
    private readonly rangeService;
    navigationService: NavigationService;
    ctrlsService: CtrlsService;
    static AG_KEYBOARD_FOCUS: string;
    private gridCtrl;
    private focusedCellPosition;
    private focusedHeaderPosition;
    private static keyboardModeActive;
    private static instancesMonitored;
    /**
     * Adds a gridCore to the list of the gridCores monitoring Keyboard Mode
     * in a specific HTMLDocument.
     *
     * @param doc {Document} - The Document containing the gridCore.
     * @param gridCore {GridComp} - The GridCore to be monitored.
     */
    private static addKeyboardModeEvents;
    /**
     * Removes a gridCore from the list of the gridCores monitoring Keyboard Mode
     * in a specific HTMLDocument.
     *
     * @param doc {Document} - The Document containing the gridCore.
     * @param gridCore {GridComp} - The GridCore to be removed.
     */
    private static removeKeyboardModeEvents;
    /**
     * This method will be called by `keydown` and `mousedown` events on all Documents monitoring
     * KeyboardMode. It will then fire a KEYBOARD_FOCUS, MOUSE_FOCUS on each gridCore present in
     * the Document allowing each gridCore to maintain a state for KeyboardMode.
     *
     * @param event {KeyboardEvent | MouseEvent | TouchEvent} - The event triggered.
     */
    private static toggleKeyboardMode;
    private init;
    unregisterGridCompController(gridCompController: GridCtrl): void;
    onColumnEverythingChanged(): void;
    isKeyboardMode(): boolean;
    getFocusCellToUseAfterRefresh(): CellPosition | null;
    getFocusHeaderToUseAfterRefresh(): HeaderPosition | null;
    private isDomDataMissingInHierarchy;
    getFocusedCell(): CellPosition | null;
    private getFocusEventParams;
    clearFocusedCell(): void;
    setFocusedCell(params: CellFocusedParams): void;
    isCellFocused(cellPosition: CellPosition): boolean;
    isRowNodeFocused(rowNode: RowNode): boolean;
    isHeaderWrapperFocused(headerCtrl: HeaderCellCtrl): boolean;
    clearFocusedHeader(): void;
    getFocusedHeader(): HeaderPosition | null;
    setFocusedHeader(headerRowIndex: number, column: ColumnGroup | Column): void;
    focusHeaderPosition(params: {
        headerPosition: HeaderPosition | null;
        direction?: 'Before' | 'After' | null;
        fromTab?: boolean;
        allowUserOverride?: boolean;
        event?: KeyboardEvent;
    }): boolean;
    focusFirstHeader(): boolean;
    focusLastHeader(event?: KeyboardEvent): boolean;
    isAnyCellFocused(): boolean;
    isRowFocused(rowIndex: number, floating?: string | null): boolean;
    findFocusableElements(rootNode: HTMLElement, exclude?: string | null, onlyUnmanaged?: boolean): HTMLElement[];
    focusInto(rootNode: HTMLElement, up?: boolean, onlyUnmanaged?: boolean): boolean;
    findFocusableElementBeforeTabGuard(rootNode: HTMLElement, referenceElement?: HTMLElement): HTMLElement | null;
    findNextFocusableElement(rootNode?: HTMLElement, onlyManaged?: boolean | null, backwards?: boolean): HTMLElement | null;
    isTargetUnderManagedComponent(rootNode: HTMLElement, target?: HTMLElement): boolean;
    findTabbableParent(node: HTMLElement | null, limit?: number): HTMLElement | null;
    focusGridView(column?: Column, backwards?: boolean): boolean;
    focusNextGridCoreContainer(backwards: boolean): boolean;
}
