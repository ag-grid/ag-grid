import { CollapsibleSection } from '@ag-website-shared/components/theme-builder/CollapsibleSection';
import { ParamEditor } from '@ag-website-shared/components/theme-builder/ParamEditor';
import {
    horizontalSpacingIcon,
    radiusIcon,
    verticalSpacingIcon,
} from '@ag-website-shared/components/theme-builder/icons';
import { useApplicationConfigAtom } from '@ag-website-shared/theming/application-config';
import styled from '@emotion/styled';
import type { ReactNode } from 'react';

import { AdvancedParamSelector } from './AdvancedParamSelector';
import { type LengthIcon, PARAM_GROUPS, type StudioParamConfig } from './params';

const ADVANCED_SECTION = 'All Parameters';
const DEFAULT_OPEN_SECTIONS = ['General', 'All Parameters'];

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

const paramEditor = (param: StudioParamConfig) => (
    <ParamEditor
        key={param.key}
        param={param.key}
        label={param.label}
        icon={iconFor(param.icon)}
        swipeAdjustmentDivisor={param.swipeAdjustmentDivisor}
        min={param.min}
        max={param.max}
    />
);

// Render a group's params, pairing an `inlineWithNext` param with its successor
// on one row (used for font + size pairs).
const renderParams = (params: StudioParamConfig[]): ReactNode[] => {
    const rows: ReactNode[] = [];
    for (let i = 0; i < params.length; ++i) {
        const param = params[i];
        const next = params[i + 1];
        if (param.inlineWithNext && next) {
            rows.push(
                <LeftBiasRow key={param.key}>
                    {paramEditor(param)}
                    {paramEditor(next)}
                </LeftBiasRow>
            );
            ++i;
        } else {
            rows.push(paramEditor(param));
        }
    }
    return rows;
};

export const EditorPanel = () => {
    const [expanded, setExpanded] = useApplicationConfigAtom('expandedEditors');
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

    return (
        <PanelWrapper>
            {PARAM_GROUPS.map((group) => (
                <CollapsibleSection key={group.id} {...sectionProps(group.label)}>
                    {renderParams(group.params)}
                </CollapsibleSection>
            ))}
            <CollapsibleSection {...sectionProps(ADVANCED_SECTION)}>
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

const LeftBiasRow = styled('div')`
    display: flex;
    gap: 12px;
    > :nth-of-type(1) {
        flex: 2;
    }
    > :nth-of-type(2) {
        flex: 1;
    }
`;
