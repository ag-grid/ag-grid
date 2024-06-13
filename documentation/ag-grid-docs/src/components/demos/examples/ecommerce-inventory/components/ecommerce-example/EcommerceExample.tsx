import type { ColDef, SizeColumnsToContentStrategy } from '@ag-grid-community/core';
import { AgGridReact } from '@ag-grid-community/react';
import { useCallback, type FunctionComponent, useRef, useState, useMemo } from 'react';

import { quantityCalculator } from '../../utils/valueGetters';
import { ActionsCellRenderer } from '../actions-cell-renderer/ActionsCellRenderer';
import { ImageCellRenderer } from '../image-cell-renderer/ImageCellRenderer';
import { ProductCellRenderer } from '../product-cell-renderer/ProductCellRenderer';
import { StatusCellRenderer } from '../status-cell-renderer/StatusCellRenderer';
import { ProductDetailsRenderer } from '../product-details-renderer/ProductDetailsRenderer';
import styles from './EcommerceExample.module.css';
import { getData } from './data';
import { ModuleRegistry } from '@ag-grid-community/core';
import { MultiFilterModule } from '@ag-grid-enterprise/multi-filter';
import { SetFilterModule } from '@ag-grid-enterprise/set-filter';
import { MasterDetailModule } from '@ag-grid-enterprise/master-detail';

ModuleRegistry.registerModules([ SetFilterModule, MultiFilterModule, MasterDetailModule ]);

interface Props {
    gridTheme?: string;
    isDarkMode?: boolean;
}

const whenSoldOut = ['Discontinued', 'Back order', 'Email when available'];
const paginationPageSizeSelector = [5, 10, 20];
function currencyFormatter(params: ValueFormatterParams) { return params.value == null ? "" : "£" + params.value; };

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
            cellRenderer: "agGroupCellRenderer",
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
        {   field: 'sku', 
            headerName: 'SKU', 
            width: 500 
        },
        {   headerName: 'Price',
            width: 200,
            cellRenderer: function(param)
            {
                return (
                    <div>
                        {'£' + param.data.price}
                        <br />
                        <span style={{ color: 'green', fontWeight: 'bold' }}>
                            {param.data.priceIncrease + '% incease'}
                        </span>
                    </div>
                );
            }
        },
        {   field: 'soldLastMonth',
            filter: 'agNumberColumnFilter'
        },
        {   headerName: 'Est. Profit',
            valueGetter: p => '£'+p.data.price * p.data.soldLastMonth /10 
        },
        {
            field: 'status',
            headerName: 'Status',
            cellRenderer: StatusCellRenderer,
            filter: 'agSetColumnFilter',
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
            width: 100
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
            width: 150
        },
        {   field: 'onHand', 
            valueGetter: quantityCalculator, 
            filter: 'agNumberColumnFilter',
            width: 100,
        },
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
                const descriptions = ['TBD' ];

                const selectedDescription = descriptions[Math.floor(Math.random() * descriptions.length)];

                params.successCallback([
                    { type: 'Type 1', description: selectedDescription, grossAmount: 1000 },
                    { type: 'Type 2', description: selectedDescription, grossAmount: 2000 },
                ]);
            },
        };
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
                        masterDetail={true}
                        detailCellRendererParams={detailCellRendererParams}
                    />
                </div>
            </div>
        </div>
    );
};
