import { allParamModels } from './ParamModel';
import { getApplicationConfigAtom } from './application-config';
import { getChangedModelItemCount } from './changed-model-items';
import type { Store } from './store';

// Applying a preset resets the change count, so the count alone cannot tell a
// returning user from a new one; everything a preset writes persists and counts.
export const hasStoredModel = (store: Store) =>
    getChangedModelItemCount(store) !== 0 ||
    allParamModels().some((param) => param.hasValue(store)) ||
    store.get(getApplicationConfigAtom('previewPaneBackgroundColor')) != null;
