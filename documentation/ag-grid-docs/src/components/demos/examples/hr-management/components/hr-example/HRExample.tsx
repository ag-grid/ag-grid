import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import type { ColDef, GetDataPath, ValueFormatterFunc, ValueFormatterParams } from '@ag-grid-community/core';
import { ModuleRegistry } from '@ag-grid-community/core';
import { AgGridReact } from '@ag-grid-community/react';
import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-quartz.css';
import { ExcelExportModule } from '@ag-grid-enterprise/excel-export';
import { MasterDetailModule } from '@ag-grid-enterprise/master-detail';
import { RichSelectModule } from '@ag-grid-enterprise/rich-select';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';
import { SetFilterModule } from '@ag-grid-enterprise/set-filter';
import { StatusBarModule } from '@ag-grid-enterprise/status-bar';
import { type FunctionComponent, useCallback, useMemo, useRef, useState } from 'react';

import { ContactCellRenderer } from '../contact-cell-renderer/ContactCellRenderer';
import { EmployeeCellRenderer } from '../employee-cell-renderer/EmployeeCellRenderer';
import { FlagRenderer } from '../flag-renderer/FlagRenderer';
import { StatusCellRenderer } from '../status-cell-renderer/StatusCellRenderer';
import { TagCellRenderer } from '../tag-cell-renderer/TagCellRenderer';
import styles from './HRExample.module.css';
import { getData } from './data';

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    ExcelExportModule,
    MasterDetailModule,
    RowGroupingModule,
    RichSelectModule,
    SetFilterModule,
    StatusBarModule,
]);

interface Props {
    gridTheme?: string;
    isDarkMode?: boolean;
}

const employmentType = ['Permanent', 'Contract'];
const paymentMethod = ['Cash', 'Check', 'Bank Transfer'];
const paymentStatus = ['Paid', 'Pending'];
const departments = {
    executiveManagement: 'Executive Management',
    legal: 'Legal',
    design: 'Design',
    engineering: 'Engineering',
    product: 'Product',
    customerSupport: 'Customer Support',
};
const departmentFormatter: ValueFormatterFunc = ({ value }) => departments[value as keyof typeof departments] ?? '';

export const HRExample: FunctionComponent<Props> = ({ gridTheme = 'ag-theme-quartz', isDarkMode }) => {
    const gridRef = useRef<AgGridReact>(null);

    const [colDefs] = useState<ColDef[]>([
        {
            headerName: 'ID',
            field: 'employeeId',
            width: 120,
        },
        {
            field: 'department',
            width: 250,
            valueFormatter: departmentFormatter,
            cellRenderer: TagCellRenderer,
        },
        {
            field: 'employmentType',
            editable: true,
            width: 180,
            cellEditor: 'agRichSelectCellEditor',
            cellEditorParams: {
                values: employmentType,
            },
        },
        {
            field: 'location',
            width: 200,
            cellRenderer: FlagRenderer,
            editable: true,
        },
        {
            field: 'joinDate',
            editable: true,
            width: 120,
        },
        {
            headerName: 'Salary',
            field: 'basicMonthlySalary',
            valueFormatter: ({ value }: ValueFormatterParams) =>
                value == null ? '' : `$${Math.round(value).toLocaleString()}`,
        },
        {
            field: 'paymentMethod',
            editable: true,
            width: 180,
            cellEditor: 'agRichSelectCellEditor',
            cellEditorParams: {
                values: paymentMethod,
            },
        },
        {
            headerName: 'Status',
            field: 'paymentStatus',
            editable: true,
            width: 100,
            cellRenderer: StatusCellRenderer,
            cellEditor: 'agRichSelectCellEditor',
            cellEditorParams: {
                values: paymentStatus,
            },
        },
        {
            field: 'contact',
            pinned: 'right',
            cellRenderer: ContactCellRenderer,
            width: 120,
        },
    ]);
    const [rowData] = useState(getData());
    const getDataPath = useCallback<GetDataPath>((data) => data.orgHierarchy, []);
    const themeClass = isDarkMode ? `${gridTheme}-dark` : gridTheme;
    const autoGroupColumnDef = useMemo<ColDef>(() => {
        return {
            headerName: 'Employee',
            width: 330,
            pinned: 'left',
            sort: 'asc',
            cellRenderer: 'agGroupCellRenderer',
            cellRendererParams: {
                suppressCount: true,
                innerRenderer: EmployeeCellRenderer,
            },
        };
    }, []);

    return (
        <div className={styles.wrapper}>
            <div className={styles.container}>
                <div className={`${themeClass} ${styles.grid}`}>
                    <AgGridReact
                        ref={gridRef}
                        columnDefs={colDefs}
                        rowData={rowData}
                        groupDefaultExpanded={-1}
                        getDataPath={getDataPath}
                        treeData
                        autoGroupColumnDef={autoGroupColumnDef}
                    />
                </div>
            </div>
        </div>
    );
};
