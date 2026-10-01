import { PresetButton, PresetScroller } from '@ag-website-shared/components/theme-builder/PresetScroller';
import { usePresetApply } from '@ag-website-shared/components/theme-builder/usePresetApply';
import { applyPreset } from '@ag-website-shared/theming/preset';
import { useStore } from 'jotai';

import { PresetPreview } from './PresetPreview';
import { PRESETS, type StudioPreset, toSharedPreset } from './presets';

interface Props {
    isDark: boolean;
    selectedId: string | null;
    onSelect: (preset: StudioPreset) => void;
}

export const PresetSelector = ({ isDark, selectedId, onSelect }: Props) => {
    const store = useStore();

    const apply = (preset: StudioPreset) => {
        applyPreset(store, toSharedPreset(preset, isDark));
        onSelect(preset);
    };

    const { selectPreset, resetChangesModal } = usePresetApply({ apply, baselineChanges: 1 });

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
            {resetChangesModal}
        </>
    );
};
