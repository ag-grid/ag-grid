import React from 'react';
import LogoMarkLoading from '../../images/inline-svgs/ag-grid-logomark-loading.svg';

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
            <LogoMarkLoading id="loading-spinner" style={loadingStyles} />
            <script id="loading-script" dangerouslySetInnerHTML={{ __html: loadingScript }}></script>
        </>
    );
};
