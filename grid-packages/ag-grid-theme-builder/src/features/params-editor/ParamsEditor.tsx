import { Help } from '@carbon/icons-react';
import {
  Autocomplete,
  AutocompleteOption,
  ListItemContent,
  Stack,
  Tooltip,
  styled,
} from '@mui/joy';
import { useStore } from 'jotai';
import { withErrorBoundary } from '../../components/ErrorBoundary';
import { ParamModel, allParamModels } from '../../model/ParamModel';
import { renderedThemeAtom } from '../../model/rendered-theme';
import { ParamEditor } from './ParamEditor';

const editablePrams = allParamModels()
  .filter((param) => param.meta.type !== 'preset')
  .sort((a, b) => a.label.toLowerCase().localeCompare(b.label.toLowerCase()));

export const ParamsEditor = withErrorBoundary(() => {
  const store = useStore();

  return (
    <Stack>
      <Autocomplete
        size="sm"
        placeholder="Customise a parameter"
        options={editablePrams}
        multiple
        blurOnSelect
        value={[] as ParamModel[]}
        onChange={(_, [newValue]) => {
          if (newValue) {
            // const defaultValue = getComputedStyle(document.body).getPropertyValue(
            //   newValue.variableName,
            // );
            const { paramDefaults } = store.get(renderedThemeAtom);
            store.set(newValue.valueAtom, paramDefaults[newValue.property]);
          }
        }}
        getOptionDisabled={(param) => param.hasValue(store)}
        renderOption={(props, param) => {
          const hasValue = param.hasValue(store);
          return (
            <AutocompleteOption {...props}>
              <AutocompleteItem>
                {param.label}
                {hasValue ? ' (already selected)' : ''}
                <Tooltip title={param.meta.docs}>
                  <HelpIcon />
                </Tooltip>
              </AutocompleteItem>
            </AutocompleteOption>
          );
        }}
      />
      <Table>
        {editablePrams.map((param) => (
          <ParamEditor key={param.property} param={param} />
        ))}
      </Table>
    </Stack>
  );
});

const Table = styled('div')`
  display: grid;
  grid-template-columns: auto 1fr auto;
  grid-column-gap: 16px;
  grid-row-gap: 8px;
  align-items: center;
`;

const AutocompleteItem = styled(ListItemContent)`
  /* font-size: 0.9em; */
  display: flex;
  align-items: center;
  gap: 16px;
`;

const HelpIcon = styled(Help)`
  opacity: 0.5;
`;
