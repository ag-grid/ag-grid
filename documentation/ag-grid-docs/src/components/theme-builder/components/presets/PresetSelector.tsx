import styled from '@emotion/styled';
import { useStore } from 'jotai';
import { memo, useEffect, useRef } from 'react';

import { opaqueForeground, ref } from '../../../../../../../community-modules/theming/src/css-helpers';
import { corePart } from '../../../../../../../community-modules/theming/src/parts/core/core-part';
import { borderValueToCss } from '../../../../../../../community-modules/theming/src/theme-types';
import { allParamModels } from '../../model/ParamModel';
import { PresetRender } from './PresetRender';

type Preset = {
    pageBackgroundColor: string;
    params: Record<string, string>;
};

const presets: Preset[] = [
    {
        pageBackgroundColor: '#fff',
        params: {},
    },
    {
        pageBackgroundColor: '#000',
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
];

export const PresetSelector = memo(() => (
    <Scroller>
        <Horizontal>
            {presets.map((preset, i) => (
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
            for (const [key, value] of Object.entries(preset.params)) {
                wrapper.style.setProperty(paramToVariableName(key), value);
            }
            wrapper.style.setProperty('--page-background-color', preset.pageBackgroundColor);
        }
    }, [preset]);

    const store = useStore();

    const applyPreset = () => {
        for (const { property, valueAtom } of allParamModels()) {
            if (store.get(valueAtom) != null || preset.params[property] != null) {
                console.log('setting', property, store.get(valueAtom));
                store.set(valueAtom, preset.params[property] || null);
            }
        }
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
