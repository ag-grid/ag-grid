import { Divider, Input, Slider, Stack, styled } from '@mui/joy';
import { useEffect, useRef, useState } from 'react';
import { Cell, TwoColumnTable } from '../../components/Table';
import { useChangeHandler } from '../../components/component-utils';
import { logErrorMessage, singleOrFirst } from '../../model/utils';
import { ColorSwatch } from './ColorSwatch';
import { HSLAColor } from './HSLAColor';
import { RGBAColor } from './RGBAColor';
import {
  UncontrolledColorEditorProps,
  format3dp,
  formatProportionAs3dpPercent,
  formatProportionAsDegrees,
  formatProportionAsPercent,
} from './color-editor-utils';

export const InputColorEditor = ({
  initialValue,
  onChange,
  preventTransparency,
}: UncontrolledColorEditorProps) => {
  const [value, setValue] = useState(initialValue);
  const [editorValue, setEditorValue] = useState(() => getInitialEditorValue(value));
  const [valid, setValid] = useState(!!editorValue);
  const [sliderValues, setSliderValues] = useState(() => getInitialSliderValues(value));
  const lastManuallyEnteredValue = useRef('');
  const enableChangeEvents = useChangeHandler(value, onChange, true);

  const handleColorPartChange = (newValue: number, part: keyof SliderValues) => {
    const newValues = { ...sliderValues, [part]: newValue };
    const editorColorMode = getColorMode(editorValue);
    let newEditorValue: string;
    if ('rgb'.includes(part) || (part === 'a' && editorColorMode === 'rgb')) {
      newEditorValue = RGBAColor.fromRGBA(newValues).toCSSFunction();
      const { h, s, l } = HSLAColor.fromRGBA(newValues);
      newValues.h = h;
      newValues.s = s;
      newValues.l = l;
    } else if ('hsl'.includes(part) || (part === 'a' && editorColorMode === 'hsl')) {
      newEditorValue = HSLAColor.fromHSLA(newValues).toCSSFunction();
      const { r, g, b } = getInitialSliderValues(newEditorValue);
      newValues.r = r;
      newValues.g = g;
      newValues.b = b;
    } else if (part === 'a') {
      newEditorValue = RGBAColor.fromRGBA(newValues).toCSSHex();
    } else {
      logErrorMessage(`Unexpected color part "${part}"`);
      return;
    }
    setSliderValues(newValues);
    setEditorValue(newEditorValue);
    enableChangeEvents();
  };

  const handleEditorValueChange = (newValue: string) => {
    lastManuallyEnteredValue.current = newValue;
    setEditorValue(newValue);
    enableChangeEvents();
  };

  useEffect(() => {
    let enteredValue = editorValue.trim();
    if (/^[0-9a-e]+$/i.test(enteredValue)) {
      enteredValue = '#' + enteredValue; // allow user to enter hex values without hash
    }
    const color = RGBAColor.reinterpretCss(enteredValue);
    if (color) {
      if (editableColorRegex.test(enteredValue)) {
        setValue(enteredValue);
      } else {
        setValue(color.toCSSHex());
      }
      if (enteredValue === lastManuallyEnteredValue.current) {
        // if the value was typed into the editor, update all sliders
        const newColorParts = getInitialSliderValues(enteredValue);
        setSliderValues(newColorParts);
      }
      setValid(true);
    } else {
      setValid(false);
    }
  }, [editorValue]);

  return (
    <Stack gap={2}>
      <ColorSwatch color={value} splitBackground />
      <TwoColumnTable>
        <Cell>CSS</Cell>
        <Input
          value={editorValue}
          placeholder="e.g. #ff00aa, rgb(255,0,170))"
          onChange={(e) => handleEditorValueChange(e.target.value)}
          onBlur={() => {
            handleEditorValueChange(getInitialEditorValue(value));
          }}
          error={!valid}
        />
        <SpanningDivider />

        {!preventTransparency && (
          <>
            <Cell>Alpha</Cell>
            <ColorPartSlider
              value={sliderValues}
              onChange={handleColorPartChange}
              part="a"
              valueLabelFormat={formatProportionAs3dpPercent}
            />
            <SpanningDivider />
          </>
        )}

        <Cell>R</Cell>
        <ColorPartSlider
          value={sliderValues}
          onChange={handleColorPartChange}
          part="r"
          valueLabelFormat={format3dp}
        />
        <Cell>G</Cell>
        <ColorPartSlider
          value={sliderValues}
          onChange={handleColorPartChange}
          part="g"
          valueLabelFormat={format3dp}
        />
        <Cell>B</Cell>
        <ColorPartSlider
          value={sliderValues}
          onChange={handleColorPartChange}
          part="b"
          valueLabelFormat={format3dp}
        />
        <SpanningDivider />
        <Cell>H</Cell>
        <ColorPartSlider
          value={sliderValues}
          onChange={handleColorPartChange}
          part="h"
          valueLabelFormat={formatProportionAsDegrees}
        />
        <Cell>S</Cell>
        <ColorPartSlider
          value={sliderValues}
          onChange={handleColorPartChange}
          part="s"
          valueLabelFormat={formatProportionAsPercent}
        />
        <Cell>L</Cell>
        <ColorPartSlider
          value={sliderValues}
          onChange={handleColorPartChange}
          part="l"
          valueLabelFormat={formatProportionAsPercent}
        />
      </TwoColumnTable>
    </Stack>
  );
};

const editableColorRegex = /(^rgba?\()|(^hsla?\()|(^[a-z]+$)/;

const getInitialEditorValue = (value: string): string => {
  if (editableColorRegex.test(value)) return value;
  const rgba = RGBAColor.reinterpretCss(value);
  if (!rgba) return '';
  if (rgba.a === 0) return 'transparent';
  return rgba.toCSSHex();
};

const getColorMode = (css: string): 'rgb' | 'hsl' | null => {
  if (/^(rgb|color\(srgb)/i.test(css)) return 'rgb';
  if (/^hsl/i.test(css)) return 'hsl';
  return null;
};

const SpanningDivider = styled(Divider)`
  grid-column-end: span 2;
  margin: 8px 0;
`;

type SliderValues = {
  r: number;
  g: number;
  b: number;
  h: number;
  s: number;
  l: number;
  a: number;
};

const getInitialSliderValues = (color: string): SliderValues => {
  const rgba = RGBAColor.reinterpretCss(color);
  if (!rgba) return { r: 0, g: 0, b: 0, a: 1, h: 0, s: 0, l: 0 };
  const { r, g, b, a } = rgba;
  const { h, s, l } = HSLAColor.fromRGBA(rgba);
  return { r, g, b, a, h, s, l };
};

const ColorPartSlider = ({
  value,
  part,
  onChange,
  valueLabelFormat,
}: {
  value: SliderValues;
  onChange: (newValue: number, part: keyof SliderValues) => void;
  part: keyof SliderValues;
  valueLabelFormat?: (n: number) => string;
}) => (
  <Slider
    value={value[part]}
    min={0}
    max={1}
    step={0.001}
    size="sm"
    onChange={(_, newValue) => onChange(singleOrFirst(newValue), part)}
    valueLabelDisplay="auto"
    sx={{ '--Slider-size': '15px' }}
    valueLabelFormat={valueLabelFormat}
  />
);
