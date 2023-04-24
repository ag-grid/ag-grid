import React, { forwardRef, useImperativeHandle, useRef, useEffect, useState } from 'react';
import { IDoesFilterPassParams, IFilterParams } from "@ag-grid-community/core";

export default forwardRef((props: IFilterParams, ref) => {
    const [filterText, setFilterText] = useState<string | null>(null);
    const inputRef = useRef<any>(null);

    const isNumeric = (n: string) => !isNaN(parseFloat(n)) && isFinite(parseFloat(n));

    useEffect(() => {
        if (inputRef.current) {
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

            doesFilterPass(params: IDoesFilterPassParams) {
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

            getModel() {
                return isFilterActive() ? Number(filterText) : null;
            },

            setModel(model: any) {
                setFilterText(model);
            },

            myMethodForTakingValueFromFloatingFilter(value: string) {
                setFilterText(value);
            }
        }
    });


    const onInputBoxChanged = (event: any) => {
        setFilterText(event.target.value)
    }

    return (
        <div style={{ padding: "4px" }}>
            <div style={{ fontWeight: "bold" }}>Greater than:</div>
            <div>
                <input ref={inputRef} style={{ margin: "4px 0 4px 0" }} type="number" min="0" onInput={onInputBoxChanged} placeholder="Number of medals..." />
            </div>
        </div>
    );
});
