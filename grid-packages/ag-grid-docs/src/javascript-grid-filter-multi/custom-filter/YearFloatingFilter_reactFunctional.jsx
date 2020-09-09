import React, { forwardRef, useState, useImperativeHandle } from 'react';

export default forwardRef(({ parentFilterInstance }, ref) => {
    const [isActive, setIsActive] = useState(false);

    const toggleFilter = isActive => {
        setIsActive(isActive);
        parentFilterInstance(instance => instance.onFloatingFilterChanged(isActive));
    };

    useImperativeHandle(ref, () => ({
        onParentModelChanged: model => {
            setIsActive(!!model);
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
