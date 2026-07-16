import { PresetButton, PresetScroller } from '@ag-website-shared/components/theme-builder/PresetScroller';
import { ResetChangesModal } from '@ag-website-shared/components/theme-builder/ResetChangesModal';
import { getChangedModelItemCount } from '@ag-website-shared/theming/changed-model-items';
import { useStore } from 'jotai';
import { type CSSProperties, useMemo, useState } from 'react';

import { type Theme, colorSchemeLight, themeQuartz } from 'ag-grid-community';

import { PresetRender } from './PresetRender';
import { type Preset, allPresets, applyPreset } from './presets';

export const PresetSelector = () => {
    const store = useStore();
    const [showDialog, setShowDialog] = useState(false);
    const [pendingPreset, setPendingPreset] = useState<Preset | null>(null);

    // allPresets is a static array, so the derived themes only need building once.
    const presetThemes = useMemo(() => allPresets.map(buildPresetTheme), []);

    const selectPreset = (preset: Preset) => {
        if (getChangedModelItemCount(store) > 1) {
            setPendingPreset(preset);
            setShowDialog(true);
        } else {
            applyPreset(store, preset);
        }
    };

    return (
        <>
            <PresetScroller>
                {allPresets.map((preset, index) => (
                    <PresetButton
                        key={index}
                        onClick={(e) => {
                            selectPreset(preset);
                            e.currentTarget.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
                        }}
                        style={{ '--page-background-color': preset.pageBackgroundColor } as CSSProperties}
                        aria-label={`Preset ${index + 1}`}
                    >
                        <PresetRender theme={presetThemes[index]} />
                    </PresetButton>
                ))}
            </PresetScroller>
            {pendingPreset && (
                <ResetChangesModal
                    showDialog={showDialog}
                    setShowDialog={setShowDialog}
                    onSuccess={() => applyPreset(store, pendingPreset)}
                />
            )}
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
