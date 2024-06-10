import type { ColDef, GetDataPath } from '@ag-grid-community/core';
import { AgGridReact } from '@ag-grid-community/react';
import { type FunctionComponent, useCallback, useMemo, useRef, useState } from 'react';

import { currencyFormatter } from '../../utils/valueFormatters';
import { EmployeeCellRenderer } from '../employee-cell-renderer/EmployeeCellRenderer';
import { EmployeeDetailsRenderer } from '../employee-details-renderer/EmployeeDetailsRenderer';
import { FlagRenderer } from '../flag-renderer/FlagRenderer';
import { TagCellRenderer } from '../tag-cell-renderer/TagCellRenderer';
import styles from './HRExample.module.css';
import { getData } from './data';
import { ModuleRegistry } from '@ag-grid-community/core';
import { RichSelectModule } from '@ag-grid-enterprise/rich-select';

ModuleRegistry.registerModules([ RichSelectModule ]);

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
            headerName: 'Employee',
            field: 'name',
            cellDataType: 'text',
            width: 250,
            cellRenderer: 'agGroupCellRenderer',
            cellRendererParams: {
                innerRenderer: EmployeeCellRenderer,
            },
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
            width: 200,
            cellRenderer: TagCellRenderer,
        },
        { 
            field: 'employmentType',
            editable: true,
            width: 180,
            cellEditor: "agRichSelectCellEditor",
            cellEditorParams: {
                values: employmentType,
            },
        },
        { 
            field: 'joinDate',
            editable: true,
            width: 120,
        },
        {   field: 'basicMonthlySalary',
            cellDataType: 'number',
            valueFormatter: currencyFormatter
        },
        {
            field: 'employeeId',
            cellDataType: 'number',
            width: 120,
        },
        { 
            field: 'paymentMethod', 
            cellDataType: 'text',
            editable: true,
            width: 180,
            cellEditor: "agRichSelectCellEditor",
            cellEditorParams: {
                values: paymentMethod,
            },
        },
        { 
            field: 'paymentStatus', 
            cellDataType: 'text',
            editable: true,
            width: 150,
            cellEditor: "agRichSelectCellEditor",
            cellEditorParams: {
                values: paymentStatus,
            },
        },
    ]);
    const [rowData] = useState(getData());
    const getDataPath = useCallback<GetDataPath>((data) => {
        return data.orgHierarchy;
    }, []);
    const detailCellRendererParams = useMemo(() => {
        return {
            detailGridOptions: {
                columnDefs: [
                    { field: 'value', headerName: 'Type', width: 150, cellRenderer: EmployeeDetailsRenderer },
                    { field: 'description', headerName: 'Description', width: 150 },
                    { field: 'grossAmount', headerName: 'Gross Amount', width: 150 },
                ],
                defaultColDef: {
                    flex: 1,
                    minWidth: 100,
                },
            },
            getDetailRowData: function (params: any) {
                const descriptions = ['Office chair and standing desk', 'Private healthcare'];

                const selectedDescription = descriptions[Math.floor(Math.random() * descriptions.length)];

                params.successCallback([
                    { type: 'Type 1', description: selectedDescription, grossAmount: 1000 },
                    { type: 'Type 2', description: selectedDescription, grossAmount: 2000 },
                ]);
            },
        };
    }, []);

    const themeClass = isDarkMode ? `${gridTheme}-dark` : gridTheme;

    return (
        <div className={styles.wrapper}>
            <div className={styles.container}>
                <div className={`${themeClass} ${styles.grid}`}>
                    <AgGridReact
                        ref={gridRef}
                        columnDefs={colDefs}
                        rowData={rowData}
                        groupDefaultExpanded={0}
                        getDataPath={getDataPath}
                        masterDetail={true}
                        detailCellRendererParams={detailCellRendererParams}
                        columnMenu="new"
                    />
                </div>
            </div>
        </div>
    );
};
