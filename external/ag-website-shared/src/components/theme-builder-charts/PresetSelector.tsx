import { PresetButton, PresetScroller } from '@ag-website-shared/components/theme-builder/PresetScroller';
import { ResetChangesModal } from '@ag-website-shared/components/theme-builder/ResetChangesModal';
import { getChangedModelItemCount } from '@ag-website-shared/theming/changed-model-items';
import { applyPreset } from '@ag-website-shared/theming/preset';
import { useStore } from 'jotai';
import { useState } from 'react';

import { PresetPreview } from './PresetPreview';
import { completePalette, setStoredPalette } from './paletteModel';
import { setImportedBaseTheme, setSelectedPresetId } from './presetModel';
import { type ChartsPreset, PRESETS, toSharedPreset } from './presets';

interface Props {
    selectedId: string | null | undefined;
}

export const PresetSelector = ({ selectedId }: Props) => {
    const store = useStore();
    const [showDialog, setShowDialog] = useState(false);
    const [pendingPreset, setPendingPreset] = useState<ChartsPreset | null>(null);

    const apply = (preset: ChartsPreset) => {
        // Neither the palette nor the base theme is part of the shared preset, so
        // both are applied here - after applyPreset, which resets the change count.
        applyPreset(store, toSharedPreset(preset));
        setStoredPalette(store, completePalette(preset.palette));
        setSelectedPresetId(store, preset.id);
        setImportedBaseTheme(store, undefined);
    };

    const selectPreset = (preset: ChartsPreset) => {
        if (getChangedModelItemCount(store) > 0) {
            setPendingPreset(preset);
            setShowDialog(true);
        } else {
            apply(preset);
        }
    };

    return (
        <>
            <PresetScroller>
                {PRESETS.map((preset) => (
                    <PresetButton
                        key={preset.id}
                        onClick={(e) => {
                            selectPreset(preset);
                            e.currentTarget.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
                        }}
                        aria-label={preset.label}
                        aria-pressed={preset.id === selectedId}
                    >
                        <PresetPreview preset={preset} />
                    </PresetButton>
                ))}
            </PresetScroller>
            {pendingPreset && (
                <ResetChangesModal
                    showDialog={showDialog}
                    setShowDialog={setShowDialog}
                    onSuccess={() => apply(pendingPreset)}
                />
            )}
        </>
    );
};
