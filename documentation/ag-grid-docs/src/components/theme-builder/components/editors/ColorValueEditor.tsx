import styled from '@emotion/styled';
import { autoUpdate, useFloating } from '@floating-ui/react';
import { useEffect, useState } from 'react';
import { HexAlphaColorPicker, HexColorPicker } from 'react-colorful';

import { useClickAwayListener } from '../component-utils';
import { Card } from '../general/Card';
import { Input } from './Input';
import { RGBAColor } from './RGBAColor';
import { type ValueEditorProps } from './ValueEditorProps';

const preventTransparency: Record<string, boolean | undefined> = {
    backgroundColor: true,
};

export const ColorValueEditor = ({ param, value, onChange }: ValueEditorProps) => {
    const hexValue = RGBAColor.reinterpretCss(value)?.toCSSHex();
    const [editorValue, setEditorValue] = useState(hexValue || value);
    const [valid, setValid] = useState(() => colorIsValid(editorValue));

    const [showPicker, setShowPicker] = useState(false);
    const { refs, floatingStyles, elements } = useFloating({
        open: showPicker,
        onOpenChange: setShowPicker,
        whileElementsMounted: autoUpdate,
        placement: 'bottom-start',
    });

    useClickAwayListener(() => setShowPicker(false), [elements.domReference, elements.floating]);

    useEffect(() => {
        if (!showPicker) {
            setEditorValue(hexValue || value);
        }
    }, [hexValue]);

    const handleInput = (newValue: string) => {
        newValue = newValue.trim();
        setEditorValue(newValue);
        if (newValue === '') {
            onChange(null);
            setValid(true);
        } else {
            const isValid = colorIsValid(newValue);
            setValid(isValid);
            if (isValid) {
                onChange(coerceToValidValue(newValue));
            }
        }
    };

    const coerceToValidValue = (input: string) => {
        let color = RGBAColor.parseCss(input);
        if (!color) {
            color = RGBAColor.reinterpretCss(input);
        }
        if (!color) return input;
        if (preventTransparency[param.property]) {
            color.a = 1;
        }
        return color.toCSSHex();
    };

    const ColorPicker = preventTransparency[param.property] ? HexColorPicker : HexAlphaColorPicker;

    return (
        <>
            <Wrapper>
                <StyledInput
                    ref={refs.setReference}
                    className={valid ? undefined : 'is-error'}
                    value={editorValue}
                    onChange={handleInput}
                    onFocus={() => {
                        setShowPicker(true);
                        setEditorValue(coerceToValidValue(value));
                    }}
                    onBlur={() => {
                        setEditorValue(coerceToValidValue(value));
                        setValid(colorIsValid(value));
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'Tab') {
                            setShowPicker(false);
                        }
                    }}
                />
                <ColorSwatch>
                    <ColorSwatchColor style={{ backgroundColor: value }} />
                </ColorSwatch>
            </Wrapper>
            {showPicker && (
                <DropdownArea ref={refs.setFloating} style={floatingStyles}>
                    <ColorPicker color={hexValue} onChange={(h) => handleInput(h.toUpperCase())} />
                </DropdownArea>
            )}
        </>
    );
};

const colorIsValid = (value: string) => RGBAColor.reinterpretCss(value) != null;

const Wrapper = styled('div')`
    position: relative;
`;

const StyledInput = styled(Input)`
    padding-left: 38px !important;
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
