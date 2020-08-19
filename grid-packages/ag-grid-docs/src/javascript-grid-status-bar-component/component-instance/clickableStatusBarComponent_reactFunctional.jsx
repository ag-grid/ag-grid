import React, {forwardRef, useImperativeHandle, useState} from 'react';

export default forwardRef((props, ref) => {
    const [visible, setVisible] = useState(true);

    const onClick = () => {
        alert('Selected Row Count: ' + props.api.getSelectedRows().length)
    }

    useImperativeHandle(ref, () => {
        return {
            setVisible: visible => {
                setVisible(visible);
            },
            isVisible: () => {
                return visible;
            }
        }
    });


    if (visible) {
        return (
            <div className="container">
                <div>
                    <span className="component">Status Bar Component&nbsp;
                        <input type="button" onClick={() => onClick()} value="Click Me"/>
                    </span>
                </div>
            </div>
        );
    }

    return null;
});

