import { type FunctionComponent, useCallback, useMemo, useRef, useState } from 'react';

import type {
    ColDef,
    GetDetailRowDataParams,
    GridSizeChangedEvent,
    SizeColumnsToFitGridStrategy,
    Toolbar,
    ValueFormatterFunc,
    ValueFormatterParams,
    ValueGetterParams,
} from 'ag-grid-community';
import { AllCommunityModule } from 'ag-grid-community';
import {
    ExcelExportModule,
    MasterDetailModule,
    MultiFilterModule,
    SetFilterModule,
    ToolbarModule,
} from 'ag-grid-enterprise';
import { AgGridProvider, AgGridReact } from 'ag-grid-react';

import styles from './InventoryExample.module.css';
import { ActionsCellRenderer } from './cell-renderers/ActionsCellRenderer';
import { PriceCellRenderer } from './cell-renderers/PriceCellRenderer';
import { ProductCellRenderer } from './cell-renderers/ProductCellRenderer';
import { StatusCellRenderer } from './cell-renderers/StatusCellRenderer';
import { StockCellRenderer } from './cell-renderers/StockCellRenderer';
import { getData } from './data';

type Breakpoint = 'small' | 'medium' | 'medLarge' | 'large' | 'xlarge';

const BREAKPOINT_CONFIG: Record<
    Breakpoint,
    {
        breakpoint?: number;
        columns: string[];
        detailColumns: string[];
        productColumnMinWidth: number;
    }
> = {
    small: {
        breakpoint: 550,
        columns: ['product', 'price'],
        detailColumns: ['title', 'year'],
        productColumnMinWidth: 150,
    },
    medium: {
        breakpoint: 750,
        columns: ['product', 'status', 'price', 'actions'],
        detailColumns: ['title', 'format', 'year'],
        productColumnMinWidth: 150,
    },
    medLarge: {
        breakpoint: 1000,
        columns: ['product', 'artist', 'status', 'price', 'actions'],
        detailColumns: ['title', 'available', 'format', 'year'],
        productColumnMinWidth: 200,
    },
    large: {
        breakpoint: 1200,
        columns: ['product', 'artist', 'year', 'status', 'inventory', 'price', 'actions'],
        detailColumns: ['title', 'available', 'format', 'label', 'year'],
        productColumnMinWidth: 250,
    },
    xlarge: {
        columns: ['product', 'artist', 'year', 'status', 'inventory', 'incoming', 'price', 'sold', 'profit', 'actions'],
        detailColumns: ['title', 'available', 'format', 'label', 'country', 'cat', 'year'],
        productColumnMinWidth: 250,
    },
};

const modules = [
    AllCommunityModule,
    ExcelExportModule,
    SetFilterModule,
    MultiFilterModule,
    MasterDetailModule,
    ToolbarModule,
];

const toolbar: Toolbar = {
    alignment: 'right',
    items: ['agQuickFilterToolbarItem'],
};

interface Props {
    gridTheme?: string;
    isDarkMode?: boolean;
}

const paginationPageSizeSelector = [5, 10, 20];

const statuses = { all: 'All', active: 'Active', paused: 'On Hold', outOfStock: 'Out of Stock' };

const statusFormatter: ValueFormatterFunc = ({ value }) => statuses[value as keyof typeof statuses] ?? '';

