import React from "react";
import {Helmet} from "react-helmet";
import {rootLocalPrefix, localPrefix} from '../../../utils/consts';
import isDevelopment from '../../../utils/is-development';

const helmet = [];
if(isDevelopment()) {
    helmet.push(<link key="charting-dashboard-theme" rel="stylesheet" href={`${localPrefix}/@ag-grid-community/styles/ag-theme-balham.css`} crossOrigin="anonymous"/>);
    helmet.push(<script key="enterprise-lib" src={`${localPrefix}/@ag-grid-enterprise/all-modules/dist/ag-grid-enterprise.js`} type="text/javascript"/>);
} else {
    helmet.push(<script key="enterprise-lib" src="https://unpkg.com/ag-grid-enterprise/dist/ag-grid-enterprise.min.js" type="text/javascript"/>);
}

const ChartingDashboardDemo = () => (
    <>
        <Helmet>
            <script crossOrigin="anonymous" src={`${rootLocalPrefix}/integrated-charting/main.js`} type="text/javascript"/>
            {helmet.map(entry => entry)}
        </Helmet>
        <div className="container-fluid blackish text-light pt-2" id="dashboard-demo">
            <div className="row">
                <div className="col-12">
                    <div id="integrated-charting-grid" style={{height: 400}} className="ag-theme-balham-dark">
                    </div>
                    <div id="integrated-charting-chart" style={{height: 400}} className="ag-theme-balham-dark">
                    </div>
                </div>
            </div>
            <div className="row mt-3">
                <div className="col-12 text-right">
                    <a className="btn btn-link" href="/javascript-grid/integrated-charts/">Read more about integrated charting</a>
                </div>
            </div>
        </div>
    </>
);

export default ChartingDashboardDemo;
