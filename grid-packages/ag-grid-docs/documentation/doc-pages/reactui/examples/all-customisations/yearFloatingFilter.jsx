import React, { forwardRef, Fragment, useCallback, useEffect, useImperativeHandle, useMemo, useState } from 'react';

export default forwardRef((props, ref) => {

    // const [year, setYear] = useState('All');
    const [filterActive, setFilterActive] = useState();

    // expose AG Grid Filter Lifecycle callbacks
    useImperativeHandle(ref, () => {
        return {
            onParentModelChanged(parentModel) {
                // When the filter is empty we will receive a null value here
                setFilterActive(parentModel!=null);
            }
        }
    });

    const syncMainFilter = useCallback( value => 
        props.parentFilterInstance( instance => {
            instance.setValueFromFloatingFilter(value);
        })
    , []);

    const onCheckboxChecked = useCallback( ()=> {
        syncMainFilter(!filterActive);
    }, [filterActive]);

    const style = useMemo( ()=> (
        {
            display: 'inline-block',
            marginTop: '10px'
        }
    ), []);

    return (
        <div style={style}>
            <label>
                <input
                type="checkbox"
                checked={filterActive}
                onChange={onCheckboxChecked} /> &gt;= 2010
            </label>
        </div>
    );
 });