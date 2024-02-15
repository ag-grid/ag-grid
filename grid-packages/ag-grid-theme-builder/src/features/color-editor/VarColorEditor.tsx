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
      setValue(new VarColor(editorState.variable.variable, editorState.alpha).toColorValue());
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

const getInitialEditorState = (initialValue: string | number): EditorState | null => {
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
  variableInfo('--ag-accent-color'),
  variableInfo('--ag-advanced-filter-builder-indent-size'),
  variableInfo('--ag-advanced-filter-column-pill-color'),
  variableInfo('--ag-advanced-filter-join-pill-color'),
  variableInfo('--ag-advanced-filter-option-pill-color'),
  variableInfo('--ag-advanced-filter-value-pill-color'),
  variableInfo('--ag-background-color'),
  variableInfo('--ag-border-color'),
  variableInfo('--ag-border-radius'),
  variableInfo('--ag-borders'),
  variableInfo('--ag-borders-critical'),
  variableInfo('--ag-borders-input'),
  variableInfo('--ag-borders-input-invalid'),
  variableInfo('--ag-borders-secondary'),
  variableInfo('--ag-borders-side-button'),
  variableInfo('--ag-card-radius'),
  variableInfo('--ag-card-shadow'),
  variableInfo('--ag-cell-horizontal-border'),
  variableInfo('--ag-cell-horizontal-padding'),
  variableInfo('--ag-cell-widget-spacing'),
  variableInfo('--ag-checkbox-background-color'),
  variableInfo('--ag-checkbox-border-radius'),
  variableInfo('--ag-checkbox-checked-color'),
  variableInfo('--ag-checkbox-indeterminate-color'),
  variableInfo('--ag-checkbox-unchecked-color'),
  variableInfo('--ag-chip-background-color'),
  variableInfo('--ag-chip-border-color'),
  variableInfo('--ag-column-hover-color'),
  variableInfo('--ag-column-select-indent-size'),
  variableInfo('--ag-control-panel-background-color'),
  variableInfo('--ag-data-color'),
  variableInfo('--ag-disabled-foreground-color'),
  variableInfo('--ag-filter-tool-panel-group-indent'),
  variableInfo('--ag-font-family'),
  variableInfo('--ag-font-size'),
  variableInfo('--ag-foreground-color'),
  variableInfo('--ag-grid-size'),
  variableInfo('--ag-header-background-color'),
  variableInfo('--ag-header-cell-hover-background-color'),
  variableInfo('--ag-header-cell-moving-background-color'),
  variableInfo('--ag-header-column-resize-handle-color'),
  variableInfo('--ag-header-column-resize-handle-display'),
  variableInfo('--ag-header-column-resize-handle-height'),
  variableInfo('--ag-header-column-resize-handle-width'),
  variableInfo('--ag-header-column-separator-color'),
  variableInfo('--ag-header-column-separator-display'),
  variableInfo('--ag-header-column-separator-height'),
  variableInfo('--ag-header-column-separator-width'),
  variableInfo('--ag-header-foreground-color'),
  variableInfo('--ag-header-height'),
  variableInfo('--ag-icon-font-color'),
  variableInfo('--ag-icon-font-family'),
  variableInfo('--ag-icon-font-weight'),
  variableInfo('--ag-icon-image-display'),
  variableInfo('--ag-icon-size'),
  variableInfo('--ag-input-border-color'),
  variableInfo('--ag-input-border-color-invalid'),
  variableInfo('--ag-input-disabled-background-color'),
  variableInfo('--ag-input-disabled-border-color'),
  variableInfo('--ag-input-focus-border-color'),
  variableInfo('--ag-input-focus-box-shadow'),
  variableInfo('--ag-invalid-color'),
  variableInfo('--ag-list-item-height'),
  variableInfo('--ag-menu-min-width'),
  variableInfo('--ag-minichart-selected-chart-color'),
  variableInfo('--ag-minichart-selected-page-color'),
  variableInfo('--ag-modal-overlay-background-color'),
  variableInfo('--ag-odd-row-background-color'),
  variableInfo('--ag-popup-shadow'),
  variableInfo('--ag-range-selection-background-color'),
  variableInfo('--ag-range-selection-background-color-2'),
  variableInfo('--ag-range-selection-background-color-3'),
  variableInfo('--ag-range-selection-background-color-4'),
  variableInfo('--ag-range-selection-border-color'),
  variableInfo('--ag-range-selection-border-style'),
  variableInfo('--ag-range-selection-chart-background-color'),
  variableInfo('--ag-range-selection-chart-category-background-color'),
  variableInfo('--ag-range-selection-highlight-color'),
  variableInfo('--ag-row-border-color'),
  variableInfo('--ag-row-border-style'),
  variableInfo('--ag-row-border-width'),
  variableInfo('--ag-row-group-indent-size'),
  variableInfo('--ag-row-height'),
  variableInfo('--ag-row-hover-color'),
  variableInfo('--ag-secondary-border-color'),
  variableInfo('--ag-secondary-foreground-color'),
  variableInfo('--ag-selected-row-background-color'),
  variableInfo('--ag-selected-tab-underline-color'),
  variableInfo('--ag-selected-tab-underline-transition-speed'),
  variableInfo('--ag-selected-tab-underline-width'),
  variableInfo('--ag-set-filter-indent-size'),
  variableInfo('--ag-side-bar-panel-width'),
  variableInfo('--ag-side-button-selected-background-color'),
  variableInfo('--ag-subheader-background-color'),
  variableInfo('--ag-subheader-toolbar-background-color'),
  variableInfo('--ag-tab-min-width'),
  variableInfo('--ag-toggle-button-border-width'),
  variableInfo('--ag-toggle-button-height'),
  variableInfo('--ag-toggle-button-off-background-color'),
  variableInfo('--ag-toggle-button-off-border-color'),
  variableInfo('--ag-toggle-button-on-background-color'),
  variableInfo('--ag-toggle-button-on-border-color'),
  variableInfo('--ag-toggle-button-switch-background-color'),
  variableInfo('--ag-toggle-button-switch-border-color'),
  variableInfo('--ag-toggle-button-width'),
  variableInfo('--ag-tooltip-background-color'),
  variableInfo('--ag-value-change-delta-down-color'),
  variableInfo('--ag-value-change-delta-up-color'),
  variableInfo('--ag-value-change-value-highlight-background-color'),
  variableInfo('--ag-widget-container-horizontal-padding'),
  variableInfo('--ag-widget-container-vertical-padding'),
  variableInfo('--ag-widget-horizontal-spacing'),
  variableInfo('--ag-widget-vertical-spacing'),
  variableInfo('--ag-wrapper-border-radius'),
];
