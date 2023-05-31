import React, {forwardRef, useEffect, useImperativeHandle, useRef, useState} from 'react';

// backspace starts the editor on Windows
const KEY_BACKSPACE = 'Backspace';

export default forwardRef((props, ref) => {
    const getInitialValue = props => {
        let startValue = props.value;

        const eventKey = props.eventKey;
        const isBackspace = eventKey === KEY_BACKSPACE;

        if (isBackspace) {
            startValue = '';
        } else if (eventKey && eventKey.length === 1) {
            startValue = eventKey;
        }

        if (startValue !== null && startValue !== undefined) {
            return startValue;
        }

        return '';
    }

    const [value, setValue] = useState(getInitialValue(props));
    const refInput = useRef(null);

    useEffect(() => {
        refInput.current.focus();
    }, []);


    useImperativeHandle(ref, () => {
        return {
            getValue() {
                return value;
            },

            myCustomFunction() {
                return {
                    rowIndex: props.rowIndex,
                    colId: props.column.getId()
                };
            }
        };
    });

    return (
        <input value={value}
               ref={refInput}
               onChange={event => setValue(event.target.value)}
               className="my-simple-editor" />
    );
})
