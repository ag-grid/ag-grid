import type { Mock, MockInstance, Mocked } from 'vitest';

import { FocusService } from './focusService';
import { GridCtrl } from './gridComp/gridCtrl';
import type { GridOptionsService } from './gridOptionsService';
import { GridHeaderCtrl } from './headerRendering/gridHeaderCtrl';
import type { CellPosition } from './interfaces/iCellPosition';
import type { Column } from './interfaces/iColumn';
import type { FocusableContainer, FocusableContainerName } from './interfaces/iFocusableContainer';
import type { HeaderPosition } from './interfaces/iHeaderPosition';
import { NavigationService } from './navigation/navigationService';
import { RowCtrl } from './rendering/row/rowCtrl';
import { mock } from './test-utils/mock';
import { _focusNextGridCoreContainer } from './utils/gridFocus';

function createColumn(colId: string): Column {
    return {
        getId: () => colId,
        getColId: () => colId,
        getPinned: () => null,
    } as unknown as Column;
}

function createHeaderPosition(columnId: string, headerRowIndex: number): HeaderPosition {
    return {
        headerRowIndex,
        column: createColumn(columnId),
    };
}

function markVisible<T extends HTMLElement>(element: T): T {
    Object.defineProperty(element, 'checkVisibility', {
        value: () => true,
        configurable: true,
    });
    return element;
}

function createFocusableButton(): HTMLButtonElement {
    const button = markVisible(document.createElement('button'));
    button.type = 'button';
    button.tabIndex = 0;
    return button;
}

function createContainer(name: FocusableContainerName): { gui: HTMLElement; container: FocusableContainer } {
    const gui = markVisible(document.createElement('div'));
    const container: FocusableContainer = {
        getGui: () => gui,
        getFocusableContainerName: () => name,
    };

    return { gui, container };
}

