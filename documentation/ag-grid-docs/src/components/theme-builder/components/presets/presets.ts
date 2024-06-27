import { type ParamTypes, type PartId, opaqueForeground, ref } from '@ag-grid-community/theming';
import { allParamModels } from '@components/theme-builder/model/ParamModel';
import { allPartModels } from '@components/theme-builder/model/PartModel';
import { enabledAdvancedParamsAtom } from '@components/theme-builder/model/advanced-params';
import { getApplicationConfigAtom } from '@components/theme-builder/model/application-config';
import { resetChangedModelItems } from '@components/theme-builder/model/changed-model-items';

import type { Store } from '../../model/store';
import { gridConfigAtom } from '../grid-config/grid-config-atom';
import { type ProductionGridConfigField, defaultConfigFields } from '../grid-config/grid-options';

export type Preset = {
    name?: string;
    pageBackgroundColor: string;
    params?: Partial<ParamTypes>;
    parts?: Partial<Record<PartId, string>>;
    additionalGridFeatures?: ProductionGridConfigField[];
};

export const lightModePreset: Preset = {
    pageBackgroundColor: '#FAFAFA',
    params: {
        headerFontSize: '14px',
        colorScheme: 'light',
    },
};

export const darkModePreset: Preset = {
    pageBackgroundColor: '#1D2634',
    params: {
        backgroundColor: '#1f2836',
        foregroundColor: '#FFF',
        colorScheme: 'dark',
        chromeBackgroundColor: opaqueForeground(0.07),
        headerFontSize: '14px',
    },
};

export const allPresets: Preset[] = [
    lightModePreset,
    darkModePreset,
    {
        pageBackgroundColor: '#182323',
        params: {
            fontFamily: 'google:IBM Plex Mono',
            fontSize: '12px',
            backgroundColor: '#21222C',
            foregroundColor: '#68FF8E',
            colorScheme: 'dark',
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
            cellTextColor: '#50F178',
            oddRowBackgroundColor: '#21222C',
            rowVerticalPaddingScale: '1.5',
            cellHorizontalPaddingScale: '0.8',
            wrapperBorder: true,
            rowBorder: true,
            columnBorder: true,
            sidePanelBorder: true,

            rangeSelectionBorderColor: 'yellow',
            rangeSelectionBorderStyle: 'dashed',
            rangeSelectionBackgroundColor: 'color-mix(in srgb, transparent, yellow 10%)',
        },
        additionalGridFeatures: ['columnsToolPanel'],
    },
    {
        pageBackgroundColor: '#F6F8F9',
        params: {
            fontFamily: 'google:Inter',
            fontSize: '13px',
            backgroundColor: '#FFFFFF',
            foregroundColor: '#555B62',
            colorScheme: 'light',
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
            rowVerticalPaddingScale: '0.8',
            cellHorizontalPaddingScale: '0.7',
            wrapperBorder: false,
            rowBorder: true,
            columnBorder: false,
            sidePanelBorder: true,
        },
    },
    {
        pageBackgroundColor: '#141516',
        params: {
            fontFamily: 'google:Roboto',
            fontSize: '16px',
            backgroundColor: '#0C0C0D',
            foregroundColor: '#BBBEC9',
            colorScheme: 'dark',
            accentColor: '#15BDE8',
            borderColor: '#ffffff00',
            chromeBackgroundColor: ref('backgroundColor'),
            gridSize: '8px',
            wrapperBorderRadius: '0px',
            borderRadius: '20px',
            headerBackgroundColor: '#182226',
            headerTextColor: '#FFFFFF',
            headerFontSize: '14px',
            headerFontWeight: '500',
            headerVerticalPaddingScale: '0.9',
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
        pageBackgroundColor: '#ffffff',
        params: {
            backgroundColor: '#ffffff',
            colorScheme: 'light',
            headerBackgroundColor: '#F9FAFB',
            headerTextColor: '#919191',
            foregroundColor: 'rgb(46, 55, 66)',
            fontFamily: 'Arial',
            gridSize: '8px',
            wrapperBorderRadius: '0px',
            headerFontWeight: '600',
            oddRowBackgroundColor: '#F9FAFB',
            headerFontSize: '14px',
            wrapperBorder: false,
            rowBorder: false,
            columnBorder: false,
            sidePanelBorder: false,
        },
    },

    {
        pageBackgroundColor: '#FFEAC1',
        params: {
            fontFamily: 'google:Merriweather',
            fontSize: '13px',
            backgroundColor: '#FFDEB4',
            foregroundColor: '#593F2B',
            colorScheme: 'light',
            accentColor: '#064DB9',
            borderColor: '#E9CBA4',
            chromeBackgroundColor: ref('backgroundColor'),
            gridSize: '6px',
            wrapperBorderRadius: '0px',
            borderRadius: '0',
            headerBackgroundColor: '#FAD0A3',
            headerTextColor: '#4C3F35',
            headerFontFamily: 'google:UnifrakturCook',
            headerFontSize: '16px',
            headerFontWeight: '600',
            headerVerticalPaddingScale: '1.6',
            rowVerticalPaddingScale: '1',
            cellHorizontalPaddingScale: '1',
            wrapperBorder: false,
            rowBorder: true,
            columnBorder: false,
            sidePanelBorder: true,
        },
    },
    {
        pageBackgroundColor: 'rgb(75, 153, 154)',
        params: {
            fontFamily: 'google:Pixelify Sans',
            fontSize: '15px',
            backgroundColor: '#F1EDE1',
            foregroundColor: '#605E57',
            colorScheme: 'light',
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
            rowVerticalPaddingScale: '1.2',
        },
    },
];

export const applyPreset = (store: Store, preset: Preset) => {
    const presetParams: any = preset.params || {};
    const advancedParams = new Set<string>();
    for (const { property, valueAtom, onlyEditableAsAdvancedParam } of allParamModels()) {
        if (store.get(valueAtom) != null || presetParams[property] != null) {
            store.set(valueAtom, presetParams[property] ?? null);
        }
        if (presetParams[property] != null && onlyEditableAsAdvancedParam) {
            advancedParams.add(property);
        }
    }
    store.set(enabledAdvancedParamsAtom, advancedParams);

    const activeConfigFields = Array.from(new Set(defaultConfigFields.concat(preset.additionalGridFeatures || [])));
    store.set(gridConfigAtom, Object.fromEntries(activeConfigFields.map((field) => [field, true])));

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
