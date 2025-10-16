import type { GridApi } from 'ag-grid-community';
import { ModuleRegistry, createGrid } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';

import { callChatGPT } from './chatgptApi';
import { gridOptions } from './gridOptions';

ModuleRegistry.registerModules([AllEnterpriseModule]);

let gridApi: GridApi;

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

    inputElement.disabled = true;
    submitButton.disabled = true;

    statusElement.innerHTML = '<code class="process">Processing request with ChatGPT <b>⧖</b></code>';
    outputElement.innerHTML = '';

    const currentState = gridApi.getState();

    callChatGPT(userRequest, currentState, gridApi)
        .then(function (response) {
            if (Object.keys(response.gridState).length > 0) {
                gridApi.setState(response.gridState, response.propertiesToIgnore);
            }

            statusElement.innerHTML = '<code class="success">Request processed successfully! <b>✓</b></code>';
            outputElement.innerHTML = `
                <i class="prompt">Prompt</i>
                <p class="msg prompt">${userRequest}</p>
                <i class="response">Response</i>
                <p class="msg response">${response.explanation}</p>
            `;
            outputElement.style.display = 'block';

            inputElement.value = '';
            inputElement.disabled = false;
            submitButton.disabled = false;
        })
        .catch(function (error) {
            statusElement.innerHTML = '<code class="error">Error processing request <b>✗</b></code>';
            outputElement.innerHTML = `<p>Error: ${error instanceof Error ? error.message : String(error)}</p>`;
            outputElement.style.display = 'block';

            // Re-enable form on error
            inputElement.disabled = false;
            submitButton.disabled = false;
        });
}

function getCurrentState() {
    const state = gridApi.getState();
    const outputElement = document.getElementById('currentState') as HTMLDivElement;
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

document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    const form = document.getElementById('requestForm') as HTMLFormElement;
    form.addEventListener('submit', processRequest);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => gridApi.setGridOption('rowData', data));
});
