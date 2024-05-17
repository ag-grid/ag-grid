import { CustomFloatingFilterProps } from '@ag-grid-community/react';
import React, { ChangeEvent } from 'react';

export interface SliderFloatingFilterProps extends CustomFloatingFilterProps {
    maxValue: number;
}

export default ({ model, onModelChange, maxValue }: SliderFloatingFilterProps) => {
    const value = (model && model.filter) || 0;

    const onChange = ({ target: { value: newValue } }: ChangeEvent<HTMLInputElement>) => {
        onModelChange(
            newValue === '' || newValue === '0'
                ? null
                : {
                      ...(model || {
                          type: 'greaterThan',
                      }),
                      filter: Number(newValue),
                  }
        );
    };

    return <input type="range" value={value} min={0} max={maxValue} step={1} onChange={onChange} />;
};
