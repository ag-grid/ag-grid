import styled from '@emotion/styled';
import { useEffect, useRef, useState } from 'react';

import { Input } from './Input';
import { type ValueEditorProps } from './ValueEditorProps';

export const LengthValueEditor = ({ param, value, onChange }: ValueEditorProps) => {
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
                onChange(parseFloat(newValue) + (param.type === 'scale' ? '' : 'px'));
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
                    if (param.type === 'scale') {
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
