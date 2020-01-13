import React, { useState } from 'react';
import { ChromePicker } from "react-color";

export const NumberEditor = ({ value, onChange }) => {
    const [stateValue, setValueChange] = useState(value);
    const inputOnChange = event => {
        const newValue = parseInt(event.target.value);
        setValueChange(newValue);
        onChange(newValue);
    };

    return <input type="number" value={stateValue} onChange={inputOnChange} />;
};

export const StringEditor = ({ value, onChange }) => {
    const [stateValue, setValueChange] = useState(value);
    const inputOnChange = event => {
        const newValue = event.target.value;
        setValueChange(newValue);
        onChange(newValue);
    };

    return <input type="text" value={stateValue} onChange={inputOnChange} />;
};

export const CheckboxEditor = ({ value, onChange }) => {
    const [stateValue, setValueChange] = useState(value);
    const inputOnChange = event => {
        const newValue = event.target.checked;
        setValueChange(newValue);
        onChange(newValue);
    };

    return <input type="checkbox" checked={stateValue} onChange={inputOnChange} />;
};

export const DropDownEditor = ({ value, options, onChange }) => {
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
        <span style={{
            display: "inline-block",
            "backgroundColor": stateValue,
            width: "15px",
            height: "15px",
            border: "solid 1px black"
        }} onClick={onClick}></span>
        {isShown && <ChromePicker color={stateValue} onChangeComplete={color => inputOnChange(color.hex)} />}
    </React.Fragment>;
};
