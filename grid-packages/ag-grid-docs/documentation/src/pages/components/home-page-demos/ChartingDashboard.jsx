import React from 'react';
import { Helmet } from 'react-helmet';
import {isProductionBuild, localPrefix, rootLocalPrefix} from '../../../utils/consts';

const helmet = [];
if(!isProductionBuild()) {
    helmet.push(
        <link
            key="charting-dashboard-theme"
            rel="stylesheet"
            href={`${localPrefix}/@ag-grid-community/styles/ag-theme-balham.css`}
            crossOrigin="anonymous"
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

const ChartingDashboardDemo = () => (
    <>
        <Helmet>
            <script
                crossOrigin="anonymous"
                src={`${rootLocalPrefix}/integrated-charting/main.js`}
                type="text/javascript"
            />
            {helmet.map((entry) => entry)}
        </Helmet>
        <div id="integrated-charting-grid" style={{ height: 400 }} className="ag-theme-balham-dark"></div>
        <div id="integrated-charting-chart" style={{ height: 400 }} className="ag-theme-balham-dark"></div>

        <a href="/javascript-grid/integrated-charts/">Read more about integrated charting</a>
    </>
);

export default ChartingDashboardDemo;
