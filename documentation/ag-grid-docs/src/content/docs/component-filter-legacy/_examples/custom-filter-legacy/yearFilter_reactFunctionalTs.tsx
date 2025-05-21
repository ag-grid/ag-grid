import type { ChangeEvent } from 'react';
import React, { useCallback, useEffect, useState } from 'react';

import type { IAfterGuiAttachedParams, IDoesFilterPassParams } from 'ag-grid-community';
import type { CustomFilterProps } from 'ag-grid-react';
import { useGridFilter } from 'ag-grid-react';

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
