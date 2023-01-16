import React, {forwardRef, useEffect, useImperativeHandle, useRef, useState} from 'react';

export default forwardRef((props, ref) => {
    const getInitialValue = props => {
        let startValue = props.value;

        if (props.charPress) {
            startValue = props.charPress;
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
