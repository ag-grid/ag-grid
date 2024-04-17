import styled from '@emotion/styled';
import { useEffect, useRef, useState } from 'react';

import { Card } from '../general/Card';
import { Input } from './Input';
import { type ValueEditorProps } from './ValueEditorProps';

export const NumberValueEditor = ({ param, value, onChange }: ValueEditorProps) => {
    const units = param.property.endsWith('Scale') ? '' : 'px';

    const [editorValue, setEditorValue] = useState(value);
    const [valid, setValid] = useState(() => numberIsValid(editorValue));
    const focusRef = useRef(false);

    useEffect(() => {
        if (!focusRef.current) {
            setEditorValue(value);
        }
    }, [value]);

    const handleInput = (newValue: string) => {
        newValue = newValue.trim();
        setEditorValue(newValue);
        if (newValue === '') {
            onChange(null);
            setValid(true);
        } else {
            const isValid = numberIsValid(newValue);
            setValid(isValid);
            if (isValid) {
                onChange(parseFloat(newValue) + units);
            }
        }
    };

    return (
        <Wrapper>
            <Input
                className={valid ? undefined : 'is-error'}
                value={editorValue}
                onChange={handleInput}
                onFocus={() => {
                    focusRef.current = true;
                    setEditorValue(String(parseFloat(value) || ''));
                }}
                onBlur={() => {
                    focusRef.current = false;
                    setEditorValue(value);
                    setValid(numberIsValid(value));
                }}
                onKeyDown={(e) => {
                    if (/^[a-z]$/i.test(e.key) && !e.ctrlKey && !e.metaKey && !e.altKey) {
                        e.preventDefault();
                    }

                    const adjustBy = (amount: number) => {
                        const current = parseFloat(editorValue) || 0;
                        const adjusted = Math.max(0, current + amount);
                        const string = adjusted.toFixed(10).replace(/\.?0+$/, '');
                        handleInput(string);
                    };
                    let amount = e.shiftKey || e.ctrlKey || e.altKey || e.metaKey ? 10 : 1;
                    if (units === '') {
                        amount /= 10;
                    }
                    if (e.key === 'ArrowUp') {
                        adjustBy(amount);
                    } else if (e.key === 'ArrowDown') {
                        adjustBy(-amount);
                    }
                }}
            />
        </Wrapper>
    );
};

const numberIsValid = (value: string) => !isNaN(parseFloat(value.trim()));

const Wrapper = styled('div')`
    position: relative;
`;

const alphaPatternSvg =
    'data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="rgba(128, 128, 128, 0.3)"><path d="M8 0h8v8H8zM0 8h8v8H0z"/></svg>';

const ColorSwatch = styled('div')`
    border-radius: 5px;
    overflow: hidden;
    position: absolute;
    top: 50%;
    margin-top: -10px;
    left: 10px;
    width: 20px;
    height: 20px;
    border: 1px solid var(--color-border-secondary);
    background-color: var(--color-bg-primary);
    background-image: url('${alphaPatternSvg}');
    background-repeat: repeat;
    background-size: 8px;
`;

const ColorSwatchColor = styled('div')`
    width: 100%;
    height: 100%;
`;

const DropdownArea = styled(Card)`
    z-index: 1000;
    position: absolute;
    pointer-events: all;
    max-height: calc(100vh - 16px);
    margin-top: 6px;
    padding: 6px;

    .react-colorful {
        width: 255px;
    }
    .react-colorful__saturation {
        height: 255px;
        border-radius: 5px;
        margin-bottom: 12px;
    }
    .react-colorful__hue,
    .react-colorful__alpha {
        height: 18px;
        border-radius: 6px;
        margin-bottom: 12px;
    }

    .react-colorful__alpha {
        background-image: url('${alphaPatternSvg}');
        background-repeat: repeat;
        background-size: 8px;
    }

    .react-colorful__pointer {
        width: 20px;
        height: 20px;
        border-width: 3px;
    }

    .react-colorful__last-control {
        margin-bottom: 2px;
    }
`;
