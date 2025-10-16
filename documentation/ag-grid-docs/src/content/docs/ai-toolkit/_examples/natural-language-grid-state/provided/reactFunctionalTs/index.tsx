import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

import type { GridApi } from 'ag-grid-community';
import { AllCommunityModule, ModuleRegistry, createGrid } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';

import { callChatGPT } from './chatgptApi';
import { type IOlympicData, gridOptions } from './gridOptions';
import './styles.css';

ModuleRegistry.registerModules([AllEnterpriseModule]);

const GridExample = () => {
    const gridRef = useRef<HTMLDivElement>(null);
    const gridApiRef = useRef<GridApi<IOlympicData> | null>(null);

    const [naturalLanguageInput, setNaturalLanguageInput] = useState('');
    const [aiResponse, setAiResponse] = useState('');
    const [processingStatus, setProcessingStatus] = useState('');
    const [currentState, setCurrentState] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        if (gridRef.current && !gridApiRef.current) {
            gridApiRef.current = createGrid(gridRef.current, gridOptions);

            fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
                .then((response) => response.json())
                .then((data: IOlympicData[]) => {
                    if (gridApiRef.current) {
                        gridApiRef.current.setGridOption('rowData', data);
                    }
                });
        }

        return () => {
            if (gridApiRef.current) {
                gridApiRef.current.destroy();
                gridApiRef.current = null;
            }
        };
    }, []);

    const processRequest = useCallback(
        async (event?: React.FormEvent) => {
            event?.preventDefault();

            const userRequest = naturalLanguageInput.trim();

            if (!userRequest) {
                setAiResponse('<p style="color: red;">Please enter a request</p>');
                return;
            }

            if (!gridApiRef.current) {
                setAiResponse('<p style="color: red;">Grid not initialized</p>');
                return;
            }

            setIsProcessing(true);
            setProcessingStatus('<code class="process">Processing request with ChatGPT <b>⧖</b></code>');
            setAiResponse('');

            const currentGridState = gridApiRef.current.getState();

            try {
                const response = await callChatGPT(userRequest, currentGridState, gridApiRef.current);

                if (Object.keys(response.gridState).length > 0) {
                    gridApiRef.current.setState(response.gridState, response.propertiesToIgnore);
                }

                setProcessingStatus('<code class="success">Request processed successfully! <b>✓</b></code>');
                setAiResponse(`
                <i class="prompt">Prompt</i>
                <p class="msg prompt">${userRequest}</p>
                <i class="response">Response</i>
                <p class="msg response">${response.explanation}</p>
            `);

                setNaturalLanguageInput('');
            } catch (error) {
                setProcessingStatus('<code class="error">Error processing request <b>✗</b></code>');
                setAiResponse(`<p>Error: ${error instanceof Error ? error.message : String(error)}</p>`);
            } finally {
                setIsProcessing(false);
            }
        },
        [naturalLanguageInput]
    );

    const getCurrentState = useCallback(() => {
        if (gridApiRef.current) {
            const state = gridApiRef.current.getState();
            setCurrentState(`<h4>Current Grid State:</h4><pre>${JSON.stringify(state, null, 2)}</pre>`);
        }
    }, []);

    const resetGrid = useCallback(() => {
        if (gridApiRef.current) {
            gridApiRef.current.setState({
                columnVisibility: { hiddenColIds: [] },
                columnPinning: { leftColIds: [], rightColIds: [] },
                sort: { sortModel: [] },
                filter: { filterModel: {} },
                rowGroup: { groupColIds: [] },
                pagination: { page: 0, pageSize: 20 },
            });

            setAiResponse('');
            setProcessingStatus('');
            setCurrentState('');
        }
    }, []);

    return (
        <div className="example-wrapper">
            <div className="example-controls">
                <div className="request-container">
                    <form className="input-group" onSubmit={processRequest}>
                        <input
                            type="text"
                            value={naturalLanguageInput}
                            onChange={(e) => setNaturalLanguageInput(e.target.value)}
                            disabled={isProcessing}
                            placeholder="Your prompt e.g. 'hide age column'"
                        />
                        <button type="submit" disabled={isProcessing}>
                            →
                        </button>
                    </form>
                    <div dangerouslySetInnerHTML={{ __html: processingStatus }} />
                    <div>
                        <button onClick={resetGrid}>Reset Grid</button>
                    </div>
                </div>

                <div className="response-container">
                    {aiResponse && <div dangerouslySetInnerHTML={{ __html: aiResponse }} />}
                    {currentState && <div dangerouslySetInnerHTML={{ __html: currentState }} />}
                </div>
            </div>

            <div ref={gridRef} style={{ height: '100%', width: '100%' }} />
        </div>
    );
};

const container = document.getElementById('root');
if (container) {
    const root = createRoot(container);
    root.render(<GridExample />);
}
