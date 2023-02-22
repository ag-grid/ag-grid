import React from 'react';
import { Helmet } from 'react-helmet';
import {isProductionBuild, localPrefix, rootLocalPrefix} from '../../../utils/consts';

const helmet = [];
if(!isProductionBuild()) {
    helmet.push(
        <link
            key="live-streaming-theme"
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
const LiveStreamingDemo = () => (
    <>
        <Helmet>
            <style type="text/css">{`
                #live-stream-updates-grid .number { text-align: right; }
                #live-stream-updates-grid .ag-row-level-0 { font-weight: bold; }
                #live-stream-updates-grid .ag-row-level-1 { color: lightblue; }
                #live-stream-updates-grid .ag-row-level-2 { color: lightyellow; }
            `}</style>
            <script
                crossOrigin="anonymous"
                src={`${rootLocalPrefix}/live-stream-updates/main.js`}
                type="text/javascript"
            />
            {helmet.map((entry) => entry)}
        </Helmet>
        <div id="live-stream-updates-grid" style={{ height: 500 }} className="ag-theme-balham-dark"></div>

        <a href="https://medium.com/ag-grid/how-to-test-for-the-best-html5-grid-for-streaming-updates-53545bb9256a">
            Read more about stream performance
        </a>
    </>
);

export default LiveStreamingDemo;
