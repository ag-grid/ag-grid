import React, { useState } from 'react';
import './Editors.css';
import { ChromePicker } from "react-color";

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
        props.max = max;
    }

    if (step != null) {
        props.step = step;
    }

    return <span className='number-editor'>
        {min != null && max != null && <input type='range' className='number-editor__slider' {...props} />}
        <input type='number' className='number-editor__input' {...props} />
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

    return <div className='preset-editor'>
        {options.map(o => <div
            key={o}
            className={`preset-editor__option ${stateValue === o ? 'preset-editor__option--selected' : ''}`}
            onClick={() => inputOnChange(o)}>{o.toString()}</div>)}
    </div>;
};

export const ColourEditor = ({ value, onChange }) => {
    const [stateValue, setValueChange] = useState(value);
    const inputOnChange = color => {
        setValueChange(color);
        onChange(color);
    };

    const [isShown, setIsShown] = useState(false);
    const onClick = () => setIsShown(!isShown);

    return <React.Fragment>
        <span
            style={{ 'backgroundColor': stateValue }}
            className='colour-editor__input'
            onClick={onClick}></span>
        {isShown && <ChromePicker color={stateValue} onChangeComplete={color => inputOnChange(color.hex)} />}
    </React.Fragment>;
};
