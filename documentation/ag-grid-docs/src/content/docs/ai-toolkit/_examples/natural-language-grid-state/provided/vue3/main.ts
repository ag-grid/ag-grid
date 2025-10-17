import { createApp, reactive, ref } from 'vue';

import type { GridApi } from 'ag-grid-community';
import { AllCommunityModule, ModuleRegistry, createGrid } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';

import { callChatGPT } from './chatgptApi';
import { type IOlympicData, gridOptions } from './gridOptions';
import './styles.css';

ModuleRegistry.registerModules([AllEnterpriseModule]);

const App = {
    setup() {
        const gridApi = ref<GridApi | null>(null);
        const naturalLanguageInput = ref('');
        const aiResponse = ref('');
        const processingStatus = ref('');
        const currentState = ref('');
        const isProcessing = ref(false);

        const processRequest = async (event?: Event) => {
            event?.preventDefault();

            const userRequest = naturalLanguageInput.value.trim();

            if (!userRequest) {
                aiResponse.value = '<p style="color: red;">Please enter a request</p>';
                return;
            }

            if (!gridApi.value) {
                aiResponse.value = '<p style="color: red;">Grid not initialized</p>';
                return;
            }

            isProcessing.value = true;
            processingStatus.value = '<code class="process">Processing request with ChatGPT <b>⧖</b></code>';
            aiResponse.value = '';

            const currentGridState = gridApi.value.getState();

            try {
                const response = await callChatGPT(userRequest, currentGridState, gridApi.value);

                if (Object.keys(response.gridState).length > 0) {
                    gridApi.value.setState(response.gridState, response.propertiesToIgnore);
                }

                processingStatus.value = '<code class="success">Request processed successfully! <b>✓</b></code>';
                aiResponse.value = `
                    <i class="prompt">Prompt</i>
                    <p class="msg prompt">${userRequest}</p>
                    <i class="response">Response</i>
                    <p class="msg response">${response.explanation}</p>
                `;

                naturalLanguageInput.value = '';
            } catch (error) {
                processingStatus.value = '<code class="error">Error processing request <b>✗</b></code>';
                aiResponse.value = `<p>Error: ${error instanceof Error ? error.message : String(error)}</p>`;
            } finally {
                isProcessing.value = false;
            }
        };

        const getCurrentState = () => {
            if (gridApi.value) {
                const state = gridApi.value.getState();
                currentState.value = `<h4>Current Grid State:</h4><pre>${JSON.stringify(state, null, 2)}</pre>`;
            }
        };

        const resetGrid = () => {
            if (gridApi.value) {
                gridApi.value.setState({
                    columnVisibility: { hiddenColIds: [] },
                    columnPinning: { leftColIds: [], rightColIds: [] },
                    sort: { sortModel: [] },
                    filter: { filterModel: {} },
                    rowGroup: { groupColIds: [] },
                    pagination: { page: 0, pageSize: 20 },
                });

                aiResponse.value = '';
                processingStatus.value = '';
                currentState.value = '';
            }
        };

        const initializeGrid = () => {
            const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
            gridApi.value = createGrid(gridDiv, gridOptions);

            fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
                .then((response) => response.json())
                .then((data: IOlympicData[]) => {
                    if (gridApi.value) {
                        gridApi.value.setGridOption('rowData', data);
                    }
                });
        };

        return {
            naturalLanguageInput,
            aiResponse,
            processingStatus,
            currentState,
            isProcessing,
            processRequest,
            getCurrentState,
            resetGrid,
            initializeGrid,
        };
    },
    template: `
        <div class="example-wrapper">
            <div class="example-controls">
                <div class="request-container">
                    <form class="input-group" @submit.prevent="processRequest">
                        <input
                            type="text"
                            v-model="naturalLanguageInput"
                            :disabled="isProcessing"
                            placeholder="Your prompt e.g. 'hide age column'"
                        />
                        <button type="submit" :disabled="isProcessing">→</button>
                    </form>
                    <div id="processingStatus" v-html="processingStatus"></div>
                    <div>
                        <button @click="resetGrid">Reset Grid</button>
                    </div>
                </div>

                <div class="response-container">
                    <div id="aiResponse" v-if="aiResponse" v-html="aiResponse"></div>
                    <div id="currentState" v-if="currentState" v-html="currentState"></div>
                </div>
            </div>

            <div id="myGrid"></div>
        </div>
    `,
    mounted() {
        this.initializeGrid();
    },
};

createApp(App).mount('#app');
