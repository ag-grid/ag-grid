import React, { useCallback, useEffect, useRef, useState } from 'react';

import type { CustomDateProps } from 'ag-grid-react';
import { useGridDate } from 'ag-grid-react';

// we'll be using the globally provided flatpickr for our example
declare let flatpickr: any;

export default ({ date, onDateChange }: CustomDateProps) => {
    const [picker, setPicker] = useState<any>(null);
    const refFlatPickr = useRef(null);
    const refInput = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setPicker(
            flatpickr(refFlatPickr.current, {
                onChange: (selectedDates: Date[]) => onDateChange(selectedDates[0]),
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

    const setInputPlaceholder = useCallback((placeholder: string) => {
        if (refInput.current) {
            refInput.current.setAttribute('placeholder', placeholder);
        }
    }, []);

    const setInputAriaLabel = useCallback((label: string) => {
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
