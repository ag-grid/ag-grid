import { _getRootNode } from '../agStack/utils/document';
import { _debounce } from '../agStack/utils/function';
import { getGridId } from '../api/coreApi';
import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { BeanName } from '../context/context';
import type { ITestIdService } from '../interfaces/iTestIdService';
import { agTestIdFor } from './testIdUtils';
import type { FilterSpec } from './testIdUtils';

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
        // Add a delayed setup that is also debounced to be more robust with Reacts async rendering.
        const delayedDebounce = _debounce(this, () => this.setupAllTestIds(), 500);
        const setup = _debounce(
            this,
            () => {
                this.setupAllTestIds();
                delayedDebounce();
            },
            0
        );
        this.addManagedEventListeners({
            firstDataRendered: setup,
            displayedRowsChanged: setup,
            displayedColumnsChanged: setup,
            displayedColumnsWidthChanged: setup,
            virtualColumnsChanged: setup,
            columnMenuVisibleChanged: setup,
            contextMenuVisibleChanged: setup,
            advancedFilterBuilderVisibleChanged: setup,
            fieldPickerValueSelected: setup,
            modelUpdated: setup,
            sideBarUpdated: setup,
            pinnedHeightChanged: setup,
            gridReady: setup,
            overlayExclusiveChanged: setup,
            rowGroupOpened: setup,
            scrollVisibilityChanged: setup,
            gridSizeChanged: setup,
            filterOpened: setup,
            filterChanged: setup,
            cellSelectionChanged: setup,
        });
    }

    public setupAllTestIds(): void {
        const root = _getRootNode(this.beans);

        /** Grid wrapper */

        const gridId = getGridId(this.beans);
        const gridWrapper = root.querySelector(`[grid-id="${gridId}"]`);
        setTestId(gridWrapper, agTestIdFor.grid(gridId));

        /** Headers */

        for (const groupCell of root.querySelectorAll('.ag-header-group-cell')) {
            setTestId(groupCell, agTestIdFor.headerGroupCell(groupCell.getAttribute('col-id')));
        }

        for (const cell of root.querySelectorAll('.ag-header-cell')) {
            const colId = cell.getAttribute('col-id');

            const isFloatingFilter = cell.classList.contains('ag-floating-filter');
            const headerCellId = isFloatingFilter ? agTestIdFor.floatingFilter(colId) : agTestIdFor.headerCell(colId);
            setTestId(cell, headerCellId);

            setTestId(cell.querySelector('.ag-header-cell-filter-button'), agTestIdFor.headerFilterButton(colId));

            setTestId(cell.querySelector('.ag-header-cell-menu-button'), agTestIdFor.headerCellMenuButton(colId));

            setTestId(cell.querySelector('.ag-header-cell-resize'), agTestIdFor.headerResizeHandle(colId));

            setTestId(cell.querySelector('.ag-checkbox input[type=checkbox]'), agTestIdFor.headerCheckbox(colId));

            setTestId(cell.querySelector('.ag-floating-filter-button button'), agTestIdFor.floatingFilterButton(colId));

            this.setupFilterInstance(cell.querySelector('.ag-floating-filter-body'), {
                source: 'floating-filter',
                colId,
            });
        }

        /** Column Filter */

        const filterMenu = root.querySelector('.ag-filter-menu');
        this.setupFilterInstance(filterMenu, { source: 'column-filter' });

        /** Advanced Filter */

        setTestId(root.querySelector('.ag-advanced-filter input[type=text]'), agTestIdFor.advancedFilterInput());

        for (const button of root.querySelectorAll('.ag-advanced-filter-buttons button')) {
            setTestId(button, agTestIdFor.advancedFilterButton(button.textContent));
        }

        setTestId(
            root.querySelector('button.ag-advanced-filter-builder-button'),
            agTestIdFor.advancedFilterBuilderButton()
        );

        const buttons = root.querySelectorAll('.ag-panel[aria-label="Advanced Filter"] .ag-panel-title-bar-button');
        for (let i = 0; i < buttons.length; i++) {
            const button = buttons[i];
            setTestId(
                button,
                i === 0 ? agTestIdFor.advancedFilterPanelMaximiseButton() : agTestIdFor.advancedFilterPanelCloseButton()
            );
        }

        for (const pill of root.querySelectorAll(
            '.ag-panel[aria-label="Advanced Filter"] .ag-advanced-filter-builder-pill'
        )) {
            setTestId(
                pill,
                agTestIdFor.advancedFilterPill(pill.querySelector('.ag-picker-field-display')?.textContent)
            );
        }
        setTestId(
            root.querySelector('.ag-panel[aria-label="Advanced Filter"] .ag-advanced-filter-builder-item-button'),
            agTestIdFor.advancedFilterBuilderAddItemButton()
        );

        /** Rows */

        for (const row of root.querySelectorAll('.ag-row')) {
            const rowId = row.getAttribute('row-id');
            setTestId(row, agTestIdFor.rowNode(rowId));

            /** Cells */

            for (const cell of row.querySelectorAll('.ag-cell')) {
                const colId = cell.getAttribute('col-id');
                setTestId(cell, agTestIdFor.cell(rowId, colId));

                setTestId(
                    cell.querySelector('.ag-selection-checkbox input[type=checkbox]'),
                    agTestIdFor.checkbox(rowId, colId)
                );

                setTestId(cell.querySelector('.ag-drag-handle'), agTestIdFor.dragHandle(rowId, colId));

                setTestId(cell.querySelector('.ag-group-contracted'), agTestIdFor.groupContracted(rowId, colId));

                setTestId(cell.querySelector('.ag-group-expanded'), agTestIdFor.groupExpanded(rowId, colId));
            }
        }

        /** Menu */

        for (const menu of root.querySelectorAll('.ag-menu-list')) {
            setTestId(menu, agTestIdFor.menu());

            for (const option of menu.querySelectorAll('.ag-menu-option')) {
                setTestId(option, agTestIdFor.menuOption(option.querySelector('.ag-menu-option-text')?.textContent));
            }
        }

        /** SideBar */

        for (const sideBar of root.querySelectorAll('.ag-side-bar')) {
            setTestId(sideBar, agTestIdFor.sideBar());

            /** SideBar buttons */

            for (const button of sideBar.querySelectorAll('.ag-side-button button')) {
                setTestId(
                    button,
                    agTestIdFor.sideBarButton(button.querySelector('.ag-side-button-label')?.textContent)
                );
            }

            /** Column Tool Panel */

            for (const panel of sideBar.querySelectorAll('.ag-column-panel')) {
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

                for (const list of panel.querySelectorAll('.ag-column-select-list')) {
                    for (const item of list.querySelectorAll('.ag-column-select-virtual-list-item')) {
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
                    }
                }

                this.setupColumnDropArea(panel, 'toolbar');
            }

            /** Filter Tool Panel (New) */

            for (const panel of sideBar.querySelectorAll('.ag-filter-panel')) {
                setTestId(panel, agTestIdFor.filterToolPanel());

                setTestId(
                    panel.querySelector('button.ag-filter-add-button'),
                    agTestIdFor.filterToolPanelAddFilterButton()
                );

                for (const filterCard of panel.querySelectorAll('.ag-filter-card')) {
                    const colLabel = filterCard.querySelector('.ag-filter-card-title')?.textContent;

                    const typeSelector = filterCard.querySelector('.ag-filter-type-select');
                    setTestId(typeSelector, agTestIdFor.filterToolPanelFilterTypeSelector(colLabel));

                    for (const filter of filterCard.querySelectorAll('.ag-filter')) {
                        this.setupFilterInstance(filter, { source: 'filter-toolpanel', colLabel });
                    }
                }
            }

            /** Filter Tool Panel (Old) */

            for (const panel of sideBar.querySelectorAll('.ag-filter-toolpanel')) {
                setTestId(
                    panel.querySelector('.ag-filter-toolpanel-search-input input[type=text]'),
                    agTestIdFor.filterToolPanelSearchInput()
                );

                for (const group of panel.querySelectorAll('.ag-filter-toolpanel-group')) {
                    const title = group.querySelector('.ag-filter-toolpanel-group-title')?.textContent;

                    setTestId(group, agTestIdFor.filterToolPanelGroup(title));

                    setTestId(
                        group.querySelector('.ag-filter-toolpanel-group-title-bar-icon .ag-icon-tree-closed'),
                        agTestIdFor.filterToolPanelGroupCollapsedIcon(title)
                    );

                    const filterRoot = group.querySelector('.ag-filter-toolpanel-instance-filter');
                    if (filterRoot) {
                        this.setupFilterInstance(filterRoot, { source: 'filter-toolpanel', colLabel: title });
                    }
                }
            }
        }

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

        for (const pagingPanel of root.querySelectorAll('.ag-paging-panel')) {
            setTestId(
                pagingPanel.querySelector('.ag-paging-page-size .ag-picker-field-display'),
                agTestIdFor.paginationPanelSizePickerDisplay(
                    pagingPanel.querySelector('.ag-paging-page-size .ag-picker-field-display')?.textContent
                )
            );

            for (const panelNumber of pagingPanel.querySelectorAll('.ag-paging-row-summary-panel-number')) {
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
            }

            for (const pagingButton of pagingPanel.querySelectorAll('.ag-paging-page-summary-panel .ag-button')) {
                setTestId(
                    pagingButton,
                    agTestIdFor.paginationSummaryPanelButton(pagingButton.getAttribute('aria-label')?.toLowerCase())
                );
            }

            for (const pagingNumber of pagingPanel.querySelectorAll(
                '.ag-paging-page-summary-panel .ag-paging-number'
            )) {
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
            }
        }

        setTestId(root.querySelector('.ag-fill-handle'), agTestIdFor.fillHandle());

        /** Column Chooser */

        for (const panel of root.querySelectorAll('.ag-panel[aria-label="Choose Columns"]')) {
            setTestId(panel.querySelector('.ag-panel-title-bar-button-icon'), agTestIdFor.columnChooserCloseButton());
            setTestId(
                panel.querySelector('.ag-column-select-header-checkbox input[type="checkbox"]'),
                agTestIdFor.columnChooserSearchBarCheckbox()
            );
            setTestId(
                panel.querySelector('.ag-column-select-header-filter-wrapper input[type="text"]'),
                agTestIdFor.columnChooserSearchBarFilter()
            );
            for (const list of panel.querySelectorAll('.ag-column-select-list')) {
                for (const item of list.querySelectorAll('.ag-column-select-virtual-list-item')) {
                    const label = item.getAttribute('aria-label');
                    setTestId(
                        item.querySelector('.ag-column-group-closed-icon'),
                        agTestIdFor.columnChooserListItemGroupClosedIcon(label)
                    );

                    setTestId(
                        item.querySelector('.ag-column-select-checkbox input[type=checkbox]'),
                        agTestIdFor.columnChooserListItemCheckbox(label)
                    );

                    setTestId(
                        item.querySelector('.ag-drag-handle'),
                        agTestIdFor.columnChooserListItemDragHandle(label)
                    );
                }
            }
        }

        /** Overlay */

        setTestId(root.querySelector('.ag-overlay-wrapper'), agTestIdFor.overlay());

        /** Row Group Panel */

        const rowGroupPanelWrapper = root.querySelector('.ag-column-drop-wrapper');
        if (rowGroupPanelWrapper) {
            this.setupColumnDropArea(rowGroupPanelWrapper, 'panel');
        }
    }

    private setupFilterInstance(filterRoot: Element | null, spec: FilterSpec): void {
        if (!filterRoot) {
            return;
        }

        for (const fieldDisplay of filterRoot.querySelectorAll('.ag-filter-select .ag-picker-field-display')) {
            setTestId(fieldDisplay, agTestIdFor.filterInstancePickerDisplay(spec));
        }

        const filterClass = spec.source === 'floating-filter' ? '.ag-floating-filter-body' : '.ag-filter-body';

        const numberInput = filterRoot.querySelector(`${filterClass} input[type="number"]`);
        setTestId(numberInput, agTestIdFor.numberFilterInstanceInput(spec));

        const textInput = filterRoot.querySelector(`${filterClass} input[type="text"]`);
        setTestId(textInput, agTestIdFor.textFilterInstanceInput(spec));

        const dateInput = filterRoot.querySelector(`${filterClass} input[type="date"]`);
        setTestId(dateInput, agTestIdFor.dateFilterInstanceInput(spec));

        const setMiniFilterInput = filterRoot.querySelector('.ag-mini-filter input[type="text"]');
        setTestId(setMiniFilterInput, agTestIdFor.setFilterInstanceMiniFilterInput(spec));

        for (const item of filterRoot.querySelectorAll('.ag-set-filter-list .ag-set-filter-item')) {
            const label = item.querySelector('.ag-checkbox-label')?.textContent;
            const checkbox = item.querySelector('input[type="checkbox"]');
            setTestId(checkbox, agTestIdFor.setFilterInstanceItem(spec, label));
        }

        for (const button of filterRoot.querySelectorAll('.ag-filter-apply-panel button')) {
            setTestId(button, agTestIdFor.setFilterApplyPanelButton(spec, button.textContent));
        }

        for (const radioButton of filterRoot.querySelectorAll('.ag-filter-condition .ag-radio-button')) {
            const label = radioButton.querySelector('.ag-radio-button-label')?.textContent;
            setTestId(
                radioButton.querySelector('input[type=radio]'),
                agTestIdFor.filterConditionRadioButton(spec, label)
            );
        }
    }

    private setupColumnDropArea(root: ParentNode, source: 'panel' | 'toolbar'): void {
        for (const columnDrop of root.querySelectorAll('.ag-column-drop')) {
            const dropAreaName = columnDrop.querySelector('.ag-column-drop-list')?.getAttribute('aria-label');
            setTestId(columnDrop, agTestIdFor.columnDropArea(source, dropAreaName));
            for (const columnDropCell of columnDrop.querySelectorAll('.ag-column-drop-cell')) {
                const label = columnDropCell.querySelector('.ag-column-drop-cell-text')?.textContent;
                setTestId(
                    columnDropCell.querySelector('.ag-drag-handle'),
                    agTestIdFor.columnDropCellDragHandle(source, dropAreaName, label)
                );

                setTestId(
                    columnDropCell.querySelector('.ag-column-drop-cell-button .ag-icon-cancel'),
                    agTestIdFor.columnDropCellCancelButton(source, dropAreaName, label)
                );
            }
        }
    }
}
