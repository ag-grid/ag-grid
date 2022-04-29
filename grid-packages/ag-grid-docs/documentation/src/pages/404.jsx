import React from 'react';
import {Link} from 'gatsby';
import Seo from "./components/SEO";
import styles from "./components/assets/homepage/homepage.module.scss";

const ErrorPage = () =>
    <>
        <Seo title="AG Grid: Page Not Found"/>
        <div className={styles['page-content']}>
            <h1>AG Grid: Page Not Found</h1>
            <p style={{height: 600}}>
                Sorry, but it looks like you've ended up in the wrong place. Please go to the <Link to="/">homepage</Link> or&nbsp;
                <Link to="/documentation">documentation</Link> to try to find what you're looking for.
            </p>
        </div>
    </>

export default ErrorPage;
