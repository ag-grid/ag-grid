import { Information } from '@carbon/icons-react';
import {
  Autocomplete,
  AutocompleteOption,
  Box,
  Button,
  List,
  ListItem,
  Slider,
  Stack,
  Tooltip,
  Typography,
  styled,
} from '@mui/joy';
import { useEffect, useState } from 'react';
import { Cell, TwoColumnTable } from '../../components/Table';
import { useChangeHandler } from '../../components/component-utils';
import { allParamModels } from '../../model/ParamModel';
import { singleOrFirst, titleCase } from '../../model/utils';
import { ColorSwatch } from './ColorSwatch';
import { RGBAColor } from './RGBAColor';
import { VarColor } from './VarColor';
import { UncontrolledColorEditorProps, formatProportionAs3dpPercent } from './color-editor-utils';

export const VarColorEditor = ({ initialValue, onChange }: UncontrolledColorEditorProps) => {
  const [value, setValue] = useState(() => initialValue);
  const [editorState, setEditorState] = useState(() => getInitialEditorState(initialValue));
  const enableChangeEvents = useChangeHandler(value, onChange, true);

  useEffect(() => {
    if (editorState) {
      setValue(new VarColor(editorState.variable.variable, editorState.alpha).toCSSFunction());
    }
  }, [editorState]);

  if (!editorState) {
    return (
      <Stack>
        <Typography level="body-sm">
          Specify colours as semi-transparent versions of other colours
          <InfoTooltip />
        </Typography>
        <Button
          onClick={() => {
            enableChangeEvents();
            const rgba = RGBAColor.reinterpretCss(value);
            setEditorState({
              alpha: rgba?.a ?? 1,
              variable: allVariableInfos[0],
            });
          }}
          variant="soft"
        >
          Enable % colours
        </Button>
      </Stack>
    );
  }

  const feedback =
    titleCase(formatVariable(editorState.variable.variable)) +
    ' with ' +
    formatProportionAs3dpPercent(editorState.alpha) +
    ' alpha';

  return (
    <Stack>
      <ColorSwatch color={value} splitBackground />
      <Box>
        {feedback}
        <InfoTooltip />
      </Box>
      <TwoColumnTable rowGap={1}>
        <Cell>Color</Cell>
        <Autocomplete
          options={allVariableInfos}
          value={editorState.variable}
          onChange={(_, variable) => {
            enableChangeEvents();
            if (variable) {
              setEditorState({ ...editorState, variable });
            }
          }}
          placeholder="Choose a color"
          getOptionLabel={({ label }) => label}
          getOptionKey={({ id }) => id}
          groupBy={({ group }) => group}
          renderOption={(props, option) => (
            <AutocompleteOption {...props}>
              <VariableOption variable={option.variable} />
            </AutocompleteOption>
          )}
          slotProps={{ listbox: { sx: { minWidth: '400px' } } }}
        />
        <Cell>Alpha</Cell>
        <Slider
          value={editorState.alpha}
          min={0}
          max={1}
          step={0.001}
          size="sm"
          onChange={(_, newAlpha) => {
            enableChangeEvents();
            setEditorState({ ...editorState, alpha: singleOrFirst(newAlpha) });
          }}
          valueLabelDisplay="auto"
          sx={{ '--Slider-size': '15px' }}
          valueLabelFormat={formatProportionAs3dpPercent}
        />
      </TwoColumnTable>
    </Stack>
  );
};

const InformationIcon = styled(Information)`
  color: var(--joy-palette-primary-400);
  vertical-align: middle;
  display: inline-block;
  margin-left: 8px;
`;

type EditorState = {
  variable: VariableInfo;
  alpha: number;
};

const getInitialEditorState = (initialValue: string): EditorState | null => {
  const color = VarColor.parseCss(initialValue);
  if (!color) return null;
  const info = allVariableInfos.find((v) => v.variable === color.variable);
  if (!info) return null;
  return {
    variable: info,
    alpha: color.alpha,
  };
};

const formatVariable = (variable: string) =>
  titleCase(variable.replace(/^--ag-/i, '').replace(/-color/i, ''));

const VariableOption = ({ variable }: { variable: string }) => {
  return (
    <Stack direction="row" alignItems="center">
      <VarColorSwatch color={`var(${variable})`} />
      <Stack gap={0}>
        {formatVariable(variable)}
        <VariableNameHint>var({variable})</VariableNameHint>
      </Stack>
    </Stack>
  );
};

const VariableNameHint = styled('span')`
  font-size: 0.8em;
  color: var(--joy-palette-neutral-400);
`;

const VarColorSwatch = styled(ColorSwatch)`
  width: 40px;
  height: 40px;
  border-radius: 6px;
`;

const InfoTooltip = () => (
  <Tooltip
    title={
      <InfoBox padding={1}>
        Tips:
        <InfoList marker="disc">
          <InfoListItem>
            Specify related colours as semi-transparent versions of each other where possible
          </InfoListItem>
          <InfoListItem>
            Use a semi-transparent version of the foreground colour for elements that require a
            neutral colour such as borders
          </InfoListItem>
        </InfoList>
        This makes your theme more maintainable and ensures that colors look good against any
        background, even if the background is changed later.
      </InfoBox>
    }
  >
    <InformationIcon />
  </Tooltip>
);

const InfoBox = styled(Box)`
  color: inherit;
  font-size: inherit;
  margin: 0;
  line-height: inherit;
`;

const InfoList = styled(List)`
  color: inherit;
  font-size: inherit;
  line-height: inherit;
  margin: 0;
`;

const InfoListItem = styled(ListItem)`
  color: inherit;
  font-size: inherit;
  line-height: inherit;
  margin: 0;
`;

type VariableInfo = {
  variable: string;
  id: string;
  label: string;
  group: string;
};

const variableInfo = (name: string, common?: boolean): VariableInfo => ({
  variable: name,
  id: common ? `common/${name}` : name,
  label: formatVariable(name),
  group: common ? 'Common variables' : 'All variables',
});

// TODO this list should be computed from the variables actually defined by the application
const allVariableInfos: VariableInfo[] = [
  variableInfo('--ag-foreground-color', true),
  variableInfo('--ag-background-color', true),
  variableInfo('--ag-accent-color', true),
  ...allParamModels()
    .filter((param) => param.meta.type === 'color')
    .map((param) => variableInfo(param.variableName)),
];
