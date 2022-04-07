import { IFloatingFilterParams } from '@ag-grid-community/core';
import React, { forwardRef, useState, useImperativeHandle } from 'react';

export default forwardRef(({ parentFilterInstance }: IFloatingFilterParams<any>, ref) => {
    const [isActive, setIsActive] = useState(false);

    const toggleFilter = (isActive: boolean) => {
        setIsActive(isActive);
        parentFilterInstance(instance => instance.onFloatingFilterChanged(isActive));
    };

    useImperativeHandle(ref, () => ({
        onParentModelChanged: (model: any) => {
            setIsActive(!!model);
        }
    }));

    return (
        <div className="year-filter">
            <label>
                <input type="radio" checked={!isActive} onChange={() => toggleFilter(false)} /> All
            </label>
            <label>
                <input type="radio" checked={isActive} onChange={() => toggleFilter(true)} /> After 2004
            </label>
        </div>
    );
});
