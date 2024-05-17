import { useGridFilter } from '@ag-grid-community/react';
import React, { useCallback, useEffect, useState } from 'react';

export default ({ model, onModelChange }) => {
    const [closeFilter, setCloseFilter] = useState();
    const [unappliedModel, setUnappliedModel] = useState(model);

    const doesFilterPass = useCallback((params) => {
        // doesFilterPass only gets called if the filter is active,
        // which is when the model is not null (e.g. >= 2010 in this case)
        return params.data.year >= 2010;
    }, []);

    const afterGuiAttached = useCallback(({ hidePopup }) => {
        setCloseFilter(() => hidePopup);
    }, []);

    // register filter handlers with the grid
    useGridFilter({
        doesFilterPass,
        afterGuiAttached,
    });

    useEffect(() => {
        setUnappliedModel(model);
    }, [model]);

    const onYearChange = ({ target: { value } }) => {
        setUnappliedModel(value === 'All' ? null : value);
    };

    const onClick = () => {
        onModelChange(unappliedModel);
        if (closeFilter) {
            closeFilter();
        }
    };

    return (
        <div className="year-filter">
            <div>Select Year Range</div>
            <label>
                <input type="radio" name="year" value="All" checked={unappliedModel == null} onChange={onYearChange} />{' '}
                All
            </label>
            <label>
                <input type="radio" name="year" value="2010" checked={unappliedModel != null} onChange={onYearChange} />{' '}
                Since 2010
            </label>
            <button onClick={onClick}>Apply</button>
        </div>
    );
};