describe('Focus override callbacks', () => {
    describe('FocusService', () => {
        let focusSvc: FocusService;
        let focusSvcAny: any;
        let gos: Mocked<GridOptionsService>;
        let getOption: Mock;
        let getCallback: Mock;
        let focusProvidedHeaderPosition: MockInstance;
        let rootDiv: HTMLElement;

        const currentHeader = createHeaderPosition('athlete', 0);
        const defaultNextHeader = createHeaderPosition('country', 0);
        const userHeader = createHeaderPosition('sport', 0);

        beforeEach(() => {
            focusSvc = new FocusService();
            focusSvcAny = focusSvc as any;

            gos = mock<GridOptionsService>('get', 'getCallback');
            getOption = gos.get as unknown as Mock;
            getCallback = gos.getCallback as unknown as Mock;

            getOption.mockImplementation((key) => {
                if (key === 'suppressHeaderFocus') {
                    return false;
                }
                if (key === 'headerHeight') {
                    return 25;
                }
                return undefined;
            });

            rootDiv = markVisible(document.createElement('div'));
            document.body.appendChild(rootDiv);

            focusSvcAny.gos = gos;
            focusSvcAny.beans = {
                gos,
                eRootDiv: rootDiv,
                visibleCols: {
                    headerGroupRowCount: 0,
                },
                ctrlsSvc: {
                    getHeaderRowContainerCtrl: () => ({ getRowCount: () => 2 }),
                },
            };
            focusSvcAny.focusedHeader = currentHeader;

            focusProvidedHeaderPosition = vi
                .spyOn(focusSvcAny, 'focusProvidedHeaderPosition')
                .mockImplementation(() => true);
        });

        afterEach(() => {
            rootDiv.remove();
            vi.restoreAllMocks();
        });

        const mountContainers = (...containers: FocusableContainer[]): void => {
            for (const container of containers) {
                rootDiv.appendChild(container.getGui());
            }
        };

        test('tabToNextHeader: false cancels header movement', () => {
            const tabToNextHeader = vi.fn(() => false);
            getCallback.mockImplementation((key) => (key === 'tabToNextHeader' ? tabToNextHeader : undefined));

            const result = focusSvc.focusHeaderPosition({
                headerPosition: defaultNextHeader,
                direction: 'After',
                fromTab: true,
                allowUserOverride: true,
            });

            expect(result).toBe(false);
            expect(tabToNextHeader).toHaveBeenCalledWith({
                backwards: false,
                previousHeaderPosition: currentHeader,
                nextHeaderPosition: defaultNextHeader,
                headerRowCount: 2,
            });
            expect(focusProvidedHeaderPosition).not.toHaveBeenCalled();
        });

        test('tabToNextHeader: true keeps current header', () => {
            const tabToNextHeader = vi.fn(() => true);
            getCallback.mockImplementation((key) => (key === 'tabToNextHeader' ? tabToNextHeader : undefined));

            const result = focusSvc.focusHeaderPosition({
                headerPosition: defaultNextHeader,
                direction: 'After',
                fromTab: true,
                allowUserOverride: true,
            });

            expect(result).toBe(true);
            expect(focusProvidedHeaderPosition).toHaveBeenCalledWith(
                expect.objectContaining({
                    headerPosition: currentHeader,
                })
            );
        });

        test('navigateToNextHeader: returned header position is used', () => {
            const navigateToNextHeader = vi.fn(() => userHeader);
            getCallback.mockImplementation((key) =>
                key === 'navigateToNextHeader' ? navigateToNextHeader : undefined
            );
            const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });

            const result = focusSvc.focusHeaderPosition({
                headerPosition: defaultNextHeader,
                direction: 'After',
                allowUserOverride: true,
                event,
            });

            expect(result).toBe(true);
            expect(navigateToNextHeader).toHaveBeenCalledWith({
                key: 'ArrowRight',
                previousHeaderPosition: currentHeader,
                nextHeaderPosition: defaultNextHeader,
                headerRowCount: 2,
                event,
            });
            expect(focusProvidedHeaderPosition).toHaveBeenCalledWith(
                expect.objectContaining({
                    headerPosition: userHeader,
                })
            );
        });

        test('tabToNextHeader: returned header position is used', () => {
            const tabToNextHeader = vi.fn(() => userHeader);
            getCallback.mockImplementation((key) => (key === 'tabToNextHeader' ? tabToNextHeader : undefined));

            const result = focusSvc.focusHeaderPosition({
                headerPosition: defaultNextHeader,
                direction: 'After',
                fromTab: true,
                allowUserOverride: true,
            });

            expect(result).toBe(true);
            expect(tabToNextHeader).toHaveBeenCalledWith({
                backwards: false,
                previousHeaderPosition: currentHeader,
                nextHeaderPosition: defaultNextHeader,
                headerRowCount: 2,
            });
            expect(focusProvidedHeaderPosition).toHaveBeenCalledWith(
                expect.objectContaining({
                    headerPosition: userHeader,
                })
            );
        });

        test('tabToNextHeader: callback is ignored when allowUserOverride is false', () => {
            const tabToNextHeader = vi.fn(() => userHeader);
            getCallback.mockImplementation((key) => (key === 'tabToNextHeader' ? tabToNextHeader : undefined));

            const result = focusSvc.focusHeaderPosition({
                headerPosition: defaultNextHeader,
                direction: 'After',
                fromTab: true,
                allowUserOverride: false,
            });

            expect(result).toBe(true);
            expect(tabToNextHeader).not.toHaveBeenCalled();
            expect(focusProvidedHeaderPosition).toHaveBeenCalledWith(
                expect.objectContaining({
                    headerPosition: defaultNextHeader,
                })
            );
        });

        test('navigateToNextHeader: callback is ignored when allowUserOverride is false', () => {
            const navigateToNextHeader = vi.fn(() => userHeader);
            getCallback.mockImplementation((key) =>
                key === 'navigateToNextHeader' ? navigateToNextHeader : undefined
            );
            const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });

            const result = focusSvc.focusHeaderPosition({
                headerPosition: defaultNextHeader,
                direction: 'After',
                allowUserOverride: false,
                event,
            });

            expect(result).toBe(true);
            expect(navigateToNextHeader).not.toHaveBeenCalled();
            expect(focusProvidedHeaderPosition).toHaveBeenCalledWith(
                expect.objectContaining({
                    headerPosition: defaultNextHeader,
                })
            );
        });

        test('navigateToNextHeader: callback is ignored when event is missing', () => {
            const navigateToNextHeader = vi.fn(() => userHeader);
            getCallback.mockImplementation((key) =>
                key === 'navigateToNextHeader' ? navigateToNextHeader : undefined
            );

            const result = focusSvc.focusHeaderPosition({
                headerPosition: defaultNextHeader,
                direction: 'After',
                allowUserOverride: true,
            });

            expect(result).toBe(true);
            expect(navigateToNextHeader).not.toHaveBeenCalled();
            expect(focusProvidedHeaderPosition).toHaveBeenCalledWith(
                expect.objectContaining({
                    headerPosition: defaultNextHeader,
                })
            );
        });

        test('navigateToNextHeader: null result keeps focus on current header (handled)', () => {
            const navigateToNextHeader = vi.fn(() => null);
            getCallback.mockImplementation((key) =>
                key === 'navigateToNextHeader' ? navigateToNextHeader : undefined
            );
            const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });

            const result = focusSvc.focusHeaderPosition({
                headerPosition: defaultNextHeader,
                direction: 'After',
                allowUserOverride: true,
                event,
            });

            expect(result).toBe(true);
            expect(navigateToNextHeader).toHaveBeenCalledWith({
                key: 'ArrowRight',
                previousHeaderPosition: currentHeader,
                nextHeaderPosition: defaultNextHeader,
                headerRowCount: 2,
                event,
            });
            if (focusProvidedHeaderPosition.mock.calls.length > 0) {
                expect(focusProvidedHeaderPosition).toHaveBeenCalledWith(
                    expect.objectContaining({
                        headerPosition: currentHeader,
                    })
                );
            }
        });

        test('tabToNextGridContainer default target: backwards into gridBody returns a real cell target', () => {
            const column = createColumn('athlete');
            const columnAny = column as any;
            columnAny.isSuppressNavigable = vi.fn(() => false);

            const { gui, container } = createContainer('gridBody');
            const focusable = createFocusableButton();
            gui.appendChild(focusable);

            focusSvcAny.visibleCols = { allCols: [column] };
            focusSvcAny.beans.rowModel = {
                getRowCount: () => 1,
                getRow: vi.fn(() => ({ id: 'row-0' })),
            };
            focusSvcAny.beans.pageBounds = {
                getFirstRow: () => 0,
                getLastRow: () => 0,
            };
            focusSvcAny.beans.pinnedRowModel = {
                getPinnedTopRowCount: () => 0,
                getPinnedBottomRowCount: () => 0,
            };
            focusSvcAny.rowRenderer = { getRowByPosition: vi.fn() };

            const target = focusSvc.getDefaultTabToNextGridContainerTarget({
                backwards: true,
                focusableContainers: [container],
                nextIndex: 0,
            });

            expect(target).toEqual({
                rowIndex: 0,
                rowPinned: null,
                column,
            });
        });

        test('tabToNextGridContainer default target: skips non-focusable intermediate containers', () => {
            const { container: statusBar } = createContainer('statusBar');
            const { gui: paginationGui, container: pagination } = createContainer('pagination');
            paginationGui.appendChild(createFocusableButton());
            mountContainers(statusBar, pagination);

            const target = focusSvc.getDefaultTabToNextGridContainerTarget({
                backwards: false,
                focusableContainers: [statusBar, pagination],
                nextIndex: 0,
            });

            expect(target).toBe('pagination');
        });

        test('tabToNextGridContainer default target: returns null when no focusable targets are available', () => {
            const { container: statusBar } = createContainer('statusBar');
            const { container: pagination } = createContainer('pagination');
            mountContainers(statusBar, pagination);

            const target = focusSvc.getDefaultTabToNextGridContainerTarget({
                backwards: false,
                focusableContainers: [statusBar, pagination],
                nextIndex: 0,
            });

            expect(target).toBeNull();
        });

        test('tabToNextGridContainer default target: forward into gridBody should align with header-first default', () => {
            const column = createColumn('athlete');
            const columnAny = column as any;
            columnAny.isSuppressNavigable = vi.fn(() => false);
            focusSvcAny.visibleCols = { allCols: [column] };
            focusSvcAny.beans.rowModel = {
                getRowCount: () => 1,
                getRow: vi.fn(() => ({ id: 'row-0' })),
            };
            focusSvcAny.beans.pageBounds = {
                getFirstRow: () => 0,
                getLastRow: () => 0,
            };
            focusSvcAny.beans.pinnedRowModel = {
                getPinnedTopRowCount: () => 0,
                getPinnedBottomRowCount: () => 0,
            };
            focusSvcAny.rowRenderer = { getRowByPosition: vi.fn() };

            const target = focusSvc.getDefaultTabToNextGridContainerTarget({
                backwards: false,
                focusableContainers: [createContainer('gridBody').container],
                nextIndex: 0,
            });

            expect(target).toEqual(
                expect.objectContaining({
                    headerRowIndex: expect.any(Number),
                    column,
                })
            );
        });

        test('tabToNextGridContainer default target: when gridBody target is unavailable, continue to next container', () => {
            const column = createColumn('athlete');
            const columnAny = column as any;
            columnAny.isSuppressNavigable = vi.fn(() => true);
            getOption.mockImplementation((key) => (key === 'suppressHeaderFocus' ? true : undefined));

            const { container: gridBody } = createContainer('gridBody');
            const { gui: paginationGui, container: pagination } = createContainer('pagination');
            paginationGui.appendChild(createFocusableButton());
            mountContainers(gridBody, pagination);

            focusSvcAny.visibleCols = { allCols: [column] };
            focusSvcAny.beans.rowModel = {
                getRowCount: () => 1,
                getRow: vi.fn(() => ({ id: 'row-0' })),
            };
            focusSvcAny.beans.pageBounds = {
                getFirstRow: () => 0,
                getLastRow: () => 0,
            };
            focusSvcAny.beans.pinnedRowModel = {
                getPinnedTopRowCount: () => 0,
                getPinnedBottomRowCount: () => 0,
            };
            focusSvcAny.rowRenderer = { getRowByPosition: vi.fn() };

            const target = focusSvc.getDefaultTabToNextGridContainerTarget({
                backwards: false,
                focusableContainers: [gridBody, pagination],
                nextIndex: 0,
            });

            expect(target).toBe('pagination');
        });
    });

    describe('NavigationService', () => {
        let navigationSvc: NavigationService;
        let navigationSvcAny: any;
        let gos: Mocked<GridOptionsService>;
        let getOption: Mock;
        let getCallback: Mock;
        let colA: Column;
        let colB: Column;

        beforeEach(() => {
            navigationSvc = new NavigationService();
            navigationSvcAny = navigationSvc as any;

            gos = mock<GridOptionsService>('get', 'getCallback');
            getOption = gos.get as unknown as Mock;
            getCallback = gos.getCallback as unknown as Mock;

            getOption.mockImplementation((key) => {
                if (key === 'enableRtl') {
                    return false;
                }
                if (key === 'editType') {
                    return undefined;
                }
                return undefined;
            });

            colA = createColumn('a');
            colB = createColumn('b');

            navigationSvcAny.gos = gos;
            navigationSvcAny.beans = {
                gos,
                cellNavigation: {
                    getNextTabbedCell: vi.fn(),
                    getNextCellToFocus: vi.fn(),
                },
                focusSvc: {
                    focusHeaderPosition: vi.fn(),
                },
                rowRenderer: {
                    getRowByPosition: vi.fn(),
                },
                ctrlsSvc: {
                    getHeaderRowContainerCtrl: () => ({ getRowCount: () => 2 }),
                },
            };

            vi.spyOn(navigationSvcAny, 'getLastCellOfColSpan').mockImplementation((position: CellPosition) => position);
            vi.spyOn(navigationSvcAny, 'isValidNavigateCell').mockReturnValue(true);
        });

        afterEach(() => {
            vi.restoreAllMocks();
        });

        test('tabToNextCell: false cancels tab navigation', () => {
            const tabToNextCell = vi.fn(() => false);
            getCallback.mockImplementation((key) => (key === 'tabToNextCell' ? tabToNextCell : undefined));

            const previousPosition: CellPosition = { rowIndex: 0, rowPinned: null, column: colA };
            const nextPosition: CellPosition = { rowIndex: 0, rowPinned: null, column: colB };
            navigationSvcAny.beans.cellNavigation.getNextTabbedCell.mockReturnValue(nextPosition);

            const result = navigationSvc.findNextCellToFocusOn(previousPosition, {
                backwards: false,
                startEditing: false,
            });

            expect(result).toBe(false);
            expect(tabToNextCell).toHaveBeenCalledWith({
                backwards: false,
                editing: false,
                previousCellPosition: previousPosition,
                nextCellPosition: nextPosition,
            });
        });

        test('tabToNextCell: custom rowIndex -1 result moves focus to header', () => {
            const tabToNextCell = vi.fn(() => ({ rowIndex: -1, rowPinned: null, column: colA }));
            getCallback.mockImplementation((key) => (key === 'tabToNextCell' ? tabToNextCell : undefined));
            navigationSvcAny.beans.cellNavigation.getNextTabbedCell.mockReturnValue(null);

            const previousPosition: CellPosition = { rowIndex: 0, rowPinned: null, column: colA };
            const result = navigationSvc.findNextCellToFocusOn(previousPosition, {
                backwards: false,
                startEditing: false,
            });

            expect(result).toBeNull();
            expect(navigationSvcAny.beans.focusSvc.focusHeaderPosition).toHaveBeenCalledWith({
                headerPosition: { headerRowIndex: 1, column: colA },
                fromCell: true,
            });
        });

        test('navigateToNextCell: null result from callback stops navigation', () => {
            const navigateToNextCell = vi.fn(() => null);
            getCallback.mockImplementation((key) => (key === 'navigateToNextCell' ? navigateToNextCell : undefined));

            const focusPositionSpy = vi.spyOn(navigationSvcAny, 'focusPosition').mockImplementation(() => undefined);
            vi.spyOn(navigationSvcAny, 'getNormalisedPosition').mockImplementation(() => null);

            const current: CellPosition = { rowIndex: 0, rowPinned: null, column: colA };
            const next: CellPosition = { rowIndex: 1, rowPinned: null, column: colB };
            navigationSvcAny.beans.cellNavigation.getNextCellToFocus.mockReturnValue(next);

            const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
            navigationSvc.navigateToNextCell(event, 'ArrowRight', current, true);

            expect(navigateToNextCell).toHaveBeenCalledWith({
                key: 'ArrowRight',
                previousCellPosition: current,
                nextCellPosition: next,
                event,
            });
            expect(focusPositionSpy).not.toHaveBeenCalled();
        });

        test('navigateToNextCell: callback override position is focused', () => {
            const userResult: CellPosition = { rowIndex: 2, rowPinned: null, column: colB };
            const navigateToNextCell = vi.fn(() => userResult);
            getCallback.mockImplementation((key) => (key === 'navigateToNextCell' ? navigateToNextCell : undefined));

            const normalised = { ...userResult };
            vi.spyOn(navigationSvcAny, 'getNormalisedPosition').mockReturnValue(normalised);
            const focusPositionSpy = vi.spyOn(navigationSvcAny, 'focusPosition').mockImplementation(() => undefined);

            const current: CellPosition = { rowIndex: 0, rowPinned: null, column: colA };
            const defaultNext: CellPosition = { rowIndex: 0, rowPinned: null, column: colB };
            navigationSvcAny.beans.cellNavigation.getNextCellToFocus.mockReturnValue(defaultNext);

            navigationSvc.navigateToNextCell(null, 'ArrowRight', current, true);

            expect(navigateToNextCell).toHaveBeenCalled();
            expect(focusPositionSpy).toHaveBeenCalledWith(normalised);
        });

        test('tabToNextCell: callback receives editing=true when tabbing from edit mode', () => {
            const tabToNextCell = vi.fn(() => false);
            getCallback.mockImplementation((key) => (key === 'tabToNextCell' ? tabToNextCell : undefined));

            const previousPosition: CellPosition = { rowIndex: 0, rowPinned: null, column: colA };
            const nextPosition: CellPosition = { rowIndex: 0, rowPinned: null, column: colB };
            navigationSvcAny.beans.cellNavigation.getNextTabbedCell.mockReturnValue(nextPosition);

            const result = navigationSvc.findNextCellToFocusOn(previousPosition, {
                backwards: false,
                startEditing: true,
            });

            expect(result).toBe(false);
            expect(tabToNextCell).toHaveBeenCalledWith({
                backwards: false,
                editing: true,
                previousCellPosition: previousPosition,
                nextCellPosition: nextPosition,
            });
        });

        test('tabToNextCell: callback receives null nextCellPosition at grid edge', () => {
            const tabToNextCell = vi.fn(() => false);
            getCallback.mockImplementation((key) => (key === 'tabToNextCell' ? tabToNextCell : undefined));

            const previousPosition: CellPosition = { rowIndex: 0, rowPinned: null, column: colA };
            navigationSvcAny.beans.cellNavigation.getNextTabbedCell.mockReturnValue(null);

            const result = navigationSvc.findNextCellToFocusOn(previousPosition, {
                backwards: false,
                startEditing: false,
            });

            expect(result).toBe(false);
            expect(tabToNextCell).toHaveBeenCalledWith({
                backwards: false,
                editing: false,
                previousCellPosition: previousPosition,
                nextCellPosition: null,
            });
        });

        test('navigateToNextCell: callback is ignored when allowUserOverride is false', () => {
            const userResult: CellPosition = { rowIndex: 2, rowPinned: null, column: colB };
            const navigateToNextCell = vi.fn(() => userResult);
            getCallback.mockImplementation((key) => (key === 'navigateToNextCell' ? navigateToNextCell : undefined));

            const current: CellPosition = { rowIndex: 0, rowPinned: null, column: colA };
            const defaultNext: CellPosition = { rowIndex: 0, rowPinned: null, column: colB };
            navigationSvcAny.beans.cellNavigation.getNextCellToFocus.mockReturnValue(defaultNext);

            const normalised = { ...defaultNext };
            vi.spyOn(navigationSvcAny, 'getNormalisedPosition').mockReturnValue(normalised);
            const focusPositionSpy = vi.spyOn(navigationSvcAny, 'focusPosition').mockImplementation(() => undefined);

            navigationSvc.navigateToNextCell(null, 'ArrowRight', current, false);

            expect(navigateToNextCell).not.toHaveBeenCalled();
            expect(focusPositionSpy).toHaveBeenCalledWith(normalised);
        });

        test('navigateToNextCell: callback rowIndex -1 routes focus to header using callback column', () => {
            const navigateToNextCell = vi.fn(() => ({ rowIndex: -1, rowPinned: null, column: colB }));
            getCallback.mockImplementation((key) => (key === 'navigateToNextCell' ? navigateToNextCell : undefined));

            const current: CellPosition = { rowIndex: 0, rowPinned: null, column: colA };
            const defaultNext: CellPosition = { rowIndex: 1, rowPinned: null, column: colB };
            navigationSvcAny.beans.cellNavigation.getNextCellToFocus.mockReturnValue(defaultNext);

            const event = new KeyboardEvent('keydown', { key: 'ArrowUp' });
            navigationSvc.navigateToNextCell(event, 'ArrowUp', current, true);

            expect(navigateToNextCell).toHaveBeenCalledWith({
                key: 'ArrowUp',
                previousCellPosition: current,
                nextCellPosition: defaultNext,
                event,
            });
            expect(navigationSvcAny.beans.focusSvc.focusHeaderPosition).toHaveBeenCalledWith({
                headerPosition: { headerRowIndex: 1, column: colB },
                event,
                fromCell: true,
            });
        });

        test('navigateToNextCell: callback receives null nextCellPosition at edge', () => {
            const navigateToNextCell = vi.fn(() => null);
            getCallback.mockImplementation((key) => (key === 'navigateToNextCell' ? navigateToNextCell : undefined));

            const current: CellPosition = { rowIndex: 0, rowPinned: null, column: colA };
            navigationSvcAny.beans.cellNavigation.getNextCellToFocus.mockReturnValue(null);

            const focusPositionSpy = vi.spyOn(navigationSvcAny, 'focusPosition').mockImplementation(() => undefined);
            navigationSvc.navigateToNextCell(null, 'ArrowRight', current, true);

            expect(navigateToNextCell).toHaveBeenCalledWith({
                key: 'ArrowRight',
                previousCellPosition: current,
                nextCellPosition: null,
                event: null,
            });
            expect(focusPositionSpy).not.toHaveBeenCalled();
        });

        test('embedFullWidthRows uses full-width navigation column when tabbing from row ctrl', () => {
            getOption.mockImplementation((key) => {
                if (key === 'enableRtl') {
                    return false;
                }
                if (key === 'embedFullWidthRows') {
                    return true;
                }
                return undefined;
            });

            navigationSvcAny.beans.visibleCols = { allCols: [colA, colB] };

            const rowCtrl = Object.create(RowCtrl.prototype) as RowCtrl;
            (rowCtrl as any).getRowPosition = vi.fn(() => ({ rowIndex: 3, rowPinned: null }));
            (rowCtrl as any).getNavigationColumn = vi.fn(() => colA);

            const findNextCellToFocusOnSpy = vi.spyOn(navigationSvcAny, 'findNextCellToFocusOn').mockReturnValue(false);

            navigationSvcAny.moveToNextCellNotEditing(rowCtrl, false);

            expect(findNextCellToFocusOnSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    rowIndex: 3,
                    rowPinned: null,
                    column: colA,
                }),
                expect.objectContaining({
                    backwards: false,
                    startEditing: false,
                })
            );
        });
    });

    describe('GridCtrl', () => {
        let gridCtrl: GridCtrl;
        let gridCtrlAny: any;
        let gos: Mocked<GridOptionsService>;
        let getOption: Mock;
        let getCallback: Mock;
        let gridBodyContainer: FocusableContainer;
        let paginationContainer: FocusableContainer;
        let rootDiv: HTMLElement;

        const appendFocusableButton = (container: FocusableContainer): HTMLButtonElement => {
            const button = createFocusableButton();
            container.getGui().appendChild(button);
            return button;
        };

        beforeEach(() => {
            gridCtrl = new GridCtrl();
            gridCtrlAny = gridCtrl as any;

            gos = mock<GridOptionsService>('get', 'getCallback');
            getOption = gos.get as unknown as Mock;
            getCallback = gos.getCallback as unknown as Mock;

            getOption.mockImplementation((key) => {
                if (key === 'headerHeight') {
                    return 25;
                }
                if (key === 'suppressHeaderFocus') {
                    return false;
                }
                return undefined;
            });

            const gridBody = createContainer('gridBody');
            const pagination = createContainer('pagination');
            gridBodyContainer = gridBody.container;
            paginationContainer = pagination.container;

            rootDiv = markVisible(document.createElement('div'));
            rootDiv.appendChild(gridBody.gui);
            rootDiv.appendChild(pagination.gui);
            document.body.appendChild(rootDiv);

            const gridBodyFocusable = appendFocusableButton(gridBodyContainer);
            gridBodyFocusable.focus();

            gridCtrlAny.gos = gos;
            gridCtrlAny.view = {
                getFocusableContainers: () => [gridBodyContainer, paginationContainer],
                forceFocusOutOfContainer: vi.fn(),
            };
            gridCtrlAny.beans = {
                gos,
                eRootDiv: rootDiv,
                navigation: {
                    ensureCellVisible: vi.fn(),
                },
                focusSvc: {
                    getDefaultTabToNextGridContainerTarget: vi.fn(() => 'pagination'),
                    setFocusedCell: vi.fn(),
                    isCellFocused: vi.fn(() => true),
                    focusHeaderPosition: vi.fn(),
                    focusFirstHeader: vi.fn(() => true),
                    focusGridView: vi.fn(() => true),
                },
                visibleCols: {
                    allCols: [],
                },
            };
        });

        afterEach(() => {
            rootDiv.remove();
            vi.restoreAllMocks();
        });

        test('focusGridInnerElement: user callback returning true short-circuits default flow', () => {
            const focusGridInnerElement = vi.fn(() => true);
            getCallback.mockImplementation((key) =>
                key === 'focusGridInnerElement' ? focusGridInnerElement : undefined
            );

            const result = gridCtrl.focusInnerElement(true);

            expect(result).toBe(true);
            expect(focusGridInnerElement).toHaveBeenCalledWith({ fromBottom: true });
        });

        test('tabToNextGridContainer: callback receives default routing metadata', () => {
            const tabToNextGridContainer = vi.fn(() => false);
            getCallback.mockImplementation((key) =>
                key === 'tabToNextGridContainer' ? tabToNextGridContainer : undefined
            );

            const result = gridCtrl.focusNextInnerContainer(false);

            expect(result).toBe(false);
            expect(tabToNextGridContainer).toHaveBeenCalledWith({
                backwards: false,
                previousContainer: 'gridBody',
                nextContainer: 'pagination',
                defaultTarget: 'pagination',
            });
        });

        test('tabToNextGridContainer: callback metadata resolves to external when there is no default target', () => {
            const paginationButton = appendFocusableButton(paginationContainer);
            paginationButton.focus();

            const focusSvc = gridCtrlAny.beans.focusSvc;
            focusSvc.getDefaultTabToNextGridContainerTarget.mockImplementation(
                ({
                    focusableContainers,
                    nextIndex,
                }: {
                    focusableContainers: FocusableContainer[];
                    nextIndex: number;
                }) => {
                    if (nextIndex < 0 || nextIndex >= focusableContainers.length) {
                        return null;
                    }
                    return focusableContainers[nextIndex].getFocusableContainerName();
                }
            );

            const tabToNextGridContainer = vi.fn(() => false);
            getCallback.mockImplementation((key) =>
                key === 'tabToNextGridContainer' ? tabToNextGridContainer : undefined
            );

            const result = gridCtrl.focusNextInnerContainer(false);

            expect(result).toBe(false);
            expect(tabToNextGridContainer).toHaveBeenCalledWith({
                backwards: false,
                previousContainer: 'pagination',
                nextContainer: 'external',
                defaultTarget: null,
            });
        });

        test('tabToNextGridContainer: callback metadata keeps gridBody destination when default target cannot be represented', () => {
            const externalButton = createFocusableButton();
            rootDiv.appendChild(externalButton);
            externalButton.focus();

            const focusSvc = gridCtrlAny.beans.focusSvc;
            focusSvc.getDefaultTabToNextGridContainerTarget.mockReturnValue(null);

            const tabToNextGridContainer = vi.fn(() => false);
            getCallback.mockImplementation((key) =>
                key === 'tabToNextGridContainer' ? tabToNextGridContainer : undefined
            );

            const result = gridCtrl.focusNextInnerContainer(false);

            expect(result).toBe(false);
            expect(tabToNextGridContainer).toHaveBeenCalledWith({
                backwards: false,
                previousContainer: 'external',
                nextContainer: 'gridBody',
                defaultTarget: null,
            });
        });

        test('tabToNextGridContainer: callback metadata uses resolved target when immediate next container is not focusable', () => {
            const { gui: statusBarGui, container: statusBar } = createContainer('statusBar');
            rootDiv.insertBefore(statusBarGui, paginationContainer.getGui());

            appendFocusableButton(paginationContainer);
            gridCtrlAny.view.getFocusableContainers = () => [gridBodyContainer, statusBar, paginationContainer];

            const focusSvc = gridCtrlAny.beans.focusSvc;
            focusSvc.getDefaultTabToNextGridContainerTarget.mockImplementation(() => 'pagination');

            const tabToNextGridContainer = vi.fn(() => false);
            getCallback.mockImplementation((key) =>
                key === 'tabToNextGridContainer' ? tabToNextGridContainer : undefined
            );

            const result = gridCtrl.focusNextInnerContainer(false);

            expect(result).toBe(false);
            expect(tabToNextGridContainer).toHaveBeenCalledWith({
                backwards: false,
                previousContainer: 'gridBody',
                nextContainer: 'pagination',
                defaultTarget: 'pagination',
            });
        });

        test('tabToNextGridContainer: callback metadata maps cell/header default targets to gridBody', () => {
            const targetCell: CellPosition = {
                rowIndex: 1,
                rowPinned: null,
                column: createColumn('country'),
            };
            const focusSvc = gridCtrlAny.beans.focusSvc;
            focusSvc.getDefaultTabToNextGridContainerTarget.mockReturnValue(targetCell);

            const tabToNextGridContainer = vi.fn(() => false);
            getCallback.mockImplementation((key) =>
                key === 'tabToNextGridContainer' ? tabToNextGridContainer : undefined
            );

            const result = gridCtrl.focusNextInnerContainer(false);

            expect(result).toBe(false);
            expect(tabToNextGridContainer).toHaveBeenCalledWith({
                backwards: false,
                previousContainer: 'gridBody',
                nextContainer: 'gridBody',
                defaultTarget: targetCell,
            });
        });

        test('tabToNextGridContainer: when callback is missing, default target lookup is not computed', () => {
            const paginationButton = appendFocusableButton(paginationContainer);
            getCallback.mockImplementation(() => undefined);

            const result = gridCtrl.focusNextInnerContainer(false);
            const focusSvc = gridCtrlAny.beans.focusSvc;

            expect(result).toBe(true);
            expect(document.activeElement).toBe(paginationButton);
            expect(focusSvc.getDefaultTabToNextGridContainerTarget).not.toHaveBeenCalled();
        });

        test('tabToNextGridContainer: callback undefined keeps grid default flow', () => {
            const paginationButton = appendFocusableButton(paginationContainer);
            const tabToNextGridContainer = vi.fn(() => undefined);
            getCallback.mockImplementation((key) =>
                key === 'tabToNextGridContainer' ? tabToNextGridContainer : undefined
            );

            const result = gridCtrl.focusNextInnerContainer(false);

            expect(result).toBe(true);
            expect(document.activeElement).toBe(paginationButton);
            expect(tabToNextGridContainer).toHaveBeenCalledTimes(1);
        });

        test('tabToNextGridContainer: default flow with no next container returns undefined', () => {
            const paginationButton = appendFocusableButton(paginationContainer);
            paginationButton.focus();
            getCallback.mockImplementation(() => undefined);

            const result = gridCtrl.focusNextInnerContainer(false);

            expect(result).toBeUndefined();
        });

        test('tabToNextGridContainer: default flow skips intermediate containers that cannot take focus', () => {
            const { gui: statusBarGui, container: statusBar } = createContainer('statusBar');
            rootDiv.insertBefore(statusBarGui, paginationContainer.getGui());
            gridCtrlAny.view.getFocusableContainers = () => [gridBodyContainer, statusBar, paginationContainer];
            const paginationButton = appendFocusableButton(paginationContainer);
            getCallback.mockImplementation(() => undefined);

            const result = gridCtrl.focusNextInnerContainer(false);

            expect(result).toBe(true);
            expect(document.activeElement).toBe(paginationButton);
        });

        test('tabToNextGridContainer: callback true preserves current focus', () => {
            const tabToNextGridContainer = vi.fn(() => true);
            getCallback.mockImplementation((key) =>
                key === 'tabToNextGridContainer' ? tabToNextGridContainer : undefined
            );
            const before = document.activeElement;

            const result = gridCtrl.focusNextInnerContainer(false);

            expect(result).toBe(true);
            expect(document.activeElement).toBe(before);
            expect(gridCtrlAny.beans.navigation.ensureCellVisible).not.toHaveBeenCalled();
        });

        test('tabToNextGridContainer: callback cell position is applied through focus service', () => {
            const targetCell: CellPosition = {
                rowIndex: 2,
                rowPinned: null,
                column: createColumn('country'),
            };
            const tabToNextGridContainer = vi.fn(() => targetCell);
            getCallback.mockImplementation((key) =>
                key === 'tabToNextGridContainer' ? tabToNextGridContainer : undefined
            );

            const result = gridCtrl.focusNextInnerContainer(false);
            const { navigation, focusSvc } = gridCtrlAny.beans;

            expect(result).toBe(true);
            expect(navigation.ensureCellVisible).toHaveBeenCalledWith(targetCell);
            expect(focusSvc.setFocusedCell).toHaveBeenCalledWith({ ...targetCell, forceBrowserFocus: true });
            expect(focusSvc.isCellFocused).toHaveBeenCalledWith(targetCell);
        });

        test('tabToNextGridContainer: callback cell position returns undefined when focus is not achieved', () => {
            const targetCell: CellPosition = {
                rowIndex: 2,
                rowPinned: null,
                column: createColumn('country'),
            };
            const tabToNextGridContainer = vi.fn(() => targetCell);
            getCallback.mockImplementation((key) =>
                key === 'tabToNextGridContainer' ? tabToNextGridContainer : undefined
            );
            const focusSvc = gridCtrlAny.beans.focusSvc;
            focusSvc.isCellFocused.mockReturnValue(false);

            const result = gridCtrl.focusNextInnerContainer(false);

            expect(result).toBeUndefined();
            expect(gridCtrlAny.beans.navigation.ensureCellVisible).toHaveBeenCalledWith(targetCell);
            expect(focusSvc.setFocusedCell).toHaveBeenCalledWith({ ...targetCell, forceBrowserFocus: true });
        });

        test('tabToNextGridContainer: callback header position routes through focus service', () => {
            const targetHeader: HeaderPosition = {
                headerRowIndex: 0,
                column: createColumn('country'),
            };
            const tabToNextGridContainer = vi.fn(() => targetHeader);
            getCallback.mockImplementation((key) =>
                key === 'tabToNextGridContainer' ? tabToNextGridContainer : undefined
            );
            const focusSvc = gridCtrlAny.beans.focusSvc;
            focusSvc.focusHeaderPosition.mockReturnValue(true);

            const result = gridCtrl.focusNextInnerContainer(false);

            expect(result).toBe(true);
            expect(focusSvc.focusHeaderPosition).toHaveBeenCalledWith({ headerPosition: targetHeader });
        });

        test('tabToNextGridContainer: callback header position returns undefined when focus fails', () => {
            const targetHeader: HeaderPosition = {
                headerRowIndex: 0,
                column: createColumn('country'),
            };
            const tabToNextGridContainer = vi.fn(() => targetHeader);
            getCallback.mockImplementation((key) =>
                key === 'tabToNextGridContainer' ? tabToNextGridContainer : undefined
            );
            const focusSvc = gridCtrlAny.beans.focusSvc;
            focusSvc.focusHeaderPosition.mockReturnValue(false);

            const result = gridCtrl.focusNextInnerContainer(false);

            expect(result).toBeUndefined();
            expect(focusSvc.focusHeaderPosition).toHaveBeenCalledWith({ headerPosition: targetHeader });
        });

        test('tabToNextGridContainer: callback container name routes focus to that container', () => {
            const { gui: statusBarGui, container: statusBar } = createContainer('statusBar');
            const statusBarButton = appendFocusableButton(statusBar);
            rootDiv.appendChild(statusBarGui);
            gridCtrlAny.view.getFocusableContainers = () => [gridBodyContainer, statusBar, paginationContainer];

            const tabToNextGridContainer = vi.fn(() => 'statusBar');
            getCallback.mockImplementation((key) =>
                key === 'tabToNextGridContainer' ? tabToNextGridContainer : undefined
            );

            const result = gridCtrl.focusNextInnerContainer(false);

            expect(result).toBe(true);
            expect(document.activeElement).toBe(statusBarButton);
        });

        for (const containerName of [
            'pagination',
            'statusBar',
            'sideBar',
            'rowGroupToolbar',
            'pivotToolbar',
            'dialog',
        ] as const) {
            test(`tabToNextGridContainer: callback accepts ${containerName} container target`, () => {
                const { gui: targetGui, container: targetContainer } = createContainer(containerName);
                const targetButton = appendFocusableButton(targetContainer);
                rootDiv.appendChild(targetGui);
                gridCtrlAny.view.getFocusableContainers = () => [
                    gridBodyContainer,
                    targetContainer,
                    paginationContainer,
                ];

                const tabToNextGridContainer = vi.fn(() => containerName);
                getCallback.mockImplementation((key) =>
                    key === 'tabToNextGridContainer' ? tabToNextGridContainer : undefined
                );

                const result = gridCtrl.focusNextInnerContainer(false);

                expect(result).toBe(true);
                expect(document.activeElement).toBe(targetButton);
            });
        }

        test('tabToNextGridContainer: callback container name returns undefined when container is not focusable', () => {
            const { gui: statusBarGui, container: statusBar } = createContainer('statusBar');
            rootDiv.appendChild(statusBarGui);
            gridCtrlAny.view.getFocusableContainers = () => [gridBodyContainer, statusBar, paginationContainer];

            const tabToNextGridContainer = vi.fn(() => 'statusBar');
            getCallback.mockImplementation((key) =>
                key === 'tabToNextGridContainer' ? tabToNextGridContainer : undefined
            );

            const result = gridCtrl.focusNextInnerContainer(false);

            expect(result).toBeUndefined();
        });

        test('tabToNextGridContainer: callback container name warns and returns undefined when target container is absent', () => {
            const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
            const tabToNextGridContainer = vi.fn(() => 'statusBar');
            getCallback.mockImplementation((key) =>
                key === 'tabToNextGridContainer' ? tabToNextGridContainer : undefined
            );

            const firstResult = gridCtrl.focusNextInnerContainer(false);
            const secondResult = gridCtrl.focusNextInnerContainer(false);

            expect(firstResult).toBeUndefined();
            expect(secondResult).toBeUndefined();
            expect(warnSpy).toHaveBeenCalledTimes(2);
            expect(warnSpy).toHaveBeenNthCalledWith(
                1,
                'AG Grid: tabToNextGridContainer - statusBar container not found'
            );
            expect(warnSpy).toHaveBeenNthCalledWith(
                2,
                'AG Grid: tabToNextGridContainer - statusBar container not found'
            );
        });

        test('tabToNextGridContainer: callback gridBody target follows header-first forward default', () => {
            const tabToNextGridContainer = vi.fn(() => 'gridBody');
            getCallback.mockImplementation((key) =>
                key === 'tabToNextGridContainer' ? tabToNextGridContainer : undefined
            );
            const focusSvc = gridCtrlAny.beans.focusSvc;
            focusSvc.focusFirstHeader.mockReturnValue(true);

            const result = gridCtrl.focusNextInnerContainer(false);

            expect(result).toBe(true);
            expect(focusSvc.focusFirstHeader).toHaveBeenCalledTimes(1);
            expect(focusSvc.focusGridView).not.toHaveBeenCalled();
        });

        test('tab from rowGroupToolbar into grid uses first header and not grid body viewport', () => {
            const { gui: rowGroupGui, container: rowGroupContainer } = createContainer('rowGroupToolbar');
            const rowGroupButton = appendFocusableButton(rowGroupContainer);
            const gridBodyViewport = appendFocusableButton(gridBodyContainer);

            rootDiv.insertBefore(rowGroupGui, gridBodyContainer.getGui());
            gridCtrlAny.view.getFocusableContainers = () => [rowGroupContainer, gridBodyContainer, paginationContainer];

            rowGroupButton.focus();
            getCallback.mockImplementation(() => undefined);

            const focusSvc = gridCtrlAny.beans.focusSvc;
            focusSvc.focusFirstHeader.mockReturnValue(true);

            const result = gridCtrl.focusNextInnerContainer(false);

            expect(result).toBe(true);
            expect(focusSvc.focusFirstHeader).toHaveBeenCalledTimes(1);
            expect(focusSvc.focusGridView).not.toHaveBeenCalled();
            expect(document.activeElement).not.toBe(gridBodyViewport);
        });

        test('tabToNextGridContainer: callback gridBody target routes backwards to grid view', () => {
            const lastColumn = createColumn('sport');
            gridCtrlAny.beans.visibleCols.allCols = [lastColumn];

            const tabToNextGridContainer = vi.fn(() => 'gridBody');
            getCallback.mockImplementation((key) =>
                key === 'tabToNextGridContainer' ? tabToNextGridContainer : undefined
            );
            const focusSvc = gridCtrlAny.beans.focusSvc;
            focusSvc.focusGridView.mockReturnValue(true);

            const result = gridCtrl.focusNextInnerContainer(true);

            expect(result).toBe(true);
            expect(focusSvc.focusGridView).toHaveBeenCalledWith({ column: lastColumn, backwards: true });
        });

        test('focusGridInnerElement: fromBottom prefers grid body default before earlier containers', () => {
            const { gui: rowGroupGui, container: rowGroupContainer } = createContainer('rowGroupToolbar');
            const rowGroupButton = appendFocusableButton(rowGroupContainer);
            const { gui: statusBarGui, container: statusBar } = createContainer('statusBar');

            rootDiv.insertBefore(rowGroupGui, gridBodyContainer.getGui());
            rootDiv.insertBefore(statusBarGui, paginationContainer.getGui());
            gridCtrlAny.view.getFocusableContainers = () => [rowGroupContainer, gridBodyContainer, statusBar];

            const lastColumn = createColumn('sport');
            gridCtrlAny.beans.visibleCols.allCols = [lastColumn];
            const focusSvc = gridCtrlAny.beans.focusSvc;
            focusSvc.focusGridView.mockReturnValue(true);
            getCallback.mockImplementation(() => undefined);

            const result = gridCtrl.focusInnerElement(true);

            expect(result).toBe(true);
            expect(focusSvc.focusGridView).toHaveBeenCalledWith({ column: lastColumn, backwards: true });
            expect(document.activeElement).not.toBe(rowGroupButton);
        });

        test('tabToNextGridContainer: shift-tab from unmanaged element should target the last grid container', () => {
            const tabGuard = document.createElement('div');
            tabGuard.tabIndex = 0;
            rootDiv.appendChild(tabGuard);
            tabGuard.focus();

            const focusSvc = gridCtrlAny.beans.focusSvc;
            focusSvc.getDefaultTabToNextGridContainerTarget.mockImplementation(
                ({
                    focusableContainers,
                    nextIndex,
                }: {
                    focusableContainers: FocusableContainer[];
                    nextIndex: number;
                }) => {
                    if (nextIndex < 0 || nextIndex >= focusableContainers.length) {
                        return null;
                    }

                    return focusableContainers[nextIndex].getFocusableContainerName();
                }
            );

            const tabToNextGridContainer = vi.fn(() => false);
            getCallback.mockImplementation((key) =>
                key === 'tabToNextGridContainer' ? tabToNextGridContainer : undefined
            );

            const result = gridCtrl.focusNextInnerContainer(true);

            expect(result).toBe(false);
            expect(tabToNextGridContainer).toHaveBeenCalledWith({
                backwards: true,
                previousContainer: 'external',
                nextContainer: 'pagination',
                defaultTarget: 'pagination',
            });
        });

        test('tabToNextGridContainer: tab from unmanaged element enters first grid container by default', () => {
            const externalButton = createFocusableButton();
            rootDiv.appendChild(externalButton);
            externalButton.focus();
            getCallback.mockImplementation(() => undefined);
            const focusSvc = gridCtrlAny.beans.focusSvc;
            focusSvc.focusFirstHeader.mockReturnValue(true);

            const result = gridCtrl.focusNextInnerContainer(false);

            expect(result).toBe(true);
            expect(focusSvc.focusFirstHeader).toHaveBeenCalledTimes(1);
            expect(focusSvc.focusGridView).not.toHaveBeenCalled();
        });

        test('tabToNextGridContainer: shift-tab from unmanaged element enters last grid container by default', () => {
            const paginationButton = appendFocusableButton(paginationContainer);
            const externalButton = createFocusableButton();
            rootDiv.appendChild(externalButton);
            externalButton.focus();
            getCallback.mockImplementation(() => undefined);

            const result = gridCtrl.focusNextInnerContainer(true);

            expect(result).toBe(true);
            expect(document.activeElement).toBe(paginationButton);
        });

        test('tabToNextGridContainer: shift-tab from unmanaged element into gridBody-only uses grid body default target', () => {
            const gridBodyViewport = appendFocusableButton(gridBodyContainer);
            gridCtrlAny.view.getFocusableContainers = () => [gridBodyContainer];

            const externalButton = createFocusableButton();
            rootDiv.appendChild(externalButton);
            externalButton.focus();
            getCallback.mockImplementation(() => undefined);

            const lastColumn = createColumn('sport');
            gridCtrlAny.beans.visibleCols.allCols = [lastColumn];
            const focusSvc = gridCtrlAny.beans.focusSvc;
            focusSvc.focusGridView.mockReturnValue(true);

            const result = gridCtrl.focusNextInnerContainer(true);

            expect(result).toBe(true);
            expect(focusSvc.focusGridView).toHaveBeenCalledWith({ column: lastColumn, backwards: true });
            expect(document.activeElement).not.toBe(gridBodyViewport);
        });
    });

    describe('GridHeaderCtrl', () => {
        let headerCtrl: GridHeaderCtrl;
        let headerCtrlAny: any;
        let gos: Mocked<GridOptionsService>;
        let getOption: Mock;
        let gridCtrl: {
            focusNextInnerContainer: Mock;
            forceFocusOutOfContainer: Mock;
            isDetailGrid: Mock;
            isFocusInsideGridBody: Mock;
        };
        let headerNavigation: {
            navigateHorizontally: Mock;
        };
        let focusSvc: {
            focusOverlay: Mock;
        };

        const createTabEvent = (shiftKey = false): KeyboardEvent =>
            new KeyboardEvent('keydown', { key: 'Tab', shiftKey, cancelable: true });

        beforeEach(() => {
            headerCtrl = new GridHeaderCtrl();
            headerCtrlAny = headerCtrl as any;

            gos = mock<GridOptionsService>('get');
            getOption = gos.get as unknown as Mock;
            getOption.mockImplementation((key) => (key === 'enableRtl' ? false : undefined));

            gridCtrl = {
                focusNextInnerContainer: vi.fn((_backwards: boolean) => undefined),
                forceFocusOutOfContainer: vi.fn(),
                isDetailGrid: vi.fn(() => false),
                isFocusInsideGridBody: vi.fn(() => true),
            };

            headerNavigation = {
                navigateHorizontally: vi.fn((_direction: string, _fromTab: boolean, _event: KeyboardEvent) => false),
            };
            focusSvc = {
                focusOverlay: vi.fn(() => false),
            };

            headerCtrlAny.gos = gos;
            headerCtrlAny.beans = {
                gos,
                headerNavigation,
                focusSvc,
                ctrlsSvc: {
                    get: vi.fn(() => gridCtrl),
                },
            };
        });

        afterEach(() => {
            vi.restoreAllMocks();
        });

        test('tab from header: successful core-container move prevents default once', () => {
            gridCtrl.focusNextInnerContainer.mockReturnValue(true);
            const event = createTabEvent(false);

            headerCtrlAny.onTabKeyDown(event);

            expect(event.defaultPrevented).toBe(true);
            expect(gridCtrl.focusNextInnerContainer).toHaveBeenCalledTimes(1);
            expect(gridCtrl.focusNextInnerContainer).toHaveBeenCalledWith(false);
        });

        test('tab from header: callback false preserves browser default flow', () => {
            gridCtrl.focusNextInnerContainer.mockReturnValue(false);
            const event = createTabEvent(false);

            headerCtrlAny.onTabKeyDown(event);

            expect(event.defaultPrevented).toBe(false);
            expect(gridCtrl.focusNextInnerContainer).toHaveBeenCalledTimes(1);
            expect(gridCtrl.focusNextInnerContainer).toHaveBeenCalledWith(false);
            expect(gridCtrl.forceFocusOutOfContainer).not.toHaveBeenCalled();
        });

        test('shift-tab from header: callback false preserves browser default and does not re-enter fallback path', () => {
            gridCtrl.focusNextInnerContainer.mockReturnValue(false);
            const event = createTabEvent(true);

            headerCtrlAny.onTabKeyDown(event);

            expect(event.defaultPrevented).toBe(false);
            expect(gridCtrl.focusNextInnerContainer).toHaveBeenCalledTimes(1);
            expect(gridCtrl.focusNextInnerContainer).toHaveBeenCalledWith(true);
            expect(gridCtrl.forceFocusOutOfContainer).not.toHaveBeenCalled();
        });

        test('shift-tab from header: unresolved movement forces focus out', () => {
            gridCtrl.focusNextInnerContainer.mockReturnValue(undefined);
            const event = createTabEvent(true);

            headerCtrlAny.onTabKeyDown(event);

            expect(event.defaultPrevented).toBe(false);
            expect(gridCtrl.focusNextInnerContainer).toHaveBeenCalledTimes(1);
            expect(gridCtrl.focusNextInnerContainer).toHaveBeenCalledWith(true);
            expect(gridCtrl.forceFocusOutOfContainer).toHaveBeenCalledWith(true);
        });

        test('tab from header: unresolved movement forces focus out without preventing default', () => {
            gridCtrl.focusNextInnerContainer.mockReturnValue(undefined);
            const event = createTabEvent(false);

            headerCtrlAny.onTabKeyDown(event);

            expect(event.defaultPrevented).toBe(false);
            expect(gridCtrl.focusNextInnerContainer).toHaveBeenCalledTimes(1);
            expect(gridCtrl.focusNextInnerContainer).toHaveBeenCalledWith(false);
            expect(gridCtrl.forceFocusOutOfContainer).toHaveBeenCalledWith(false);
        });

        test('shift-tab from header: successful first move does not trigger fallback call', () => {
            gridCtrl.focusNextInnerContainer.mockReturnValue(true);
            const event = createTabEvent(true);

            headerCtrlAny.onTabKeyDown(event);

            expect(event.defaultPrevented).toBe(true);
            expect(gridCtrl.focusNextInnerContainer).toHaveBeenCalledTimes(1);
            expect(gridCtrl.focusNextInnerContainer).toHaveBeenCalledWith(true);
        });
    });

    describe('Grid focus container flow', () => {
        test('tabToNextGridContainer: false from grid body should not force focus out', () => {
            const gridCtrl = {
                focusNextInnerContainer: vi.fn(() => false),
                forceFocusOutOfContainer: vi.fn(),
                isDetailGrid: vi.fn(() => false),
                isFocusInsideGridBody: vi.fn(() => true),
            };

            const beans = {
                ctrlsSvc: {
                    get: vi.fn(() => gridCtrl),
                },
            } as any;

            const result = _focusNextGridCoreContainer(beans, false);

            expect(result).toBe(false);
            expect(gridCtrl.focusNextInnerContainer).toHaveBeenCalledWith(false);
            expect(gridCtrl.forceFocusOutOfContainer).not.toHaveBeenCalled();
        });

        test('focus flow: unresolved forward movement in grid body forces focus out', () => {
            const gridCtrl = {
                focusNextInnerContainer: vi.fn(() => undefined),
                forceFocusOutOfContainer: vi.fn(),
                isDetailGrid: vi.fn(() => false),
                isFocusInsideGridBody: vi.fn(() => true),
            };

            const beans = {
                ctrlsSvc: {
                    get: vi.fn(() => gridCtrl),
                },
            } as any;

            const result = _focusNextGridCoreContainer(beans, false);

            expect(result).toBe(false);
            expect(gridCtrl.focusNextInnerContainer).toHaveBeenCalledWith(false);
            expect(gridCtrl.forceFocusOutOfContainer).toHaveBeenCalledWith(false);
        });

        test('focus flow: unresolved forward movement outside grid body does not force focus out', () => {
            const gridCtrl = {
                focusNextInnerContainer: vi.fn(() => undefined),
                forceFocusOutOfContainer: vi.fn(),
                isDetailGrid: vi.fn(() => false),
                isFocusInsideGridBody: vi.fn(() => false),
            };

            const beans = {
                ctrlsSvc: {
                    get: vi.fn(() => gridCtrl),
                },
            } as any;

            const result = _focusNextGridCoreContainer(beans, false);

            expect(result).toBe(false);
            expect(gridCtrl.focusNextInnerContainer).toHaveBeenCalledWith(false);
            expect(gridCtrl.forceFocusOutOfContainer).not.toHaveBeenCalled();
        });

        test('force-out path still attempts next inner container to allow overrides', () => {
            const gridCtrl = {
                focusNextInnerContainer: vi.fn(() => undefined),
                forceFocusOutOfContainer: vi.fn(),
                isDetailGrid: vi.fn(() => false),
                isFocusInsideGridBody: vi.fn(() => true),
            };

            const beans = {
                ctrlsSvc: {
                    get: vi.fn(() => gridCtrl),
                },
            } as any;

            _focusNextGridCoreContainer(beans, false, true);

            expect(gridCtrl.focusNextInnerContainer).toHaveBeenCalledWith(false);
            expect(gridCtrl.forceFocusOutOfContainer).toHaveBeenCalledWith(false);
        });

        test('tabToNextGridContainer: false should always preserve browser-default flow, including forceOut path', () => {
            const gridCtrl = {
                focusNextInnerContainer: vi.fn(() => false),
                forceFocusOutOfContainer: vi.fn(),
                isDetailGrid: vi.fn(() => false),
                isFocusInsideGridBody: vi.fn(() => true),
            };

            const beans = {
                ctrlsSvc: {
                    get: vi.fn(() => gridCtrl),
                },
            } as any;

            const result = _focusNextGridCoreContainer(beans, false, true);

            expect(result).toBe(false);
            expect(gridCtrl.focusNextInnerContainer).toHaveBeenCalledWith(false);
            expect(gridCtrl.forceFocusOutOfContainer).not.toHaveBeenCalled();
        });
    });
});
