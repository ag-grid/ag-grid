import classnames from 'classnames';
import { convertUrl } from 'components/documentation-helpers';
import MenuView from 'components/menu-view/MenuView';
import { SEO } from 'components/SEO';
import logos from 'images/logos';
import React from 'react';
import menuData from '../../doc-pages/licensing/menu.json';
import { Icon } from '../components/Icon';
import tileStyles from '../components/menu-view/Tile.module.scss';
import supportedFrameworks from '../utils/supported-frameworks';
import styles from './home.module.scss';
import { useState } from 'react';
import Note from '../components/Note';
import Code from '../components/Code.jsx'

const OverviewSection = () => {
  return (
    <div className={classnames(styles.gridContainer)}>
      <div className={classnames(styles.cardGroup)}>
        <div className={classnames(styles.card)}>
          <div className={classnames(styles.cardTitle, 'font-size-extra-large')}>
            Introduction
            <img className={classnames(styles.cardIcon)} src="TODO" style={{ float: 'right' }} />
          </div>
          <hr className={classnames(styles.cardDivider)} />
          <div className={classnames(styles.cardBody)}>
            Know you need a Grid, but not sure which ones right for you? Check-out our
            introduction section to learn more
          </div>
          <div className={classnames(styles.cardLink)}>
            <a href='introduction/'>Learn More</a>
          </div>
        </div>
        <div className={classnames(styles.card)}>
          <div className={classnames(styles.cardTitle, 'font-size-extra-large')}>
            Quick Start
            <img className={classnames(styles.cardIcon)} src="TODO" style={{ float: 'right' }} />
          </div>
          <hr className={classnames(styles.cardDivider)} />
          <div className={classnames(styles.cardBody)}>
            Want to try AG Grid for yourself? Take a look at our Quick Start guide to
            install, configure and customise the Grid
          </div>
          <div className={classnames(styles.cardLink)}>
            <a href='get-started/'>Get Started</a>
          </div>
        </div>
        <div className={classnames(styles.card)}>
          <div className={classnames(styles.cardTitle, 'font-size-extra-large')}>
            Demos
            <img className={classnames(styles.cardIcon)} src="TODO" style={{ float: 'right' }} />
          </div>
          <hr className={classnames(styles.cardDivider)} />
          <div className={classnames(styles.cardBody)}>
            Already familiar with the Grid or want to see how it in action? Browse our Demos
            to kick-start your development
          </div>
          <div className={classnames(styles.cardLink)}>
            <a href='quick-starts/basic-example/'>Explore</a>
          </div>
        </div>
      </div>
      <div className={classnames(styles.cardGroup)}>
        <div className={classnames(styles.card)}>
          <div className={classnames(styles.cardTitle, 'font-size-extra-large')}>
            API Reference
            <img className={classnames(styles.cardIcon)} src="TODO" style={{ float: 'right' }} />
          </div>
          <hr className={classnames(styles.cardDivider)} />
          <div className={classnames(styles.cardBody)}>
            Explore our API reference page to easily access all of our API methods in one place
          </div>
          <div className={classnames(styles.cardLink)}>
            <a href='grid-interface/'>Grid API</a>
          </div>
        </div>
      </div>
    </div>
  )
}

const NeedHelpSection = () => {
  return (
    <div className={classnames(styles.cardGroup)}>
      <div className={classnames(styles.card)}>
        <div className={classnames(styles.cardTitle, 'font-size-extra-large')}>
          GitHub
          <img className={classnames(styles.cardIcon)} src="TODO" style={{ float: 'right' }} />
        </div>
        <hr className={classnames(styles.cardDivider)} />
        <div className={classnames(styles.cardBody)}>
          Browse our source-code, extend & customize the grid, or submit bug reports & feature
          requests through our GitHub
        </div>
        <div className={classnames(styles.cardLink)}>
          <a href='https://github.com/ag-grid/ag-grid' target='_blank'>View Source</a>
        </div>
      </div>
      <div className={classnames(styles.card)}>
        <div className={classnames(styles.cardTitle, 'font-size-extra-large')}>
          StackOverflow
          <img className={classnames(styles.cardIcon)} src="TODO" style={{ float: 'right' }} />
        </div>
        <hr className={classnames(styles.cardDivider)} />
        <div className={classnames(styles.cardBody)}>
          Browse 1000's of questions, support the community and build your profile, or ask your own
          questions with the `ag-grid` tag
        </div>
        <div className={classnames(styles.cardLink)}>
          <a href='https://stackoverflow.com/questions/tagged/ag-grid' target='_blank'>Ask a Question</a>
        </div>
      </div>
      <div className={classnames(styles.card)}>
        <div className={classnames(styles.cardTitle, 'font-size-extra-large')}>
          ZenDesk
          <img className={classnames(styles.cardIcon)} src="TODO" style={{ float: 'right' }} />
        </div>
        <hr className={classnames(styles.cardDivider)} />
        <div className={classnames(styles.cardBody)}>
          Enterprise customers can get dedicated support and propritized feature requests by
          submitting tickets through ZenDesk.
        </div>
        <div className={classnames(styles.cardLink)}>
          <a href='https://ag-grid.zendesk.com/' target='_blank'>Create a Ticket</a>
        </div>
      </div>
    </div>
  )
}

