import React, {forwardRef, useEffect, useImperativeHandle, useRef, useState} from 'react';
import ReactDOM from 'react-dom';

export default forwardRef((props, ref) => {
    const [text, setText] = useState('');
    const refInput = useRef(null);

    useEffect(() => {
        props.filterChangedCallback()
    }, [text])

    useImperativeHandle(ref, () => {
        return {
            isFilterActive() {
                return text != null && text !== '';
            },

            doesFilterPass(params) {
                const { node } = params;
                const value = props.getValue(node).toString().toLowerCase();
        
                return text.toLowerCase()
                    .split(' ')
                    .every(filterWord => value.indexOf(filterWord) >= 0);
            },

            getModel() {
                if (!this.isFilterActive()) { return null; }

                return {value: text};
            },

            setModel(model) {
                setText(model ? model.value : '');
            },

            afterGuiAttached(params) {
                focus();
            },

            componentMethod(message) {
                alert(`Alert from PartialMatchFilterComponent: ${message}`);
            }
        }
    });

    const focus = () => {
        window.setTimeout(() => {
            const container = ReactDOM.findDOMNode(refInput.current);
            if (container) {
                container.focus();
            }
        });
    }

    const onChange = event => {
        const newValue = event.target.value;
        if (text !== newValue) {
            setText(newValue);
        }
    }

    const style = {
        borderRadius: '5px',
        width: '200px',
        height: '50px',
        padding: '10px'
    };

    return (
        <div style={style}>Filter:
            <input style={{height: '20px'}} ref={refInput}
                   value={text}
                   onChange={onChange}
                   className="form-control"/>
        </div>
    );

});
