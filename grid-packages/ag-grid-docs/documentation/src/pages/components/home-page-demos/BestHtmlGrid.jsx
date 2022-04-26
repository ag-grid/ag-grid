import React from "react";
import {Helmet} from "react-helmet";
import styles from "../assets/homepage/homepage.module.scss";
import {rootLocalPrefix} from '../../../utils/consts';

const BestHtmlDemo = () => {
    return (<>
        <Helmet>
            <link rel="stylesheet" href={`${rootLocalPrefix}/example-rich-grid/styles.css`} crossOrigin="anonymous"/>
            <link rel="stylesheet" href={`${rootLocalPrefix}/dev/@ag-grid-community/core/dist/styles/ag-theme-material.css`}
                  crossOrigin="anonymous"/>
            <script src={`${rootLocalPrefix}/example-rich-grid/data.js`} type="text/javascript"/>
            <script defer={true} src={`${rootLocalPrefix}/example-rich-grid/example.js`} type="text/javascript"/>
            <script src={`${rootLocalPrefix}/dev/@ag-grid-enterprise/all-modules/dist/ag-grid-enterprise.js`} type="text/javascript"/>
        </Helmet>
        <div id='bestHtml5Grid' style={{height: 515}} className={`${styles['stage-scenarios__bestHtml5Grid']} ag-theme-material`}>
            <div className={styles['loading']}>
                <p>Loading Demo...</p>
            </div>
        </div>
    </>)
}

export default BestHtmlDemo;
