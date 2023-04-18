import classnames from 'classnames';
import React, { FunctionComponent } from 'react';
import styles from './UpdateSpeedSlider.module.scss';

interface Props {
    min: number;
    max: number;
    step: number;
    value: number;
    disabled: boolean;
    setValue: (value: number) => void;
}

export const UpdateSpeedSlider: FunctionComponent<Props> = ({ min, max, step, value, disabled, setValue }) => {
    return (
        <div className={classnames('font-size-large', styles.slider)}>
            <label htmlFor="update-speed-slider">
                <span className="text-secondary">Update speed:</span> <span>{value}x</span>
            </label>
            <input
                type="range"
                id="update-speed-slider"
                name="update-speed-slider"
                min={min}
                max={max}
                step={step}
                value={value}
                disabled={disabled}
                onChange={(event) => setValue(parseFloat(event.target.value))}
            />
        </div>
    );
};
