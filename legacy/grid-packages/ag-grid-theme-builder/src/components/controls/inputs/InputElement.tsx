import styled from '@emotion/styled';

export const InputElement = styled('input')`
  height: 40px;

  &:focus,
  &:hover {
    border-color: rgb(129, 189, 255);
  }

  &.is-error {
    border-color: var(--input-error-color) !important;
  }
`;
