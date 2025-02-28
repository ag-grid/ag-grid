import { Checkmark, ChevronDown } from '@carbon/icons-react';
import { paramValueToCss } from '@components/theme-builder/api';
import { ParamModel, useParamAtom } from '@components/theme-builder/model/ParamModel';
import { useRenderedTheme } from '@components/theme-builder/model/rendered-theme';
import type { ThemeParam } from '@components/theme-builder/model/utils';
import styled from '@emotion/styled';
import * as RadixDropdown from '@radix-ui/react-dropdown-menu';

import { getThemeDefaultParams } from '../component-utils';
import { withErrorBoundary } from '../general/ErrorBoundary';
import { FormField } from './FormField';
import { SharedContent, SharedIndicator, SharedItem, SharedTrigger } from './dropdown-shared';

const borders: [ThemeParam, string][] = [
    ['wrapperBorder', 'Around grid'],
    ['rowBorder', 'Between rows'],
    ['columnBorder', 'Between columns'],
    ['headerRowBorder', 'Below header'],
];

export const BordersEditor = withErrorBoundary(() => {
    const params = getThemeDefaultParams(useRenderedTheme());
    const selectedBorders = borders.filter(([param]) => borderEnabled(param, params[param])).map(([, label]) => label);

    return (
        <FormField label="Borders">
            <RadixDropdown.Root>
                <StyledTrigger>
                    {getSelectedBordersLabel(selectedBorders)} <StyledChevronDown />
                </StyledTrigger>

                <RadixDropdown.Portal>
                    <StyledContent align="start" sideOffset={3}>
                        {borders.map(([param, label]) => (
                            <BorderItem key={param} param={param} label={label} />
                        ))}
                    </StyledContent>
                </RadixDropdown.Portal>
            </RadixDropdown.Root>
        </FormField>
    );
});

const borderEnabled = (paramName: string, border: unknown): boolean => {
    if (!border) return false;
    const css = paramValueToCss(paramName, border);
    return !!(css && css !== 'none' && !css.includes('transparent'));
};

type BorderProps = {
    param: ThemeParam;
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
        const params = getThemeDefaultParams(theme);
        if (param.property in params) {
            editorValue = params[param.property];
        } else {
            throw new Error(`ThemeParam "${param.property}" does not exist.`);
        }
    }

    const checked = borderEnabled(props.param, editorValue);

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

const StyledTrigger = SharedTrigger.withComponent(RadixDropdown.Trigger);
const StyledContent = SharedContent.withComponent(RadixDropdown.Content);
const StyledItem = SharedItem.withComponent(RadixDropdown.CheckboxItem);
const StyledIndicator = SharedIndicator.withComponent(RadixDropdown.ItemIndicator);

const StyledChevronDown = styled(ChevronDown)`
    opacity: 0.5;
    height: 16px;
    width: 16px;
`;
