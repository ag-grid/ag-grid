import React from 'react';

const loadingStyles = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%) scale(2)',
};

const loadingScript = `(function() {
    const cleanupLoading = () => {
        if (document.querySelector('.ag-root-wrapper, .ag-chart-wrapper')) {
            document.querySelector('#loading-spinner').remove();
            document.querySelector('#loading-script').remove();
        } else {
            requestAnimationFrame(() => cleanupLoading());
        }
    };

    cleanupLoading();
})()`;

export const LoadingSpinner = () => {
    return (
        <>
            <object
                id="loading-spinner"
                style={loadingStyles}
                type="image/svg+xml"
                data="https://ag-grid.com/images/ag-grid-loading-spinner.svg"
                aria-label="loading"
            ></object>
            <script id="loading-script" dangerouslySetInnerHTML={{ __html: loadingScript }}></script>
        </>
    );
};
