import React, { useState } from 'react';
import './Editors.css';
import { HuePicker, AlphaPicker } from 'react-color';

export const NumberEditor = ({ value, min, max, step, onChange }) => {
    const [stateValue, setValueChange] = useState(value);
    const inputOnChange = event => {
        const { value } = event.target;
        const newValue = value == null || value.trim() === '' ? undefined : step % 1 > 0 ? parseFloat(value) : parseInt(value);
        setValueChange(newValue);
        onChange(newValue);
    };

    const props = {
        value: stateValue,
        onChange: inputOnChange
    };

    if (min != null) {
        props.min = min;
    }

    if (max != null) {
        props.max = typeof max === 'function' ? max() : max;
    }

    if (step != null) {
        props.step = step;
    }

    if (props.max && stateValue > props.max) {
        setValueChange(props.max);
        onChange(props.max);
    }

    return <span className="number-editor">
        {min != null && max != null && <input type="range" className="number-editor__slider" {...props} />}
        <input type="number" className="number-editor__input" {...props} />
    </span>;
};

export const StringEditor = ({ value, toStringValue, fromStringValue, onChange }) => {
    const initialValue = toStringValue ? toStringValue(value) : value;
    const [stateValue, setValueChange] = useState(initialValue);
    const inputOnChange = event => {
        const newValue = event.target.value;

        setValueChange(newValue);

        const transformedValue = fromStringValue ? fromStringValue(newValue) : newValue;

        onChange(transformedValue);
    };

    return <input className="string-editor__input" type="text" value={stateValue} maxLength={200} onChange={inputOnChange} />;
};

export const ArrayEditor = props =>
    <StringEditor
        toStringValue={array => array.join(', ')}
        fromStringValue={value => value.split(',').filter(x => x != null && x.trim().length).map(x => JSON.parse(x))}
        {...props}
    />;

export const BooleanEditor = ({ value, onChange }) => <PresetEditor options={[false, true]} value={value} onChange={onChange} />;

export const PresetEditor = ({ value, options, onChange }) => {
    const [stateValue, setValueChange] = useState(value);
    const inputOnChange = newValue => {
        setValueChange(newValue);
        onChange(newValue);
    };

    return <div className="preset-editor">
        {(Array.isArray(options) ? options : Object.keys(options)).map(o => <div
            key={o}
            className={`preset-editor__option ${stateValue === o ? 'preset-editor__option--selected' : ''}`}
            onClick={() => inputOnChange(o)}>{Array.isArray(options) ? o.toString() : options[o]}</div>)}
    </div>;
};

export const ColourEditor = ({ value, onChange }) => {
    const [colourString, setColourString] = useState(value);
    const [rgb, setRgb] = useState(null);

    const inputOnChange = event => {
        const { value } = event.target;

        setColourString(value);
        setRgb(null);
        onChange(value);
    };

    const sliderOnChange = (colour, hasAlpha) => {
        if (!hasAlpha && rgb) {
            colour.rgb.a = rgb.a;
        }

        const { r, g, b, a } = colour.rgb;
        const colourString = a < 1 ? `rgba(${r}, ${g}, ${b}, ${a})` : colour.hex;

        setColourString(colourString);
        setRgb(colour.rgb);
        onChange(colourString);
    };

    const color = rgb || colourString || 'black';

    return <div className="colour-editor">
        <div class="colour-editor__input-wrapper">
            <input className="colour-editor__input" type="text" value={colourString} maxLength={25} onChange={inputOnChange} />
            <div style={{ 'backgroundColor': colourString }} className="colour-editor__sample"></div>
        </div>
        <div className="colour-editor__slider"><HuePicker width={'100%'} height={15} color={color} onChange={value => sliderOnChange(value, false)} /></div>
        <div className="colour-editor__slider"><AlphaPicker width={'100%'} height={15} color={color} onChange={value => sliderOnChange(value, true)} /></div>
    </div>;
};
