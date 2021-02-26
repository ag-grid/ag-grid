import React from 'react';
import { Helmet } from 'react-helmet';

const title = 'AG Grid: Documentation';

const Default = () => <div>
    <Helmet title={title} />
    <div className="p-3">
        <h1>{title}</h1>
        <div>Loading framework-specific content...</div>
    </div>
</div>;

export default Default;