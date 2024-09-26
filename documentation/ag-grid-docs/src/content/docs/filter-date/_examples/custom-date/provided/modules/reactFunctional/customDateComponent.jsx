import React, { useCallback, useEffect, useRef, useState } from 'react';

import { useGridDate } from 'ag-grid-react';

export default ({ date, onDateChange }) => {
    const [picker, setPicker] = useState(null);
    const refFlatPickr = useRef(null);
    const refInput = useRef(null);

    useEffect(() => {
        setPicker(
            flatpickr(refFlatPickr.current, {
                onChange: (selectedDates) => onDateChange(selectedDates[0]),
                dateFormat: 'd/m/Y',
                wrap: true,
            })
        );
    }, []);

    useEffect(() => {
        if (picker) {
            picker.calendarContainer.classList.add('ag-custom-component-popup');
        }
    }, [picker]);

    useEffect(() => {
        if (picker) {
            picker.setDate(date);
        }
    }, [date, picker]);

    const setInputPlaceholder = useCallback((placeholder) => {
        if (refInput.current) {
            refInput.current.setAttribute('placeholder', placeholder);
        }
    }, []);

    const setInputAriaLabel = useCallback((label) => {
        if (refInput.current) {
            refInput.current.setAttribute('aria-label', label);
        }
    }, []);

    useGridDate({
        setInputPlaceholder,
        setInputAriaLabel,
    });

    return (
        <div className="ag-input-wrapper custom-date-filter" role="presentation" ref={refFlatPickr}>
            <input type="text" ref={refInput} data-input style={{ width: '100%' }} />
            <a className="input-button" title="clear" data-clear>
                <i className="fa fa-times"></i>
            </a>
        </div>
    );
};
