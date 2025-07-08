import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { BeanName } from '../context/context';
import { _getRootNode } from '../gridOptionsUtils';
import type { ITestIdService } from '../interfaces/iTestIdService';
import * as getTestIdFor from './testIdUtils';

let TEST_ID_ATTR = 'data-testid';

function setTestId(element: Element | null | undefined, testId: string) {
    element?.setAttribute(TEST_ID_ATTR, testId);
}

export function setTestIdAttribute(attr: string): void {
    TEST_ID_ATTR = attr;
}

export class TestIdService extends BeanStub implements NamedBean, ITestIdService {
    beanName: BeanName = 'testIdSvc';

    public postConstruct(): void {
        const setup = () => this.setupAllTestIds();
        this.addManagedEventListeners({
            firstDataRendered: setup,
            displayedRowsChanged: setup,
            displayedColumnsChanged: setup,
            displayedColumnsWidthChanged: setup,
            columnMenuVisibleChanged: setup,
            contextMenuVisibleChanged: setup,
            advancedFilterBuilderVisibleChanged: setup,
            fieldPickerValueSelected: setup,
            modelUpdated: setup,
            sideBarUpdated: setup,
            pinnedHeightChanged: setup,
        });
    }

    public setupAllTestIds(): void {
        const root = _getRootNode(this.beans);

        /** Headers */

        root.querySelectorAll('.ag-header-group-cell').forEach((groupCell) => {
            setTestId(groupCell, getTestIdFor.headerGroupCell(groupCell.getAttribute('col-id')));
        });

        root.querySelectorAll('.ag-header-cell').forEach((cell) => {
            const colId = cell.getAttribute('col-id');
            setTestId(cell, getTestIdFor.headerCell(colId));

            setTestId(cell.querySelector('.ag-header-cell-filter-button'), getTestIdFor.headerFilterButton(colId));

            setTestId(cell.querySelector('.ag-header-cell-menu-button'), getTestIdFor.headerCellMenuButton(colId));

            setTestId(cell.querySelector('.ag-checkbox input[type=checkbox]'), getTestIdFor.headerCheckbox(colId));

            setTestId(
                cell.querySelector('.ag-floating-filter-button button'),
                getTestIdFor.floatingFilterButton(colId)
            );

            const numberInput = cell.querySelector('.ag-floating-filter-body input[type=number]');
            setTestId(numberInput, getTestIdFor.columnNumberFilterInput());

            const textInput = cell.querySelector('.ag-floating-filter-body input[type=text]');
            setTestId(textInput, getTestIdFor.columnTextFilterInput());

            const dateInput = cell.querySelector('.ag-floating-filter-body input[type=date]');
            setTestId(dateInput, getTestIdFor.columnDateFilterInput());
        });

        /** Column Filters */

        this.setupFilters(root);

        /** Rows */

        root.querySelectorAll('.ag-row').forEach((row) => {
            const rowId = row.getAttribute('row-id');
            setTestId(row, getTestIdFor.rowNode(rowId));

            /** Cells */

            row.querySelectorAll('.ag-cell').forEach((cell) => {
                const colId = cell.getAttribute('col-id');
                setTestId(cell, getTestIdFor.cell(rowId, colId));

                setTestId(
                    cell.querySelector('.ag-selection-checkbox input[type=checkbox]'),
                    getTestIdFor.checkbox(rowId, colId)
                );

                setTestId(cell.querySelector('.ag-drag-handle'), getTestIdFor.dragHandle(rowId, colId));

                setTestId(cell.querySelector('.ag-group-contracted'), getTestIdFor.groupContracted(rowId, colId));

                setTestId(cell.querySelector('.ag-group-expanded'), getTestIdFor.groupExpanded(rowId, colId));
            });
        });

        /** Menu */

        root.querySelectorAll('.ag-menu-list').forEach((menu) => {
            setTestId(menu, getTestIdFor.menu());

            menu.querySelectorAll('.ag-menu-option').forEach((option) => {
                setTestId(option, getTestIdFor.menuOption(option.querySelector('.ag-menu-option-text')?.textContent));
            });
        });

        /** SideBar */

        root.querySelectorAll('.ag-side-bar').forEach((sideBar) => {
            setTestId(sideBar, getTestIdFor.sideBar());

            /** SideBar buttons */

            sideBar.querySelectorAll('.ag-side-button button').forEach((button) => {
                setTestId(
                    button,
                    getTestIdFor.sideBarButton(button.querySelector('.ag-side-button-label')?.textContent)
                );
            });

            /** Column Tool Panel */

            sideBar.querySelectorAll('.ag-column-panel').forEach((panel) => {
                setTestId(panel, getTestIdFor.columnToolPanel());

                setTestId(
                    panel.querySelector('.ag-pivot-mode-select input[type=checkbox]'),
                    getTestIdFor.pivotModeSelect()
                );

                setTestId(
                    panel.querySelector('.ag-column-select-header-checkbox input[type=checkbox]'),
                    getTestIdFor.columnPanelSelectHeaderCheckbox()
                );

                setTestId(
                    panel.querySelector('.ag-column-select-header-filter-wrapper input[type=text]'),
                    getTestIdFor.columnPanelSelectHeaderFilter()
                );

                panel.querySelectorAll('.ag-column-select-list').forEach((list) => {
                    list.querySelectorAll('.ag-column-select-virtual-list-item').forEach((item) => {
                        const label = item.getAttribute('aria-label');

                        setTestId(
                            item.querySelector('.ag-column-group-closed-icon'),
                            getTestIdFor.columnSelectListItemGroupClosedIcon(label)
                        );

                        setTestId(
                            item.querySelector('.ag-column-select-checkbox input[type=checkbox]'),
                            getTestIdFor.columnSelectListItemCheckbox(label)
                        );

                        setTestId(
                            item.querySelector('.ag-drag-handle'),
                            getTestIdFor.columnSelectListItemDragHandle(label)
                        );
                    });
                });

                panel.querySelectorAll('.ag-column-drop').forEach((columnDrop) => {
                    columnDrop.querySelectorAll('.ag-column-drop-cell').forEach((columnDropCell) => {
                        setTestId(
                            columnDropCell.querySelector('.ag-drag-handle'),
                            getTestIdFor.columnDropCellDragHandle(
                                columnDropCell.querySelector('.ag-column-drop-cell-text')?.textContent
                            )
                        );
                    });
                });
            });

            /** Filter Tool Panel */

            sideBar.querySelectorAll('.ag-filter-panel').forEach((panel) => {
                setTestId(panel, getTestIdFor.filterToolPanel());

                setTestId(
                    panel.querySelector('button.ag-filter-add-button'),
                    getTestIdFor.filterToolPanelAddFilterButton()
                );

                panel.querySelectorAll('.ag-filter-card').forEach((filterCard) => {
                    const colLabel = filterCard.querySelector('.ag-filter-card-title')?.textContent;

                    const typeSelector = filterCard.querySelector('.ag-filter-type-select');
                    setTestId(typeSelector, getTestIdFor.filterToolPanelFilterTypeSelector(colLabel));

                    filterCard.querySelectorAll('.ag-filter').forEach((filter) => this.setupFilters(filter));
                });
            });
        });

        /** Status Bar */

        setTestId(
            root.querySelector('.ag-status-bar .ag-status-panel-total-and-filtered-row-count'),
            getTestIdFor.statusBarTotalAndFilteredRowCount()
        );
        setTestId(
            root.querySelector('.ag-status-bar .ag-status-panel-total-row-count'),
            getTestIdFor.statusBarTotalRowCount()
        );
        setTestId(
            root.querySelector('.ag-status-bar .ag-status-panel-filtered-row-count'),
            getTestIdFor.statusBarFilteredRowCount()
        );
        setTestId(
            root.querySelector('.ag-status-bar .ag-status-panel-selected-row-count'),
            getTestIdFor.statusBarSelectedRowCount()
        );
        setTestId(
            root.querySelector('.ag-status-bar .ag-status-panel-filtered-row-count'),
            getTestIdFor.statusBarAggregations()
        );

        /** Pagination */

        root.querySelectorAll('.ag-paging-panel').forEach((pagingPanel) => {
            setTestId(
                pagingPanel.querySelector('.ag-paging-page-size .ag-picker-field-display'),
                getTestIdFor.paginationPanelSizePickerDisplay(
                    pagingPanel.querySelector('.ag-paging-page-size .ag-picker-field-display')?.textContent
                )
            );

            pagingPanel.querySelectorAll('.ag-paging-row-summary-panel-number').forEach((panelNumber) => {
                const dataRef = panelNumber.getAttribute('data-ref');
                switch (dataRef) {
                    case 'lbFirstRowOnPage':
                        setTestId(panelNumber, getTestIdFor.paginationPanelFirstRowOnPage(panelNumber.textContent));
                        break;
                    case 'lbLastRowOnPage':
                        setTestId(panelNumber, getTestIdFor.paginationPanelLastRowOnPage(panelNumber.textContent));
                        break;
                    case 'lbRecordCount':
                        setTestId(panelNumber, getTestIdFor.paginationPanelRecordCount(panelNumber.textContent));
                        break;
                }
            });

            pagingPanel.querySelectorAll('.ag-paging-page-summary-panel .ag-button').forEach((pagingButton) => {
                setTestId(
                    pagingButton,
                    getTestIdFor.paginationSummaryPanelButton(pagingButton.getAttribute('aria-label')?.toLowerCase())
                );
            });

            pagingPanel.querySelectorAll('.ag-paging-page-summary-panel .ag-paging-number').forEach((pagingNumber) => {
                const dataRef = pagingNumber.getAttribute('data-ref');
                switch (dataRef) {
                    case 'lbCurrent':
                        setTestId(
                            pagingNumber,
                            getTestIdFor.paginationSummaryPanelCurrentPage(pagingNumber.textContent)
                        );
                        break;
                    case 'lbTotal':
                        setTestId(pagingNumber, getTestIdFor.paginationSummaryPanelTotalPage(pagingNumber.textContent));
                        break;
                }
            });
        });
    }

