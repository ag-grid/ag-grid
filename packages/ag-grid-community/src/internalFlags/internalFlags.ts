import type { BeanCollection } from '../context/context';
import type { InternalFlag, InternalFlags } from '../interfaces/iInternalFlags';

// Studio only supplies the `studio` bean, so what it turns on is decided here and needs no change in Studio
const STUDIO_FLAGS: Required<InternalFlags> = {
    clickToggleSelection: true,
};

export function _isInternalFlagEnabled(beans: BeanCollection, flag: InternalFlag): boolean {
    const override = beans.internalFlags?.flags[flag];
    if (override !== undefined) {
        return override;
    }
    // eslint-disable-next-line no-restricted-syntax -- the one place behaviour is keyed off running inside Studio
    return !!beans.studio && STUDIO_FLAGS[flag];
}
