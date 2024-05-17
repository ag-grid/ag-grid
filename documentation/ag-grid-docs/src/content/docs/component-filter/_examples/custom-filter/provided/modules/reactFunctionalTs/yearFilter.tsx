import { IAfterGuiAttachedParams, IDoesFilterPassParams } from '@ag-grid-community/core';
import { CustomFilterProps, useGridFilter } from '@ag-grid-community/react';
import React, { ChangeEvent, useCallback, useEffect, useState } from 'react';

export default ({ model, onModelChange }: CustomFilterProps) => {
    const [closeFilter, setCloseFilter] = useState<(() => void) | undefined>();
    const [unappliedModel, setUnappliedModel] = useState(model);

    const doesFilterPass = useCallback((params: IDoesFilterPassParams) => {
        // doesFilterPass only gets called if the filter is active,
        // which is when the model is not null (e.g. >= 2010 in this case)
        return params.data.year >= 2010;
    }, []);

    const afterGuiAttached = useCallback(({ hidePopup }: IAfterGuiAttachedParams) => {
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

    const onYearChange = ({ target: { value } }: ChangeEvent<HTMLInputElement>) => {
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
