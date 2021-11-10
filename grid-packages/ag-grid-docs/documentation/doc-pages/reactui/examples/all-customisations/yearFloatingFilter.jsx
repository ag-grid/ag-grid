import React, { forwardRef, Fragment, useCallback, useEffect, useImperativeHandle, useMemo, useState } from 'react';

export default forwardRef((props, ref) => {

    const [year, setYear] = useState('All');

    // expose AG Grid Filter Lifecycle callbacks
    useImperativeHandle(ref, () => {
        return {
            onParentModelChanged(parentModel) {
                // When the filter is empty we will receive a null value here
                if (!parentModel) {
                    setYear('All');
                } else {
                    setYear('2010');
                }
            }
        }
    });

    const syncMainFilter = useCallback( value => 
        props.parentFilterInstance( instance => {
            instance.setValueFromFloatingFilter(value);
        })
    , []);

    const onAllClicked = useCallback( ()=> syncMainFilter(false), []);
    const on2010Clicked = useCallback( ()=> syncMainFilter(true), []);

    const style = useMemo( ()=> (
        {
            display: 'inline-block',
            marginTop: '10px'
        }
    ), []);

    return (
        <div style={style}>
            <label onClick={onAllClicked}>
                <input type="radio" name="yearFloatingFilter" value="All" checked={year === 'All'}/> All
            </label>
            <label onClick={on2010Clicked}>
                <input type="radio" name="yearFloatingFilter" value="2010" checked={year === '2010'}/> &gt;= 2010
            </label>
        </div>
    );
 });