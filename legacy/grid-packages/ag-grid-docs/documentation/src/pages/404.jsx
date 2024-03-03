import { Link } from 'gatsby';
import React, { useEffect } from 'react';
import docsStyles from '@design-system/modules/GridDocs.module.scss';
import { track404 } from '../utils/analytics';
import Seo from './components/SEO';

const ErrorPage = () => {
    useEffect(() => {
        track404({
            path: document.location.pathname,
        });
    }, []);

    return (
        <>
            <Seo title="AG Grid: Page Not Found" />
            <div className={docsStyles['doc-page-wrapper']}>
                <div className={docsStyles['doc-page']}>
                    <h1>AG Grid: Page Not Found</h1>
                    <p style={{ height: 600 }}>
                        Sorry, but it looks like you've ended up in the wrong place. Please go to the{' '}
                        <Link to="/">homepage</Link> or&nbsp;
                        <Link to="/documentation">documentation</Link> to try to find what you're looking for.
                    </p>
                </div>
            </div>
        </>
    );
};

export default ErrorPage;
