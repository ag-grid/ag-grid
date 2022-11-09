import React from 'react';
import Styles from './Styles';
import Scripts from './Scripts';

var ANGULAR_VERSION = "14.2.6";

const extrasMap = {
    jquery: {
        scripts: ['https://cdnjs.cloudflare.com/ajax/libs/jquery/1.12.1/jquery.min.js']
    },
    jqueryui: {
        scripts: ['https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min.js'],
        styles: ['https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min.css']
    },
    rxjs: {
        scripts: ['https://cdnjs.cloudflare.com/ajax/libs/rxjs/5.4.0/Rx.min.js']
    },
    bluebirdjs: {
        scripts: [
            'https://cdnjs.cloudflare.com/ajax/libs/bluebird/3.7.2/bluebird.core.min.js',
            'https://cdnjs.cloudflare.com/ajax/libs/bluebird/3.7.2/bluebird.min.js'
        ]
    },
    lodash: {
        scripts: ['https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.4/lodash.min.js']
    },
    momentjs: {
        scripts: ['https://momentjs.com/downloads/moment-with-locales.min.js']
    },
    alasql: {
        scripts: ['https://cdnjs.cloudflare.com/ajax/libs/alasql/0.5.5/alasql.min.js']
    },
    bootstrap: {
        scripts: ['https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.7/js/bootstrap.min.js'],
        styles: [
            'https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.7/css/bootstrap.min.css',
            'https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.7/css/bootstrap-theme.min.css'
        ]
    },
    flatpickr: {
        scripts: ['https://cdnjs.cloudflare.com/ajax/libs/flatpickr/4.5.2/flatpickr.min.js'],
        styles: [
            'https://cdnjs.cloudflare.com/ajax/libs/flatpickr/4.5.2/flatpickr.min.css',
            'https://cdnjs.cloudflare.com/ajax/libs/flatpickr/4.5.2/themes/material_blue.css'
        ]
    },
    fontawesome: {
        styles: ['https://use.fontawesome.com/releases/v5.6.3/css/all.css']
    },
    'xlsx-style': {
        scripts: ['https://cdn.jsdelivr.net/npm/xlsx-style@0.8.13/dist/xlsx.full.min.js']
    },
    materialdesign: {
        styles: [
            `https://cdn.jsdelivr.net/npm/@angular/material@${ANGULAR_VERSION}/prebuilt-themes/indigo-pink.css`,
            'https://fonts.googleapis.com/icon?family=Material+Icons'
        ]
    },
    materialdesignicons: {
        styles: [
            'https://cdn.jsdelivr.net/npm/@mdi/font/css/materialdesignicons.css'
        ]
    }
};

/**
 * These are the extra scripts or styles that an example can import.
 */
const Extras = ({ options }) => {
    const { extras } = options;

    if (!extras) { return null; }

    const requiredExtras = new Set();

    extras.forEach(extra => {
        requiredExtras.add(extra);

        if (extra === 'bootstrap' || 'jqueryui') {
            // bootstrap and jQuery UI require jQuery
            requiredExtras.add('jquery');
        }
    });

    const styles = [];
    const scripts = [];

    // iterate over all possible scripts to ensure they are included in the correct order
    Object.keys(extrasMap).forEach(key => {
        if (!requiredExtras.has(key)) { return; }

        const config = extrasMap[key];

        if (config.styles) {
            styles.push(...config.styles);
        }

        if (config.scripts) {
            scripts.push(...config.scripts);
        }
    });

    return <>
        <Styles files={styles} />
        <Scripts files={scripts} />
    </>;
};

export default Extras;