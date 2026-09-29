import { useStore } from 'jotai';
import { useState } from 'react';

import { getChangedModelItemCount } from '../../theming/changed-model-items';
import { ResetChangesModal } from './ResetChangesModal';

interface Options<TPreset> {
    apply: (preset: TPreset) => void;
    /** Changes that are not the user's own edits — a host whose preset application registers one passes 1. */
    baselineChanges?: number;
}

/** Applying a preset discards every edit made since the last one, so confirm first when there are any. */
export const usePresetApply = <TPreset,>({ apply, baselineChanges = 0 }: Options<TPreset>) => {
    const store = useStore();
    const [showDialog, setShowDialog] = useState(false);
    const [pendingPreset, setPendingPreset] = useState<TPreset | null>(null);

    const selectPreset = (preset: TPreset) => {
        if (getChangedModelItemCount(store) > baselineChanges) {
            setPendingPreset(preset);
            setShowDialog(true);
        } else {
            apply(preset);
        }
    };

    const resetChangesModal = pendingPreset != null && (
        <ResetChangesModal
            showDialog={showDialog}
            setShowDialog={setShowDialog}
            onSuccess={() => apply(pendingPreset)}
        />
    );

    return { selectPreset, resetChangesModal };
};
