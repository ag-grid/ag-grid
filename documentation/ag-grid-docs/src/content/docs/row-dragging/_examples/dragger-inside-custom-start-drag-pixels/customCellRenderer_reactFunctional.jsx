import React, { useEffect, useRef } from 'react';

const CustomCellRenderer = (props) => {
    const myRef = useRef(null);

    useEffect(() => {
        props.registerRowDragger(myRef.current, 0);
    });

    return (
        <div className="my-custom-cell-renderer">
            <div className="athlete-info">
                <span>{props.data.athlete}</span>
                <span>{props.data.country}</span>
            </div>
            <span>{props.data.year}</span>
            <i className="fas fa-arrows-alt-v" ref={myRef}></i>
        </div>
    );
};
export default CustomCellRenderer;
