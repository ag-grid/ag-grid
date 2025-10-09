import type { GridApi, GridOptions } from 'ag-grid-community';
import { AllCommunityModule, ModuleRegistry, createGrid } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';

import { callChatGPT } from './chatgptApi';

const API_KEY = ''; // <-- ENTER YOUR OPENAI API KEY HERE
ModuleRegistry.registerModules([AllCommunityModule, AllEnterpriseModule]);

interface IOlympicData {
    athlete: string;
    age: number;
    country: string;
    year: number;
    sport: string;
    gold: number;
    silver: number;
    bronze: number;
    total: number;
}

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    columnDefs: [
        {
            field: 'athlete',
            headerName: 'Athlete',
            minWidth: 200,
            enableRowGroup: true,
            enablePivot: false,
        },
        {
            field: 'age',
            headerName: 'Age',
            width: 90,
            type: 'number',
            enableValue: true,
            enableRowGroup: false,
        },
        {
            field: 'country',
            headerName: 'Country',
            minWidth: 150,
            enableRowGroup: true,
            enablePivot: true,
        },
        {
            field: 'year',
            headerName: 'Year',
            width: 90,
            type: 'number',
            enableRowGroup: true,
            enableValue: false,
        },
        {
            field: 'sport',
            headerName: 'Sport',
            minWidth: 150,
            enableRowGroup: true,
            enablePivot: true,
        },
        {
            field: 'gold',
            headerName: 'Gold',
            width: 100,
            type: 'number',
            enableValue: true,
            aggFunc: 'sum',
        },
        {
            field: 'silver',
            headerName: 'Silver',
            width: 100,
            type: 'number',
            enableValue: true,
            aggFunc: 'sum',
        },
        {
            field: 'bronze',
            headerName: 'Bronze',
            width: 100,
            type: 'number',
            enableValue: true,
            aggFunc: 'sum',
        },
        {
            field: 'total',
            headerName: 'Total',
            width: 100,
            type: 'number',
            enableValue: true,
            aggFunc: 'sum',
        },
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 100,
        filter: true,
        sortable: true,
        resizable: true,
    },
    enableRangeSelection: true,
    rowGroupPanelShow: 'always',
    sideBar: {
        toolPanels: [
            {
                id: 'columns',
                labelDefault: 'Columns',
                labelKey: 'columns',
                iconKey: 'columns',
                toolPanel: 'agColumnsToolPanel',
            },
            {
                id: 'filters',
                labelDefault: 'Filters',
                labelKey: 'filters',
                iconKey: 'filter',
                toolPanel: 'agFiltersToolPanel',
            },
        ],
        defaultToolPanel: 'columns',
    },
    pagination: true,
    paginationPageSize: 20,
    paginationPageSizeSelector: [10, 20, 50, 100],
};

function processRequest(event?: Event) {
    event?.preventDefault();

    const inputElement = document.getElementById('naturalLanguageInput') as HTMLInputElement;
    const submitButton = document.getElementById('processRequest') as HTMLButtonElement;
    const outputElement = document.getElementById('aiResponse') as HTMLDivElement;
    const statusElement = document.getElementById('processingStatus') as HTMLDivElement;

    const userRequest = inputElement.value.trim();

    if (!userRequest) {
        outputElement.innerHTML = '<p style="color: red;">Please enter a request</p>';
        outputElement.style.display = 'block';
        return;
    }

    // Disable form elements
    inputElement.disabled = true;
    submitButton.disabled = true;

    statusElement.innerHTML = '<p>Processing request with ChatGPT...</p>';
    outputElement.innerHTML = '';

    const currentState = gridApi.getState();

    callChatGPT(userRequest, currentState, gridApi, API_KEY)
        .then(function (response) {
            // Apply the state changes
            if (Object.keys(response.gridState).length > 0) {
                gridApi.setState(response.gridState, response.propertiesToIgnore);
            }

            // Display the request and response
            statusElement.innerHTML = '<p style="color: green;">✓ Request processed successfully!</p>';
            outputElement.innerHTML = `
                <h4>Your Request:</h4>
                <p><em>"${userRequest}"</em></p>
                <h4>AI Response:</h4>
                <p>${response.explanation}</p>
            `;
            outputElement.style.display = 'block';

            // Clear the input and re-enable form
            inputElement.value = '';
            inputElement.disabled = false;
            submitButton.disabled = false;
        })
        .catch(function (error) {
            statusElement.innerHTML = '<p style="color: red;">✗ Error processing request</p>';
            outputElement.innerHTML = `<p style="color: red;">Error: ${error instanceof Error ? error.message : String(error)}</p>`;
            outputElement.style.display = 'block';

            // Re-enable form on error
            inputElement.disabled = false;
            submitButton.disabled = false;
        });
}

function getCurrentState() {
    const state = gridApi.getState();
    const outputElement = document.getElementById('currentState') as HTMLDivElement;
    outputElement.innerHTML = `<h4>Current Grid State:</h4><pre>${JSON.stringify(state, null, 2)}</pre>`;
    outputElement.style.display = 'block';
}

function resetGrid() {
    gridApi.setState({
        columnVisibility: { hiddenColIds: [] },
        columnPinning: { leftColIds: [], rightColIds: [] },
        sort: { sortModel: [] },
        filter: { filterModel: {} },
        rowGroup: { groupColIds: [] },
        pagination: { page: 0, pageSize: 20 },
    });

    const aiResponse = document.getElementById('aiResponse')!;
    const processingStatus = document.getElementById('processingStatus')!;
    const currentState = document.getElementById('currentState')!;

    aiResponse.innerHTML = '';
    aiResponse.style.display = 'none';
    processingStatus.innerHTML = '';
    currentState.innerHTML = '';
    currentState.style.display = 'none';
}

function toggleApiKeyVisibility() {
    const apiKeyElement = document.getElementById('apiKeyInput') as HTMLInputElement;
    if (apiKeyElement.type === 'password') {
        apiKeyElement.type = 'text';
    } else {
        apiKeyElement.type = 'password';
    }
}

// Setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#ExampleGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    // Add form submit handler
    const form = document.getElementById('requestForm') as HTMLFormElement;
    form.addEventListener('submit', processRequest);

    // Load sample data
    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then(function (response) {
            return response.json();
        })
        .then(function (data: IOlympicData[]) {
            gridApi.setGridOption('rowData', data);
        });
});

// Make functions available globally for demo purposes
(window as any).processRequest = processRequest;
(window as any).getCurrentState = getCurrentState;
(window as any).resetGrid = resetGrid;
(window as any).toggleApiKeyVisibility = toggleApiKeyVisibility;
