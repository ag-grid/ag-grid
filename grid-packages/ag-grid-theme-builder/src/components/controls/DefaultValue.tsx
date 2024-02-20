import styled from '@emotion/styled';
import { Value } from 'model/values';

export type DefaultValueProps = {
  value: Value | null;
};

export const DefaultValue = ({ value }: DefaultValueProps) => {
  if (!value) {
    return <NoDefault />;
  }

  if (value.type === 'color') {
    return value.isTransparent() ? (
      <>(transparent)</>
    ) : (
      <ColorSwatchBackground>
        <ColorSwatch style={{ backgroundColor: value.toCss() }} />
      </ColorSwatchBackground>
    );
  }

  return <span>{value.describe()}</span>;
};

const NoDefault = styled('div')`
  font-style: italic;
  &:before {
    content: 'not set';
  }
`;

const ColorSwatch = styled('div')`
  height: 40px;
  width: 80px;
  padding: 5px;
  overflow: hidden;
  line-height: 1em;
  color: #000;
`;

const ColorSwatchBackground = styled('div')`
  background-position:
    0px 0px,
    10px 10px;
  background-size: 20px 20px;
  background-image: linear-gradient(
      45deg,
      rgba(0, 0, 0, 0.1) 25%,
      transparent 25%,
      transparent 75%,
      rgba(0, 0, 0, 0.1) 75%,
      rgba(0, 0, 0, 0.1) 100%
    ),
    linear-gradient(
      45deg,
      rgba(0, 0, 0, 0.1) 25%,
      transparent 25%,
      transparent 75%,
      rgba(0, 0, 0, 0.1) 75%,
      rgba(0, 0, 0, 0.1) 100%
    );

  html[data-dark-mode='true'] & {
    background-image: linear-gradient(
        45deg,
        rgba(255, 255, 255, 0.1) 25%,
        transparent 25%,
        transparent 75%,
        rgba(255, 255, 255, 0.1) 75%,
        rgba(255, 255, 255, 0.1) 100%
      ),
      linear-gradient(
        45deg,
        rgba(255, 255, 255, 0.1) 25%,
        transparent 25%,
        transparent 75%,
        rgba(255, 255, 255, 0.1) 75%,
        rgba(255, 255, 255, 0.1) 100%
      );
  }
`;
