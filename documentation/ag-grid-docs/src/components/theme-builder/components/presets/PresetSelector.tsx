import { corePart, paramValueToCss } from '@ag-grid-community/theming';
import { getChangedModelItemCount } from '@components/theme-builder/model/changed-model-items';
import styled from '@emotion/styled';
import { useStore } from 'jotai';
import { memo, useEffect, useRef } from 'react';

import { PresetRender } from './PresetRender';
import { type Preset, allPresets, applyPreset } from './presets';

export const PresetSelector = memo(() => {
    // find and load any google fonts that might be used by presets
    const googleFonts = [corePart.defaults, ...allPresets.map((p) => p.params)]
        .map((params) =>
            Object.values(params || {})
                .filter((v) => String(v).startsWith('google:'))
                .map((v) => String(v).replace('google:', ''))
        )
        .flat()
        .sort()
        .map(
            (font) =>
                `@import url('https://fonts.googleapis.com/css2?family=${encodeURIComponent(font)}&display=swap');`
        )
        .join('\n');

    return (
        <Scroller>
            <style>{googleFonts}</style>
            <Horizontal>
                {allPresets.map((preset, i) => (
                    <SelectButton key={i} preset={preset} />
                ))}
            </Horizontal>
        </Scroller>
    );
});

type SelectButtonProps = {
    preset: Preset;
};

const SelectButton = ({ preset }: SelectButtonProps) => {
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const wrapper = wrapperRef.current;
        if (wrapper) {
            const params = { ...corePart.defaults, ...preset.params };
            for (const [key, value] of Object.entries(params)) {
                let rendered = paramValueToCss(key, value);
                if (typeof rendered === 'string') {
                    wrapper.style.setProperty(paramToVariableName(key), rendered);
                }
            }
            wrapper.style.setProperty('--page-background-color', preset.pageBackgroundColor);
        }
    }, [preset]);

    const store = useStore();

    return (
        <SelectButtonWrapper
            ref={wrapperRef}
            onClick={() => {
                if (getChangedModelItemCount(store) > 1) {
                    if (!confirm('Applying a preset will reset your changes, are you sure?')) {
                        return;
                    }
                }
                applyPreset(store, preset);
            }}
        >
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