const JoinCommunitySection = () => {
  return (
    <div className={classnames(styles.gridContainer)}>
      <div className={classnames(styles.cardGroup)}>
        <div className={classnames(styles.card)}>
          <div className={classnames(styles.cardTitle, 'font-size-extra-large')}>
            YouTube
            <img className={classnames(styles.cardIcon)} src="TODO" style={{ float: 'right' }} />
          </div>
          <hr className={classnames(styles.cardDivider)} />
          <div className={classnames(styles.cardBody)}>
            Visual learner? Browse our YouTube.
          </div>
          <div className={classnames(styles.cardLink)}>
            <a href='https://youtube.com/c/ag-grid' target='_blank'>Subscribe</a>
          </div>
        </div>
        <div className={classnames(styles.card)}>
          <div className={classnames(styles.cardTitle, 'font-size-extra-large')}>
            Twitter (X)
            <img className={classnames(styles.cardIcon)} src="TODO" style={{ float: 'right' }} />
          </div>
          <hr className={classnames(styles.cardDivider)} />
          <div className={classnames(styles.cardBody)}>
            Join the conversation and on X (Twitter).
          </div>
          <div className={classnames(styles.cardLink)}>
            <a href='https://twitter.com/ag_grid' target='_blank'>Follow Us</a>
          </div>
        </div>
        <div className={classnames(styles.card)}>
          <div className={classnames(styles.cardTitle, 'font-size-extra-large')}>
            LinkedIn
            <img className={classnames(styles.cardIcon)} src="TODO" style={{ float: 'right' }} />
          </div>
          <hr className={classnames(styles.cardDivider)} />
          <div className={classnames(styles.cardBody)}>
            Network with the AG Grid Professional community.
          </div>
          <div className={classnames(styles.cardLink)}>
            <a href='https://www.linkedin.com/company/ag-grid/' target='_blank'>Connect</a>
          </div>
        </div>
        <div className={classnames(styles.card)}>
          <div className={classnames(styles.cardTitle, 'font-size-extra-large')}>
            Blog
            <img className={classnames(styles.cardIcon)} src="TODO" style={{ float: 'right' }} />
          </div>
          <hr className={classnames(styles.cardDivider)} />
          <div className={classnames(styles.cardBody)}>
            Read our Blog for the Latest News & Tutorials.
          </div>
          <div className={classnames(styles.cardLink)}>
            <a href='https://blog.ag-grid.com' target='_blank'>Read</a>
          </div>
        </div>
      </div>
      <div className={classnames(styles.cardGroup)}>
        <div className={classnames(styles.card)}>
          <div className={classnames(styles.cardTitle, 'font-size-extra-large')}>
            Newsletter
            <img className={classnames(styles.cardIcon)} src="TODO" style={{ float: 'right' }} />
          </div>
          <hr className={classnames(styles.cardDivider)} />
          <div className={classnames(styles.cardBody)}>
            Subscribe to our AG Grid Newsletter to be notified of new product and feature releases,
            as well as the latest news & events.
          </div>
          <div className={classnames(styles.cardLink)}>
            <a href='https://blog.ag-grid.com/newsletter/' target='_blank'>Join Mailing List</a>
          </div>
        </div>
      </div>
    </div>
  )
}

