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
      <DefaultColorSwatch
        style={{ backgroundColor: value.hex }}
        className={colorIsDarkish(value) ? 'is-darkish' : undefined}
      >
        {value.hex}
      </DefaultColorSwatch>
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

const DefaultColorSwatch = styled('div')`
  padding: 5px;
  overflow: hidden;
  line-height: 1em;
  color: #000;

  &.is-darkish {
    color: #fff;
  }
`;
