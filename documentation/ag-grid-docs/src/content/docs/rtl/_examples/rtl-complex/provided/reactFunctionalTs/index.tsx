import { AgChartsEnterpriseModule } from 'ag-charts-enterprise';
import React, { StrictMode, useCallback, useState } from 'react';
import { createRoot } from 'react-dom/client';

import type {
    CellClassParams,
    CellStyle,
    ColDef,
    ColGroupDef,
    DefaultMenuItem,
    GetContextMenuItemsParams,
    ICellRendererParams,
    IRowNode,
    MenuItemDef,
    RowSelectedEvent,
    RowSelectionOptions,
    SelectionChangedEvent,
    StatusPanelDef,
    ValueSetterParams,
} from 'ag-grid-community';
import { LocaleModule } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';
import { AgGridProvider, AgGridReact } from 'ag-grid-react';

import CountryCellRenderer from './countryCellRenderer';
import { COUNTRY_CODES, LANGUAGES, createRowData } from './data';
import type { LanguageConfig } from './data';
import './styles.css';

/** PROVIDED EXAMPLE DARK INTEGRATED **/

const modules = [AllEnterpriseModule.with(AgChartsEnterpriseModule), LocaleModule];

const dataSize: string = '.1x22';

// Mutable module-level language config, mirroring main.ts. The plain string-returning renderers,
// comparators and value setters below are framework-agnostic functions copied verbatim from main.ts;
// they close over `currentLang` for a few localised literals. The component keeps this in sync with
// the selected language on every render (before the column defs are rebuilt).
let currentLang: LanguageConfig = LANGUAGES['arabic'];

const defaultColDef: ColDef = {
    editable: true,
    minWidth: 100,
    filter: true,
    floatingFilter: true,
};

const statusBar: { statusPanels: StatusPanelDef[] } = {
    statusPanels: [{ statusPanel: 'agAggregationComponent' }],
};

const rowSelection: RowSelectionOptions = {
    mode: 'multiRow',
    groupSelects: 'descendants',
    selectAll: 'filtered',
};

function getAutoGroupColumnDef(): ColDef {
    return {
        headerName: currentLang.headers.group,
        width: 200,
        field: 'name',
        valueGetter: (params) => {
            if (params.node && params.node.group) {
                return params.node.key;
            } else {
                return params.data[params.colDef.field!];
            }
        },
        cellRenderer: 'agGroupCellRenderer',
    };
}

function getContextMenuItems(params: GetContextMenuItemsParams): (DefaultMenuItem | MenuItemDef)[] {
    const result: (DefaultMenuItem | MenuItemDef)[] = params.defaultItems!.splice(0);
    result.push({
        name: currentLang.contextMenu.customMenuItem,
        icon: '<img src="https://www.ag-grid.com/example-assets/lab.png" style="width: 14px;" />',
        action: () => {
            const value = params.value ? params.value : '<empty>';
            console.log('You clicked a custom menu item on cell ' + value);
        },
    });

    return result;
}

