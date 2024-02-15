import { ChevronRight, TableAlias, WarningAltFilled } from '@carbon/icons-react';
import { Card, Checkbox, ListItem, Tooltip, styled } from '@mui/joy';
import { useAtom } from 'jotai';
import { UIDropdownButton } from '../../components/UIDropdownButton';
import { gridConfigBooleanFields } from '../../model/grid-options';
import { titleCase } from '../../model/utils';
import { gridConfigAtom } from './grid-config-atom';

export const GridConfigDropdownButton = () => {
  return (
    <UIDropdownButton dropdownContent={<GridConfigDropdown />} endDecorator={<DropdownIcon />}>
      <TableAlias /> Grid setup
    </UIDropdownButton>
  );
};

const GridConfigDropdown = () => {
  const [gridConfig, setGridConfig] = useAtom(gridConfigAtom);
  const filtersConflict = gridConfig.advancedFilter && gridConfig.filtersToolPanel;

  return (
    <Card>
      {gridConfigBooleanFields.map((property) => {
        const showFiltersWarning = filtersConflict && property === 'filtersToolPanel';
        const item = (
          <ListItem key={property} sx={{ gap: 1 }}>
            <Checkbox
              checked={!!gridConfig[property]}
              onChange={() => setGridConfig({ ...gridConfig, [property]: !gridConfig[property] })}
              label={titleCase(String(property))}
              sx={{
                opacity: showFiltersWarning ? 0.5 : undefined,
              }}
            />
            {showFiltersWarning && <WarningAltFilled color="var(--joy-palette-warning-400)" />}
          </ListItem>
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
    </Card>
  );
};

const DropdownIcon = styled(ChevronRight)`
  zoom: 80%;
`;
