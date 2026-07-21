import type { Part } from 'ag-grid-community';

import { allParamModels } from './ParamModel';
import { allFeatureModels } from './PartModel';
import { enabledAdvancedParamsAtom } from './advanced-params';
import { getApplicationConfigAtom } from './application-config';
import { resetChangedModelItems } from './changed-model-items';
import type { Store } from './store';
import type { ThemeParams } from './utils';

export type Preset = {
    pageBackgroundColor: string;
    params?: Partial<ThemeParams>;
    parts?: Part<any>[];
};

export const applyPreset = (store: Store, preset: Preset) => {
    const presetParams: any = preset.params || {};
    const advancedParams = new Set<string>();
    for (const { property, valueAtom, onlyEditableAsAdvancedParam } of allParamModels()) {
        if (store.get(valueAtom) != null || presetParams[property] != null) {
            store.set(valueAtom, presetParams[property] ?? undefined);
        }
        if (presetParams[property] != null && onlyEditableAsAdvancedParam) {
            advancedParams.add(property);
        }
    }
    store.set(enabledAdvancedParamsAtom, advancedParams);

    for (const feature of allFeatureModels()) {
        const part = feature.parts.find((partModel) => preset.parts?.includes(partModel.part)) || feature.defaultPart;
        store.set(feature.selectedPartAtom, part);
    }
    store.set(getApplicationConfigAtom('previewPaneBackgroundColor'), preset.pageBackgroundColor || null);
    resetChangedModelItems(store);
};
