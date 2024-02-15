import { styled } from '@mui/joy';

type TwoColumnTableProps = {
  rowGap?: number;
};

export const TwoColumnTable = styled('div')`
  display: grid;
  grid-template-columns: auto 1fr;
  grid-column-gap: 16px;
  grid-row-gap: ${(props: TwoColumnTableProps) => `${(props.rowGap ?? 0) * 8}px`};
`;

export const Cell = styled('div')`
  display: flex;
  align-items: center;
`;
