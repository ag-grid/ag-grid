import React, { useCallback, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

import { ModuleRegistry } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';
import { AgGridReact } from 'ag-grid-react';

import { callChatGPT } from './chatgptApi';
import { type IOlympicData, gridOptions } from './gridOptions';
import './styles.css';
import { useFetchJson } from './useFetchJson';

ModuleRegistry.registerModules([AllEnterpriseModule]);

interface ChatMessage {
    prompt: string;
    response: string;
}

interface ProcessingState {
    isProcessing: boolean;
    status: 'idle' | 'processing' | 'success' | 'error';
    message: string;
}

const GridExample = () => {
    const gridRef = useRef<AgGridReact>(null);
    const { data: rowData, loading } = useFetchJson<IOlympicData>(
        'https://www.ag-grid.com/example-assets/olympic-winners.json'
    );

    const [naturalLanguageInput, setNaturalLanguageInput] = useState('');
    const [chatMessage, setChatMessage] = useState<ChatMessage | null>(null);
    const [currentState, setCurrentState] = useState('');
    const [processingState, setProcessingState] = useState<ProcessingState>({
        isProcessing: false,
        status: 'idle',
        message: '',
    });

    const processRequest = useCallback(
        async (event?: React.FormEvent) => {
            event?.preventDefault();

            const userRequest = naturalLanguageInput.trim();

            if (!userRequest) {
                setProcessingState({
                    isProcessing: false,
                    status: 'error',
                    message: 'Please enter a request',
                });
                return;
            }

            if (!gridRef.current?.api) {
                setProcessingState({
                    isProcessing: false,
                    status: 'error',
                    message: 'Grid not initialized',
                });
                return;
            }

            setProcessingState({
                isProcessing: true,
                status: 'processing',
                message: 'Processing request with ChatGPT',
            });
            setChatMessage(null);

            const currentGridState = gridRef.current.api.getState();

            try {
                const response = await callChatGPT(userRequest, currentGridState, gridRef.current.api);

                if (Object.keys(response.gridState).length > 0) {
                    gridRef.current.api.setState(response.gridState, response.propertiesToIgnore);
                }

                setProcessingState({
                    isProcessing: false,
                    status: 'success',
                    message: 'Request processed successfully!',
                });

                setChatMessage({
                    prompt: userRequest,
                    response: response.explanation,
                });

                setNaturalLanguageInput('');
            } catch (error) {
                setProcessingState({
                    isProcessing: false,
                    status: 'error',
                    message: `Error: ${error instanceof Error ? error.message : String(error)}`,
                });
            }
        },
        [naturalLanguageInput]
    );

    const resetGrid = useCallback(() => {
        if (gridRef.current?.api) {
            gridRef.current.api.setState({
                columnVisibility: { hiddenColIds: [] },
                columnPinning: { leftColIds: [], rightColIds: [] },
                sort: { sortModel: [] },
                filter: { filterModel: {} },
                rowGroup: { groupColIds: [] },
                pagination: { page: 0, pageSize: 20 },
            });

            setChatMessage(null);
            setProcessingState({
                isProcessing: false,
                status: 'idle',
                message: '',
            });
            setCurrentState('');
        }
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="example-wrapper">
            <div className="example-controls">
                <div className="request-container">
                    <form className="input-group" onSubmit={processRequest}>
                        <input
                            type="text"
                            value={naturalLanguageInput}
                            onChange={(e) => setNaturalLanguageInput(e.target.value)}
                            disabled={processingState.isProcessing}
                            placeholder="Your prompt e.g. 'hide age column'"
                        />
                        <button type="submit" disabled={processingState.isProcessing}>
                            →
                        </button>
                    </form>

                    {processingState.message && (
                        <div id="processingStatus">
                            <code
                                className={`
                                    ${processingState.status === 'processing' ? 'process' : ''}
                                    ${processingState.status === 'success' ? 'success' : ''}
                                    ${processingState.status === 'error' ? 'error' : ''}
                                `.trim()}
                            >
                                {processingState.message}
                                {processingState.status === 'processing' && <b> ⧖</b>}
                                {processingState.status === 'success' && <b> ✓</b>}
                                {processingState.status === 'error' && <b> ✗</b>}
                            </code>
                        </div>
                    )}

                    <div>
                        <button onClick={resetGrid}>Reset Grid</button>
                    </div>
                </div>

                <div className="response-container">
                    {chatMessage && (
                        <div id="aiResponse">
                            <i className="prompt">Prompt</i>
                            <p className="msg prompt">{chatMessage.prompt}</p>
                            <i className="response">Response</i>
                            <p className="msg response">{chatMessage.response}</p>
                        </div>
                    )}

                    {currentState && (
                        <div id="currentState">
                            <h4>Current Grid State:</h4>
                            <pre>{currentState}</pre>
                        </div>
                    )}
                </div>
            </div>

            <AgGridReact
                ref={gridRef}
                columnDefs={gridOptions.columnDefs}
                rowData={rowData}
                gridOptions={gridOptions}
            />
        </div>
    );
};

const container = document.getElementById('root');
if (container) {
    const root = createRoot(container);
    root.render(<GridExample />);
}
