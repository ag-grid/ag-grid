import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { BeanName } from '../context/context';
import { _getRootNode } from '../gridOptionsUtils';
import type { ITestIdService } from '../interfaces/iTestIdService';

const TEST_ID_ATTR = 'data-testid';

export class TestIdService extends BeanStub implements NamedBean, ITestIdService {
    beanName: BeanName = 'testIdSvc';

    public postConstruct(): void {
        this.addManagedEventListeners({
            firstDataRendered: () => this.setupAllTestIds(),
        });
    }

    public setupAllTestIds(): void {
        const root = _getRootNode(this.beans);

        function setTestId(
            element: Element | null | undefined,
            name: string,
            attrs?: Record<string, string | number | null | undefined>
        ) {
            element?.setAttribute(TEST_ID_ATTR, formatTestId(name, attrs));
        }

        /** Headers */

        root.querySelectorAll('.ag-header-group-cell').forEach((groupCell) => {
            setTestId(groupCell, 'ag-header-group-cell', {
                ['col-id']: groupCell.getAttribute('col-id'),
            });
        });

        root.querySelectorAll('.ag-header-cell').forEach((cell) => {
            setTestId(cell, 'ag-header-cell', {
                ['col-id']: cell.getAttribute('col-id'),
            });

            setTestId(cell.querySelector('.ag-header-cell-menu-button'), 'ag-header-cell-menu-button', {
                ['col-id']: cell.getAttribute('col-id'),
            });
        });

        /** Rows */

        root.querySelectorAll('.ag-row').forEach((row) => {
            setTestId(row, 'ag-row', { ['row-id']: row.getAttribute('row-id') });

            /** Cells */

            row.querySelectorAll('.ag-cell').forEach((cell) => {
                setTestId(cell, 'ag-cell', {
                    ['row-id']: row.getAttribute('row-id'),
                    ['col-id']: cell.getAttribute('col-id'),
                });

                setTestId(cell.querySelector('.ag-selection-checkbox input[type=checkbox]'), 'ag-selection-checkbox', {
                    ['row-id']: row.getAttribute('row-id'),
                    ['col-id']: cell.getAttribute('col-id'),
                });

                setTestId(cell.querySelector('.ag-drag-handle'), 'ag-drag-handle', {
                    ['row-id']: row.getAttribute('row-id'),
                    ['col-id']: cell.getAttribute('col-id'),
                });

                setTestId(cell.querySelector('.ag-group-contracted'), 'ag-group-contracted', {
                    ['row-id']: row.getAttribute('row-id'),
                    ['col-id']: cell.getAttribute('col-id'),
                });

                setTestId(cell.querySelector('.ag-group-expanded'), 'ag-group-expanded', {
                    ['row-id']: row.getAttribute('row-id'),
                    ['col-id']: cell.getAttribute('col-id'),
                });
            });
        });

        /** Menu */

        root.querySelectorAll('.ag-menu-list').forEach((menu) => {
            setTestId(menu, 'ag-menu-list');

            menu.querySelectorAll('.ag-menu-option').forEach((option) => {
                setTestId(option, 'ag-menu-option', {
                    ['option-text']: option.querySelector('.ag-menu-option-text')?.textContent,
                });
            });
        });

        /** SideBar */

        root.querySelectorAll('.ag-side-bar').forEach((sideBar) => {
            setTestId(sideBar, 'ag-side-bar');

            /** SideBar buttons */

            sideBar.querySelectorAll('.ag-side-button button').forEach((button) => {
                setTestId(button, 'ag-side-button', {
                    ['label']: button.querySelector('.ag-side-button-label')?.textContent,
                });
            });

            /** Column Tool Panel */

            sideBar.querySelectorAll('.ag-column-panel').forEach((panel) => {
                setTestId(panel, 'ag-column-panel');

                setTestId(panel.querySelector('.ag-pivot-mode-select input[type=checkbox]'), 'ag-pivot-mode-select');

                setTestId(
                    panel.querySelector('.ag-column-select-header-checkbox input[type=checkbox]'),
                    'ag-column-panel-select-header-checkbox'
                );

                setTestId(
                    panel.querySelector('.ag-column-select-header-filter-wrapper input[type=text]'),
                    'ag-column-panel-select-header-filter'
                );

                panel.querySelectorAll('.ag-column-select-list').forEach((list) => {
                    list.querySelectorAll('.ag-column-select-virtual-list-item').forEach((item) => {
                        setTestId(
                            item.querySelector('.ag-column-group-closed-icon'),
                            'ag-column-select-list-item-group-closed-icon',
                            {
                                label: item.getAttribute('aria-label'),
                            }
                        );

                        setTestId(
                            item.querySelector('.ag-column-select-checkbox input[type=checkbox]'),
                            'ag-column-select-list-item-checkbox',
                            {
                                label: item.getAttribute('aria-label'),
                            }
                        );

                        setTestId(item.querySelector('.ag-drag-handle'), 'ag-column-select-list-item-drag-handle', {
                            label: item.getAttribute('aria-label'),
                        });
                    });
                });

                panel.querySelectorAll('.ag-column-drop').forEach((columnDrop) => {
                    columnDrop.querySelectorAll('.ag-column-drop-cell').forEach((columnDropCell) => {
                        setTestId(columnDropCell.querySelector('.ag-drag-handle'), 'ag-column-drop-cell-drag-handle', {
                            label: columnDropCell.querySelector('.ag-column-drop-cell-text')?.textContent,
                        });
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
                'ag-pagination-page-size-picker-field-display',
                {
                    value: pagingPanel.querySelector('.ag-paging-page-size .ag-picker-field-display')?.textContent,
                }
            );

            pagingPanel.querySelectorAll('.ag-paging-row-summary-panel-number').forEach((panelNumber) => {
                const dataRef = panelNumber.getAttribute('data-ref');
                switch (dataRef) {
                    case 'lbFirstRowOnPage':
                        setTestId(panelNumber, 'ag-paging-row-summary-panel-first-row-on-page', {
                            value: panelNumber.textContent,
                        });
                        break;
                    case 'lbLastRowOnPage':
                        setTestId(panelNumber, 'ag-paging-row-summary-panel-last-row-on-page', {
                            value: panelNumber.textContent,
                        });
                        break;
                    case 'lbRecordCount':
                        setTestId(panelNumber, 'ag-paging-row-summary-panel-record-count', {
                            value: panelNumber.textContent,
                        });
                        break;
                }
            });

            pagingPanel.querySelectorAll('.ag-paging-page-summary-panel .ag-button').forEach((pagingButton) => {
                setTestId(pagingButton, 'ag-paging-page-summary-panel-button', {
                    label: pagingButton.getAttribute('aria-label')?.toLowerCase(),
                });
            });

            pagingPanel.querySelectorAll('.ag-paging-page-summary-panel .ag-paging-number').forEach((pagingNumber) => {
                const dataRef = pagingNumber.getAttribute('data-ref');
                switch (dataRef) {
                    case 'lbCurrent':
                        setTestId(pagingNumber, 'ag-paging-page-summary-panel-current-page', {
                            value: pagingNumber.textContent,
                        });
                        break;
                    case 'lbTotal':
                        setTestId(pagingNumber, 'ag-paging-page-summary-panel-total-page', {
                            value: pagingNumber.textContent,
                        });
                        break;
                }
            });
        });
    }
}

function formatTestId(name: string, attributes: Record<string, string | number | null | undefined> = {}): string {
    return `${name}:${Object.entries(attributes)
        .map(([k, v]) => (v != null ? `${k}=${v}` : null))
        .filter(Boolean)
        .join(';')}`;
}
