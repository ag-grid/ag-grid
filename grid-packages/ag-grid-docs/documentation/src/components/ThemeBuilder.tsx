import React, { useEffect, useRef, useState } from 'react';
import { AgGridReact } from "@ag-grid-community/react"
import { ClientSideRowModelModule } from "@ag-grid-community/client-side-row-model"
import classnames from 'classnames';
import styles from './ThemeBuilder.module.scss';

import "@ag-grid-community/styles/ag-grid.css"
import "@ag-grid-community/styles/ag-theme-alpine.css"

export interface ThemeProps {
    pageName?: string;
    framework?: string;
}

export const ThemeBuilder: React.FC<ThemeProps> = ({
    pageName,
    framework
}): any => {

    const [rowData] = useState([
        {make: "Toyota", model: "Celica", price: 35000},
        {make: "Ford", model: "Mondeo", price: 32000},
        {make: "Porsche", model: "Boxster", price: 72000}
    ]);

    const [columnDefs] = useState<any>([
        { field: 'make' },
        { field: 'model' },
        { field: 'price' }
    ]);

    return (
        <div
            className="ag-theme-alpine"
            style={{ width: "500px", height: "300px" }}
        >
            <AgGridReact
                modules={[
                    ClientSideRowModelModule,
                ]}
                rowData={rowData}
                columnDefs={columnDefs}
            />
        </div>
    )

};

