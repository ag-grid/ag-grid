import type { SelectionOptions } from '../../entities/gridOptions';
import type { Deprecations, OptionsValidator, Validations } from '../validationTypes';

const SELECTION_DEPRECATIONS: Deprecations<SelectionOptions> = {};

const SELECTION_OPTIONS_VALIDATIONS: Validations<SelectionOptions> = {};

/**
 * Needed because `keyof (T | U)` only returns the common keys, whereas the below
 * forces Typescript to expand the union and collect all possible keys across the union.
 */
type KeysOfUnion<T> = T extends T ? keyof T : never;

const selectionPropertyMap: Record<KeysOfUnion<SelectionOptions>, undefined> = {
    mode: undefined,
    suppressClickSelection: undefined,
    suppressDeselection: undefined,
    suppressMultiRanges: undefined,
    hideDisabledCheckboxes: undefined,
    checkboxes: undefined,
    headerCheckbox: undefined,
    isRowSelectable: undefined,
    groupSelects: undefined,
    selectAll: undefined,
    enableMultiSelectWithClick: undefined,
    handle: undefined,
};
const ALL_PROPERTIES = Object.keys(selectionPropertyMap) as KeysOfUnion<SelectionOptions>[];

export const SELECTION_VALIDATORS: OptionsValidator<SelectionOptions> = {
    objectName: 'selection',
    allProperties: ALL_PROPERTIES,
    docsUrl: 'grid-options/#reference--selection/',
    deprecations: SELECTION_DEPRECATIONS,
    validations: SELECTION_OPTIONS_VALIDATIONS,
};
