import React from "react";
import { Helmet } from "react-helmet";
import styles from "../assets/homepage/homepage.module.scss";
import {rootLocalPrefix, localPrefix} from '../../../utils/consts';
import isDevelopment from '../../../utils/is-development';

const helmet = [];
if (isDevelopment()) {
    helmet.push(<link key="hero-grid-theme" rel="stylesheet" href={`${localPrefix}/@ag-grid-community/styles/ag-theme-alpine.css`} crossOrigin="anonymous" type="text/css"/>);
    helmet.push(<script key="enterprise-lib" src={`${localPrefix}/@ag-grid-enterprise/all-modules/dist/ag-grid-enterprise.js`} type="text/javascript"/>);
} else {
    helmet.push(<script key="enterprise-lib" src="https://cdn.jsdelivr.net/npm/ag-grid-enterprise/dist/ag-grid-enterprise.min.js" type="text/javascript" />);
}

const HeroGrid = () => (
    <>
        <Helmet>
            <script defer={true} src={`${rootLocalPrefix}/hero-grid/main.js`} type="text/javascript"/>
            {/* <script defer={true} src={`${rootLocalPrefix}/example-rich-grid/example.js`} type="text/javascript"/> */}
            {helmet.map(entry => entry)}
        </Helmet>
        <div id='heroGrid' style={{ height: "400px", width: "800px" }} className={'ag-theme-alpine-dark'}></div>
    </>
);

export default HeroGrid;