function createDefaultCols(): (ColDef | ColGroupDef)[] {
    const firstColumn: ColDef = {
        headerName: currentLang.headers.name,
        field: 'name',
        width: 200,
        editable: true,
        enableRowGroup: true,
        icons: {
            sortAscending: '<i class="fa fa-sort-alpha-up"/>',
            sortDescending: '<i class="fa fa-sort-alpha-down"/>',
        },
    };

    const cols: (ColDef | ColGroupDef)[] = [
        {
            headerName: currentLang.headers.participant,
            children: [
                firstColumn,
                {
                    headerName: currentLang.headers.language,
                    field: 'language',
                    width: 150,
                    editable: true,
                    filter: 'agSetColumnFilter',
                    cellRenderer: languageCellRenderer,
                    cellEditor: 'agSelectCellEditor',
                    enableRowGroup: true,
                    enablePivot: true,
                    cellEditorParams: {
                        values: currentLang.editorLanguages,
                    },
                    pinned: 'right',
                    headerTooltip: currentLang.headers.languageTooltip,
                },
                {
                    headerName: currentLang.headers.country,
                    field: 'country',
                    width: 150,
                    editable: true,
                    cellRenderer: CountryCellRenderer,
                    enableRowGroup: true,
                    enablePivot: true,
                    cellEditor: 'agRichSelectCellEditor',
                    cellEditorParams: {
                        cellRenderer: CountryCellRenderer,
                        values: currentLang.editorCountries,
                    },
                    filterParams: {
                        cellRenderer: CountryCellRenderer,
                    },
                },
            ],
        },
        {
            headerName: currentLang.headers.gameOfChoice,
            children: [
                {
                    headerName: currentLang.headers.gameName,
                    field: 'game.name',
                    width: 180,
                    editable: true,
                    filter: 'agSetColumnFilter',
                    tooltip: true,
                    cellClass: () => {
                        return 'alphabet';
                    },
                    enableRowGroup: true,
                    enablePivot: true,
                    pinned: 'left',
                    icons: {
                        sortAscending: '<i class="fa fa-sort-alpha-up"/>',
                        sortDescending: '<i class="fa fa-sort-alpha-down"/>',
                    },
                },
                {
                    headerName: currentLang.headers.bought,
                    field: 'game.bought',
                    filter: 'agSetColumnFilter',
                    editable: true,
                    width: 100,
                    enableRowGroup: true,
                    enablePivot: true,
                    enableValue: true,
                    cellRenderer: booleanCellRenderer,
                    cellStyle: { textAlign: 'center' },
                    comparator: booleanComparator,
                    filterParams: { cellRenderer: booleanFilterCellRenderer },
                },
            ],
        },
        {
            groupId: 'performance',
            children: [
                {
                    headerName: currentLang.headers.bankBalance,
                    field: 'bankBalance',
                    width: 150,
                    editable: true,
                    cellRenderer: currencyRenderer,
                    cellStyle: currencyCssFunc,
                    filter: 'agNumberColumnFilter',
                    enableValue: true,
                    icons: {
                        sortAscending: '<i class="fa fa-sort-amount-up"/>',
                        sortDescending: '<i class="fa fa-sort-amount-down"/>',
                    },
                },
                {
                    headerName: currentLang.headers.extraInfo1,
                    columnGroupShow: 'open',
                    width: 150,
                    editable: false,
                    sortable: false,
                    suppressHeaderMenuButton: true,
                    cellStyle: { textAlign: 'right' },
                    cellRenderer: () => {
                        return currentLang.cellContent.abra;
                    },
                },
                {
                    headerName: currentLang.headers.extraInfo2,
                    columnGroupShow: 'open',
                    width: 150,
                    editable: false,
                    sortable: false,
                    suppressHeaderMenuButton: true,
                    cellStyle: { textAlign: 'left' },
                    cellRenderer: () => {
                        return currentLang.cellContent.cadabra;
                    },
                },
            ],
        },
        {
            headerName: currentLang.headers.rating,
            field: 'rating',
            width: 100,
            editable: true,
            cellRenderer: ratingRenderer,
            enableRowGroup: true,
            enablePivot: true,
            enableValue: true,
            filterParams: { cellRenderer: ratingFilterRenderer },
        },
        {
            headerName: currentLang.headers.totalWinnings,
            field: 'totalWinnings',
            filter: 'agNumberColumnFilter',
            editable: true,
            valueSetter: numberValueSetter,
            width: 150,
            enableValue: true,
            cellRenderer: currencyRenderer,
            cellStyle: currencyCssFunc,
            icons: {
                sortAscending: '<i class="fa fa-sort-amount-up"/>',
                sortDescending: '<i class="fa fa-sort-amount-down"/>',
            },
        },
    ];

    const monthGroup: ColGroupDef = {
        headerName: currentLang.headers.monthlyBreakdown,
        children: [],
    };
    cols.push(monthGroup);
    for (let i = 0, len = currentLang.months.length; i < len; ++i) {
        const month = currentLang.months[i];
        const child: ColDef = {
            headerName: month,
            field: 'month_' + i,
            width: 100,
            filter: 'agNumberColumnFilter',
            editable: true,
            enableValue: true,
            cellClassRules: {
                'good-score': 'typeof x === "number" && x > 50000',
                'bad-score': 'typeof x === "number" && x < 10000',
            },
            valueSetter: numberValueSetter,
            cellRenderer: currencyRenderer,
            cellStyle: { textAlign: 'right' },
        };
        monthGroup.children.push(child);
    }

    return cols;
}

