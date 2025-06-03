import type { ChangeEvent } from 'react';
import React, { Fragment } from 'react';

import type { CustomFloatingFilterDisplayProps } from 'ag-grid-react';

export interface CustomProps extends CustomFloatingFilterDisplayProps {
    color: string;
}

export default ({ model, onModelChange, color }: CustomProps) => {
    const onInput = ({ target: { value } }: ChangeEvent<HTMLInputElement>) => {
        onModelChange(value === '' ? null : Number(value));
    };

    const style = {
        borderColor: color,
        width: '30px',
    };

    return (
        <Fragment>
            &gt; <input value={model == null ? '' : model} style={style} type="number" min="0" onInput={onInput} />
        </Fragment>
    );
};
