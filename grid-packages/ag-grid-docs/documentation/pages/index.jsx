import React from 'react';
import { Helmet } from 'react-helmet';
import { getHeaderTitle } from 'utils/page-header';

const Default = () => <div>
    <Helmet title={getHeaderTitle('Documentation')} />
    <h1>Documentation</h1>
    <div>Loading framework-specific content...</div>
</div>;

export default Default;