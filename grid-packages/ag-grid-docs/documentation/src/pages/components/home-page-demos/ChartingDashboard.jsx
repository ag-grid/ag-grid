import React from "react";
import {Helmet} from "react-helmet";
import {rootLocalPrefix} from '../../../utils/consts';

const ChartingDashboardDemo = () => {
    return (<>
        <Helmet>
            <link rel="stylesheet" href={`${rootLocalPrefix}/dev/@ag-grid-community/core/dist/styles/ag-theme-balham-dark.css`}
                  crossOrigin="anonymous"/>
            <script crossOrigin="anonymous" src={`${rootLocalPrefix}/integrated-charting/main.js`} type="text/javascript"/>
            <script src={`${rootLocalPrefix}/dev/@ag-grid-enterprise/all-modules/dist/ag-grid-enterprise.js`} type="text/javascript"/>
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
    </>)
}

export default ChartingDashboardDemo;
