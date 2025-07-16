import { getGridId } from '../api/coreApi';
import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { BeanName } from '../context/context';
import { _getRootNode } from '../gridOptionsUtils';
import type { ITestIdService } from '../interfaces/iTestIdService';
import { agTestIdFor } from './testIdUtils';

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

        /** Grid wrapper */

        const gridId = getGridId(this.beans);
        const gridWrapper = root.querySelector(`[grid-id="${gridId}"]`);
        setTestId(gridWrapper, agTestIdFor.root(gridId));

        /** Headers */

        root.querySelectorAll('.ag-header-group-cell').forEach((groupCell) => {
            setTestId(groupCell, agTestIdFor.headerGroupCell(groupCell.getAttribute('col-id')));
        });

        root.querySelectorAll('.ag-header-cell').forEach((cell) => {
            const colId = cell.getAttribute('col-id');
            setTestId(cell, agTestIdFor.headerCell(colId));

            setTestId(cell.querySelector('.ag-header-cell-filter-button'), agTestIdFor.headerFilterButton(colId));

            setTestId(cell.querySelector('.ag-header-cell-menu-button'), agTestIdFor.headerCellMenuButton(colId));

            setTestId(cell.querySelector('.ag-checkbox input[type=checkbox]'), agTestIdFor.headerCheckbox(colId));

            setTestId(cell.querySelector('.ag-floating-filter-button button'), agTestIdFor.floatingFilterButton(colId));

            const numberInput = cell.querySelector('.ag-floating-filter-body input[type=number]');
            setTestId(numberInput, agTestIdFor.columnNumberFilterInput());

            const textInput = cell.querySelector('.ag-floating-filter-body input[type=text]');
            setTestId(textInput, agTestIdFor.columnTextFilterInput());

            const dateInput = cell.querySelector('.ag-floating-filter-body input[type=date]');
            setTestId(dateInput, agTestIdFor.columnDateFilterInput());
        });

        /** Column Filters */

        this.setupFilters(root);

        /** Rows */

        root.querySelectorAll('.ag-row').forEach((row) => {
            const rowId = row.getAttribute('row-id');
            setTestId(row, agTestIdFor.rowNode(rowId));

            /** Cells */

            row.querySelectorAll('.ag-cell').forEach((cell) => {
                const colId = cell.getAttribute('col-id');
                setTestId(cell, agTestIdFor.cell(rowId, colId));

                setTestId(
                    cell.querySelector('.ag-selection-checkbox input[type=checkbox]'),
                    agTestIdFor.checkbox(rowId, colId)
                );

                setTestId(cell.querySelector('.ag-drag-handle'), agTestIdFor.dragHandle(rowId, colId));

                setTestId(cell.querySelector('.ag-group-contracted'), agTestIdFor.groupContracted(rowId, colId));

                setTestId(cell.querySelector('.ag-group-expanded'), agTestIdFor.groupExpanded(rowId, colId));
            });
        });

        /** Menu */

        root.querySelectorAll('.ag-menu-list').forEach((menu) => {
            setTestId(menu, agTestIdFor.menu());

            menu.querySelectorAll('.ag-menu-option').forEach((option) => {
                setTestId(option, agTestIdFor.menuOption(option.querySelector('.ag-menu-option-text')?.textContent));
            });
        });

        /** SideBar */

        root.querySelectorAll('.ag-side-bar').forEach((sideBar) => {
            setTestId(sideBar, agTestIdFor.sideBar());

            /** SideBar buttons */

            sideBar.querySelectorAll('.ag-side-button button').forEach((button) => {
                setTestId(
                    button,
                    agTestIdFor.sideBarButton(button.querySelector('.ag-side-button-label')?.textContent)
                );
            });

            /** Column Tool Panel */

            sideBar.querySelectorAll('.ag-column-panel').forEach((panel) => {
                setTestId(panel, agTestIdFor.columnToolPanel());

                setTestId(
                    panel.querySelector('.ag-pivot-mode-select input[type=checkbox]'),
                    agTestIdFor.pivotModeSelect()
                );

                setTestId(
                    panel.querySelector('.ag-column-select-header-checkbox input[type=checkbox]'),
                    agTestIdFor.columnPanelSelectHeaderCheckbox()
                );

                setTestId(
                    panel.querySelector('.ag-column-select-header-filter-wrapper input[type=text]'),
                    agTestIdFor.columnPanelSelectHeaderFilter()
                );

                panel.querySelectorAll('.ag-column-select-list').forEach((list) => {
                    list.querySelectorAll('.ag-column-select-virtual-list-item').forEach((item) => {
                        const label = item.getAttribute('aria-label');

                        setTestId(
                            item.querySelector('.ag-column-group-closed-icon'),
                            agTestIdFor.columnSelectListItemGroupClosedIcon(label)
                        );

                        setTestId(
                            item.querySelector('.ag-column-select-checkbox input[type=checkbox]'),
                            agTestIdFor.columnSelectListItemCheckbox(label)
                        );

                        setTestId(
                            item.querySelector('.ag-drag-handle'),
                            agTestIdFor.columnSelectListItemDragHandle(label)
                        );
                    });
                });

                panel.querySelectorAll('.ag-column-drop').forEach((columnDrop) => {
                    columnDrop.querySelectorAll('.ag-column-drop-cell').forEach((columnDropCell) => {
                        setTestId(
                            columnDropCell.querySelector('.ag-drag-handle'),
                            agTestIdFor.columnDropCellDragHandle(
                                columnDropCell.querySelector('.ag-column-drop-cell-text')?.textContent
                            )
                        );
                    });
                });
            });

            /** Filter Tool Panel */

            sideBar.querySelectorAll('.ag-filter-panel').forEach((panel) => {
                setTestId(panel, agTestIdFor.filterToolPanel());

                setTestId(
                    panel.querySelector('button.ag-filter-add-button'),
                    agTestIdFor.filterToolPanelAddFilterButton()
                );

                panel.querySelectorAll('.ag-filter-card').forEach((filterCard) => {
                    const colLabel = filterCard.querySelector('.ag-filter-card-title')?.textContent;

                    const typeSelector = filterCard.querySelector('.ag-filter-type-select');
                    setTestId(typeSelector, agTestIdFor.filterToolPanelFilterTypeSelector(colLabel));

                    filterCard.querySelectorAll('.ag-filter').forEach((filter) => this.setupFilters(filter));
                });
            });
        });

        /** Status Bar */

        setTestId(
            root.querySelector('.ag-status-bar .ag-status-panel-total-and-filtered-row-count'),
            agTestIdFor.statusBarTotalAndFilteredRowCount()
        );
        setTestId(
            root.querySelector('.ag-status-bar .ag-status-panel-total-row-count'),
            agTestIdFor.statusBarTotalRowCount()
        );
        setTestId(
            root.querySelector('.ag-status-bar .ag-status-panel-filtered-row-count'),
            agTestIdFor.statusBarFilteredRowCount()
        );
        setTestId(
            root.querySelector('.ag-status-bar .ag-status-panel-selected-row-count'),
            agTestIdFor.statusBarSelectedRowCount()
        );
        setTestId(
            root.querySelector('.ag-status-bar .ag-status-panel-filtered-row-count'),
            agTestIdFor.statusBarAggregations()
        );

        /** Pagination */

        root.querySelectorAll('.ag-paging-panel').forEach((pagingPanel) => {
            setTestId(
                pagingPanel.querySelector('.ag-paging-page-size .ag-picker-field-display'),
                agTestIdFor.paginationPanelSizePickerDisplay(
                    pagingPanel.querySelector('.ag-paging-page-size .ag-picker-field-display')?.textContent
                )
            );

            pagingPanel.querySelectorAll('.ag-paging-row-summary-panel-number').forEach((panelNumber) => {
                const dataRef = panelNumber.getAttribute('data-ref');
                switch (dataRef) {
                    case 'lbFirstRowOnPage':
                        setTestId(panelNumber, agTestIdFor.paginationPanelFirstRowOnPage(panelNumber.textContent));
                        break;
                    case 'lbLastRowOnPage':
                        setTestId(panelNumber, agTestIdFor.paginationPanelLastRowOnPage(panelNumber.textContent));
                        break;
                    case 'lbRecordCount':
                        setTestId(panelNumber, agTestIdFor.paginationPanelRecordCount(panelNumber.textContent));
                        break;
                }
            });

            pagingPanel.querySelectorAll('.ag-paging-page-summary-panel .ag-button').forEach((pagingButton) => {
                setTestId(
                    pagingButton,
                    agTestIdFor.paginationSummaryPanelButton(pagingButton.getAttribute('aria-label')?.toLowerCase())
                );
            });

            pagingPanel.querySelectorAll('.ag-paging-page-summary-panel .ag-paging-number').forEach((pagingNumber) => {
                const dataRef = pagingNumber.getAttribute('data-ref');
                switch (dataRef) {
                    case 'lbCurrent':
                        setTestId(
                            pagingNumber,
                            agTestIdFor.paginationSummaryPanelCurrentPage(pagingNumber.textContent)
                        );
                        break;
                    case 'lbTotal':
                        setTestId(pagingNumber, agTestIdFor.paginationSummaryPanelTotalPage(pagingNumber.textContent));
                        break;
                }
            });
        });
    }

    private setupFilters(root: Document | ShadowRoot | Element): void {
        root.querySelectorAll('.ag-filter-menu').forEach((menu) => {
            menu.querySelectorAll('.ag-filter-select .ag-picker-field-display').forEach((fieldDisplay) => {
                setTestId(fieldDisplay, agTestIdFor.columnFilterPickerDisplay());
            });

            const numberInput = menu.querySelector('.ag-filter-body input[type=number]');
            setTestId(numberInput, agTestIdFor.columnNumberFilterInput());

            const textInput = menu.querySelector('.ag-filter-body input[type=text]');
            setTestId(textInput, agTestIdFor.columnTextFilterInput());

            const dateInput = menu.querySelector('.ag-filter-body input[type=date]');
            setTestId(dateInput, agTestIdFor.columnDateFilterInput());

            const setMiniFilterInput = menu.querySelector('.ag-mini-flter input[type=text]');
            setTestId(setMiniFilterInput, agTestIdFor.setFilterMiniFilterInput());

            menu.querySelectorAll('.ag-set-filter-list .ag-set-filter-item').forEach((item) => {
                const label = item.querySelector('.ag-checkbox-label')?.textContent;
                const checkbox = item.querySelector('input[type=checkbox]');
                setTestId(checkbox, agTestIdFor.setFilterItem(label));
            });

            menu.querySelectorAll('.ag-filter-apply-panel button').forEach((button) => {
                setTestId(button, agTestIdFor.setFilterApplyPanelButton(button.textContent));
            });

            menu.querySelectorAll('.ag-filter-condition .ag-radio-button').forEach((radioButton) => {
                const label = radioButton.querySelector('.ag-radio-button-label')?.textContent;
                setTestId(
                    radioButton.querySelector('input[type=radio]'),
                    agTestIdFor.filterConditionRadioButton(label)
                );
            });
        });

        /** Advanced Filter */

        setTestId(root.querySelector('.ag-advanced-filter input[type=text]'), agTestIdFor.advancedFilterInput());

        root.querySelectorAll('.ag-advanced-filter-buttons button').forEach((button) => {
            setTestId(button, agTestIdFor.advancedFilterButton(button.textContent));
        });

        setTestId(
            root.querySelector('button.ag-advanced-filter-builder-button'),
            agTestIdFor.advancedFilterBuilderButton()
        );

        root.querySelectorAll('.ag-panel[aria-label="Advanced Filter"] .ag-panel-title-bar-button').forEach(
            (button, i) => {
                setTestId(
                    button,
                    i === 0
                        ? agTestIdFor.advancedFilterPanelMaximiseButton()
                        : agTestIdFor.advancedFilterPanelCloseButton()
                );
            }
        );

        root.querySelectorAll('.ag-panel[aria-lable="Advanced Filter"] .ag-advanced-filter-builder-pill').forEach(
            (pill) => {
                setTestId(
                    pill,
                    agTestIdFor.advancedFilterPill(pill.querySelector('.ag-picker-field-display')?.textContent)
                );
            }
        );

        setTestId(
            root.querySelector('.ag-panel[aria-label="Advanced Filter"] .ag-advanced-filter-builder-item-button'),
            agTestIdFor.advancedFilterBuilderAddItemButton()
        );
    }
}