function getColCount() {
    switch (dataSize) {
        case '10x100':
            return 100;
        default:
            return 22;
    }
}

function createCols() {
    const colCount = getColCount();
    const defaultCols = createDefaultCols();
    const columns = defaultCols.slice(0, colCount);

    for (let col = 22; col < colCount; col++) {
        const colName = currentLang.colNames[col % currentLang.colNames.length];
        const colDef = {
            headerName: colName,
            field: 'col' + col,
            width: 200,
            editable: true,
        };
        columns.push(colDef);
    }

    return columns;
}

function selectionChanged(event: SelectionChangedEvent) {
    console.log('Callback selectionChanged: selection count = ' + event.selectedNodes?.length);
}

function rowSelected(event: RowSelectedEvent) {
    // the number of rows selected could be huge, if the user is grouping and selects a group, so
    // to stop the console from clogging up, we only print if in the first 10 (by chance we know
    // the node id's are assigned from 0 upwards)
    if (Number(event.node.id) < 10) {
        const valueToPrint = event.node.group ? 'group (' + event.node.key + ')' : event.node.data.name;
        console.log('Callback rowSelected: ' + valueToPrint);
    }
}

function getBusinessKeyForNode(node: IRowNode): string {
    if (node.data) {
        return node.data.name;
    } else {
        return '';
    }
}

function numberValueSetter(params: ValueSetterParams) {
    const newValue = params.newValue;
    let valueAsNumber;
    if (newValue === null || newValue === undefined || newValue === '') {
        valueAsNumber = null;
    } else {
        valueAsNumber = parseFloat(params.newValue);
    }
    const field = params.colDef.field!;
    const data = params.data;
    data[field] = valueAsNumber;
    return true;
}

function currencyCssFunc(params: CellClassParams): CellStyle {
    if (params.value !== null && params.value !== undefined && params.value < 0) {
        return { color: 'red', textAlign: 'right', fontWeight: 'bold' };
    } else {
        return { textAlign: 'right' };
    }
}

function ratingFilterRenderer(params: ICellRendererParams) {
    return ratingRendererGeneral(params.value, true);
}

function ratingRenderer(params: ICellRendererParams) {
    return ratingRendererGeneral(params.value, false);
}

// React renders a cell renderer's return value as JSX, so the flag/star/tick markup is expressed as
// elements (not the HTML strings the vanilla example returns for innerHTML) to render identically.
function ratingRendererGeneral(value: any, forFilter: boolean) {
    if (value === '(Select All)') {
        return value;
    }

    const stars = [];
    for (let i = 0; i < 5; i++) {
        if (value > i) {
            stars.push(<img key={i} src="https://www.ag-grid.com/example-assets/gold-star.png" />);
        }
    }

    return (
        <span>
            {stars}
            {forFilter && Number(value) === 0 ? currentLang.cellContent.noStars : null}
        </span>
    );
}

function currencyRenderer(params: ICellRendererParams) {
    if (params.value === null || params.value === undefined) {
        return null;
    } else if (isNaN(params.value)) {
        return 'NaN';
    } else {
        if (params.node.group && params.column!.getAggFunc() === 'count') {
            return params.value;
        } else {
            return (
                '£' +
                Math.floor(params.value)
                    .toString()
                    .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
            );
        }
    }
}

