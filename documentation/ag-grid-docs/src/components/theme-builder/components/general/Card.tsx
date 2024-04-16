import styled from '@emotion/styled';

export const Card = styled('div')`
    border: solid 1px hsla(0, 0%, 89%, 1);
    background-color: var(--color-bg-primary);
    border-radius: 6px;
    box-shadow: var(--shadow-md);
    overflow-y: auto;
    max-height: calc(100vh - 16px);
    > * {
        margin: 16px;
    }
`;
