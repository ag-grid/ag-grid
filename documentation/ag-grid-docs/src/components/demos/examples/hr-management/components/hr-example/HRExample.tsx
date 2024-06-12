import type { ColDef, GetDataPath, StatusPanelDef } from '@ag-grid-community/core';
import { ModuleRegistry } from '@ag-grid-community/core';
import { AgGridReact } from '@ag-grid-community/react';
import { RichSelectModule } from '@ag-grid-enterprise/rich-select';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';
import { SetFilterModule } from '@ag-grid-enterprise/set-filter';
import { StatusBarModule } from '@ag-grid-enterprise/status-bar';
import { type FunctionComponent, useCallback, useMemo, useRef, useState } from 'react';

import { currencyFormatter } from '../../utils/valueFormatters';
import { ContactCellRenderer } from '../contact-cell-renderer/ContactCellRenderer';
import { EmployeeCellRenderer } from '../employee-cell-renderer/EmployeeCellRenderer';
import { FlagRenderer } from '../flag-renderer/FlagRenderer';
import { StatusCellRenderer } from '../status-cell-renderer/StatusCellRenderer';
import { TagCellRenderer } from '../tag-cell-renderer/TagCellRenderer';
import styles from './HRExample.module.css';
import { getData } from './data';

ModuleRegistry.registerModules([RowGroupingModule, RichSelectModule, SetFilterModule, StatusBarModule]);

interface Props {
    gridTheme?: string;
    isDarkMode?: boolean;
}

const employmentType = ['Permanent', 'Contract'];
const paymentMethod = ['Cash', 'Check', 'Bank Transfer'];
const paymentStatus = ['Paid', 'Pending'];

export const HRExample: FunctionComponent<Props> = ({ gridTheme = 'ag-theme-quartz', isDarkMode }) => {
    const gridRef = useRef<AgGridReact>(null);

    const [colDefs] = useState<ColDef[]>([
        {
            headerName: 'Contact',
            field: 'contact',
            pinned: 'left',
            cellRenderer: ContactCellRenderer,
            width: 120,
        },
        {
            headerName: 'Location',
            field: 'location',
            cellDataType: 'text',
            width: 200,
            cellRenderer: FlagRenderer,
            editable: true,
        },

        {
            field: 'department',
            cellDataType: 'text',
            width: 250,
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
            field: 'joinDate',
            editable: true,
            width: 120,
        },
        {
            headerName: 'Salary',
            field: 'basicMonthlySalary',
            cellDataType: 'number',
            valueFormatter: currencyFormatter,
        },
        {
            headerName: 'ID',
            field: 'employeeId',
            cellDataType: 'number',
            width: 120,
        },
        {
            headerName: 'Method',
            field: 'paymentMethod',
            cellDataType: 'text',
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
            cellDataType: 'text',
            editable: true,
            width: 150,
            pinned: 'right',
            cellRenderer: StatusCellRenderer,
            cellEditor: 'agRichSelectCellEditor',
            cellEditorParams: {
                values: paymentStatus,
            },
        },
    ]);
    const [rowData] = useState(getData());
    const getDataPath = useCallback<GetDataPath>((data) => {
        return data.orgHierarchy;
    }, []);

    const themeClass = isDarkMode ? `${gridTheme}-dark` : gridTheme;
    const treeData = true;
    const autoGroupColumnDef = useMemo(() => {
        return {
            headerName: 'Employee',
            width: 330,
            pinned: 'left',
            sort: 'asc',
            cellRendererParams: {
                suppressCount: true,
                innerRenderer: EmployeeCellRenderer,
            },
        };
    }, []);

    const statusBar = useMemo<{
        statusPanels: StatusPanelDef[];
    }>(() => {
        return {
            statusPanels: [
                { statusPanel: 'agTotalAndFilteredRowCountComponent' },
                { statusPanel: 'agFilteredRowCountComponent' },
            ],
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
                        columnMenu="new"
                        treeData={treeData}
                        autoGroupColumnDef={autoGroupColumnDef}
                        statusBar={statusBar}
                    />
                </div>
            </div>
        </div>
    );
};
