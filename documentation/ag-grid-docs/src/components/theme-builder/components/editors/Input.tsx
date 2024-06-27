import styled from '@emotion/styled';
import { type KeyboardEventHandler, forwardRef } from 'react';

import { combineClassNames } from '../component-utils';

export type InputProps = {
    value: string;
    type?: HTMLInputElement['type'];
    placeholder?: string;
    onChange?: (value: string) => void;
    onFocus?: () => void;
    onBlur?: () => void;
    onKeyDown?: KeyboardEventHandler<HTMLInputElement>;
    onKeyPress?: KeyboardEventHandler<HTMLInputElement>;
    isError?: boolean;
    className?: string;
    additionalPaddingLeft?: number;
};

export const Input = forwardRef<HTMLInputElement, InputProps>((props, ref) => (
    <StyledInput
        placeholder={props.placeholder}
        ref={ref}
        type={props.type || 'text'}
        value={props.value}
        onChange={(e) => props.onChange?.(e.target.value)}
        onFocus={props.onFocus}
        onBlur={props.onBlur}
        onKeyDown={props.onKeyDown}
        className={combineClassNames(props.className, props.isError && 'is-error')}
        additionalPaddingLeft={props.additionalPaddingLeft || 0}
    />
));

type StyledInputProps = {
    additionalPaddingLeft?: number;
};

export const StyledInput = styled('input')`
    width: 100%;
    font-size: 14px;
    padding-left: ${(props: StyledInputProps) => 8 + (props.additionalPaddingLeft ?? 0)}px !important;
    &.is-error {
        border-color: var(--color-input-error) !important;

        &:focus {
            box-shadow:
                0 0 0 4px color-mix(in srgb, transparent, var(--color-input-error) 20%),
                var(--shadow-xs) !important;
        }
    }
`;
