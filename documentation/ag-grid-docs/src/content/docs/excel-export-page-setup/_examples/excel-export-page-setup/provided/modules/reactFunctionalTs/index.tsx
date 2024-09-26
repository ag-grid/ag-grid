'use strict';

import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-quartz.css';
import React, { StrictMode, useCallback, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

import { ClientSideRowModelModule, CommunityFeaturesModule } from 'ag-grid-community';
import type { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';
import { ModuleRegistry } from 'ag-grid-community';
import { ExcelExportModule } from 'ag-grid-enterprise';
import { MenuModule } from 'ag-grid-enterprise';
import { AgGridReact } from 'ag-grid-react';

import type { IOlympicData } from './interfaces';
import './styles.css';

ModuleRegistry.registerModules([ClientSideRowModelModule, CommunityFeaturesModule, MenuModule, ExcelExportModule]);

function getNumber(id: string) {
    const el = document.querySelector(id) as any;
    if (!el || isNaN(el.value)) {
        return 0;
    }
    return parseFloat(el.value);
}

function getValue(id: string) {
    return (document.querySelector(id) as any).value;
}

function getSheetConfig() {
    return {
        pageSetup: {
            orientation: getValue('#pageOrientation'),
            pageSize: getValue('#pageSize'),
        },
        margins: {
            top: getNumber('#top'),
            right: getNumber('#right'),
            bottom: getNumber('#bottom'),
            left: getNumber('#left'),
            header: getNumber('#header'),
            footer: getNumber('#footer'),
        },
    };
}

const GridExample = () => {
    const containerStyle = useMemo(() => ({ width: '100%', height: '100%' }), []);
    const gridStyle = useMemo(() => ({ height: '100%', width: '100%' }), []);
    const [gridApi, setGridApi] = useState<GridApi | null>(null);
    const [rowData, setRowData] = useState<IOlympicData[]>();
    const [columnDefs, setColumnDefs] = useState<ColDef[]>([
        { field: 'athlete', minWidth: 200 },
        { field: 'country', minWidth: 200 },
        { field: 'sport', minWidth: 150 },
        { field: 'gold' },
        { field: 'silver' },
        { field: 'bronze' },
        { field: 'total' },
    ]);
    const defaultColDef = useMemo<ColDef>(() => {
        return {
            filter: true,
            minWidth: 100,
            flex: 1,
        };
    }, []);

    const onFormSubmit = useCallback(
        (e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            const { pageSetup, margins } = getSheetConfig();
            gridApi!.exportDataAsExcel({ pageSetup, margins });
        },
        [gridApi]
    );

    const popupParent = useMemo<HTMLElement | null>(() => {
        return document.body;
    }, []);
    const onGridReady = useCallback((params: GridReadyEvent) => {
        setGridApi(params.api);
        fetch('https://www.ag-grid.com/example-assets/small-olympic-winners.json')
            .then((resp) => resp.json())
            .then((data: IOlympicData[]) => setRowData(data.filter((rec: any) => rec.country != null)));
    }, []);

    return (
        <div style={containerStyle}>
            <div className="container">
                <form onSubmit={(e: React.FormEvent<HTMLFormElement>) => onFormSubmit(e)}>
                    <div className="columns">
                        <div className="column">
                            <label className="option" htmlFor="pageOrientation">
                                Page Orientation =
                                <select id="pageOrientation">
                                    <option value="Portrait">Portrait</option>
                                    <option value="Landscape">Landscape</option>
                                </select>
                            </label>
                            <label className="option" htmlFor="pageSize">
                                Page Size =
                                <select id="pageSize">
                                    <option value="Letter">Letter</option>
                                    <option value="Letter Small">Letter Small</option>
                                    <option value="Tabloid">Tabloid</option>
                                    <option value="Ledger">Ledger</option>
                                    <option value="Legal">Legal</option>
                                    <option value="Statement">Statement</option>
                                    <option value="Executive">Executive</option>
                                    <option value="A3">A3</option>
                                    <option value="A4">A4</option>
                                    <option value="A4 Small">A4 Small</option>
                                    <option value="A5">A5</option>
                                    <option value="A6">A6</option>
                                    <option value="B4">B4</option>
                                    <option value="B5">B5</option>
                                    <option value="Folio">Folio</option>
                                    <option value="Envelope">Envelope</option>
                                    <option value="Envelope DL">Envelope DL</option>
                                    <option value="Envelope C5">Envelope C5</option>
                                    <option value="Envelope B5">Envelope B5</option>
                                    <option value="Envelope C3">Envelope C3</option>
                                    <option value="Envelope C4">Envelope C4</option>
                                    <option value="Envelope C6">Envelope C6</option>
                                    <option value="Envelope Monarch">Envelope Monarch</option>
                                    <option value="Japanese Postcard">Japanese Postcard</option>
                                    <option value="Japanese Double Postcard">Japanese Double Postcard</option>
                                </select>
                            </label>
                        </div>
                        <fieldset className="column margin-container">
                            <legend>Margins</legend>
                            <label htmlFor="top">
                                Top = <input type="number" id="top" defaultValue="0.75" min="0" step="0.05" />
                            </label>
                            <label htmlFor="right">
                                Right = <input type="number" id="right" defaultValue="0.7" min="0" step="0.05" />
                            </label>
                            <label htmlFor="bottom">
                                Bottom = <input type="number" id="bottom" defaultValue="0.75" min="0" step="0.05" />
                            </label>
                            <label htmlFor="left">
                                Left = <input type="number" id="left" defaultValue="0.7" min="0" step="0.05" />
                            </label>
                            <label htmlFor="header">
                                Header = <input type="number" id="header" defaultValue="0.3" min="0" step="0.05" />
                            </label>
                            <label htmlFor="footer">
                                Footer = <input type="number" id="footer" defaultValue="0.3" min="0" step="0.05" />
                            </label>
                        </fieldset>
                    </div>
                    <div>
                        <input
                            type="submit"
                            style={{ margin: '5px 0px', fontWeight: 'bold' }}
                            value="Export to Excel"
                        />
                    </div>
                </form>
                <div className="grid-wrapper">
                    <div
                        style={gridStyle}
                        className={
                            /** DARK MODE START **/ document.documentElement?.dataset.defaultTheme ||
                            'ag-theme-quartz' /** DARK MODE END **/
                        }
                    >
                        <AgGridReact<IOlympicData>
                            rowData={rowData}
                            columnDefs={columnDefs}
                            defaultColDef={defaultColDef}
                            popupParent={popupParent}
                            onGridReady={onGridReady}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

const root = createRoot(document.getElementById('root')!);
root.render(
    <StrictMode>
        <GridExample />
    </StrictMode>
);
