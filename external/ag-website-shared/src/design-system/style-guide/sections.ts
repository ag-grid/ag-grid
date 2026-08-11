import type { FunctionComponent } from 'react';

import { Accessibility } from './sections/Accessibility';
import { Buttons } from './sections/Buttons';
import { Code } from './sections/Code';
import { Colour } from './sections/Colour';
import { Alerts, Containers, Pills } from './sections/Components';
import { Contributing } from './sections/Contributing';
import { Forms } from './sections/Forms';
import { Icons } from './sections/Icons';
import { Introduction } from './sections/Introduction';
import { Breakpoints, LayoutSection } from './sections/LayoutAndBreakpoints';
import { Motion } from './sections/Motion';
import { Radii, Shadows, Spacing } from './sections/Scales';
import { Tables } from './sections/Tables';
import { Links, TextElements } from './sections/TextElements';
import { Typography } from './sections/Typography';

export type SectionGroup = 'Start' | 'Foundations' | 'Elements' | 'Components' | 'Practice';

export interface SectionEntry {
    /** Must match the `id` passed to the section's `<Section>`, since it is the anchor. */
    id: string;
    /** Sidebar label. Kept short - the section's own heading carries the full title. */
    label: string;
    group: SectionGroup;
    Component: FunctionComponent;
}

/**
 * Single registry of every section, in page order.
 *
 * The sidebar, the anchor targets and the render order all come from this one list, so adding a
 * section is one entry rather than three edits that can fall out of step.
 */
export const SECTIONS: SectionEntry[] = [
    { id: 'introduction', label: 'How to use this guide', group: 'Start', Component: Introduction },

    { id: 'colour', label: 'Colour', group: 'Foundations', Component: Colour },
    { id: 'typography', label: 'Typography', group: 'Foundations', Component: Typography },
    { id: 'spacing', label: 'Spacing', group: 'Foundations', Component: Spacing },
    { id: 'radii', label: 'Border radii', group: 'Foundations', Component: Radii },
    { id: 'shadows', label: 'Shadows', group: 'Foundations', Component: Shadows },
    { id: 'layout', label: 'Layout', group: 'Foundations', Component: LayoutSection },
    { id: 'breakpoints', label: 'Breakpoints', group: 'Foundations', Component: Breakpoints },
    { id: 'motion', label: 'Motion', group: 'Foundations', Component: Motion },

    { id: 'text-elements', label: 'Text elements', group: 'Elements', Component: TextElements },
    { id: 'links', label: 'Links', group: 'Elements', Component: Links },
    { id: 'buttons', label: 'Buttons', group: 'Elements', Component: Buttons },
    { id: 'forms', label: 'Form controls', group: 'Elements', Component: Forms },
    { id: 'tables', label: 'Tables', group: 'Elements', Component: Tables },
    { id: 'code', label: 'Code', group: 'Elements', Component: Code },
    { id: 'icons', label: 'Icons', group: 'Elements', Component: Icons },

    { id: 'alerts', label: 'Alerts', group: 'Components', Component: Alerts },
    { id: 'containers', label: 'Cards and tabs', group: 'Components', Component: Containers },
    { id: 'pills', label: 'Pills', group: 'Components', Component: Pills },

    { id: 'accessibility', label: 'Accessibility', group: 'Practice', Component: Accessibility },
    { id: 'contributing', label: 'Extending the system', group: 'Practice', Component: Contributing },
];

/** Section ids grouped in page order, for the sidebar. */
export const SECTION_GROUPS: { group: SectionGroup; entries: SectionEntry[] }[] = SECTIONS.reduce<
    { group: SectionGroup; entries: SectionEntry[] }[]
>((groups, entry) => {
    const last = groups[groups.length - 1];
    if (last?.group === entry.group) {
        last.entries.push(entry);
    } else {
        groups.push({ group: entry.group, entries: [entry] });
    }
    return groups;
}, []);
