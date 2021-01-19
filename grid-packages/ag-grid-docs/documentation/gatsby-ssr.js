import React from 'react';
import { dependencies } from './package.json';

/* It is better to pull these files directly from a CDN rather than bundling them ourselves. However, the packages are
 * still required to be installed as they are used elsewhere, so we import the versions here to ensure we are
 * consistent. */
export const onRenderBody = ({ setHeadComponents, setPostBodyComponents }) => {
    setHeadComponents([
        <link
            key="fontawesome"
            rel="stylesheet"
            href={`https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-svg-core@${dependencies['@fortawesome/fontawesome-svg-core']}/styles.min.css`}
            crossOrigin="anonymous" />,
        <link
            key="roboto"
            rel="stylesheet"
            href="https://cdn.jsdelivr.net/npm/@fontsource/roboto@4.1.0/index.min.css"
            crossOrigin="anonymous" />,
    ]);

    setPostBodyComponents([
        <script
            key="jquery"
            src={`https://cdnjs.cloudflare.com/ajax/libs/jquery/${dependencies['jquery']}/jquery.slim.min.js`}
            crossOrigin="anonymous" />,
        <script
            key="bootstrap"
            src={`https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/${dependencies['bootstrap']}/js/bootstrap.bundle.min.js`}
            crossOrigin="anonymous" />
    ]);
};