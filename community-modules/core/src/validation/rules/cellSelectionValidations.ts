import type { CellSelectionOptions } from '../../entities/gridOptions';
import type { Deprecations, OptionsValidator, Validations } from '../validationTypes';

const CELL_SELECTION_DEPRECATIONS: Deprecations<CellSelectionOptions> = {};

const CELL_SELECTION_OPTIONS_VALIDATIONS: Validations<CellSelectionOptions> = {};

/**
 * Needed because `keyof (T | U)` only returns the common keys, whereas the below
 * forces Typescript to expand the union and collect all possible keys across the union.
 */
type KeysOfUnion<T> = T extends T ? keyof T : never;

const cellSelectionPropertyMap: Record<KeysOfUnion<CellSelectionOptions>, undefined> = {
    mode: undefined,
    suppressMultiRanges: undefined,
    handle: undefined,
};
const ALL_PROPERTIES = Object.keys(cellSelectionPropertyMap) as KeysOfUnion<CellSelectionOptions>[];

export const CELL_SELECTION_VALIDATORS: OptionsValidator<CellSelectionOptions> = {
    objectName: 'cell-selection',
    allProperties: ALL_PROPERTIES,
    docsUrl: 'grid-options/#reference-selection-selection/',
    deprecations: CELL_SELECTION_DEPRECATIONS,
    validations: CELL_SELECTION_OPTIONS_VALIDATIONS,
};
