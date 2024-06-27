import styled from '@emotion/styled';

export const SharedContent = styled('div')`
    min-width: max(230px, var(--radix-popper-anchor-width, 230px));
    position: absolute;
    overflow: hidden;
    background-color: var(--color-bg-primary);
    border: 1px solid var(--color-border-primary);
    border-radius: 6px;
    box-shadow:
        0px 10px 38px -10px rgba(22, 23, 24, 0.35),
        0px 10px 20px -15px rgba(22, 23, 24, 0.2);
    z-index: 1000;
    padding: 6px;

    .SelectScrollButton {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 25px;
        color: var(--violet-11);
        cursor: default;
    }
`;

export const SharedTrigger = styled('div')`
    display: flex;
    align-items: center;
    border-radius: var(--radius-sm);
    font-weight: normal;
    height: 32px;
    gap: 16px;
    color: var(--color-fg-primary);
    background-color: var(--color-bg-primary);
    border: 1px solid var(--color-input-border);
    font-size: 14px;
    justify-content: space-between;

    &:hover,
    &:active {
        color: var(--color-fg-primary);
        background-color: var(--color-bg-primary);
        border: 1px solid var(--color-input-border-hover);
    }
`;

export const SharedItem = styled('div')`
    font-size: 14px !important;
    line-height: 1;
    color: var(--violet-11);
    border-radius: 3px;
    display: flex;
    align-items: center;
    height: 25px;
    padding: 0 24px;
    position: relative;
    user-select: none;
    cursor: pointer;
    justify-content: space-between;

    &[data-disabled] {
        opacity: 0.5;
        pointer-events: none;
    }

    &[data-highlighted] {
        outline: none;
        background-color: var(--color-util-gray-100);
    }
`;

export const SharedIndicator = styled('div')`
    position: absolute;
    left: 0;
    width: 25px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
`;
