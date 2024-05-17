import { IDoesFilterPassParams, IFilterParams } from '@ag-grid-community/core';
import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';

export default forwardRef((props: IFilterParams, ref) => {
    const [year, setYear] = useState('All');

    // expose AG Grid Filter Lifecycle callbacks
    useImperativeHandle(ref, () => {
        return {
            doesFilterPass(params: IDoesFilterPassParams) {
                return params.data.year >= 2010;
            },

            isFilterActive() {
                return year === '2010';
            },

            // this example isn't using getModel() and setModel(),
            // so safe to just leave these empty. don't do this in your code!!!
            getModel() {},

            setModel() {},
        };
    });

    const onYearChange = (event: any) => {
        setYear(event.target.value);
    };

    useEffect(() => {
        props.filterChangedCallback();
    }, [year]);

    return (
        <div style={{ display: 'inline-block', width: '400px' }} onChange={onYearChange}>
            <div style={{ padding: '10px', textAlign: 'center' }}>Select Year Range</div>
            <label style={{ margin: '10px', padding: '10px', display: 'inline-block' }}>
                <input type="radio" name="year" value="All" defaultChecked={year === 'All'} /> All
            </label>
            <label style={{ margin: '10px', padding: '10px', display: 'inline-block' }}>
                <input type="radio" name="year" value="2010" /> Since 2010
            </label>
        </div>
    );
});
