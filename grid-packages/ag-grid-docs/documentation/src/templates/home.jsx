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
import Note from '../components/Note'

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
          'img': '/images/temp-images-docs-testing/003-documents.png'
        },
        {
          'name': 'Sorting',
          'desc': 'Sort your rows using default options, or build your own custom sorting function',
          'img': '/images/temp-images-docs-testing/008-sort-up.png'
        },
        {
          'name': 'Editing',
          'desc': 'Directly edit cell data within the grid, either by default or based on a condition',
          'img': '/images/temp-images-docs-testing/009-pen.png'
        },
        {
          'name': 'Grouping',
          'desc': 'Enable multiple levels of columns from the colummn header or show/hide columns',
          'img': '/images/temp-images-docs-testing/002-grouping.png'
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
          'img': '/'
        },
        {
          'name': 'Pivoting',
          'desc': 'Take a columns values and turn them into columns.',
          'img': '/'
        },
        {
          'name': 'Exporting',
          'desc': 'Excel (xlsx) export functionality without any third party libraries',
          'img': '/'
        },
        {
          'name': 'Adv. Filtering',
          'desc': 'Complex filter conditions in a single type-ahead input',
          'img': '/'
        }
      ]
    },
    {
      'title': 'Extend',
      'features': [
        {
          'name': 'Tool Panels',
          'desc': '',
          'img': '/'
        },
        {
          'name': 'Column Menu',
          'desc': '',
          'img': '/'
        },
        {
          'name': 'Column Menu',
          'desc': '',
          'img': '/'
        },
        {
          'name': 'Status Bar',
          'desc': '',
          'img': '/'
        }
      ]
    },
    {
      'title': 'Style',
      'features': [
        {
          'name': 'Themes',
          'desc': '',
          'img': '/'
        },
        {
          'name': 'Figma Design',
          'desc': '',
          'img': '/'
        },
        {
          'name': 'Cell Renderers',
          'desc': '',
          'img': '/'
        },
        {
          'name': 'Value Formatters',
          'desc': '',
          'img': '/'
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
            <img src={"/images/temp-images-docs-testing/005-github.png"} className={classnames(styles.socialIcon)} />
            <img src={"/images/temp-images-docs-testing/007-stack-overflow.png"} className={classnames(styles.socialIcon)} />
            <img src={"/images/temp-images-docs-testing/004-info.png"} className={classnames(styles.socialIcon)} />
          </div>
        </div>
      </div>
      <div className={classnames(styles.cardTransparent)}>
        <div className={classnames(styles.cardTitleMiddle, 'font-size-extra-large')}>
          Join The Community
        </div>
        <div className={classnames(styles.cardBody)}>
          <div className={classnames(styles.socialIconsContainer)}>
            <img src={"/images/temp-images-docs-testing/001-youtube.png"} className={classnames(styles.socialIcon)} />
            <img src={"/images/temp-images-docs-testing/010-twitter.png"} className={classnames(styles.socialIcon)} />
            <img src={"/images/temp-images-docs-testing/002-linkedin.png"} className={classnames(styles.socialIcon)} />
            <img src={"/images/temp-images-docs-testing/001-blogger.png"} className={classnames(styles.socialIcon)} />
            <img src={"/images/temp-images-docs-testing/003-newsletter.png"} className={classnames(styles.socialIcon)} />
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

      {/* Introduction  */}
      <div className={classnames(styles.section)}>
        <div style={{ display: 'flex' }}>
          <div style={{ flex: 3 }}>
            <h1>AG Grid <span style={{ textTransform: 'capitalize' }}>{framework}</span> Documentation</h1>
            <p className="font-size-large">
              AG Grid is an open-source <span style={{ textTransform: 'capitalize' }}>{framework}</span> data grid with free and enterprise versions. AG Grid can be used with any JS framework and has dedicated support for {listOtherFrameworks()}.
            </p>
            <button>
              GET STARTED
            </button>
            <a style={{ marginLeft: 24, fontSize: 18, color: 'grey', textDecoration: 'underline', cursor: 'pointer' }}>
              API Reference
            </a>
          </div>
          <div style={{ flex: 1, padding: '16px' }}>
            <iframe height='100%' src="https://www.youtube.com/embed/j-Odsb0EjVo" frameborder="0" allowfullscreen></iframe>
          </div>
        </div>
      </div>

      {/* Overview */}
      <div className={classnames(styles.section, 'font-size-responsive')}>
        <h2>Features</h2>
        <p>
          For an exhaustive list of features, check out our <a href='#'>Feature Matrix</a>
        </p>
        <FeaturesSection />
      </div>

      {/* Demos */}
      <div className={classnames(styles.section, 'font-size-responsive')}>
        <h2>Demos & Tutorials</h2>
        <p>
          A collection of demos, showcasing AG Grids functionality. All demos are fully editable via CodeSandbox & Plunkr:
        </p>
        <DemosSection />
      </div>

      {/* Whats New */}
      <div className={classnames(styles.section, 'font-size-responsive')}>
        <h2>Whats New?</h2><span style={{ float: 'right' }}><a href='https://www.ag-grid.com/changelog/' target='_blank'>View Changelog</a></span>
        <p>
          Check out our latest releases and see what we've been working on
        </p>
        <TimelineSection />
      </div>

      {/* Need Help */}
      <div className={classnames(styles.section, 'font-size-responsive')}>
        <hr style={{ marginBottom: '32px' }} />
        <HelpAndCommunitySection />
      </div>

    </div>
  );
};

export default HomePage;
