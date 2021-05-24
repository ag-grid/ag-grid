import { BeanStub } from "./context/beanStub";
import { Column } from "./entities/column";
import { CellPosition } from "./entities/cellPosition";
import { RowNode } from "./entities/rowNode";
import { AbstractHeaderWrapper } from "./headerRendering/header/abstractHeaderWrapper";
import { HeaderPosition } from "./headerRendering/header/headerPosition";
import { ColumnGroup } from "./entities/columnGroup";
import { GridCompController } from "./gridComp/gridCompController";
export declare class FocusController extends BeanStub {
    private readonly columnController;
    private readonly headerNavigationService;
    private readonly columnApi;
    private readonly gridApi;
    private readonly rowRenderer;
    private readonly rowPositionUtils;
    private readonly rangeController;
    static AG_KEYBOARD_FOCUS: string;
    private gridCompController;
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
    registerGridCompController(gridCompController: GridCompController): void;
    unregisterGridCompController(gridCompController: GridCompController): void;
    onColumnEverythingChanged(): void;
    isKeyboardMode(): boolean;
    getFocusCellToUseAfterRefresh(): CellPosition | null;
    private getGridCellForDomElement;
    clearFocusedCell(): void;
    getFocusedCell(): CellPosition | null;
    setFocusedCell(rowIndex: number, colKey: string | Column, floating: string | null | undefined, forceBrowserFocus?: boolean): void;
    isCellFocused(cellPosition: CellPosition): boolean;
    isRowNodeFocused(rowNode: RowNode): boolean;
    isHeaderWrapperFocused(headerWrapper: AbstractHeaderWrapper): boolean;
    clearFocusedHeader(): void;
    getFocusedHeader(): HeaderPosition | null;
    setFocusedHeader(headerRowIndex: number, column: ColumnGroup | Column): void;
    focusHeaderPosition(headerPosition: HeaderPosition | null, direction?: 'Before' | 'After' | undefined | null, fromTab?: boolean, allowUserOverride?: boolean, event?: KeyboardEvent): boolean;
    isAnyCellFocused(): boolean;
    isRowFocused(rowIndex: number, floating?: string | null): boolean;
    findFocusableElements(rootNode: HTMLElement, exclude?: string | null, onlyUnmanaged?: boolean): HTMLElement[];
    focusInto(rootNode: HTMLElement, up?: boolean, onlyUnmanaged?: boolean): boolean;
    findNextFocusableElement(rootNode: HTMLElement, onlyManaged?: boolean | null, backwards?: boolean): HTMLElement | null;
    isFocusUnderManagedComponent(rootNode: HTMLElement): boolean;
    findTabbableParent(node: HTMLElement | null, limit?: number): HTMLElement | null;
    private onCellFocused;
    focusGridView(column?: Column, backwards?: boolean): boolean;
    focusNextGridCoreContainer(backwards: boolean): boolean;
}
