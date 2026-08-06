import { PresetButton, PresetScroller } from '@ag-website-shared/components/theme-builder/PresetScroller';
import { ResetChangesModal } from '@ag-website-shared/components/theme-builder/ResetChangesModal';
import { getChangedModelItemCount } from '@ag-website-shared/theming/changed-model-items';
import { applyPreset } from '@ag-website-shared/theming/preset';
import { useStore } from 'jotai';
import { useState } from 'react';

import { PresetPreview } from './PresetPreview';
import { PRESETS, type StudioPreset, toSharedPreset } from './presets';

interface Props {
    isDark: boolean;
    selectedId: string | null;
    onSelect: (preset: StudioPreset) => void;
}

export const PresetSelector = ({ isDark, selectedId, onSelect }: Props) => {
    const store = useStore();
    const [showDialog, setShowDialog] = useState(false);
    const [pendingPreset, setPendingPreset] = useState<StudioPreset | null>(null);

    const apply = (preset: StudioPreset) => {
        applyPreset(store, toSharedPreset(preset, isDark));
        onSelect(preset);
    };

    const selectPreset = (preset: StudioPreset) => {
        // Only warn about losing manual edits; a single change is the preset
        // application itself, mirroring the grid host's threshold.
        if (getChangedModelItemCount(store) > 1) {
            setPendingPreset(preset);
            setShowDialog(true);
        } else {
            apply(preset);
        }
    };

    return (
        <>
            <PresetScroller>
                {PRESETS.map((preset) => {
                    const variant = isDark ? preset.variants.dark : preset.variants.light;
                    const selected = preset.id === selectedId;
                    return (
                        <PresetButton
                            key={preset.id}
                            onClick={(e) => {
                                selectPreset(preset);
                                e.currentTarget.scrollIntoView({
                                    behavior: 'smooth',
                                    inline: 'center',
                                    block: 'nearest',
                                });
                            }}
                            aria-label={preset.label}
                            aria-pressed={selected}
                        >
                            <PresetPreview label={preset.label} variant={variant} />
                        </PresetButton>
                    );
                })}
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
