import { useGridCellRenderer } from '@ag-grid-community/react';
import React, { useCallback, useRef } from 'react';

export default () => {
    const buttonRef = useRef(null);

    const suppressGridClickHandling = useCallback((event) => {
        return !!buttonRef.current && !!buttonRef.current.contains(event.target);
    }, []);

    useGridCellRenderer({
        suppressGridClickHandling,
    });

    return (
        <button ref={buttonRef} onClick={() => console.log('Button clicked')}>
            Custom Button
        </button>
    );
};
