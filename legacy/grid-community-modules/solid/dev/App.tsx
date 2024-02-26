import type {Component} from "solid-js";
import AgGridSolid from "../src";
import {ClientSideRowModelModule} from '@ag-grid-community/client-side-row-model';

import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-quartz.css';
import { ColDef } from "@ag-grid-community/core";

interface ICar {
    make: string;
    model: string;
    price: number;
}

const App: Component = () => {
    const columnDefs: ColDef<ICar>[] = [
        {field: "make"},
        {field: "model"},
        {field: "price"},
    ];

    const rowData : ICar[] = [
        {make: "Toyota", model: "Celica", price: 35000},
        {make: "Ford", model: "Mondeo", price: 32000},
        {make: "Porsche", model: "Boxster", price: 72000}
    ];

    const defaultColDef = {
        flex: 1,
        floatingFilter: true,
        filter: true,
    };

    return (
        <div class="ag-theme-quartz" style={{height: "100%"}}>
            <AgGridSolid
                columnDefs={columnDefs}
                rowData={rowData}
                defaultColDef={defaultColDef}
                modules={[ClientSideRowModelModule]}
            />
        </div>
    );
};

export default App;
