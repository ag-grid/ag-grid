import type { ColDef, SizeColumnsToContentStrategy } from '@ag-grid-community/core';
import { ModuleRegistry } from '@ag-grid-community/core';
import { AgGridReact } from '@ag-grid-community/react';
import { MasterDetailModule } from '@ag-grid-enterprise/master-detail';
import { MultiFilterModule } from '@ag-grid-enterprise/multi-filter';
import { SetFilterModule } from '@ag-grid-enterprise/set-filter';
import { type FunctionComponent, useCallback, useMemo, useRef, useState } from 'react';

import { quantityCalculator } from '../../utils/valueGetters';
import { ActionsCellRenderer } from '../actions-cell-renderer/ActionsCellRenderer';
import { InventoryCountRenderer } from '../inventory-count/InventoryCountRenderer';
import { ProductCellRenderer } from '../product-cell-renderer/ProductCellRenderer';
import { ProductDetailsRenderer } from '../product-details-renderer/ProductDetailsRenderer';
import { StatusCellRenderer } from '../status-cell-renderer/StatusCellRenderer';
import styles from './EcommerceExample.module.css';
import { getData } from './data';

ModuleRegistry.registerModules([SetFilterModule, MultiFilterModule, MasterDetailModule]);

interface Props {
    gridTheme?: string;
    isDarkMode?: boolean;
}

const whenSoldOut = ['Discontinued', 'Back order', 'Email when available'];
const paginationPageSizeSelector = [5, 10, 20];

