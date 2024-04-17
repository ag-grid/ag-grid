import {
    type CoreParam,
    type PartId,
    borderValueToCss,
    corePart,
    opaqueForeground,
    ref,
} from '@ag-grid-community/theming';
import { allPartModels } from '@components/theme-builder/model/PartModel';
import { getApplicationConfigAtom } from '@components/theme-builder/model/application-config';
import styled from '@emotion/styled';
import { useStore } from 'jotai';
import { memo, useEffect, useRef } from 'react';

import { allParamModels } from '../../model/ParamModel';
import { PresetRender } from './PresetRender';

type Preset = {
    pageBackgroundColor: string;
    params?: Partial<Record<CoreParam, string>>;
    parts?: Partial<Record<PartId, string>>;
};

export const allPresets: Preset[] = [
    {
        pageBackgroundColor: '#fff',
    },
    {
        pageBackgroundColor: '#1D2634',
        params: {
            backgroundColor: '#1f2836',
            foregroundColor: '#FFF',
            chromeBackgroundColor: opaqueForeground(0.07),
        },
    },
    {
        pageBackgroundColor: 'rgb(75, 153, 154)',
        params: {
            backgroundColor: 'rgb(241, 237, 225)',
            foregroundColor: 'rgb(46, 55, 66)',
            chromeBackgroundColor: ref('backgroundColor'),
            fontFamily: 'monospace',
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
            fontFamily: 'Arial',
            gridSize: '8px',
            wrapperBorderRadius: '0px',
            headerFontWeight: '600',
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
        },
    },
];

export const PresetSelector = memo(() => (
    <Scroller>
        <Horizontal>
            {allPresets.map((preset, i) => (
                <SelectButton key={i} preset={preset} />
            ))}
        </Horizontal>
    </Scroller>
));

type SelectButtonProps = {
    preset: Preset;
};

const SelectButton = ({ preset }: SelectButtonProps) => {
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const wrapper = wrapperRef.current;
        if (wrapper) {
            for (const [key, value] of Object.entries(corePart.defaults)) {
                wrapper.style.setProperty(paramToVariableName(key), borderValueToCss(value));
            }
            for (const [key, value] of Object.entries(preset.params || {})) {
                wrapper.style.setProperty(paramToVariableName(key), value);
            }
            wrapper.style.setProperty('--page-background-color', preset.pageBackgroundColor);
        }
    }, [preset]);

    const store = useStore();

    const applyPreset = () => {
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
                    newVariantId == null
                        ? part.defaultVariant
                        : part.variants.find((v) => v.variantId === newVariantId);
                if (!newVariant) {
                    throw new Error(
                        `Invalid variant ${newVariantId} for part ${part.partId}, use one of: ${part.variants.map((v) => v.variantId).join(', ')}`
                    );
                }
                store.set(part.variantAtom, newVariant);
            }
        }
        store.set(getApplicationConfigAtom('previewPaneBackgroundColor'), preset.pageBackgroundColor || null);
    };

    return (
        <SelectButtonWrapper ref={wrapperRef} onClick={applyPreset}>
            <PresetRender />
        </SelectButtonWrapper>
    );
};

const SelectButtonWrapper = styled('div')`
    display: inline-block;
    margin-right: 12px;
`;

const Horizontal = styled('div')`
    display: flex;
    height: 100%;
`;
const Scroller = styled('div')`
    width: 100%;
    min-height: 160px;
    overflow-x: auto;
    padding-bottom: 6px;
`;

const paramToVariableName = (param: string) => `--ag-${kebabCase(param)}`;
const kebabCase = (str: string) => str.replace(/[A-Z]/g, (m) => `-${m}`).toLowerCase();
