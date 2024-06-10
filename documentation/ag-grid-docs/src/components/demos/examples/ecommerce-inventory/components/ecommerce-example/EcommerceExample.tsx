import type { ColDef, SizeColumnsToContentStrategy } from '@ag-grid-community/core';
import { AgGridReact } from '@ag-grid-community/react';
import { useCallback, type FunctionComponent, useRef, useState } from 'react';

import { quantityCalculator } from '../../utils/valueGetters';
import { ActionsCellRenderer } from '../actions-cell-renderer/ActionsCellRenderer';
import { ImageCellRenderer } from '../image-cell-renderer/ImageCellRenderer';
import { ProductCellRenderer } from '../product-cell-renderer/ProductCellRenderer';
import { StatusCellRenderer } from '../status-cell-renderer/StatusCellRenderer';
import styles from './EcommerceExample.module.css';
import { getData } from './data';
import { ModuleRegistry } from '@ag-grid-community/core';
import { MultiFilterModule } from '@ag-grid-enterprise/multi-filter';
import { SetFilterModule } from '@ag-grid-enterprise/set-filter';

ModuleRegistry.registerModules([ SetFilterModule ]);
ModuleRegistry.registerModules([ MultiFilterModule ]);

interface Props {
    gridTheme?: string;
    isDarkMode?: boolean;
}

const whenSoldOut = ['Discontinued', 'Back order', 'Email when available'];
const paginationPageSizeSelector = [5, 10, 20];


export const EcommerceExample: FunctionComponent<Props> = ({ gridTheme = 'ag-theme-quartz', isDarkMode }) => {
    const gridRef = useRef<AgGridReact>(null);

    const [colDefs] = useState<ColDef[]>([
        {
            headerCheckboxSelection: true,
            checkboxSelection: true,
            field: 'imageURL',
            headerName: 'Image',
            cellRenderer: ImageCellRenderer,
            autoHeight: true,
        },
        {
            field: 'product',
            headerName: 'Product',
            cellRenderer: ProductCellRenderer,
            wrapText: true,
            filter: 'agMultiColumnFilter',
            filterParams: {
                filters: [
                    {
                        filter: 'agTextColumnFilter',
                        filterParams: {
                            defaultOption: 'startsWith',
                        }
                    },
                    {
                        filter: 'agSetColumnFilter',
                    },
                ],
            },
            width: 600
        },
        {
            field: 'status',
            headerName: 'Status',
            cellRenderer: StatusCellRenderer,
            filter: 'agSetColumnFilter',
        },
        { field: 'sku', headerName: 'SKU', width: 500 },

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
        },
        { field: 'onHand', valueGetter: quantityCalculator, filter: 'agNumberColumnFilter' },
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
        },
        { field: 'actions', cellRenderer: ActionsCellRenderer, pinned: 'right' },
    ]);
    const [rowData] = useState(getData());
    const [defaultColDef] = useState({
        floatingFilter: true,
    });
    const [autoSizeStrategy] = useState<SizeColumnsToContentStrategy>({
        type: 'fitCellContents',
    });
    const themeClass = isDarkMode ? `${gridTheme}-dark` : gridTheme;

    const onFilterTextBoxChanged = useCallback(() => {
        gridRef.current!.api.setGridOption(
          "quickFilterText",
          (document.getElementById("filter-text-box") as HTMLInputElement).value,
        );
      }, []);

    return (
        <div className={styles.wrapper}>
            <div className={styles.container}>
                <div className="example-header">
                    <span>Quick Filter:</span>
                    <input
                        type="text"
                        id="filter-text-box"
                        placeholder="Search..."
                        onInput={onFilterTextBoxChanged}
            />
        </div>
                <div className={`${themeClass} ${styles.grid}`}>
                    <AgGridReact
                        ref={gridRef}
                        columnDefs={colDefs}
                        rowData={rowData}
                        defaultColDef={defaultColDef}
                        rowSelection="multiple"
                        autoSizeStrategy={autoSizeStrategy}
                        columnMenu="new"
                        pagination={true}
                        paginationPageSize={10}
                        paginationPageSizeSelector={paginationPageSizeSelector}
                    />
                </div>
            </div>
        </div>
    );
};
