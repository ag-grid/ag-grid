import React, { useState } from 'react';
import './Editors.css';
import { ChromePicker } from "react-color";

export const NumberEditor = ({ value, min, max, step, onChange }) => {
    const [stateValue, setValueChange] = useState(value);
    const inputOnChange = event => {
        const newValue = step % 1 > 0 ? parseFloat(event.target.value) : parseInt(event.target.value);
        setValueChange(newValue);
        onChange(newValue);
    };

    const props = {
        type: 'number',
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

    return <input {...props} />;
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

    return <input type="text" value={stateValue} maxLength={200} onChange={inputOnChange} />;
};

export const ArrayEditor = ({ value, onChange }) => {
    const stringValue = value.join(', ');
    const [stateValue, setValueChange] = useState(stringValue);
    const inputOnChange = event => {
        const newValue = event.target.value;

        setValueChange(newValue);

        const array = newValue.split(',').filter(x => x != null && x.trim().length).map(x => JSON.parse(x));

        onChange(array);
    };

    return <input type="text" value={stateValue} maxLength={200} onChange={inputOnChange} />;
};

export const BooleanEditor = ({ value, onChange }) => {
    const [stateValue, setValueChange] = useState(value);
    const inputOnChange = event => {
        const newValue = event.target.checked;
        setValueChange(newValue);
        onChange(newValue);
    };

    return <input type="checkbox" checked={stateValue} onChange={inputOnChange} />;
};

export const PresetEditor = ({ value, options, onChange }) => {
    const [stateValue, setValueChange] = useState(value);
    const inputOnChange = event => {
        const newValue = event.target.value;
        setValueChange(newValue);
        onChange(newValue);
    };

    return <select value={stateValue} onChange={inputOnChange}>
        {options.map(o => <option key={o}>{o}</option>)}
    </select>;
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
