import { type CoreParam, type PartId, opaqueForeground, ref } from '@ag-grid-community/theming';
import { allParamModels } from '@components/theme-builder/model/ParamModel';
import { allPartModels } from '@components/theme-builder/model/PartModel';
import { getApplicationConfigAtom } from '@components/theme-builder/model/application-config';
import { resetChangedModelItems } from '@components/theme-builder/model/changed-model-items';

import type { Store } from '../../model/store';

export type Preset = {
    name?: string;
    pageBackgroundColor: string;
    params?: Partial<Record<CoreParam, string>>;
    parts?: Partial<Record<PartId, string>>;
};

export const lightModePreset: Preset = {
    pageBackgroundColor: '#FAFAFA',
    params: {
        headerFontSize: '14px',
    },
};
export const darkModePreset: Preset = {
    pageBackgroundColor: '#1D2634',
    params: {
        backgroundColor: '#1f2836',
        foregroundColor: '#FFF',
        chromeBackgroundColor: opaqueForeground(0.07),
        headerFontSize: '14px',
    },
};

export const allPresets: Preset[] = [
    lightModePreset,
    darkModePreset,
    {
        name: 'Elite',
        pageBackgroundColor: '#182323',
        params: {
            fontFamily: 'google:IBM Plex Mono',
            fontSize: '12px',
            backgroundColor: '#21222C',
            foregroundColor: '#68FF8E',
            accentColor: '#00A2FF',
            borderColor: '#429356',
            gridSize: '4px',
            wrapperBorderRadius: '0px',
            borderRadius: '0px',
            headerBackgroundColor: '#21222C',
            headerTextColor: '#68FF8E',
            headerFontSize: '14px',
            headerFontWeight: '700',
            headerVerticalPaddingScale: '1.5',
            dataColor: '#50F178',
            oddRowBackgroundColor: '#21222C',
            rowVerticalPaddingScale: '1.5',
            cellHorizontalPaddingScale: '0.8',
            wrapperBorder: true,
            rowBorder: true,
            columnBorder: true,
            sidePanelBorder: true,
        },
    },
    {
        // ONLY ROW & TOOLPANEL BORDERS
        name: 'DenseAndDull',
        pageBackgroundColor: '#F6F8F9',
        params: {
            fontFamily: 'google:Inter',
            fontSize: '13px',
            backgroundColor: '#FFFFFF',
            foregroundColor: '#555B62',
            accentColor: '#087AD1',
            borderColor: '#D7E2E6',
            chromeBackgroundColor: ref('backgroundColor'),
            gridSize: '6px',
            wrapperBorderRadius: '2px',
            borderRadius: '2px',
            headerBackgroundColor: '#FFFFFF',
            headerTextColor: '#84868B',
            headerFontSize: '13px',
            headerFontWeight: '400',
            cellTextColor: '#4F5760',
            rowVerticalPaddingScale: '0.8',
            cellHorizontalPaddingScale: '0.7',
            wrapperBorder: false,
            rowBorder: true,
            columnBorder: false,
            sidePanelBorder: true,
        },
    },
    {
        name: 'JustinHawkins',
        pageBackgroundColor: '#141516',
        params: {
            fontFamily: 'google:Roboto',
            fontSize: '16px',
            backgroundColor: '#0C0C0D',
            foregroundColor: '#BBBEC9',
            accentColor: '#15BDE8',
            borderColor: '#D7E2E6',
            chromeBackgroundColor: ref('backgroundColor'),
            gridSize: '8px',
            wrapperBorderRadius: '0px',
            borderRadius: '20px',
            headerBackgroundColor: '#1E222A',
            headerTextColor: '#FFFFFF',
            headerFontSize: '16px',
            headerFontWeight: '500',
            headerVerticalPaddingScale: '0.9',
            cellTextColor: '#BBBEC9',
            rowVerticalPaddingScale: '1.2',
            cellHorizontalPaddingScale: '1',
            wrapperBorder: false,
            rowBorder: false,
            columnBorder: false,
            sidePanelBorder: false,
            iconSize: '20px',
        },
    },
    {
        name: 'Windows95',
        pageBackgroundColor: 'rgb(75, 153, 154)',
        params: {
            fontFamily: 'google:Pixelify Sans',
            fontSize: '15px',
            backgroundColor: '#F1EDE1',
            foregroundColor: '#605E57',
            accentColor: '#0086F4',
            borderColor: '#98968F',
            chromeBackgroundColor: ref('backgroundColor'),
            gridSize: '5px',
            wrapperBorderRadius: '0px',
            borderRadius: '0px',
            headerBackgroundColor: '#E4DAD1',
            headerTextColor: '#3C3A35',
            headerFontSize: '15px',
            headerFontWeight: '700',
            cellTextColor: '#605E57',
            rowVerticalPaddingScale: '1.2',
        },
    },
    {
        name: 'EphTea',
        pageBackgroundColor: '#FFEAC1',
        params: {
            fontFamily: 'google:Merriweather',
            fontSize: '13px',
            backgroundColor: '#FFDEB4',
            foregroundColor: '#593F2B',
            accentColor: '#064DB9',
            borderColor: '#E9CBA4',
            chromeBackgroundColor: ref('backgroundColor'),
            gridSize: '6px',
            wrapperBorderRadius: '0px',
            borderRadius: '0',
            headerBackgroundColor: '#FAD0A3',
            headerTextColor: '#4C3F35',
            headerFontFamily: 'google:UnifrakturCook',
            headerFontSize: '22px',
            headerFontWeight: '600',
            headerVerticalPaddingScale: '1.6',
            cellTextColor: '#BBBEC9',
            rowVerticalPaddingScale: '1',
            cellHorizontalPaddingScale: '1',
            wrapperBorder: false,
            rowBorder: true,
            columnBorder: false,
            sidePanelBorder: true,
        },
    },
    {
        pageBackgroundColor: '#212124',
        params: {
            backgroundColor: '#252A33',
            headerBackgroundColor: '#8AB4F9',
            headerTextColor: '#252A33',
            foregroundColor: '#BDC2C7',
            chromeBackgroundColor: ref('backgroundColor'),
            fontFamily: 'google:Plus Jakarta Sans',
            gridSize: '8px',
            wrapperBorderRadius: '12px',
            headerFontWeight: '600',
            accentColor: '#8AB4F9',
            rowVerticalPaddingScale: '0.6',
            headerFontSize: '14px',
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
            headerFontSize: '14px',
        },
    },
];

export const applyPreset = (store: Store, preset: Preset) => {
    const presetParams: any = preset.params || {};
    for (const { property, valueAtom } of allParamModels()) {
        if (store.get(valueAtom) != null || presetParams[property] != null) {
            store.set(valueAtom, presetParams[property] ?? null);
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
