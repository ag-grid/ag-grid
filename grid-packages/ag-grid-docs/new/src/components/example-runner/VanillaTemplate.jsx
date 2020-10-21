import React from 'react';

const VanillaTemplate = ({ indexFragment, scriptFiles, isEnterprise = false }) => {
    const agGridVersion = '24.1.0';
    const communityScriptPath = `https://unpkg.com/@ag-grid-community/all-modules@${agGridVersion}/dist/ag-grid-community.min.js`;
    const enterpriseScriptPath = `https://unpkg.com/@ag-grid-enterprise/all-modules@${agGridVersion}/dist/ag-grid-enterprise.min.js`;

    return <html lang="en">
        <head>
            <script dangerouslySetInnerHTML={{ __html: "var __basePath = '/';" }}></script>
            <style media="only screen">
                {`html, body {
                    height: 100%;
                    width: 100%;
                    margin: 0;
                    box-sizing: border-box;
                    -webkit-overflow-scrolling: touch;
                }

                html {
                    position: absolute;
                    top: 0;
                    left: 0;
                    padding: 0;
                    overflow: auto;
                }

                body {
                    padding: 1rem;
                    overflow: auto;
                }`}
            </style>
            <script src={isEnterprise ? enterpriseScriptPath : communityScriptPath}></script>
        </head>

        <body>
            <div style={{ height: '100%', boxSizing: 'border-box' }} dangerouslySetInnerHTML={{ __html: indexFragment }}></div>
            {scriptFiles.map(script => <script key={script} src={script}></script>)}
        </body>
    </html >;
};

export default VanillaTemplate;