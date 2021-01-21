import React from 'react';
import { Helmet } from 'react-helmet';
import { getHeaderTitle } from 'utils/page-header';

const Default = () => <div><Helmet title={getHeaderTitle('Documentation')} /></div>;

export default Default;