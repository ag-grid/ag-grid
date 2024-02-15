/*

TODO restore ad all params editor

import { Help } from '@carbon/icons-react';
import { Tooltip, styled } from '@mui/joy';
import { useAtom } from 'jotai';
import { Fragment, useRef } from 'react';
import { Cell } from '../../components/Table';
import { titleCase } from '../../model/utils';

export type ParamsEditorProps = {
  partId: PartId;
};

export const ParamsEditor = ({ partId }: ParamsEditorProps) => {
  const [valueOrPreset, setValue] = useAtom(getPartAtom(partId));
  const { params } = getPart(partId);

  const lastObjectValue = useRef<AnyPartParams>();
  if (valueOrPreset && typeof valueOrPreset === 'object') {
    lastObjectValue.current = valueOrPreset;
  }
  const value = lastObjectValue.current;

  if (!value) return null;

  return (
    <Table>
      {params.map((param) => {
        const { property } = param;
        return (
          <Fragment key={property}>
            <LabelCell>{titleCase(property)}:</LabelCell>
            {((): ReactElement => {
              const paramValue = value[property];
              switch (param.type) {
                case 'color':
                  return (
                    <ColorEditor
                      value={paramValue}
                      onChange={(newValue) => setValue({ ...value, [property]: newValue })}
                      preventTransparency={param.preventTransparency}
                      preventVariables={param.preventVariables}
                    />
                  );
                case 'number':
                  return (
                    <Slider
                      value={paramValue}
                      min={param.min}
                      max={param.max}
                      step={param.step}
                      onChange={(_, newValue) =>
                        setValue({ ...value, [property]: singleOrFirst(newValue) })
                      }
                      valueLabelDisplay="auto"
                      valueLabelFormat={(value) =>
                        formatRoundedToStep(value, param.step) + param.unit
                      }
                      sx={{ '--Slider-size': '15px' }}
                    />
                  );
                case 'boolean':
                  return (
                    <Checkbox
                      checked={!!paramValue}
                      onChange={() => setValue({ ...value, [property]: !paramValue })}
                    />
                  );
                case 'borderStyle':
                  return (
                    <Select
                      value={paramValue}
                      onChange={(_, newValue) => setValue({ ...value, [property]: newValue })}
                    >
                      {cssBorderStyles.map((borderStyle) => (
                        <Option key={borderStyle} value={borderStyle}>
                          {borderStyle}
                        </Option>
                      ))}
                    </Select>
                  );
              }
            })()} }
            <Tooltip title={param.docs}>
              <HelpIcon />
            </Tooltip>
          </Fragment>
        );
      })}
    </Table>
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
*/
