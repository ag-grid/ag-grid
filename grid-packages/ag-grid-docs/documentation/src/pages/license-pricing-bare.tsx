import React from 'react';
import LicensePricing from './license-pricing';

const IS_SSR = typeof window === 'undefined';

const LicensePricingBare = ({location}) => {
    if (!IS_SSR) {
        const params = new URLSearchParams(location.search);
        const darkMode = params.get("darkMode") === "true";

        const htmlEl = document.querySelector('html') as any;
        // Using .no-transitions class so that there are no animations between light/dark modes
        htmlEl.classList.add('no-transitions');
        htmlEl.dataset.darkMode = darkMode ? 'true' : 'false';
        htmlEl.classList.remove('no-transitions');
    }

    return (
        <LicensePricing></LicensePricing>
    )
}

export default LicensePricingBare;