const WhatsNewSection = () => {
  return (
    <div className={classnames(styles.gridContainer)}>
      <div className={classnames(styles.cardGroup)}>
        <div className={classnames(styles.card)}>
          <div className={classnames(styles.cardTitle, 'font-size-extra-large')}>
            v30.2.0
            <p className={classnames(styles.cardDate, 'font-size-extra-small')}>August 10th</p>
          </div>
          <hr className={classnames(styles.cardDivider)} />
          <div className={classnames(styles.cardBody)}>
            Advanced Filter, Quick Filter, Rich Select Editor, Group Footer Rows
          </div>
          <div className={classnames(styles.cardLink)}>
            <a href='introduction/overview/'>Read More</a>
          </div>
        </div>
        <div className={classnames(styles.card)}>
          <div className={classnames(styles.cardTitle, 'font-size-extra-large')}>
            V30.1.0
            <p className={classnames(styles.cardDate, 'font-size-extra-small')}>July 4th</p>
          </div>
          <hr className={classnames(styles.cardDivider)} />
          <div className={classnames(styles.cardBody)}>
            Advanced Filter, Quick Filter, Rich Select Editor, Group Footer Rows
          </div>
          <div className={classnames(styles.cardLink)}>
            <a href='introduction/overview/'>Read More</a>
          </div>
        </div>
        <div className={classnames(styles.card)}>
          <div className={classnames(styles.cardTitle, 'font-size-extra-large')}>
            V30.0.0
            <p className={classnames(styles.cardDate, 'font-size-extra-small')}>May 28th</p>
          </div>
          <hr className={classnames(styles.cardDivider)} />
          <div className={classnames(styles.cardBody)}>
            Advanced Filter, Quick Filter, Rich Select Editor, Group Footer Rows
          </div>
          <div className={classnames(styles.cardLink)}>
            <a href='introduction/overview/'>Read More</a>
          </div>
        </div>
      </div>
    </div>
  )
}

const TimelineSection = () => {
  return (
    <div className={styles.timelineContainer}>
      <div className={styles.timelineColumn}>
        <div className={classnames(styles.cardTransparent)}>
          <div className={classnames(styles.cardTitle, 'font-size-extra-large')}>
            v30.2.0
            <p className={classnames(styles.cardDate, 'font-size-extra-small')}>August 10th</p>
          </div>
          <hr className={classnames(styles.cardDivider)} />
          <div className={classnames(styles.cardBody)}>
            Advanced Filter, Quick Filter, Rich Select Editor, Group Footer Rows
          </div>
        </div>
      </div>
      <div style={{ alignSelf: 'center'}}>
        <p>></p>
      </div>
      <div className={styles.timelineColumn}>
        <div className={classnames(styles.cardTransparent)}>
          <div className={classnames(styles.cardTitle, 'font-size-extra-large')}>
            v30.0.0
            <p className={classnames(styles.cardDate, 'font-size-extra-small')}>August 10th</p>
          </div>
          <hr className={classnames(styles.cardDivider)} />
          <div className={classnames(styles.cardBody)}>
            Advanced Filter, Quick Filter, Rich Select Editor, Group Footer Rows
          </div>
        </div>
      </div>
      <div style={{ alignSelf: 'center'}}>
        <p>></p>
      </div>
      <div className={styles.timelineColumn}>
        <div className={classnames(styles.cardTransparent)}>
          <div className={classnames(styles.cardTitle, 'font-size-extra-large')}>
            v30.0.0
            <p className={classnames(styles.cardDate, 'font-size-extra-small')}>August 10th</p>
          </div>
          <hr className={classnames(styles.cardDivider)} />
          <div className={classnames(styles.cardBody)}>
            Advanced Filter, Quick Filter, Rich Select Editor, Group Footer Rows
          </div>
        </div>
      </div>
    </div>
  );
}