export const InventoryExample: FunctionComponent<Props> = ({ gridTheme = 'ag-theme-quartz', isDarkMode }) => {
    const gridRef = useRef<AgGridReact>(null);
    const [breakpoint, setBreakpoint] = useState<Breakpoint>('xlarge');

    const colDefs = useMemo<ColDef[]>(() => {
        const breakpointConfig = BREAKPOINT_CONFIG[breakpoint];
        const allColDefs: ColDef[] = [
            {
                field: 'product',
                headerName: 'Album Name',
                cellRenderer: 'agGroupCellRenderer',
                headerClass: 'header-product',
                cellRendererParams: {
                    innerRenderer: ProductCellRenderer,
                },
                minWidth: breakpointConfig.productColumnMinWidth,
            },
            { field: 'artist' },
            { field: 'year', width: 150, headerClass: 'header-sku' },
            {
                field: 'status',
                valueFormatter: statusFormatter,
                cellRenderer: StatusCellRenderer,
                minWidth: 140,
                filter: true,
                filterParams: {
                    valueFormatter: statusFormatter,
                },
                headerClass: 'header-status',
            },
            {
                field: 'inventory',
                cellRenderer: StockCellRenderer,
                headerClass: 'header-inventory',
                sortable: false,
                tooltipValueGetter: ({ data: { available, variants } }) => `${available} Stock / ${variants} Variants`,
            },
            {
                field: 'incoming',
                cellEditorParams: {
                    precision: 0,
                    step: 1,
                    showStepperButtons: true,
                },
                editable: true,
            },
            {
                field: 'price',
                width: 150,
                headerClass: 'header-price',
                cellRenderer: PriceCellRenderer,
            },
            { field: 'sold', headerClass: 'header-calendar' },
            {
                headerName: 'Est. Profit',
                colId: 'profit',
                headerClass: 'header-percentage',
                cellDataType: 'number',
                valueGetter: ({ data: { price, sold } }: ValueGetterParams) => (price * sold) / 10,
                valueFormatter: ({ value }: ValueFormatterParams) => `£${value}`,
                width: 150,
            },
            { field: 'actions', cellRenderer: ActionsCellRenderer, minWidth: 194, sortable: false, filter: false },
        ];

        return allColDefs.filter(
            (colDef) =>
                breakpointConfig.columns.includes(colDef.field!) || breakpointConfig.columns.includes(colDef.colId!)
        );
    }, [breakpoint]);
    const [rowData] = useState(getData());
    const defaultColDef = useMemo<ColDef>(
        () => ({
            resizable: false,
        }),
        []
    );
    const autoSizeStrategy = useMemo<SizeColumnsToFitGridStrategy>(
        () => ({
            type: 'fitGridWidth',
        }),
        []
    );
    const themeClass = isDarkMode ? `${gridTheme}-dark` : gridTheme;

    const detailCellRendererParams = useMemo(() => {
        const breakpointConfig = BREAKPOINT_CONFIG[breakpoint];
        const allDetailColDefs: ColDef[] = [
            { field: 'title', flex: 1.5 },
            { field: 'available', maxWidth: 120 },
            { field: 'format', flex: 2 },
            { field: 'label', flex: 1 },
            { field: 'country', flex: 0.66 },
            { field: 'cat', headerName: 'Cat#', type: 'rightAligned', flex: 0.66 },
            { field: 'year', type: 'rightAligned', maxWidth: 80 },
        ];
        const detailColDefs = allDetailColDefs.filter((colDef) =>
            breakpointConfig.detailColumns.includes(colDef.field!)
        );

        return {
            detailGridOptions: {
                columnDefs: detailColDefs,
                headerHeight: 38,
            },
            getDetailRowData: ({ successCallback, data: { variantDetails } }: GetDetailRowDataParams) =>
                successCallback(variantDetails),
        };
    }, [breakpoint]);
    const onGridSizeChanged = useCallback((params: GridSizeChangedEvent) => {
        if (params.clientWidth < BREAKPOINT_CONFIG.small.breakpoint!) {
            setBreakpoint('small');
        } else if (params.clientWidth < BREAKPOINT_CONFIG.medium.breakpoint!) {
            setBreakpoint('medium');
        } else if (params.clientWidth < BREAKPOINT_CONFIG.medLarge.breakpoint!) {
            setBreakpoint('medLarge');
        } else if (params.clientWidth < BREAKPOINT_CONFIG.large.breakpoint!) {
            setBreakpoint('large');
        } else {
            setBreakpoint('xlarge');
        }
    }, []);

    const [activeTab, setActiveTab] = useState('all');
    const handleTabClick = useCallback((status: string) => {
        setActiveTab(status);
        gridRef
            .current!.api.setColumnFilterModel('status', status === 'all' ? null : { values: [status] })
            .then(() => gridRef.current!.api.onFilterChanged());
    }, []);

    return (
        <AgGridProvider modules={modules}>
            <div className={styles.wrapper}>
                <div className={styles.container}>
                    <div className={styles.exampleHeader}>
                        <div className={styles.tabs}>
                            {Object.entries(statuses).map(([key, displayValue]) => (
                                <button
                                    className={`${styles.tabButton} ${activeTab === key ? styles.active : ''}`}
                                    onClick={() => handleTabClick(key)}
                                    key={key}
                                >
                                    {displayValue}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className={`${themeClass} ${styles.grid}`}>
                        <AgGridReact
                            ref={gridRef}
                            columnDefs={colDefs}
                            rowData={rowData}
                            defaultColDef={defaultColDef}
                            rowHeight={80}
                            autoSizeStrategy={autoSizeStrategy}
                            pagination
                            paginationPageSize={10}
                            paginationPageSizeSelector={paginationPageSizeSelector}
                            masterDetail
                            keepDetailRows
                            detailCellRendererParams={detailCellRendererParams}
                            toolbar={toolbar}
                            detailRowAutoHeight
                            onGridSizeChanged={onGridSizeChanged}
                        />
                    </div>
                </div>
            </div>
        </AgGridProvider>
    );
};
