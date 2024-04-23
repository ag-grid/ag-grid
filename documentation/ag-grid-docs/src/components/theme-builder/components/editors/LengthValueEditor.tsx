import styled from '@emotion/styled';
import { useCallback, useEffect, useRef, useState } from 'react';

import { Input } from './Input';
import { type ValueEditorProps } from './ValueEditorProps';

const getPropEditorValue = ({ isScale, updateValue }: { isScale: boolean; updateValue: string | number }) => {
    const cleanedValue = typeof updateValue === 'string' ? parseFloat(updateValue.trim()) : updateValue;
    const scaledValue = isScale ? toScalePercentageString(cleanedValue) : cleanedValue;
    const newEditorValue = scaledValue + (isScale ? '%' : '');
    const isValid = scaledValue === '' || numberIsValid(scaledValue);

    return isValid ? newEditorValue : '';
};

const getUpdateValues = ({ isScale, updateValue }: { isScale: boolean; updateValue: string }) => {
    const newValue = parseFloat(updateValue.trim());
    const newEditorValue = newValue + (isScale ? '%' : '');
    const isValid = newValue === '' || numberIsValid(newValue);

    let onChangeValue = null;
    if (newValue !== '' && isValid) {
        const floatValue = parseFloat(newValue);
        onChangeValue = isScale ? scalePercentageValue(floatValue) : floatValue;
    }

    return {
        isValid,
        newValue,
        newEditorValue,
        onChangeValue,
    };
};

export const LengthValueEditor = ({ param, value, onChange }: ValueEditorProps) => {
    const isScale = param.type === 'scale';
    const [editorValue, setEditorValue] = useState(getPropEditorValue({ isScale, updateValue: value }));
    const [valid, setValid] = useState(() => numberIsValid(editorValue));
    const focusRef = useRef(false);

    useEffect(() => {
        if (!focusRef.current) {
            setEditorValue(getPropEditorValue({ isScale, updateValue: value }));
        }
    }, [value]);

    const handleInput = (value: string) => {
        const { isValid, newValue, newEditorValue, onChangeValue } = getUpdateValues({ isScale, updateValue: value });

        setEditorValue(newEditorValue);
        setValid(isValid);
        if (isValid) {
            onChange(onChangeValue);
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
                    setEditorValue(getPropEditorValue({ isScale, updateValue: value }));
                }}
                onBlur={() => {
                    focusRef.current = false;
                    setEditorValue(getPropEditorValue({ isScale, updateValue: value }));
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

const numberIsValid = (value: string | number) => (typeof value === 'number' ? true : !isNaN(parseFloat(value.trim())));
const scalePercentageValue = (value: number) => value / 100;
const toScalePercentageString = (value: number) => value * 100;

const Wrapper = styled('div')`
    position: relative;
`;
