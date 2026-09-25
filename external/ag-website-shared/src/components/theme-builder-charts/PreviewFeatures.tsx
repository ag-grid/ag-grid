import { Checkbox } from '@ag-website-shared/components/theme-builder/Checkbox';
import { UIPopupButton } from '@ag-website-shared/components/theme-builder/UIPopupButton';
import styled from '@emotion/styled';

import {
    CHART_FEATURES,
    type ChartFeatureId,
    type ChartFeatures,
    isFeatureActive,
    isFeatureEnabled,
} from './chartFeatures';

interface Props {
    /** Which of the two previews these features belong to, for screen readers. */
    paneLabel: string;
    /** The features this pane's chart type can show; anything else is left out. */
    available: ChartFeatureId[];
    features: ChartFeatures;
    onChange: (features: ChartFeatures) => void;
}

/**
 * The chart's own UI, switched on and off. A grid draws its header, menus and
 * status bar unasked, where a chart draws only its series - so three of the
 * editor panel's groups reach the screen through this or not at all. Lists only
 * what the pane's chart type supports, a dead checkbox being worse than none.
 */
export const PreviewFeatures = ({ paneLabel, available, features, onChange }: Props) => {
    const shown = CHART_FEATURES.filter(({ id }) => available.includes(id));
    if (shown.length === 0) return null;

    return (
        <UIPopupButton
            allowedPlacements={['bottom-start', 'top-start']}
            dropdownContent={
                <Container>
                    {shown.map(({ id, label, hint, requires }) => {
                        // Held off rather than unticked, so switching the
                        // requirement back on returns what the user had chosen.
                        const heldOffBy = requires && !isFeatureActive(features, requires) ? requires : undefined;
                        const requirement = heldOffBy && CHART_FEATURES.find(({ id: other }) => other === heldOffBy);
                        return (
                            <Checkbox
                                key={id}
                                checked={isFeatureEnabled(features, id) && !heldOffBy}
                                disabled={heldOffBy != null}
                                onChange={(checked) => onChange({ ...features, [id]: checked })}
                            >
                                <Item>
                                    {label}
                                    <Hint>{requirement ? `Needs ${requirement.label}` : hint}</Hint>
                                </Item>
                            </Checkbox>
                        );
                    })}
                </Container>
            }
        >
            {featuresIcon} Features
            <VisuallyHidden>{` for the ${paneLabel.toLowerCase()} preview`}</VisuallyHidden>
        </UIPopupButton>
    );
};

const Container = styled('div')`
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 320px;
`;

// The checkbox aligns to the middle of the label, so the hint sits under the
// name rather than pushing the box down beside two lines of text.
const Item = styled('span')`
    display: flex;
    flex-direction: column;
    gap: 2px;
`;

const Hint = styled('span')`
    color: var(--color-fg-secondary);
    font-size: var(--text-fs-xs);
    line-height: 1.35;
`;

const VisuallyHidden = styled('span')`
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
`;

// Sliders, the same shape grid's Grid Features button uses for the same job.
const featuresIcon = (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" d="M2 4.5h3m2 0h7M2 11.5h7m2 0h3" />
        <circle cx="6" cy="4.5" r="1.75" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="10" cy="11.5" r="1.75" stroke="currentColor" strokeWidth="1.5" />
    </svg>
);
