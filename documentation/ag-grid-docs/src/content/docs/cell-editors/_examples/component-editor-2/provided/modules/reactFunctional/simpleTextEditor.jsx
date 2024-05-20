import React, { useEffect, useRef } from 'react';

export default ({ value, onValueChange, eventKey, rowIndex, column }, ref) => {
    const updateValue = (val) => {
        onValueChange(val === '' ? null : val);
    };

    useEffect(() => {
        let startValue;

        if (eventKey === 'Backspace') {
            startValue = '';
        } else if (eventKey && eventKey.length === 1) {
            startValue = eventKey;
        } else {
            startValue = value;
        }
        if (startValue == null) {
            startValue = '';
        }

        updateValue(startValue);

        refInput.current.focus();
    }, []);

    const refInput = useRef(null);

    return (
        <input
            value={value || ''}
            ref={refInput}
            onChange={(event) => updateValue(event.target.value)}
            className="my-simple-editor"
        />
    );
};
