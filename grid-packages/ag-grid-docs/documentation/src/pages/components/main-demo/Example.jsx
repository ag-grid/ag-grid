import React from "react";
import {Helmet} from "react-helmet";
import {localPrefix, rootLocalPrefix} from "../../../utils/consts";
import isDevelopment from '../../../utils/is-development';
import styles from "../assets/homepage/homepage.module.scss";

const helmet = [];
if (isDevelopment()) {
    helmet.push(<link key="live-streaming-theme" rel="stylesheet" href={`${localPrefix}/@ag-grid-community/core/dist/styles/ag-theme-alpine.css`}
                      crossOrigin="anonymous"/>);
    helmet.push(<link key="live-streaming-theme" rel="stylesheet" href={`${localPrefix}/@ag-grid-community/core/dist/styles/ag-theme-alpine-dark.css`}
                      crossOrigin="anonymous"/>);
    helmet.push(<link key="live-streaming-theme" rel="stylesheet" href={`${localPrefix}/@ag-grid-community/core/dist/styles/ag-theme-balham.css`}
                      crossOrigin="anonymous"/>);
    helmet.push(<link key="live-streaming-theme" rel="stylesheet" href={`${localPrefix}/@ag-grid-community/core/dist/styles/ag-theme-balham-dark.css`}
                      crossOrigin="anonymous"/>);
    helmet.push(<link key="live-streaming-theme" rel="stylesheet" href={`${localPrefix}/@ag-grid-community/core/dist/styles/ag-theme-material.css`}
                      crossOrigin="anonymous"/>);
    helmet.push(<script key="enterprise-lib" src={`${localPrefix}/@ag-grid-enterprise/all-modules/dist/ag-grid-enterprise.js`}
                        type="text/javascript"/>);
} else {
    helmet.push(<script key="enterprise-lib" src="https://unpkg.com/ag-grid-enterprise/dist/ag-grid-enterprise.min.js" type="text/javascript"/>);

}
const Example = () => (
    <>
        <Helmet>
            <style type="text/css">{`
                .collapsed {
                            height: 0;
                }
            `}</style>
            <script crossOrigin="anonymous" src={`${rootLocalPrefix}/example.js`} type="text/javascript"/>
            {helmet.map(entry => entry)}
        </Helmet>
        <div className={`${styles['example-wrapper']}`}>
            <div className={`${styles['example-toolbar']}`} id='example-toolbar'>
                <div className={styles['options-container']}>
                    <div>
                        <label htmlFor="data-size">Data Size:</label>
                        {/* listener will be dynamically attached by example.js */}
                        <select id="data-size" alt="Grid Theme Dropdown"></select>
                        <span id="message" style={{marginLeft: 10}}>
                            <i className="fa fa-spinner fa-pulse fa-fw margin-bottom"/>
                        </span>
                    </div>
                    <div>
                        <label htmlFor="grid-theme">Theme:</label>

                        {/* listener will be dynamically attached by example.js */}
                        <select id="grid-theme" defaultValue="ag-theme-alpine">
                            <option value="">-none-</option>
                            <option value="ag-theme-alpine">Alpine</option>
                            <option value="ag-theme-alpine-dark">Alpine Dark</option>
                            <option value="ag-theme-balham">Balham</option>
                            <option value="ag-theme-balham-dark">Balham Dark</option>
                            <option value="ag-theme-material">Material</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="global-filter">Filter:</label>
                        {/* listener will be dynamically attached by example.js */}
                        <input
                            placeholder="Filter any column..." type="text"
                            className="hide-when-small"
                            id="global-filter"
                            style={{flex: 1}}
                        />
                    </div>
                    <div className={styles['video-tour']}>
                        <a href="https://youtu.be/29ja0liMuv4" target="_blank" rel="noreferrer">Take a video tour</a>
                    </div>
                </div>
            </div>
            <div className={styles['options-expander']}>
                <span id="messageText"/>
                {/* listener will be dynamically attached by example.js */}
                <div id="options-toggle"><span>&nbsp;</span>OPTIONS</div>
                <span>&nbsp;</span>
            </div>

            <section className={styles['example-wrapper__grid-wrapper']} style={{padding: "1rem", paddingTop: 0}}>
                <div id="myGrid" style={{flex: "1 1 auto", overflow: "hidden"}} className="ag-theme-alpine"/>
            </section>
        </div>
    </>
)

export default Example;
