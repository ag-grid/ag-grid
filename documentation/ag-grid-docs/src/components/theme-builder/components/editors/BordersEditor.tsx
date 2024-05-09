import { Checkmark, ChevronDown } from '@carbon/icons-react';
import { ParamModel, useParamAtom } from '@components/theme-builder/model/ParamModel';
import { useRenderedTheme } from '@components/theme-builder/model/rendered-theme';
import styled from '@emotion/styled';
import * as RadixDropdown from '@radix-ui/react-dropdown-menu';

import { paramValueToCss } from '../../../../../../../community-modules/theming/src/theme-types';
import { withErrorBoundary } from '../general/ErrorBoundary';
import { FormField } from './FormField';
import { SharedContent, SharedIndicator, SharedItem, SharedTrigger } from './dropdown-shared';

const borders = {
    wrapperBorder: 'Around grid',
    rowBorder: 'Between rows',
    columnBorder: 'Between columns',
    sidePanelBorder: 'Around side panel',
};

export const BordersEditor = withErrorBoundary(() => {
    const theme = useRenderedTheme();
    const selectedBorders = Object.entries(borders)
        .filter(([param]) => borderIsEnabled(param, theme.getRenderedParams()[param]))
        .map(([, label]) => label);

    return (
        <FormField label="Borders">
            <RadixDropdown.Root>
                <StyledTrigger>
                    {getSelectedBordersLabel(selectedBorders)} <StyledChevronDown />
                </StyledTrigger>

                <RadixDropdown.Portal>
                    <StyledContent align="start" sideOffset={3}>
                        {Object.entries(borders).map(([param, label]) => (
                            <BorderItem key={param} param={param} label={label} />
                        ))}
                    </StyledContent>
                </RadixDropdown.Portal>
            </RadixDropdown.Root>
        </FormField>
    );
});

type BorderProps = {
    param: string;
    label: string;
};

const getSelectedBordersLabel = (selectedBorders: string[]) => {
    const [first, ...rest] = selectedBorders;
    if (!first) return 'None';
    if (!rest.length) return `${first} only`;
    return `${first} +${rest.length} more`;
};

const BorderItem = (props: BorderProps) => {
    const param = ParamModel.for(props.param);
    const [value, setValue] = useParamAtom(param);

    const theme = useRenderedTheme();
    let editorValue = value;
    if (editorValue == null) {
        const params = theme.getRenderedParams();
        if (param.property in params) {
            editorValue = params[param.property];
        } else {
            throw new Error(`Param "${param.property}" does not exist.`);
        }
    }

    const checked = borderIsEnabled(props.param, editorValue);

    return (
        <StyledItem
            checked={checked}
            onCheckedChange={(newChecked) => {
                setValue(newChecked);
            }}
            onSelect={(e) => e.preventDefault()}
        >
            {props.label}
            <StyledIndicator>
                <Checkmark />
            </StyledIndicator>
        </StyledItem>
    );
};

const borderIsEnabled = (param: string, value: string) =>
    typeof value === 'boolean' ? value : paramValueToCss(param, false) !== value;

const StyledTrigger = SharedTrigger.withComponent(RadixDropdown.Trigger);
const StyledContent = SharedContent.withComponent(RadixDropdown.Content);
const StyledItem = SharedItem.withComponent(RadixDropdown.CheckboxItem);
const StyledIndicator = SharedIndicator.withComponent(RadixDropdown.ItemIndicator);

const StyledChevronDown = styled(ChevronDown)`
    opacity: 0.5;
    height: 16px;
    width: 16px;
`;
