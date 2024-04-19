import { type CoreParam, type PartId, opaqueForeground, ref } from '@ag-grid-community/theming';
import { allParamModels } from '@components/theme-builder/model/ParamModel';
import { allPartModels } from '@components/theme-builder/model/PartModel';
import { getApplicationConfigAtom } from '@components/theme-builder/model/application-config';
import { resetChangedModelItems } from '@components/theme-builder/model/changed-model-items';

import type { Store } from '../../model/store';

export type Preset = {
    pageBackgroundColor: string;
    params?: Partial<Record<CoreParam, string>>;
    parts?: Partial<Record<PartId, string>>;
};

export const lightModePreset: Preset = {
    pageBackgroundColor: '#FAFAFA',
};
export const darkModePreset: Preset = {
    pageBackgroundColor: '#1D2634',
    params: {
        backgroundColor: '#1f2836',
        foregroundColor: '#FFF',
        chromeBackgroundColor: opaqueForeground(0.07),
    },
};

export const allPresets: Preset[] = [
    lightModePreset,
    darkModePreset,
    {
        pageBackgroundColor: 'rgb(75, 153, 154)',
        params: {
            backgroundColor: 'rgb(241, 237, 225)',
            foregroundColor: 'rgb(46, 55, 66)',
            chromeBackgroundColor: ref('backgroundColor'),
            fontFamily: 'google:Press Start 2P',
            gridSize: '4px',
        },
    },
    {
        pageBackgroundColor: '#948B8E',
        params: {
            backgroundColor: '#E4E0E2',
            headerBackgroundColor: '#807078',
            headerTextColor: '#EEECED',
            // headerBackgroundColor: '#807078',
            foregroundColor: 'rgb(46, 55, 66)',
            chromeBackgroundColor: ref('backgroundColor'),
            fontFamily: 'google:Jacquard 24',
            gridSize: '8px',
            wrapperBorderRadius: '0px',
            headerFontWeight: '600',
        },
    },
    {
        pageBackgroundColor: '#212124',
        params: {
            backgroundColor: '#252A33',
            headerBackgroundColor: '#8AB4F9',
            headerTextColor: '#252A33',
            // headerBackgroundColor: '#807078',
            foregroundColor: '#BDC2C7',
            chromeBackgroundColor: ref('backgroundColor'),
            fontFamily: 'google:Plus Jakarta Sans',
            gridSize: '8px',
            wrapperBorderRadius: '12px',
            headerFontWeight: '600',
            accentColor: '#8AB4F9',
            rowVerticalPaddingScale: '0.6',
        },
    },
    {
        pageBackgroundColor: '#ffffff',
        params: {
            backgroundColor: '#ffffff',
            headerBackgroundColor: '#F9FAFB',
            headerTextColor: '#919191',
            foregroundColor: 'rgb(46, 55, 66)',
            fontFamily: 'Arial',
            gridSize: '8px',
            wrapperBorderRadius: '0px',
            headerFontWeight: '600',
            oddRowBackgroundColor: '#F9FAFB',
            rowBorder: 'none',
            wrapperBorder: 'none',
        },
    },
];

export const applyPreset = (store: Store, preset: Preset) => {
    const presetParams: any = preset.params || {};
    for (const { property, valueAtom } of allParamModels()) {
        if (store.get(valueAtom) != null || presetParams[property] != null) {
            store.set(valueAtom, presetParams[property] || null);
        }
    }

    const presetParts = preset.parts || {};
    for (const part of allPartModels()) {
        const newVariantId = presetParts[part.partId];
        if (store.get(part.variantAtom) != null || newVariantId != null) {
            const newVariant =
                newVariantId == null ? part.defaultVariant : part.variants.find((v) => v.variantId === newVariantId);
            if (!newVariant) {
                throw new Error(
                    `Invalid variant ${newVariantId} for part ${part.partId}, use one of: ${part.variants.map((v) => v.variantId).join(', ')}`
                );
            }
            store.set(part.variantAtom, newVariant);
        }
    }
    store.set(getApplicationConfigAtom('previewPaneBackgroundColor'), preset.pageBackgroundColor || null);
    resetChangedModelItems(store);
};
