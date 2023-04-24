import React, {forwardRef, useImperativeHandle, useRef, useEffect, useState} from 'react';

export default forwardRef((props, ref) => {
    const [filterText, setFilterText] = useState(null);
    const inputRef = useRef(null);

    const isNumeric = n => !isNaN(parseFloat(n)) && isFinite(n);

    useEffect(() => {
        if(inputRef.current) {
            inputRef.current.value = filterText;
        }
        props.filterChangedCallback();
    }, [filterText])

    const isFilterActive = () => {
        return filterText !== null &&
            filterText !== undefined &&
            filterText !== '' &&
            isNumeric(filterText);
    }

    // expose AG Grid Filter Lifecycle callbacks
    useImperativeHandle(ref, () => {
        return {
            isFilterActive,

            doesFilterPass(params) {
                if (!this.isFilterActive()) { return; }

                const { api, colDef, column, columnApi, context, valueGetter } = props;
                const { node } = params;
            
                const value = valueGetter({
                    api,
                    colDef,
                    column,
                    columnApi,
                    context,
                    data: node.data,
                    getValue: (field) => node.data[field],
                    node,
                });        

                if (!value) return false;
                return Number(value) > Number(filterText);
            },

            isNumeric(n) {
                return !isNaN(parseFloat(n)) && isFinite(n);
            },

            getModel() {
                return isFilterActive() ? Number(filterText) : null;
            },

            setModel(model) {
                setFilterText(model);
            },

            myMethodForTakingValueFromFloatingFilter(value) {
                setFilterText(value);
            }
        }
    });


    const onInputBoxChanged = (event) => {
        setFilterText(event.target.value)
    }

    return (
        <div style={{padding: "4px"}}>
            <div style={{fontWeight: "bold"}}>Greater than:</div>
            <div>
                <input ref={inputRef} style={{margin: "4px 0 4px 0"}} type="number" min="0" onInput={onInputBoxChanged} placeholder="Number of medals..."/>
            </div>
        </div>
    );
});
