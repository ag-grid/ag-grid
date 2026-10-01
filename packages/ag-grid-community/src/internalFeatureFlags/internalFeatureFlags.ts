import type { BeanCollection } from '../context/context';
import type { InternalFeatureFlag, InternalFeatureFlags } from '../interfaces/iInternalFeatureFlags';

// Studio only supplies the `studio` bean, so what it turns on is decided here and needs no change in Studio
const STUDIO_FLAGS: Required<InternalFeatureFlags> = {
    clickToggleSelection: true,
    spaceKeyFollowsClickSelection: true,
};

export function _isInternalFeatureFlagEnabled(beans: BeanCollection, flag: InternalFeatureFlag): boolean {
    const override = beans.internalFeatureFlags?.flags[flag];
    if (override !== undefined) {
        return override;
    }
    // eslint-disable-next-line no-restricted-syntax -- the one place behaviour is keyed off running inside Studio
    return !!beans.studio && STUDIO_FLAGS[flag];
}
