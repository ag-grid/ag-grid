import React, {forwardRef, useEffect, useImperativeHandle, useState} from 'react';

export default forwardRef((props, ref) => {
    const [year, setYear] = useState('All');

    // expose AG Grid Filter Lifecycle callbacks
    useImperativeHandle(ref, () => {
        return {
            doesFilterPass(params) {
                return params.data.year >= 2010;
            },

            isFilterActive() {
                return year === '2010'
            },

            // this example isn't using getModel() and setModel(),
            // so safe to just leave these empty. don't do this in your code!!!
            getModel() {
            },

            setModel() {
            }
        }
    });

    const onYearChange = event => {
        setYear(event.target.value)
    }

    useEffect(() => {
        props.filterChangedCallback()
    }, [year]);

    return (
        <div style={{display: "inline-block", width: "400px"}} onChange={onYearChange}>
            <div style={{padding: "10px", backgroundColor: "#d3d3d3", textAlign: "center"}}>This is a very wide filter</div>
            <label style={{margin: "10px", padding: "50px", display: "inline-block", backgroundColor: "#999999"}}>
                <input type="radio" name="year" value="All" checked={year === 'All'}/> All
            </label>
            <label style={{margin: "10px", padding: "50px", display: "inline-block", backgroundColor: "#999999"}}>
                <input type="radio" name="year" value="2010"/> Since 2010
            </label>
        </div>
    )
});
