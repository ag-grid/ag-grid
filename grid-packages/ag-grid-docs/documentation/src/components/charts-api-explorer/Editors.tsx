/**
 * These are the different editors available to be used in the Standalone Charts API Explorer, depending on the data
 * type of the particular option.
 */

import React, { useState } from 'react';
import { HuePicker, AlphaPicker } from 'react-color';
import classnames from 'classnames';
import { doOnEnter } from '../key-handlers';
import styles from './Editors.module.scss';

export const NumberEditor = ({ value, min, max, step, unit, onChange }) => {
    const [stateValue, setValueChange] = useState(value || '');
    const inputOnChange = event => {
        const { value } = event.target;
        const newValue = value == null || value.trim() === '' ? undefined : step % 1 > 0 ? parseFloat(value) : parseInt(value);
        setValueChange(newValue);
        onChange(newValue);
    };

    const props: Partial<React.InputHTMLAttributes<HTMLInputElement>> = {
        value: stateValue,
        onChange: inputOnChange,
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
    }

    const rangeClassName = classnames({
        [styles['number-editor__slider']]: true,
        [styles['number-editor__slider_hidden']]: min == null || max == null,
    });

    return <span className={styles['number-editor']}>
        <input type="range" className={rangeClassName} {...props} />
        <input type="number" className={styles['number-editor__input']} {...props} />
        {unit && <span dangerouslySetInnerHTML={{ __html: '&nbsp;' + unit }}></span>}
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

    return <input className={styles['string-editor__input']} type="text" value={stateValue} maxLength={200} onChange={inputOnChange} />;
};

export const ArrayEditor = props =>
    <StringEditor
        toStringValue={array => array ? array.join(', ') : ''}
        fromStringValue={value => value.split(',').filter(x => x != null && x.trim().length).map(x => JSON.parse(x))}
        {...props}
    />;

export const BooleanEditor = ({ value, onChange }) => <PresetEditor options={[false, true]} value={value} onChange={onChange} />;

export const PresetEditor = ({ value, options, suggestions = undefined, breakIndex = Infinity, onChange }) => {
    const [stateValue, setValueChange] = useState(value);
    const inputOnChange = newValue => {
        setValueChange(newValue);
        onChange(newValue);
    };

    const optionsToUse = options || suggestions;

    const createOptionElement = o => <div
        key={o}
        role="button"
        tabIndex={0}
        className={classnames(styles['preset-editor__option'], { [styles['preset-editor__option--selected']]: stateValue === o })}
        onClick={() => inputOnChange(o)}
        onKeyDown={e => doOnEnter(e, () => inputOnChange(o))}>
        {Array.isArray(optionsToUse) ? o.toString() : optionsToUse[o]}
    </div>;

    const elementsBeforeBreak = [];
    const elementsAfterBreak = [];

    (Array.isArray(optionsToUse) ? optionsToUse : Object.keys(optionsToUse)).forEach((option, i) => {
        const element = createOptionElement(option);

        if (breakIndex && i >= breakIndex) {
            elementsAfterBreak.push(element);
        } else {
            elementsBeforeBreak.push(element);
        }
    });

    return <React.Fragment>
        {elementsBeforeBreak.length > 0 && <div className={styles['preset-editor']}>{elementsBeforeBreak}</div>}
        {elementsAfterBreak.length > 0 && <div className={styles['preset-editor']}>{elementsAfterBreak}</div>}
    </React.Fragment>;
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

    return <div className={styles['colour-editor']}>
        <div className={styles['colour-editor__input-wrapper']}>
            <input className={styles['colour-editor__input']} type="text" value={colourString} maxLength={25} onChange={inputOnChange} />
            <div style={{ backgroundColor: colourString }} className={styles['colour-editor__sample']}></div>
        </div>
        <div className={styles['colour-editor__slider']}><HuePicker width={'100%'} height={15} color={color} onChange={value => sliderOnChange(value, false)} /></div>
        <div className={styles['colour-editor__slider']}><AlphaPicker width={'100%'} height={15} color={color} onChange={value => sliderOnChange(value, true)} /></div>
    </div>;
};
