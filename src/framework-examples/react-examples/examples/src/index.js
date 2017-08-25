'use strict';

import React from "react";
import {render} from "react-dom";

import "ag-grid-root/dist/styles/ag-grid.css";
import "ag-grid-root/dist/styles/theme-fresh.css";
import "../node_modules/bootstrap/dist/css/bootstrap.css";

import App from "./App";

// only required when using enterprise features
// import {LicenseManager} from "ag-grid-enterprise/main";
// LicenseManager.setLicenseKey("<your license key>");

document.addEventListener('DOMContentLoaded', () => {
    render(
        <App/>,
        document.querySelector('#app')
    );
});

