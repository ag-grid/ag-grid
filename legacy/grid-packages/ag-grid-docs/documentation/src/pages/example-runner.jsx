import React from 'react';
import { Helmet } from 'react-helmet';
import * as queryString from "query-string";
import ExampleRunnerResult from 'components/example-runner/ExampleRunnerResult';
import { useExampleFileNodes } from 'components/example-runner/use-example-file-nodes';
import { getExampleInfo } from 'components/example-runner/helpers';

/* eslint-disable limited-exports-page-templates */
const ExampleRunnerPage = ({location}) => {
    const nodes = useExampleFileNodes();
    const { pageName, library, framework, useVue3, importType, name, title, type, options = {}} = queryString.parse(location.search);

    const exampleInfo = getExampleInfo(nodes, library, pageName, name, title, type, options, framework, useVue3, importType);

    return <div style={{ height: '100vh', width: '100%' }}>
        <Helmet title={title}>
            <meta name="robots" content="noindex" />
        </Helmet>
        <ExampleRunnerResult exampleInfo={exampleInfo} />
    </div>;
};


export default ExampleRunnerPage;
