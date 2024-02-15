import React, { useEffect, useState } from 'react';
import LicensePricing, { type LicenseTab } from './license-pricing';

const LicensePricingBare = ({location}) => {
    const [initialTab, setInitialTab] = useState<LicenseTab>('grid');

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const tab = params.get('tab') as LicenseTab;

        setInitialTab(tab);
    }, [])

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const darkMode = params.get("darkMode") === "true";

        const htmlEl = document.querySelector('html') as any;
        // Using .no-transitions class so that there are no animations between light/dark modes
        htmlEl.classList.add('no-transitions');
        htmlEl.dataset.darkMode = darkMode ? 'true' : 'false';
        htmlEl.classList.remove('no-transitions');
    }, [])

    return (
        <LicensePricing initialTab={initialTab} isWithinIframe={true}></LicensePricing>
    )
}

export default LicensePricingBare;
