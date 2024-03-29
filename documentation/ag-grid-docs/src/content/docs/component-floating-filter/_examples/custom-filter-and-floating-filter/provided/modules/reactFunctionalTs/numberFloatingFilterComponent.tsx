import React, { Fragment, ChangeEvent } from 'react';
import { CustomFloatingFilterProps } from '@ag-grid-community/react';

export default ({ model, onModelChange }: CustomFloatingFilterProps) => {
    const onInput = ({ target: { value } }: ChangeEvent<HTMLInputElement>) => {
        onModelChange(value === '' ? null : Number(value));
    }

    return (
        <Fragment>
            &gt; <input
                value={model == null ? '' : model}
                style={{ width: "30px" }}
                type="number"
                min="0"
                onInput={onInput}
            />
        </Fragment>
    );
};
