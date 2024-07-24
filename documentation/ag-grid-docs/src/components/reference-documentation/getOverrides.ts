import { throwDevWarning } from '@ag-website-shared/utils/throwDevWarning';
import { getEntry } from 'astro:content';

export async function getOverrides(overrideSrc: string) {
    let overrides = {};
    if (overrideSrc) {
        // NOTE: Need to remove `.json` for getEntry
        const overrideFileName = overrideSrc.replace('.json', '');
        const overridesEntry = await getEntry('interface-documentation', overrideFileName);
        if (!overridesEntry) {
            const message = `InterfaceDocumentation source not found: src/content/interface-documentation/${overrideFileName}.json`;
            throwDevWarning({ message });
        } else {
            overrides = overridesEntry.data;
        }
    }

    return overrides;
}