const FeaturesSection = () => {
  const [activeTab, setActiveTab] = useState(0);

  const changeTab = (tabIndex) => {
    setActiveTab(tabIndex);
  };

  const tabs = [
    {
      'title': 'Basic',
      'features': [
        {
          'name': 'Pagination',
          'desc': 'Pagination allows the grid to paginate rows, removing the need for a vertical scroll to view more',
          'img': ''
        },
        {
          'name': 'Sorting',
          'desc': 'Sort your rows using default options, or build your own custom sorting function',
          'img': ''
        },
        {
          'name': 'Editing',
          'desc': 'Directly edit cell data within the grid, either by default or based on a condition',
          'img': ''
        },
        {
          'name': 'Grouping',
          'desc': 'Enable multiple levels of columns from the colummn header or show/hide columns',
          'img': ''
        }
      ]
    },
    {
      'title': 'Advanced',
      'note': 'Advanced features require an Enterprise Lisence, see [Pricing](https://ag-grid.com/license-pricing) page for more info.',
      'features': [
        {
          'name': 'Master / Detail',
          'desc': 'Top level grid called a Master Grid having rows that expand.',
          'img': ''
        },
        {
          'name': 'Pivoting',
          'desc': 'Take a columns values and turn them into columns.',
          'img': ''
        },
        {
          'name': 'Exporting',
          'desc': 'Excel (xlsx) export functionality without any third party libraries',
          'img': ''
        },
        {
          'name': 'Adv. Filtering',
          'desc': 'Complex filter conditions in a single type-ahead input',
          'img': ''
        }
      ]
    },
    {
      'title': 'Extend',
      'features': [
        {
          'name': 'Tool Panels',
          'desc': '',
          'img': ''
        },
        {
          'name': 'Column Menu',
          'desc': '',
          'img': ''
        },
        {
          'name': 'Column Menu',
          'desc': '',
          'img': ''
        },
        {
          'name': 'Status Bar',
          'desc': '',
          'img': ''
        }
      ]
    },
    {
      'title': 'Style',
      'features': [
        {
          'name': 'Themes',
          'desc': '',
          'img': ''
        },
        {
          'name': 'Figma Design',
          'desc': '',
          'img': ''
        },
        {
          'name': 'Cell Renderers',
          'desc': '',
          'img': ''
        },
        {
          'name': 'Value Formatters',
          'desc': '',
          'img': ''
        }
      ]
    }
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', margin: '12px 6px 12px 6px', borderBottom: '2px solid var(--neutral-200)' }}>
        {tabs.map((tabs, index) => (
          <div
            key={index}
            style={{
              padding: '15px',
              cursor: 'pointer',
              transition: 'background-color 0.3s',
              borderBottom: activeTab === index ? '2px solid var(--primary-600)' : '2px solid transparent',
              color: activeTab === index ? 'var(--primary-600)' : ''
            }}
            onClick={() => changeTab(index)}
          >
            {tabs.title}
          </div>
        ))}
      </div>

      <div>
        {tabs.map((tab, index) => (
          <div key={index} style={{ display: activeTab === index ? 'flex' : 'none' }}>

            <div className={classnames(styles.gridContainer)}>
              <div className={classnames(styles.cardGroup)}>
                {tab.features.map((feature, index) => (
                  <div className={classnames(styles.cardTransparent)}>
                    <div className={classnames(styles.cardTitle, 'font-size-extra-large')}>
                      <img />
                    </div>
                    <div className={classnames(styles.cardTitle, 'font-size-extra-large')}>
                      {feature.name}
                      <img className={classnames(styles.cardIcon)} src={feature.img} style={{ maxHeight: '24px', float: 'right' }} />
                    </div>
                    <hr className={classnames(styles.cardDivider)} />
                    <div className={classnames(styles.cardBody)}>
                      {feature.desc}
                    </div>
                  </div>
                ))}
              </div>
              <div className={classnames(styles.cardGroup)}>
                {tab.note && <Note >{tab.note}</Note>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const DemosSection = () => {
  return (
    <div className={classnames(styles.cardGroup)}>
      <div className={classnames(styles.cardTransparent)}>
        {<img style={{ width: '100%', height: '125px' }} className={classnames(styles.cardImage)} /* src={"/images/ag-Grid2-200.png"} */ />}
        <div className={classnames(styles.cardTitle, 'font-size-extra-large')}>
          Using the Grid API
        </div>
        <div className={classnames(styles.cardBody)}>
          Learn how to access the Grid API once it's ready, and then use it to manipulate the grid at run-time.
        </div>
        <div className={classnames(styles.cardLink)}>
          <a href='introduction/overview/' style={{ fontWeight: 400, marginRight: 12 }}>Demo</a>
          <a href='introduction/overview/'>Tutorial</a>
        </div>
      </div>
      <div className={classnames(styles.cardTransparent)}>
        {<img style={{ width: '100%', height: '125px' }} className={classnames(styles.cardImage)} /* src={"/images/ag-Grid2-200.png"} */ />}
        <div className={classnames(styles.cardTitle, 'font-size-extra-large')}>
          Cell Renderers
        </div>
        <div className={classnames(styles.cardBody)}>
          Learn how to customize the cells within the Grid to display things like checkboxes & Buttons
        </div>
        <div className={classnames(styles.cardLink)}>
          <a href='introduction/overview/' style={{ fontWeight: 400, marginRight: 12 }}>Demo</a>
          <a href='introduction/overview/'>Tutorial</a>
        </div>
      </div>
      <div className={classnames(styles.cardTransparent)}>
        {<img style={{ width: '100%', height: '125px' }} className={classnames(styles.cardImage)} /* src={"/images/ag-Grid2-200.png"} */ />}
        <div className={classnames(styles.cardTitle, 'font-size-extra-large')}>
          Updating Grid Data
        </div>
        <div className={classnames(styles.cardBody)}>
          Learn how to update the data displayed within the Grid in real-time
        </div>
        <div className={classnames(styles.cardLink)}>
          <a href='introduction/overview/' style={{ fontWeight: 400, marginRight: 12 }}>Demo</a>
          <a href='introduction/overview/'>Tutorial</a>
        </div>
      </div>
      <div className={classnames(styles.cardTransparent)}>
        {<img style={{ width: '100%', height: '125px' }} className={classnames(styles.cardImage)} /* src={"/images/ag-Grid2-200.png"} */ />}
        <div className={classnames(styles.cardTitle, 'font-size-extra-large')}>
          Value Formatting
        </div>
        <div className={classnames(styles.cardBody)}>
          Learn how to customise the way values, such as currencies, are formatted within the Grid
        </div>
        <div className={classnames(styles.cardLink)}>
          <a href='introduction/overview/' style={{ fontWeight: 400, marginRight: 12 }}>Demo</a>
          <a href='introduction/overview/'>Tutorial</a>
        </div>
      </div>
    </div>
  )
}

const HelpAndCommunitySection = () => {
  return (
    <div className={classnames(styles.cardGroup)}>
      <div className={classnames(styles.cardTransparent)}>
        <div className={classnames(styles.cardTitleMiddle, 'font-size-extra-large')}>
          Support & Resources
        </div>
        <div className={classnames(styles.cardBody)}>
          <div className={classnames(styles.socialIconsContainer)}>
            <img alt='GitHub' className={classnames(styles.socialIcon)} />
            <img alt='StackOverflow' className={classnames(styles.socialIcon)} />
            <img alt='ZenDesk' className={classnames(styles.socialIcon)} />
          </div>
        </div>
      </div>
      <div className={classnames(styles.cardTransparent)}>
        <div className={classnames(styles.cardTitleMiddle, 'font-size-extra-large')}>
          Join The Community
        </div>
        <div className={classnames(styles.cardBody)}>
          <div className={classnames(styles.socialIconsContainer)}>
            <img alt="Youtube" className={classnames(styles.socialIcon)} />
            <img alt="Twitter" lassName={classnames(styles.socialIcon)} />
            <img alt="LinkedIn" className={classnames(styles.socialIcon)} />
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * This is the home page for the documentation.
 */
const HomePage = ({ pageContext: { framework } }) => {
  const listOtherFrameworks = () => {
    const frameworks = supportedFrameworks.filter((f) => f !== framework);
    return (
      <span style={{ textTransform: 'capitalize' }}>
        <a href={`../${frameworks[0]}-data-grid/`}>{frameworks[0]}</a>,{' '}
        <a href={`../${frameworks[1]}-data-grid/`}>{frameworks[1]}</a>, and{' '}
        <a href={`../${frameworks[2]}-data-grid/`}>{frameworks[2]}</a>
      </span>
    );
  };

  return (
    <div className={styles.docsHome}>

      {/*eslint-disable-next-line react/jsx-pascal-case*/}
      <SEO
        title="Documentation"
        description="Our documentation will help you to get up and running with AG Grid."
        framework={framework}
        pageName="home"
      />

      {/* Header  */}
      <div className={classnames(styles.section)}>
            <h1>AG Grid <span style={{ textTransform: 'capitalize' }}>{framework}</span> Documentation</h1>
            <p className="font-size-large">
              Welcome to our <span style={{ textTransform: 'capitalize' }}>{framework}</span> documentation. Toggle between {listOtherFrameworks()} using the menu in the toolbar.
            </p>
      </div>

      {/* Introduction */}
      <div className={classnames(styles.section, 'font-size-responsive')}>
        <h2>Introduction</h2>
        <p>
          AG Grid is an open-source, framework agnostic, JavaScript data grid with both free & paid versions. With over 11,000 Stars on GitHub, and 2.2m Monthly Downloads on NPM, AG Grid is one of the most popular & widely used Grid libraries available. Packed with features from the basic, like Pagination, Filtering, Grouping & Sorting, to more advanced Excel-esque features, such as Master / Detail, Pivoting, and Exporting AG Grid can also seamlessly handle huge data sets. 
        </p>
      </div>

      {/* Get Started */}
      <div className={classnames(styles.section, 'font-size-responsive')}>
        <h2>Get Started</h2>
        <p>
          Learn how to Get Started by creating a basic grid, or jump straight into the <a href='#example'>example</a> code.
        </p>
        <h3>Download</h3>
        <p>
          AG Grid is available from NPM. The Community library contains core Grid functionality, and the React library has the React-specific functionality:
        </p>
        <Code language={'bash'} lineNumbers={false} code={'npm install ag-grid-community\nnpm install ag-grid-react'} />
        To confirm the libraries have been added successfully, check your <code>package.json</code> has the correct dependencies:
        <Code language={'js'} lineNumbers={false} code={"'dependencies': { \n\t'ag-grid-community': '30.2.0',\n\t'ag-grid-react': '30.2.0',\n\t...\n}"} />
        <h3>Import</h3>
        You'll need to import the React library into your application:
        <Code language={'bash'} lineNumbers={false} code={"import { AgGridReact } from 'ag-grid-react';"} />
        You'll also need to include the core CSS & 1 of 5 <a>pre-made themes</a>.
        <Code language={'bash'} lineNumbers={false} code={"import 'ag-grid-community/styles/ag-grid.css';\nimport 'ag-grid-community/styles/ag-theme-alpine.css';"} /> 
        <Note>You can customize a pre-made theme, or create a new one entirely</Note> 
        <h3>Configure</h3>
        For a minimum configuration, you need to provide the Grid with Row Data, which is your data in JSON format:
        <Code language={'js'} lineNumbers={false} code={"const rowData = [\n\t{ make: 'Toyota', model: 'Celica', price: 35000 },\n\t{ make: 'Ford', model: 'Mondeo', price: 32000 },\n\t{ make: 'Porsche', model: 'Boxter', price: 72000 }\n]"} /> 
        As well as your Column Definitions. Each field in your columns should match a property in your data:
        <Code language={'js'} lineNumbers={false} code={"const colDefs = [\n\t{ field: 'make' },\n\t{ field: 'model' },\n\t{ field: 'price' }\n]"} /> 
        <h3>Display</h3>
        Finally, create a grid with rowData & ColDefs as props, wrapped in a parent div that contains your theme, as well as the dimensions of the grid
        <Code language={'html'} lineNumbers={false} code={"<div className='ag-theme-alpine' style={{width: 500, height: 500}}>\n\t<AgGridReact rowData={rowData} columnDefs={columnDefs} />\n</div>"} /> 
        <Note>You must provide dimensions & a theme to the Grid container or the Grid will not be displayed</Note>
        <h3 id='example'>Example</h3>
        Bringing this all together, our file should look like:
        <Code language={'js'} code={"import { AgGridReact } from 'ag-grid-react';\nimport 'ag-grid-community/styles/ag-grid.css';\nimport 'ag-grid-community/styles/ag-theme-alpine.css';\n\nconst rowData = [\n\t{ make: 'Toyota', model: 'Celica', price: 35000 },\n\t{ make: 'Ford', model: 'Mondeo', price: 32000 },\n\t{ make: 'Porsche', model: 'Boxter', price: 72000 }\n]\n\nconst colDefs = [\n\t{ field: 'make' },\n\t{ field: 'model' },\n\t{ field: 'price' }\n]\n\nexport default GridExample = () => {\n\treturn (\n\t\t<div className='ag-theme-alpine' style={{width: 500, height: 500}}>\n\t\t\t<AgGridReact rowData={rowData} columnDefs={colDefs} />\n\t\t</div>\n\t)\n}"}></Code>
        Which displays a very basic grid: <i>TODO: Add Basic Grid</i>
      </div>

      {/* Next Steps */}
      <div className={classnames(styles.section, 'font-size-responsive')}>
        <h2>Next Steps</h2>
        <p>
          Check out our latest releases and see what we've been working on
        </p>
        <ul>
          <li><a>Key Concepts</a></li>
          <li><a>Customise the Grid</a></li>
          <li><a>Upgrade to Enterprise</a></li>
        </ul>
      </div>

    </div>
  );
};

export default HomePage;
