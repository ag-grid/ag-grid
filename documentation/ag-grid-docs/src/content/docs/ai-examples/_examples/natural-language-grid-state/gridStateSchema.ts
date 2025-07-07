import type { GridState, GridStateKey } from 'ag-grid-community';

/**
 * Response format for ChatGPT when modifying AG-Grid state
 * Uses the official AG-Grid GridState interface
 */
export interface ChatGPTGridStateResponse {
    /**
     * The grid state object that will be passed to gridApi.setState()
     * Uses the official AG-Grid GridState interface
     */
    gridState: GridState;
    
    /**
     * Properties to ignore when setting state (optional)
     */
    propertiesToIgnore?: GridStateKey[];
    
    /**
     * Human-readable explanation of what changes were made
     */
    explanation: string;
}

