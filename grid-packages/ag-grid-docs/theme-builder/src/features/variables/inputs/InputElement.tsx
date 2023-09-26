import styled from '@emotion/styled';

export const InputElement = styled('input')`
  border: solid 2px #ddd;
  border-radius: 3px;
  height: 40px;

  &:focus,
  &:hover {
    border-color: rgb(129, 189, 255);
  }

  &.is-error {
    border-color: #a00 !important;
  }
`;
