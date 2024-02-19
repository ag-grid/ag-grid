import { Help } from '@carbon/icons-react';
import { Checkbox, Option, Select, Slider, Tooltip, styled } from '@mui/joy';
import { ReactElement } from 'react';
import { cssBorderStyles } from '../../ag-grid-community-themes/metadata';
import { withErrorBoundary } from '../../components/ErrorBoundary';
import { Cell } from '../../components/Table';
import { ParamModel, allParamModels, useParamAtom } from '../../model/ParamModel';
import { ColorParamEditor } from './ColorParamEditor';

export const ParamsEditor = withErrorBoundary(() => (
  <Table>
    {allParamModels()
      .filter((param) => param.meta.type !== 'preset')
      .map((param) => (
        <ParamEditor key={param.property} param={param} />
      ))}
  </Table>
));

export type ParamEditorProps = {
  param: ParamModel;
};

export const ParamEditor = ({ param }: ParamEditorProps) => {
  const [value, setValue] = useParamAtom(param);

  if (value == null) return null;

  const renderEditor = (): ReactElement => {
    const { meta } = param;
    switch (meta.type) {
      case 'color':
        return <ColorParamEditor param={param} meta={meta} />;
      case 'length':
        return (
          <Slider
            value={value || null}
            min={meta.min}
            max={meta.max}
            step={meta.step}
            onChange={(_, newValue) => setValue(newValue)}
            valueLabelDisplay="auto"
            valueLabelFormat={(value) => formatRoundedToStep(value, meta.step) + 'px'}
            sx={{ '--Slider-size': '15px' }}
          />
        );
      case 'boolean':
        return <Checkbox checked={!!value} onChange={() => setValue(!value)} />;
      case 'borderStyle':
        return (
          <Select value={value || null} onChange={(_, newValue) => setValue(newValue)}>
            {cssBorderStyles.map((borderStyle) => (
              <Option key={borderStyle} value={borderStyle}>
                {borderStyle}
              </Option>
            ))}
          </Select>
        );
      case 'preset':
        // presets don't have param editors, they're handled by part editors
        return <span />;
      case 'css':
        return <span>TODO</span>;
    }
  };

  return (
    <>
      <LabelCell>{param.label}:</LabelCell>
      {renderEditor()}
      <Tooltip title={param.meta.docs}>
        <HelpIcon />
      </Tooltip>
    </>
  );
};

const formatRoundedToStep = (value: number, step: number): string =>
  (Math.round(value / step) * step).toFixed(5).replace(/\.?0+$/, '');

export const Table = styled('div')`
  display: grid;
  grid-template-columns: auto 1fr auto;
  grid-column-gap: 16px;
  grid-row-gap: 8px;
  align-items: center;
`;

export const Label = styled('div')`
  display: flex;
  align-items: center;
`;

export const HelpIcon = styled(Help)`
  display: flex;
  align-items: center;
  opacity: 0.5;
`;

export const LabelCell = styled(Cell)`
  font-size: 0.9em;
`;
