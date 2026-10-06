import { useApplicationConfigAtom } from '@ag-website-shared/theming/application-config';

import type { CollapsibleSectionProps } from './CollapsibleSection';

/**
 * Open/closed state for a panel of CollapsibleSections, persisted across reloads.
 * Returns a function producing one section's props from its heading, so a host
 * spreads `{...sectionProps('General')}` and owns nothing but the headings.
 */
export const useCollapsibleSections = (defaultOpenSections: string[]) => {
    const [expanded, setExpanded] = useApplicationConfigAtom('expandedEditors');
    const openSections = expanded ?? defaultOpenSections;

    const toggleSection = (heading: string) =>
        setExpanded(
            openSections.includes(heading) ? openSections.filter((h) => h !== heading) : [...openSections, heading]
        );

    return (heading: string): Omit<CollapsibleSectionProps, 'children'> => ({
        heading,
        isOpen: openSections.includes(heading),
        onToggle: () => toggleSection(heading),
    });
};
