import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';

export default forwardRef((props, ref) => {
    const [year, setYear] = useState('All');
 
    // expose AG Grid Filter Lifecycle callbacks
    useImperativeHandle(ref, () => {
        const isActive = year === '2010';
        return {
            doesFilterPass(params) {
                return params.data.year >= 2010;
            },
 
            isFilterActive() {
                return isActive;
            },
 
            getModel() {
                return isActive ? {active: true} : undefined;
            },
 
            setModel(model) {
                const active = model && model.active;
                setYear(active ? '2010' : 'All');
            },

            setValueFromFloatingFilter(value) {
                setYear(value ? '2010' : 'All');
            },

            sampleToggleMethod() {
                setYear(!isActive ? '2010' : 'All');
            }
        }
    });
 
    const onYearChange = event => {
        setYear(event.target.value)
        props.filterChangedCallback()
    }
 
    useEffect(() => {
        props.filterChangedCallback()
    }, [year]);
 
    return (
        <div style={{display: "inline-block"}} onChange={onYearChange}>
            <div style={{padding: "10px", backgroundColor: "#d3d3d3", textAlign: "center"}}>Year Filter</div>
            <label style={{margin: "10px", padding: "20px", display: "inline-block", backgroundColor: "#999999"}}>
                <input type="radio" name="year" value="All" checked={year === 'All'}/> All
            </label>
            <label style={{margin: "10px", padding: "20px", display: "inline-block", backgroundColor: "#999999"}}>
                <input type="radio" name="year" value="2010" checked={year === '2010'}/> Since 2010
            </label>
        </div>
    )
 });
