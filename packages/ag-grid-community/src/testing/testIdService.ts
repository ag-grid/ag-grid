import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { BeanName } from '../context/context';
import { _getRootNode } from '../gridOptionsUtils';
import type { ITestIdService } from '../interfaces/iTestIdService';
import * as ids from './testIdUtils';

const TEST_ID_ATTR = 'data-testid';

export class TestIdService extends BeanStub implements NamedBean, ITestIdService {
    beanName: BeanName = 'testIdSvc';

    public postConstruct(): void {
        const setup = () => this.setupAllTestIds();
        this.addManagedEventListeners({
            firstDataRendered: setup,
            displayedRowsChanged: setup,
            displayedColumnsChanged: setup,
        });
    }

    public setupAllTestIds(): void {
        const root = _getRootNode(this.beans);

        function setTestId(element: Element | null | undefined, testId: string) {
            element?.setAttribute(TEST_ID_ATTR, testId);
        }

        /** Headers */

        root.querySelectorAll('.ag-header-group-cell').forEach((groupCell) => {
            setTestId(groupCell, ids.getTestIdForHeaderGroupCell(groupCell.getAttribute('col-id')));
        });

        root.querySelectorAll('.ag-header-cell').forEach((cell) => {
            const colId = cell.getAttribute('col-id');
            setTestId(cell, ids.getTestIdForHeaderCell(colId));

            setTestId(cell.querySelector('.ag-header-cell-filter-button'), ids.getTestIdForHeaderFilterButton(colId));

            setTestId(cell.querySelector('.ag-header-cell-menu-button'), ids.getTestIdForHeaderCellMenuButton(colId));

            setTestId(cell.querySelector('.ag-checkbox input[type=checkbox]'), ids.getTestIdForHeaderCheckbox(colId));
        });

        /** Column Filters */

        root.querySelectorAll('.ag-filter-menu').forEach((menu) => {
            const fieldDisplay = menu.querySelector('.ag-filter-select .ag-picker-field-display');
            setTestId(fieldDisplay, ids.getTestIdForColumnFilterPickerDisplay(fieldDisplay?.textContent));

            const numberInput = menu.querySelector('.ag-filter-body input[type=number]');
            setTestId(numberInput, ids.getTestIdForColumnNumberFilterInput(numberInput?.textContent));

            const textInput = menu.querySelector('.ag-filter-body input[type=text]');
            setTestId(textInput, ids.getTestIdForColumnTextFilterInput(textInput?.textContent));
        });

        // ...TODO

        /** Rows */

        root.querySelectorAll('.ag-row').forEach((row) => {
            const rowId = row.getAttribute('row-id');
            setTestId(row, ids.getTestIdForRowNode(rowId));

            /** Cells */

            row.querySelectorAll('.ag-cell').forEach((cell) => {
                const colId = cell.getAttribute('col-id');
                setTestId(cell, ids.getTestIdForCell(rowId, colId));

                setTestId(
                    cell.querySelector('.ag-selection-checkbox input[type=checkbox]'),
                    ids.getTestIdForCheckbox(rowId, colId)
                );

                setTestId(cell.querySelector('.ag-drag-handle'), ids.getTestIdForDragHandle(rowId, colId));

                setTestId(cell.querySelector('.ag-group-contracted'), ids.getTestIdForGroupContracted(rowId, colId));

                setTestId(cell.querySelector('.ag-group-expanded'), ids.getTestIdForGroupExpanded(rowId, colId));
            });
        });

        /** Menu */

        root.querySelectorAll('.ag-menu-list').forEach((menu) => {
            setTestId(menu, ids.getTestIdForMenu());

            menu.querySelectorAll('.ag-menu-option').forEach((option) => {
                setTestId(
                    option,
                    ids.getTestIdForMenuOption(option.querySelector('.ag-menu-option-text')?.textContent)
                );
            });
        });

        /** SideBar */

        root.querySelectorAll('.ag-side-bar').forEach((sideBar) => {
            setTestId(sideBar, ids.getTestIdForSideBar());

            /** SideBar buttons */

            sideBar.querySelectorAll('.ag-side-button button').forEach((button) => {
                setTestId(
                    button,
                    ids.getTestIdForSideBarButton(button.querySelector('.ag-side-button-label')?.textContent)
                );
            });

            /** Column Tool Panel */

            sideBar.querySelectorAll('.ag-column-panel').forEach((panel) => {
                setTestId(panel, ids.getTestIdForColumnToolPanel());

                setTestId(
                    panel.querySelector('.ag-pivot-mode-select input[type=checkbox]'),
                    ids.getTestIdForPivotModeSelect()
                );

                setTestId(
                    panel.querySelector('.ag-column-select-header-checkbox input[type=checkbox]'),
                    ids.getTestIdForColumnPanelSelectHeaderCheckbox()
                );

                setTestId(
                    panel.querySelector('.ag-column-select-header-filter-wrapper input[type=text]'),
                    ids.getTestIdForColumnPanelSelectHeaderFilter()
                );

                panel.querySelectorAll('.ag-column-select-list').forEach((list) => {
                    list.querySelectorAll('.ag-column-select-virtual-list-item').forEach((item) => {
                        const label = item.getAttribute('aria-label');

                        setTestId(
                            item.querySelector('.ag-column-group-closed-icon'),
                            ids.getTestIdForColumnSelectListItemGroupClosedIcon(label)
                        );

                        setTestId(
                            item.querySelector('.ag-column-select-checkbox input[type=checkbox]'),
                            ids.getTestIdForColumnSelectListItemCheckbox(label)
                        );

                        setTestId(
                            item.querySelector('.ag-drag-handle'),
                            ids.getTestIdForColumnSelectListItemDragHandle(label)
                        );
                    });
                });

                panel.querySelectorAll('.ag-column-drop').forEach((columnDrop) => {
                    columnDrop.querySelectorAll('.ag-column-drop-cell').forEach((columnDropCell) => {
                        setTestId(
                            columnDropCell.querySelector('.ag-drag-handle'),
                            ids.getTestIdForColumnDropCellDragHandle(
                                columnDropCell.querySelector('.ag-column-drop-cell-text')?.textContent
                            )
                        );
                    });
                });
            });

            /** Filter Tool Panel */

            // TODO...
        });

        /** Pagination */

        root.querySelectorAll('.ag-paging-panel').forEach((pagingPanel) => {
            setTestId(
                pagingPanel.querySelector('.ag-paging-page-size .ag-picker-field-display'),
                ids.getTestIdForPaginationPanelSizePickerDisplay(
                    pagingPanel.querySelector('.ag-paging-page-size .ag-picker-field-display')?.textContent
                )
            );

            pagingPanel.querySelectorAll('.ag-paging-row-summary-panel-number').forEach((panelNumber) => {
                const dataRef = panelNumber.getAttribute('data-ref');
                switch (dataRef) {
                    case 'lbFirstRowOnPage':
                        setTestId(panelNumber, ids.getTestIdForPaginationPanelFirstRowOnPage(panelNumber.textContent));
                        break;
                    case 'lbLastRowOnPage':
                        setTestId(panelNumber, ids.getTestIdForPaginationPanelLastRowOnPage(panelNumber.textContent));
                        break;
                    case 'lbRecordCount':
                        setTestId(panelNumber, ids.getTestIdForPaginationPanelRecordCount(panelNumber.textContent));
                        break;
                }
            });

            pagingPanel.querySelectorAll('.ag-paging-page-summary-panel .ag-button').forEach((pagingButton) => {
                setTestId(
                    pagingButton,
                    ids.getTestIdForPaginationSummaryPanelButton(pagingButton.getAttribute('aria-label')?.toLowerCase())
                );
            });

            pagingPanel.querySelectorAll('.ag-paging-page-summary-panel .ag-paging-number').forEach((pagingNumber) => {
                const dataRef = pagingNumber.getAttribute('data-ref');
                switch (dataRef) {
                    case 'lbCurrent':
                        setTestId(
                            pagingNumber,
                            ids.getTestIdForPaginationSummaryPanelCurrentPage(pagingNumber.textContent)
                        );
                        break;
                    case 'lbTotal':
                        setTestId(
                            pagingNumber,
                            ids.getTestIdForPaginationSummaryPanelTotalPage(pagingNumber.textContent)
                        );
                        break;
                }
            });
        });
    }
}
