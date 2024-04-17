import { WarningAltFilled } from '@carbon/icons-react';
import styled from '@emotion/styled';

import { gridConfigBooleanFields } from './grid-options';
import { titleCase } from '../../model/utils';
import { Checkbox } from '../general/Checkbox';
import { Tooltip } from '../general/Tooltip';
import { UIPopupButton } from '../general/UIPopupButton';
import { useGridConfigAtom } from './grid-config-atom';

export const GridConfigDropdownButton = () => {
    return (
        <UIPopupButton dropdownContent={<GridConfigDropdown />}>
            {configIcon}
        </UIPopupButton>
    );
};

const GridConfigDropdown = () => {
    const [gridConfig, setGridConfig] = useGridConfigAtom();
    const filtersConflict = gridConfig.advancedFilter && gridConfig.filtersToolPanel;

    return (
        <Container>
            {gridConfigBooleanFields.toSorted().map((property) => {
                const showFiltersWarning = filtersConflict && property === 'filtersToolPanel';
                const item = (
                    <Checkbox
                        key={property}
                        checked={!!gridConfig[property]}
                        onChange={() => setGridConfig({ ...gridConfig, [property]: !gridConfig[property] })}
                    >
                        <Label className={showFiltersWarning ? 'has-warning' : undefined}>
                            {titleCase(String(property))}
                        </Label>
                        {showFiltersWarning && <WarningAltFilled color="var(--color-warning-500)" />}
                    </Checkbox>
                );
                return showFiltersWarning ? (
                    <Tooltip
                        key={property}
                        title="Advanced Filter does not work with Filters Tool Panel. Filters Tool Panel has been disabled."
                    >
                        {item}
                    </Tooltip>
                ) : (
                    item
                );
            })}
        </Container>
    );
};
const configIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none">
        <path
            fill="currentColor"
            fillRule="evenodd"
            d="M12.003 2.667h-4v14.666h4V2.667Zm1.333 0v14.666h3.333a.667.667 0 0 0 .667-.666V3.333a.667.667 0 0 0-.667-.666h-3.333Zm-10 0h3.333v14.666H3.336a.667.667 0 0 1-.667-.666V3.333c0-.368.299-.666.667-.666Zm0-1.334a2 2 0 0 0-2 2v13.334a2 2 0 0 0 2 2h13.333a2 2 0 0 0 2-2V3.333a2 2 0 0 0-2-2H3.336Z"
            clipRule="evenodd"
        />
    </svg>
);

const Container = styled('div')`
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

const Label = styled('span')`
    &.has-warning {
        opacity: 0.5;
    }
`;
