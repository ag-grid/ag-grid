import React, { forwardRef, useState, useEffect, useImperativeHandle } from 'react';

export default forwardRef(({ filterChangedCallback }, ref) => {
    const [isActive, setIsActive] = useState(false);
    const toggleFilter = isActive => {
        setIsActive(isActive);
    };

    useEffect(() => filterChangedCallback());

    const setModel = model => toggleFilter(!!model);
    const isFilterActive = () => isActive;

    useImperativeHandle(ref, () => ({
        doesFilterPass: params => {
            return params.data.year > 2004;
        },

        isFilterActive,

        getModel: () => {
            return isFilterActive() || null;
        },

        setModel,

        onFloatingFilterChanged: value => {
            setModel(value);
        }
    }));

    return (
        <div class="year-filter">
            <label>
                <input type="radio" checked={!isActive} onChange={() => toggleFilter(false)} /> All
            </label>
            <label>
                <input type="radio" checked={isActive} onChange={() => toggleFilter(true)} /> After 2004
            </label>
        </div>
    );
});