    private setupFilters(root: Document | ShadowRoot | Element): void {
        root.querySelectorAll('.ag-filter-menu').forEach((menu) => {
            menu.querySelectorAll('.ag-filter-select .ag-picker-field-display').forEach((fieldDisplay) => {
                setTestId(fieldDisplay, getTestIdFor.columnFilterPickerDisplay());
            });

            const numberInput = menu.querySelector('.ag-filter-body input[type=number]');
            setTestId(numberInput, getTestIdFor.columnNumberFilterInput());

            const textInput = menu.querySelector('.ag-filter-body input[type=text]');
            setTestId(textInput, getTestIdFor.columnTextFilterInput());

            const dateInput = menu.querySelector('.ag-filter-body input[type=date]');
            setTestId(dateInput, getTestIdFor.columnDateFilterInput());

            const setMiniFilterInput = menu.querySelector('.ag-mini-flter input[type=text]');
            setTestId(setMiniFilterInput, getTestIdFor.setFilterMiniFilterInput());

            menu.querySelectorAll('.ag-set-filter-list .ag-set-filter-item').forEach((item) => {
                const label = item.querySelector('.ag-checkbox-label')?.textContent;
                const checkbox = item.querySelector('input[type=checkbox]');
                setTestId(checkbox, getTestIdFor.setFilterItem(label));
            });

            menu.querySelectorAll('.ag-filter-apply-panel button').forEach((button) => {
                setTestId(button, getTestIdFor.setFilterApplyPanelButton(button.textContent));
            });

            menu.querySelectorAll('.ag-filter-condition .ag-radio-button').forEach((radioButton) => {
                const label = radioButton.querySelector('.ag-radio-button-label')?.textContent;
                setTestId(
                    radioButton.querySelector('input[type=radio]'),
                    getTestIdFor.filterConditionRadioButton(label)
                );
            });
        });

        /** Advanced Filter */

        setTestId(root.querySelector('.ag-advanced-filter input[type=text]'), getTestIdFor.advancedFilterInput());

        root.querySelectorAll('.ag-advanced-filter-buttons button').forEach((button) => {
            setTestId(button, getTestIdFor.advancedFilterButton(button.textContent));
        });

        setTestId(
            root.querySelector('button.ag-advanced-filter-builder-button'),
            getTestIdFor.advancedFilterBuilderButton()
        );

        root.querySelectorAll('.ag-panel[aria-label="Advanced Filter"] .ag-panel-title-bar-button').forEach(
            (button, i) => {
                setTestId(
                    button,
                    i === 0
                        ? getTestIdFor.advancedFilterPanelMaximiseButton()
                        : getTestIdFor.advancedFilterPanelCloseButton()
                );
            }
        );

        root.querySelectorAll('.ag-panel[aria-lable="Advanced Filter"] .ag-advanced-filter-builder-pill').forEach(
            (pill) => {
                setTestId(
                    pill,
                    getTestIdFor.advancedFilterPill(pill.querySelector('.ag-picker-field-display')?.textContent)
                );
            }
        );

        setTestId(
            root.querySelector('.ag-panel[aria-label="Advanced Filter"] .ag-advanced-filter-builder-item-button'),
            getTestIdFor.advancedFilterBuilderAddItemButton()
        );
    }
}
