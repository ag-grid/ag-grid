import { CollapsibleSection } from '@ag-website-shared/components/theme-builder/CollapsibleSection';
import { ParamEditor } from '@ag-website-shared/components/theme-builder/ParamEditor';
import { PartEditor } from '@ag-website-shared/components/theme-builder/PartEditor';
import {
    horizontalSpacingIcon,
    radiusIcon,
    verticalSpacingIcon,
} from '@ag-website-shared/components/theme-builder/icons';
import { useApplicationConfigAtom } from '@ag-website-shared/theming/application-config';
import styled from '@emotion/styled';

import { AdvancedParamSelector } from './AdvancedParamSelector';
import { BordersEditor } from './BordersEditor';

const DEFAULT_OPEN_SECTIONS = ['General', 'All Parameters'];

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
            <div className="pageHeading">
                <h1 className="pageTitle">Theme Builder </h1>
            </div>
            <CollapsibleSection {...sectionProps('General')}>
                <LeftBiasRow>
                    <ParamEditor param="fontFamily" />
                    <ParamEditor param="fontSize" />
                </LeftBiasRow>
                <ParamEditor param="backgroundColor" />
                <ParamEditor param="foregroundColor" />
                <ParamEditor param="accentColor" showDocs />
            </CollapsibleSection>
            <CollapsibleSection {...sectionProps('Borders & spacing')}>
                <ParamEditor param="borderColor" />
                <BordersEditor />
                <ParamEditor param="spacing" showDocs icon={verticalSpacingIcon} />
                <EvenSplitRow>
                    <ParamEditor
                        param="wrapperBorderRadius"
                        label="Wrapper radius"
                        showDocs
                        icon={radiusIcon}
                        swipeAdjustmentDivisor={20}
                    />
                    <ParamEditor
                        param="borderRadius"
                        label="Widget radius"
                        showDocs
                        icon={radiusIcon}
                        swipeAdjustmentDivisor={20}
                    />
                </EvenSplitRow>
            </CollapsibleSection>
            <CollapsibleSection {...sectionProps('Header')}>
                <ParamEditor param="headerBackgroundColor" label="Background color" />
                <ParamEditor param="headerTextColor" label="Text color" />
                <LeftBiasRow>
                    <ParamEditor param="headerFontFamily" label="Font family" />
                    <ParamEditor param="headerFontSize" label="Font size" />
                </LeftBiasRow>
                <ParamEditor param="headerFontWeight" label="Font weight" />
                <ParamEditor
                    param="headerVerticalPaddingScale"
                    label="Adjust vertical padding"
                    icon={verticalSpacingIcon}
                />
            </CollapsibleSection>
            <CollapsibleSection {...sectionProps('Cells')}>
                <ParamEditor param="cellTextColor" label="Text color" />
                <ParamEditor param="oddRowBackgroundColor" label="Odd row background" />
                <ParamEditor
                    param="rowVerticalPaddingScale"
                    label="Adjust vertical padding"
                    icon={verticalSpacingIcon}
                />
                <ParamEditor
                    param="cellHorizontalPaddingScale"
                    label="Adjust horizontal padding"
                    icon={horizontalSpacingIcon}
                />
            </CollapsibleSection>
            <CollapsibleSection {...sectionProps('Icons')}>
                <PartEditor featureName="iconSet" />
                <ParamEditor param="iconSize" label="Size" />
            </CollapsibleSection>
            <CollapsibleSection {...sectionProps('All Parameters')}>
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

    .iconDoc {
        margin-left: 8px;
        color: var(--color-fg-quinary);
        font-size: var(--text-fs-sm);
        transition: all 0.3s ease;
        &:hover {
            color: var(--color-fg-primary);
            transition: all 0.3s ease;
            opacity: 0.7;
        }
    }

    .pageHeading {
        display: flex;
        margin-bottom: 8px;
        align-items: center;
        position: sticky;
        padding-bottom: 8px;
        top: 0px;
        background: linear-gradient(var(--color-bg-primary) 65%, rgba(255, 255, 255, 0));
        z-index: 1;
    }

    .pageTitle {
        color: var(--color-fg-secondary);
        font-weight: var(--text-semibold);
        font-size: var(--text-fs-base);
        padding-left: 6px;
        margin-bottom: 0;
    }

    .pageDescription {
        color: var(--color-text-secondary);
        font-size: var(--text-fs-sm);
        opacity: 0.7;
        padding-left: 4px;
    }
`;

const EvenSplitRow = styled('div')`
    display: flex;
    gap: 12px;
    > * {
        flex: 1;
    }
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
