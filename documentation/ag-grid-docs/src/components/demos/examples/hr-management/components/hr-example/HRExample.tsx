import type { ColDef, GetDataPath, ICellRendererParams, StatusPanelDef } from '@ag-grid-community/core';
import { ModuleRegistry } from '@ag-grid-community/core';
import { AgGridReact } from '@ag-grid-community/react';
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

ModuleRegistry.registerModules([RowGroupingModule, RichSelectModule, SetFilterModule, StatusBarModule]);

interface Props {
    gridTheme?: string;
    isDarkMode?: boolean;
}

const employmentType = ['Permanent', 'Contract'];
const paymentMethod = ['Cash', 'Check', 'Bank Transfer'];
const paymentStatus = ['Paid', 'Pending'];

const currencyFormatter = (params) => {
    const value = params.value;
    if (value == null) {
        return '';
    }
    const roundedValue = Math.round(value);
    return `$${roundedValue.toLocaleString()}`;
};

export const HRExample: FunctionComponent<Props> = ({ gridTheme = 'ag-theme-quartz', isDarkMode }) => {
    const gridRef = useRef<AgGridReact>(null);

    const [colDefs] = useState<ColDef[]>([
        {
            headerName: 'Contact',
            field: 'contact',
            cellRendererSelector: (params: ICellRendererParams<IRow>) => {
                const contactDetails = {
                    component: ContactCellRenderer,
                };
                if (params.node.footer) return undefined;
                return contactDetails;
            },
            width: 120,
        },
        {
            headerName: 'Location',
            field: 'location',
            cellDataType: 'text',
            width: 200,
            cellRendererSelector: (params: ICellRendererParams<IRow>) => {
                const flatIcon = {
                    component: FlagRenderer,
                };
                if (params.node.footer) return undefined;
                return flatIcon;
            },
            editable: true,
        },

        {
            field: 'department',
            cellDataType: 'text',
            width: 250,
            cellRendererSelector: (params: ICellRendererParams<IRow>) => {
                const tagCell = {
                    component: TagCellRenderer,
                };
                if (params.node.footer) return undefined;
                return tagCell;
            },
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
            cellDataType: 'text',
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
            cellRendererSelector: (params: ICellRendererParams<IRow>) => {
                const statusCell = {
                    component: StatusCellRenderer,
                };
                if (params.node.footer) return undefined;
                return statusCell;
            },
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
            cellRendererSelector: (params: ICellRendererParams<IRow>) => {
                const groupCell = {
                    suppressCount: true,
                    innerRenderer: EmployeeCellRenderer,
                };
                if (params.node.footer) {
                    return 'Total';
                }
                return { component: 'agGroupCellRenderer', params: groupCell };
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
                        columnMenu="new"
                        treeData={treeData}
                        autoGroupColumnDef={autoGroupColumnDef}
                        suppressGroupRowsSticky={true}
                    />
                </div>
            </div>
        </div>
    );
};