export const EcommerceExample: FunctionComponent<Props> = ({ gridTheme = 'ag-theme-quartz', isDarkMode }) => {
    const gridRef = useRef<AgGridReact>(null);

    const [colDefs] = useState<ColDef[]>([
        { field: 'sku', headerName: 'SKU', width: 500, headerClass: 'header-sku' },
        {
            field: 'product',
            headerName: 'Product',
            cellRenderer: 'agGroupCellRenderer',
            headerClass: 'header-product',
            cellRendererParams: {
                innerRenderer: ProductCellRenderer,
            },
            width: 600,
        },
        {
            field: 'status',
            headerName: 'Status',
            cellRenderer: StatusCellRenderer,
            filter: 'agSetColumnFilter',
            headerClass: 'header-status',
        },

        {
            field: 'inventory',
            headerName: 'Inventory',
            cellRenderer: InventoryCountRenderer,
            headerClass: 'header-inventory',
            width: 600,
        },

        {
            headerName: 'Price',
            width: 200,
            headerClass: 'header-price',
            cellRenderer: function (param) {
                return (
                    <div className={styles.price}>
                        <span className={styles.priceAmount}>{'£' + param.data.price}</span>
                        <span className={styles.increase}>{param.data.priceIncrease + '% incease'}</span>
                    </div>
                );
            },
        },
        { field: 'soldLastMonth', filter: 'agNumberColumnFilter', headerClass: 'header-calendar' },
        {
            headerName: 'Est. Profit',
            headerClass: 'header-percentage',
            valueGetter: (p) => '£' + (p.data.price * p.data.soldLastMonth) / 10,
        },

        {
            field: 'whenSoldOut',
            cellEditor: 'agSelectCellEditor',
            cellEditorParams: {
                values: whenSoldOut,
            },
            editable: true,
        },
        {
            field: 'available',
            cellEditor: 'agNumberCellEditor',
            filter: 'agNumberColumnFilter',
            cellEditorParams: {
                precision: 0,
                step: 1,
                showStepperButtons: true,
            },
            editable: true,
            width: 100,
        },
        {
            field: 'unavailable',
            cellEditor: 'agNumberCellEditor',
            filter: 'agNumberColumnFilter',
            cellEditorParams: {
                precision: 0,
                step: 1,
                showStepperButtons: true,
            },
            editable: true,
            width: 150,
        },
        { field: 'onHand', valueGetter: quantityCalculator, filter: 'agNumberColumnFilter', width: 100 },
        {
            field: 'incoming',
            cellEditor: 'agNumberCellEditor',
            filter: 'agNumberColumnFilter',
            cellEditorParams: {
                precision: 0,
                step: 1,
                showStepperButtons: true,
            },
            editable: true,
            width: 100,
        },
        { field: 'actions', cellRenderer: ActionsCellRenderer, pinned: 'right' },
    ]);
    const [rowData] = useState(getData());
    const [defaultColDef] = useState({
        resizable: false,
    });
    const [autoSizeStrategy] = useState<SizeColumnsToContentStrategy>({
        type: 'fitCellContents',
    });
    const themeClass = isDarkMode ? `${gridTheme}-dark` : gridTheme;

    const onFilterTextBoxChanged = useCallback(() => {
        gridRef.current!.api.setGridOption(
            'quickFilterText',
            (document.getElementById('filter-text-box') as HTMLInputElement).value
        );
    }, []);

    const detailCellRendererParams = useMemo(() => {
        return {
            detailGridOptions: {
                columnDefs: [
                    { field: 'value', headerName: 'Type', width: 150, cellRenderer: ProductDetailsRenderer },
                    { field: 'description', headerName: 'Description', width: 150 },
                    { field: 'grossAmount', headerName: 'Gross Amount', width: 150 },
                ],
                defaultColDef: {
                    flex: 1,
                    minWidth: 100,
                },
            },
            getDetailRowData: function (params: any) {
                const descriptions = ['TBD'];

                const selectedDescription = descriptions[Math.floor(Math.random() * descriptions.length)];

                params.successCallback([
                    { type: 'Type 1', description: selectedDescription, grossAmount: 1000 },
                    { type: 'Type 2', description: selectedDescription, grossAmount: 2000 },
                ]);
            },
        };
    }, []);

    const setStatusFilter = (status: string) => {
        gridRef.current!.api.getFilterInstance('status', (filterInstance) => {
            if (status === 'all') {
                filterInstance.setModel(null); // Reset the filter
            } else {
                filterInstance.setModel({ values: [status] });
            }
            gridRef.current!.api.onFilterChanged();
        });
    };

    const [activeTab, setActiveTab] = useState('all');

    const handleTabClick = (status: string) => {
        setActiveTab(status);
        setStatusFilter(status);
    };

    return (
        <div className={styles.wrapper}>
            <div className={styles.container}>
                <div className={styles.exampleHeader}>
                    <div className={styles.tabs}>
                        <button
                            className={`${styles.tabButton} ${activeTab === 'all' ? styles.active : ''}`}
                            onClick={() => handleTabClick('all')}
                        >
                            All
                        </button>
                        <button
                            className={`${styles.tabButton} ${activeTab === 'active' ? styles.active : ''}`}
                            onClick={() => handleTabClick('active')}
                        >
                            Active
                        </button>
                        <button
                            className={`${styles.tabButton} ${activeTab === 'paused' ? styles.active : ''}`}
                            onClick={() => handleTabClick('paused')}
                        >
                            Paused
                        </button>
                        <button
                            className={`${styles.tabButton} ${activeTab === 'out of stock' ? styles.active : ''}`}
                            onClick={() => handleTabClick('out of stock')}
                        >
                            Out of Stock
                        </button>
                    </div>
                    <div className={styles.inputWrapper}>
                        <svg
                            focusable="false"
                            preserveAspectRatio="xMidYMid meet"
                            fill="currentColor"
                            width="16"
                            height="16"
                            viewBox="0 0 32 32"
                            aria-hidden="true"
                            className={styles.searchIcon}
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path d="M29,27.5859l-7.5521-7.5521a11.0177,11.0177,0,1,0-1.4141,1.4141L27.5859,29ZM4,13a9,9,0,1,1,9,9A9.01,9.01,0,0,1,4,13Z"></path>
                        </svg>
                        <input
                            type="text"
                            id="filter-text-box"
                            placeholder="Search product..."
                            onInput={onFilterTextBoxChanged}
                        />
                    </div>
                </div>
                <div className={`${themeClass} ${styles.grid}`}>
                    <AgGridReact
                        ref={gridRef}
                        columnDefs={colDefs}
                        rowData={rowData}
                        defaultColDef={defaultColDef}
                        rowHeight={80}
                        rowSelection="multiple"
                        autoSizeStrategy={autoSizeStrategy}
                        columnMenu="new"
                        pagination={true}
                        paginationPageSize={10}
                        paginationPageSizeSelector={paginationPageSizeSelector}
                        masterDetail={true}
                        detailCellRendererParams={detailCellRendererParams}
                    />
                </div>
            </div>
        </div>
    );
};