function booleanComparator(value1: any, value2: any) {
    const value1Cleaned = booleanCleaner(value1);
    const value2Cleaned = booleanCleaner(value2);
    const value1Ordinal = value1Cleaned === true ? 0 : value1Cleaned === false ? 1 : 2;
    const value2Ordinal = value2Cleaned === true ? 0 : value2Cleaned === false ? 1 : 2;
    return value1Ordinal - value2Ordinal;
}

function booleanCellRenderer(params: ICellRendererParams) {
    const valueCleaned = booleanCleaner(params.value);
    if (valueCleaned === true) {
        return <span title="true">✔</span>;
    } else if (valueCleaned === false) {
        return <span title="false">✖</span>;
    } else if (params.value !== null && params.value !== undefined) {
        return params.value.toString();
    } else {
        return null;
    }
}

function booleanFilterCellRenderer(params: ICellRendererParams) {
    const valueCleaned = booleanCleaner(params.value);

    if (valueCleaned === true) {
        return '✔';
    } else if (valueCleaned === false) {
        return '✖';
    } else if (params.value === '(Select All)') {
        return params.value;
    } else {
        return currentLang.cellContent.empty;
    }
}

function booleanCleaner(value: any) {
    if (value === 'true' || value === true || value === 1) {
        return true;
    } else if (value === 'false' || value === false || value === 0) {
        return false;
    } else {
        return null;
    }
}

function languageCellRenderer(params: ICellRendererParams) {
    if (params.value !== null && params.value !== undefined) {
        return params.value;
    } else {
        return null;
    }
}

const GridExample = () => {
    const [language, setLanguage] = useState('arabic');
    const [gridVisible, setGridVisible] = useState(true);

    // Keep the module-level `currentLang` (closed over by the plain renderers/comparators above) in
    // sync with the selected language before rebuilding the language-dependent grid options below.
    currentLang = LANGUAGES[language];

    const columnDefs = createCols();
    const autoGroupColumnDef = getAutoGroupColumnDef();
    const rowData = createRowData(language);

    const onLanguageChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
        setLanguage(event.target.value);
        // `enableRtl` and `localeText` are initial-only grid options, so the grid must be remounted
        // to apply the newly-selected language (same pattern as the grid-state example).
        setGridVisible(false);
        setTimeout(() => {
            setGridVisible(true);
        });
    }, []);

    return (
        <AgGridProvider modules={modules}>
            <div className="example-wrapper">
                <div style={{ marginBottom: '0.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <label htmlFor="language">Language:</label>
                    <select id="language" value={language} onChange={onLanguageChange}>
                        <option value="arabic">العربية (Arabic)</option>
                        <option value="hebrew">עברית (Hebrew)</option>
                        <option value="english">English</option>
                    </select>
                </div>
                <div className="grid-wrapper">
                    {gridVisible && (
                        <AgGridReact
                            columnDefs={columnDefs}
                            rowData={rowData}
                            context={{ COUNTRY_CODES }}
                            defaultColDef={defaultColDef}
                            sideBar={true}
                            rowGroupPanelShow="always"
                            pivotPanelShow="always"
                            enableRtl={currentLang.enableRtl}
                            localeText={currentLang.localeText}
                            statusBar={statusBar}
                            rowSelection={rowSelection}
                            autoGroupColumnDef={autoGroupColumnDef}
                            onRowSelected={rowSelected}
                            onSelectionChanged={selectionChanged}
                            getBusinessKeyForNode={getBusinessKeyForNode}
                            getContextMenuItems={getContextMenuItems}
                        />
                    )}
                </div>
            </div>
        </AgGridProvider>
    );
};

const root = createRoot(document.getElementById('root')!);
root.render(
    <StrictMode>
        <GridExample />
    </StrictMode>
);
