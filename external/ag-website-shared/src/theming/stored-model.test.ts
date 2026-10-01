import { createStore } from 'jotai';
import { describe, expect, it } from 'vitest';

import { ParamModel, setThemeParamSource } from './ParamModel';
import { getApplicationConfigAtom } from './application-config';
import { addChangedModelItem } from './changed-model-items';
import { hasStoredModel } from './stored-model';

// Our own param source, not a host's: every container repo runs this, installing only its own product.
setThemeParamSource(() => ({ backgroundColor: '#FFFFFF', accentColor: '#2196F3' }));

describe('hasStoredModel', () => {
    it('finds nothing in the store a first visit starts with', () => {
        expect(hasStoredModel(createStore())).toBe(false);
    });

    it('counts a param a preset left behind, with no change recorded', () => {
        const store = createStore();
        store.set(ParamModel.for('backgroundColor').valueAtom, '#FF0000');

        expect(hasStoredModel(store)).toBe(true);
    });

    it('counts a page background a preset left behind', () => {
        const store = createStore();
        store.set(getApplicationConfigAtom('previewPaneBackgroundColor'), '#FF0000');

        expect(hasStoredModel(store)).toBe(true);
    });

    it('counts an edit the user has made', () => {
        const store = createStore();
        addChangedModelItem(store, 'accentColor');

        expect(hasStoredModel(store)).toBe(true);
    });
});
