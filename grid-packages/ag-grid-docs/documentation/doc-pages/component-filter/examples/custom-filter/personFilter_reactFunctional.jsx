import React, {forwardRef, useEffect, useImperativeHandle, useState, useRef} from 'react';

export default forwardRef((props, ref) => {
    const [filterText, setFilterText] = useState(null);

    // expose AG Grid Filter Lifecycle callbacks
    useImperativeHandle(ref, () => {
        return {
            doesFilterPass(params) {
                const { api, colDef, column, columnApi, context } = props;
                const { node } = params;

                // make sure each word passes separately, ie search for firstname, lastname
                let passed = true;
                filterText.toLowerCase().split(' ').forEach(filterWord => {
                    const value = props.valueGetter({
                        api,
                        colDef,
                        column,
                        columnApi,
                        context,
                        data: node.data,
                        getValue: (field) => node.data[field],
                        node,
                    });
        
                    if (value.toString().toLowerCase().indexOf(filterWord) < 0) {
                        passed = false;
                    }
                });

                return passed;
            },

            isFilterActive() {
                return filterText != null && filterText !== '';
            },

            getModel() {
                if (!this.isFilterActive()) { return null; }

                return {value: filterText};
            },

            setModel(model) {
                setFilterText(model == null ? null : model.value);
            }
        }
    });

    const onChange = event => {
        setFilterText(event.target.value)
    }

    useEffect(() => {
        props.filterChangedCallback()
    }, [filterText]);

    return (
        <div style={{padding: 4, width: 200}}>
            <div style={{fontWeight: "bold"}}>Custom Athlete Filter</div>
            <div>
                <input style={{margin: "4 0 4 0"}} type="text" value={filterText} onChange={onChange} placeholder="Full name search..."/>
            </div>
            <div style={{marginTop: 20}}>This filter does partial word search on multiple words, eg "mich phel" still brings back Michael Phelps.</div>
            <div style={{marginTop: 20}}>Just to emphasise that anything can go in here, here is an image!!</div>
            <div>
                <img src="https://www.ag-grid.com/images/ag-Grid2-200.png"
                    style={{width: 150, textAlign: "center", padding: 10, margin: 10, border: "1px solid lightgrey"}}/>
            </div>
        </div>
    )
});
