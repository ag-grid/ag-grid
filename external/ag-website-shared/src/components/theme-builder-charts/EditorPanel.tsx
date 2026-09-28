import { AdvancedParamSelector } from '@ag-website-shared/components/theme-builder/AdvancedParamSelector';
import { CollapsibleSection } from '@ag-website-shared/components/theme-builder/CollapsibleSection';
import { PaletteEditor } from '@ag-website-shared/components/theme-builder/PaletteEditor';
import { ParamEditor } from '@ag-website-shared/components/theme-builder/ParamEditor';
import {
    horizontalSpacingIcon,
    radiusIcon,
    verticalSpacingIcon,
} from '@ag-website-shared/components/theme-builder/icons';
import { useApplicationConfigAtom } from '@ag-website-shared/theming/application-config';
import styled from '@emotion/styled';
import type { ReactNode } from 'react';

import { InheritedValueNote } from './InheritedValueNote';
import { useSetEditedGroup } from './editedGroup';
import { usePalette } from './paletteModel';
import { type ChartsParamConfig, type LengthIcon, PARAM_GROUPS } from './params';

const PALETTE_SECTION = 'Palette';
const ALL_PARAMS_SECTION = 'All Parameters';

const DEFAULT_OPEN_SECTIONS = [
    PALETTE_SECTION,
    ...PARAM_GROUPS.filter((group) => !group.collapsed).map((group) => group.label),
    // A param pinned here was asked for explicitly; a closed section would hide it.
    ALL_PARAMS_SECTION,
];

const iconFor = (icon?: LengthIcon): ReactNode => {
    switch (icon) {
        case 'radius':
            return radiusIcon;
        case 'verticalSpacing':
            return verticalSpacingIcon;
        case 'horizontalSpacing':
            return horizontalSpacingIcon;
        default:
            return undefined;
    }
};

const paramEditor = (param: ChartsParamConfig) => (
    <ParamEditor
        key={param.key}
        param={param.key}
        label={param.label}
        // Three sections have a "Background Color", so the tooltip carries what
        // the short label leaves out: which part of the chart this one paints.
        showDocs
        note={<InheritedValueNote param={param.key} />}
        icon={iconFor(param.icon)}
        swipeAdjustmentDivisor={param.swipeAdjustmentDivisor}
        min={param.min}
        max={param.max}
    />
);

export const EditorPanel = () => {
    const [expanded, setExpanded] = useApplicationConfigAtom('expandedEditors');
    const [palette, setPalette] = usePalette();
    const setEditedGroup = useSetEditedGroup();
    const openSections = expanded || DEFAULT_OPEN_SECTIONS;

    const toggleSection = (heading: string) => {
        setExpanded(
            openSections.includes(heading) ? openSections.filter((h) => h !== heading) : [...openSections, heading]
        );
    };

    const sectionProps = (heading: string) => ({
        heading,
        isOpen: openSections.includes(heading),
        onToggle: () => toggleSection(heading),
    });

    // See `editedGroup.ts`. Capture handlers, so the panel clears the group and
    // the group under the pointer then names itself; anywhere else in the panel
    // clears it and stops there. No release on blur: colour pickers render in a
    // portal, so a swatch click would read as abandoning the panel.
    const releaseGroup = {
        onFocusCapture: () => setEditedGroup(null),
        onPointerDownCapture: () => setEditedGroup(null),
    };
    const holdGroup = (id: string) => ({
        onFocusCapture: () => setEditedGroup(id),
        onPointerDownCapture: () => setEditedGroup(id),
    });

    return (
        <PanelWrapper {...releaseGroup}>
            <CollapsibleSection {...sectionProps(PALETTE_SECTION)}>
                <PaletteEditor value={palette} onChange={setPalette} />
            </CollapsibleSection>
            {/* Every group, and every param in it - including params that follow
                another one, since the panel is where you find out what a theme
                can change. */}
            {PARAM_GROUPS.map((group) => (
                <CollapsibleSection key={group.id} {...sectionProps(group.label)}>
                    <Fields {...holdGroup(group.id)}>{group.params.map(paramEditor)}</Fields>
                </CollapsibleSection>
            ))}
            {/* The same params, searchable, for finding one without knowing
                which section holds it. */}
            <CollapsibleSection {...sectionProps(ALL_PARAMS_SECTION)}>
                <AdvancedParamSelector />
            </CollapsibleSection>
        </PanelWrapper>
    );
};

const PanelWrapper = styled('div')`
    display: flex;
    flex-direction: column;
    width: 100%;
    padding-bottom: 32px;
`;

const Fields = styled('div')`
    display: flex;
    flex-direction: column;
    gap: 12px;
`;
