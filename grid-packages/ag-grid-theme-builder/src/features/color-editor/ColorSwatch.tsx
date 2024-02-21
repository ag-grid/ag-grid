import { Card, Tooltip, styled } from '@mui/joy';
import { colorValueToCssExpression } from './color-editor-utils';

export type ColorSwatchProps = {
  color: string | number;
  splitBackground?: boolean;
  className?: string;
};

export const ColorSwatch = ({ color, className, splitBackground }: ColorSwatchProps) => (
  <ColorSwatchCard className={className}>
    {splitBackground && (
      <Tooltip title="This shows your color on top of the background">
        <OpaqueBackground>
          <ColorOverOpaqueBackground
            sx={{
              borderColor: colorValueToCssExpression(color),
            }}
          />
        </OpaqueBackground>
      </Tooltip>
    )}
    <Color
      style={{
        backgroundColor: colorValueToCssExpression(color),
      }}
    />
  </ColorSwatchCard>
);

const Color = styled('div')`
  width: 100%;
  height: 100%;
`;

const OpaqueBackground = styled('div')`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 60px;
  background-color: var(--ag-background-color);
`;

const ColorOverOpaqueBackground = styled('div')`
  position: absolute;
  inset: 20%;
  border-radius: 100%;
  background-color: var(--ag-background-color);
  border: solid 5px;
`;

const ColorSwatchCard = styled(Card)`
  height: 60px;
  padding: 0;
  border-width: 2px;
  overflow: hidden;
  background-image: url('data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill-opacity=".05"><path d="M8 0h8v8H8zM0 8h8v8H0z"/></svg>');
  position: relative;
`;
