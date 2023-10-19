import classnames from 'classnames';
import { SEO } from 'components/SEO';
import React from 'react';
import styles from './home.module.scss';
import Code from '../components/Code.jsx';
import { Link } from 'gatsby';

const ReactQuickStart = () => {
    return (
        <>
            {/* Download from NPM */}
            <h2>Download</h2>
            <p>
                Install the required dependencies:
            </p>
            <Code language={'bash'} lineNumbers={false} code={'npm install ag-grid-react'} />
            <p>
                <i>For more information on installation, refer to our detailed <a>installation guide</a>.</i>
            </p>

            {/* Create the Grid */}
            <h2>Create</h2>
            <p>
                Create a basic grid:
            </p>
            <Code language={'jsx'} lineNumbers={true} code={"import { AgGridReact } from 'ag-grid-react'; // Grid Component\nimport 'ag-grid-community/styles/ag-grid.css'; // Core CSS;\nimport 'ag-grid-community/styles/ag-theme-alpine.css'; // Alpine Theme\n\nconst GridExample = () => {\n\t// Data to be displayed within the grid\n\tconst [rowData] = useState([\n\t\t{ make: 'Toyota', model: 'Celica', price: 35000 },\n\t\t{ make: 'Ford', model: 'Mondeo', price: 32000 },\n\t\t{ make: 'Porsche', model: 'Boxter', price: 72000 }\n\t]);\n\t\n\t// Columns (Should match properties in rowData)\n\tconst [columnDefs] = useState([\n\t\t{ field: 'make' },\n\t\t{ field: 'model' },\n\t\t{ field: 'price' }\n\t]);\n\n\treturn (\n\t\t// Grid container which sets the theme & dimensions of the grid\n\t\t<div className='ag-theme-alpine' style={{width: 600, height: 500}}>\n\t\t\t<AgGridReact rowData={rowData} columnDefs={columnDefs} />\n\t\t</div>\n\t)\n}"} />
        </>
    )
}

/**
 * This is the home page for the documentation.
 */
const HomePage = ({ pageContext: { framework } }) => {
    const getQuickstartForFramework = () => {
        switch (framework) {
            case "javascript":
                return <></>
            case "react":
                return <ReactQuickStart />;
            case "angular":
                return <></>
            case "vue":
                return <></>
        }
    }

    return (
        <div className={styles.docsHome}>
            {/*eslint-disable-next-line react/jsx-pascal-case*/}
            <SEO
                title="Documentation"
                description="Our documentation will help you to get up and running with AG Grid."
                framework={framework}
                pageName="home"
            />

            {/* Introduction / Heading */}
            <div className={classnames(styles.section, styles.introSection, 'font-size-responsive')}>
                <h1>{framework} Quick Start</h1>
                <p className="font-size-extra-large">Display your data in a Grid in 60 seconds.</p>
            </div>

            {/* Quick Start Guide */}
            <div className={classnames(styles.section, styles.introSection, 'font-size-responsive')}>
                {getQuickstartForFramework()}
            </div>

            {/* Next Steps */}
            <div className={classnames(styles.section, styles.introSection, 'font-size-responsive')}>
                <h2>Next Steps</h2>
                <p>
                    Read our introductory tutorial to learn how to use AG Grid
                </p>
                <ul>
                    <li><Link to='/'>Introduction to the Grid</Link></li>
                </ul>
            </div>
        </div>
    );
};

export default HomePage;
