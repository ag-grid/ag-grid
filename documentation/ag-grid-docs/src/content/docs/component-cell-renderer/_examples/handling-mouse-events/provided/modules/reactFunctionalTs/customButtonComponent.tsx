import { useGridCellRenderer } from '@ag-grid-community/react';
import React, { useCallback, useRef } from 'react';

export default () => {
    const buttonRef = useRef<HTMLButtonElement>(null);

    const suppressGridClickHandling = useCallback((event: MouseEvent) => {
        return !!buttonRef.current?.contains(event.target as HTMLElement);
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
