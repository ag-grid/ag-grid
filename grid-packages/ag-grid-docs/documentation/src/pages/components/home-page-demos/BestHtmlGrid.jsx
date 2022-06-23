import React from "react";
import {Helmet} from "react-helmet";
import styles from "../assets/homepage/homepage.module.scss";
import {rootLocalPrefix, localPrefix} from '../../../utils/consts';
import isDevelopment from '../../../utils/is-development';

const helmet = [];
if(isDevelopment()) {
    helmet.push(<link key="best-html-theme" rel="stylesheet" href={`${localPrefix}/@ag-grid-community/styles/ag-theme-material.css`} crossOrigin="anonymous"/>);
    helmet.push(<script key="enterprise-lib" src={`${localPrefix}/@ag-grid-enterprise/all-modules/dist/ag-grid-enterprise.js`} type="text/javascript"/>);
} else {
    helmet.push(<script key="enterprise-lib" src="https://unpkg.com/ag-grid-enterprise/dist/ag-grid-enterprise.min.js" type="text/javascript"/>);
}

const BestHtmlDemo = () => (
    <>
        <Helmet>
            <link rel="stylesheet" href={`${rootLocalPrefix}/example-rich-grid/styles.css`} crossOrigin="anonymous"/>
            <script defer={true} src={`${rootLocalPrefix}/example-rich-grid/example.js`} type="text/javascript"/>
            {helmet.map(entry => entry)}
        </Helmet>
        <div id='bestHtml5Grid' style={{height: 515}} className={`${styles['stage-scenarios__bestHtml5Grid']} ag-theme-material`}>
            <div className={styles['loading']}>
                <p>Loading Demo...</p>
            </div>
        </div>
    </>
);

export default BestHtmlDemo;
