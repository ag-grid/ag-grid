export interface AutocompleteParams {
    onValueChanged?: (value: string | null) => void;
    valueValidator?: (value: string | null) => string | null;
    listGenerator: (value: string | null, position: number) => AutocompleteListParams;
    onConfirmed: (value: string | null) => void;
    valueUpdater: (params: {
        value: string | null;
        position: number;
        updateEntry: AutocompleteEntry;
        type?: string;
    }) => AutocompleteUpdate;
    ariaLabel: string;
}

export interface AutocompleteListParams {
    enabled: boolean;
    type?: string;
    searchString?: string;
    entries?: AutocompleteEntry[];
}

export interface AutocompleteEntry {
    key: string;
    displayValue?: any;
}

export interface AutocompleteUpdate {
    updatedValue: string;
    updatedPosition: number;
}
