import { PresetButton, PresetScroller } from '@ag-website-shared/components/theme-builder/PresetScroller';
import { usePresetApply } from '@ag-website-shared/components/theme-builder/usePresetApply';
import { type Preset, applyPreset } from '@ag-website-shared/theming/preset';
import { useStore } from 'jotai';
import { type CSSProperties, useMemo } from 'react';

import { type Theme, colorSchemeLight, themeQuartz } from 'ag-grid-community';

import { PresetRender } from './PresetRender';
import { allPresets } from './presets';

export const PresetSelector = () => {
    const store = useStore();

    // allPresets is a static array, so the derived themes only need building once.
    const presetThemes = useMemo(() => allPresets.map(buildPresetTheme), []);

    const { selectPreset, resetChangesModal } = usePresetApply({
        apply: (preset: Preset) => applyPreset(store, preset),
        baselineChanges: 1,
    });

    return (
        <>
            <PresetScroller>
                {allPresets.map((preset, index) => (
                    <PresetButton
                        key={index}
                        onClick={() => selectPreset(preset)}
                        style={{ '--page-background-color': preset.pageBackgroundColor } as CSSProperties}
                        aria-label={`Preset ${index + 1}`}
                    >
                        <PresetRender theme={presetThemes[index]} />
                    </PresetButton>
                ))}
            </PresetScroller>
            {resetChangesModal}
        </>
    );
};

function buildPresetTheme(preset: Preset): Theme {
    let built: Theme = themeQuartz.withPart(colorSchemeLight);
    if (preset.params) {
        built = built.withParams(preset.params);
    }
    for (const part of preset.parts || []) {
        built = built.withPart(part);
    }
    return built;
}
