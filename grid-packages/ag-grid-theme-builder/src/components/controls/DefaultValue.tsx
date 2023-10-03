import styled from '@emotion/styled';
import { Value, valueToCss } from 'model/values';
import { colorIsDarkish } from 'model/values/color';

export type DefaultValueProps = {
  value: Value | null;
};

export const DefaultValue = ({ value }: DefaultValueProps) => {
  if (!value) {
    return <NoDefault />;
  }

  if (value.type === 'color') {
    return (
      <ColorSwatchBackground>
        <ColorSwatch
          style={{ backgroundColor: value.hex }}
          className={colorIsDarkish(value) ? 'is-darkish' : undefined}
        >
          {value.hex}
        </ColorSwatch>
      </ColorSwatchBackground>
    );
  }

  return <span>{valueToCss(value)}</span>;
};

const NoDefault = styled('div')`
  font-style: italic;
  &:before {
    content: 'not set';
  }
`;

const ColorSwatch = styled('div')`
  padding: 5px;
  overflow: hidden;
  line-height: 1em;
  color: #000;

  &.is-darkish {
    color: #fff;
  }
`;

const ColorSwatchBackground = styled('div')`
  background-image: linear-gradient(45deg, #888 25%, transparent 25%),
    linear-gradient(-45deg, #888 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #888 75%),
    linear-gradient(-45deg, transparent 75%, #888 75%);
  background-size: 20px 20px;
  background-position:
    0 0,
    0 10px,
    10px -10px,
    -10px 0px;
`;
