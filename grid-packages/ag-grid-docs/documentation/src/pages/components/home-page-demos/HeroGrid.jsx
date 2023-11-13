// Remount component when Fast Refresh is triggered
// @refresh reset

import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { initGrid } from '../../../components/hero-grid';
import LogoMark from '../../../components/LogoMark';
import { isProductionBuild, localPrefix } from '../../../utils/consts';
import './HeroGrid.module.scss';

const helmet = [];
if (!isProductionBuild()) {
    helmet.push(
        <link
            key="hero-grid-theme"
            rel="stylesheet"
            href={`${localPrefix}/@ag-grid-community/styles/ag-theme-alpine.css`}
            crossOrigin="anonymous"
            type="text/css"
        />
    );
    helmet.push(
        <script
            key="enterprise-lib"
            src={`${localPrefix}/@ag-grid-enterprise/all-modules/dist/ag-grid-enterprise.js`}
            type="text/javascript"
        />
    );
} else {
    helmet.push(
        <script
            key="enterprise-lib"
            src="https://cdn.jsdelivr.net/npm/ag-grid-enterprise/dist/ag-grid-enterprise.min.js"
            type="text/javascript"
        />
    );
}

const HeroGrid = () => {
    useEffect(() => {
        let gridParams = {
            selector: '#heroGrid',
        };
        const searchParams = new URLSearchParams(window.location.search);
        if (searchParams.get('isCI') === 'true') {
            gridParams = {
                ...gridParams,
                suppressUpdates: true,
                useStaticData: true,
            };
        }

        initGrid(gridParams);
    }, []);

    return (
        <>
            <Helmet>{helmet.map((entry) => entry)}</Helmet>
            <div id="heroGrid" style={{ height: '100%', width: '100%' }} className="ag-theme-alpine-dark">
                <LogoMark isSpinning />
            </div>
        </>
    );
};

export default HeroGrid;
