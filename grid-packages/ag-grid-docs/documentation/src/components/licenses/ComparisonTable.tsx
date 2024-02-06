import React, { useState, useEffect } from 'react';
import '@design-system/modules/ComparisonTable.scss';
import { Icon } from '../../components/Icon';
import {ChevronDown} from 'lucide-react';


const data = [
  {
    category: 'Charting',
    features: [
      {
        feature: 'Enterprise Integrated Charts',
        community: false,
        enterprise: false,
        chartsGrid: true,
        link: 'https://example.com/column-groups', 
      },
      {
        feature: 'Enterprise AG Charts',
        community: false,
        enterprise: false,
        chartsGrid: true,
        link: 'https://example.com/column-spanning', 
      }
    ],
  },
  {
    category: 'Filtering',
    features: [
      {
        feature: 'Simple Column Filters',
        community: true,
        enterprise: true,
        chartsGrid: true,
      },
      {
        feature: 'Multi Filter',
        community: true,
        enterprise: true,
        chartsGrid: true,
      },
      {
        feature: 'Set Filter',
        community: true,
        enterprise: true,
        chartsGrid: true,
      },
      {
        feature: 'External Filter',
        community: false,
        enterprise: true,
        chartsGrid: true,
      },

      {
        feature: 'Quick Filter',
        community: false,
        enterprise: true,
        chartsGrid: true,
      },
      {
        feature: 'Advanced Filter',
        community: false,
        enterprise: true,
        chartsGrid: true,
      },
 
    ],
  },
  {
    category: 'Group & Pivot',
    features: [
      {
        feature: 'Aggregation',
        community: false,
        enterprise: true,
        chartsGrid: true,
      },
      {
        feature: 'Row Grouping',
        community: false,
        enterprise: true,
        chartsGrid: true,
      },
      {
        feature: 'Pivoting',
        community: false,
        enterprise: true,
        chartsGrid: true,
      },
      {
        feature: 'Tree Data',
        community: false,
        enterprise: true,
        chartsGrid: true,
      },
    ],
  },
  {
    category: 'Accessories',
    features: [
      {
        feature: 'Column Menu',
        community: false,
        enterprise: true,
        chartsGrid: true,
      },
      {
        feature: 'Context Menu',
        community: false,
        enterprise: true,
        chartsGrid: true,
      },
      {
        feature: 'Side Bar',
        community: false,
        enterprise: true,
        chartsGrid: true,
      },
      {
        feature: 'Filters Tool Panel',
        community: false,
        enterprise: true,
        chartsGrid: true,
      },
      {
        feature: 'Status Bar',
        community: false,
        enterprise: true,
        chartsGrid: true,
      },
    ],
  },
];

const chartsArray = [
  {
    category: 'Charting',
    features: [
      {
        feature: 'Enterprise Integrated Charts',
        community: false,
        enterprise: false,
        chartsGrid: true,
      },
      {
        feature: 'Enterprise AG Charts',
        community: false,
        enterprise: false,
        chartsGrid: true,
      },
    ],
  },
  {
    category: 'Series',
    features: [
      {
        feature: 'Bar',
        community: true,
        enterprise: true,
        chartsGrid: true,
      },
      {
        feature: 'Line',
        community: true,
        enterprise: true,
        chartsGrid: true,
      },
      {
        feature: 'Area',
        community: true,
        enterprise: true,
        chartsGrid: true,
      },
      {
        feature: 'Scatter',
        community: true,
        enterprise: true,
        chartsGrid: true,
      },
      {
        feature: 'Bubble',
        community: true,
        enterprise: true,
        chartsGrid: true,
      },
      {
        feature: 'Pie',
        community: true,
        enterprise: true,
        chartsGrid: true,
      },
      {
        feature: 'Doughnut',
        community: true,
        enterprise: true,
        chartsGrid: true,
      },
      {
        feature: 'Histogram',
        community: true,
        enterprise: true,
        chartsGrid: true,
      },
      {
        feature: 'Combination',
        community: true,
        enterprise: true,
        chartsGrid: true,
      },
      {
        feature: 'Box Plot',
        community: false,
        enterprise: true,
        chartsGrid: true,
      },
      {
        feature: 'Bullet',
        community: false,
        enterprise: true,
        chartsGrid: true,
      },
      {
        feature: 'Heatmap',
        community: false,
        enterprise: true,
        chartsGrid: true,
      },
      {
        feature: 'Nightingale',
        community: false,
        enterprise: true,
        chartsGrid: true,
      },
      {
        feature: 'Radar Area',
        community: false,
        enterprise: true,
        chartsGrid: true,
      },
      {
        feature: 'Radar Line',
        community: false,
        enterprise: true,
        chartsGrid: true,
      },
      {
        feature: 'Radial Bar',
        community: false,
        enterprise: true,
        chartsGrid: true,
      },
      {
        feature: 'Radial Column',
        community: false,
        enterprise: true,
        chartsGrid: true,
      },
      {
        feature: 'Range Area',
        community: false,
        enterprise: true,
        chartsGrid: true,
      },
      {
        feature: 'Range Bar',
        community: false,
        enterprise: true,
        chartsGrid: true,
      },
      {
        feature: 'Sunburst',
        community: false,
        enterprise: true,
        chartsGrid: true,
      },
      {
        feature: 'Treemap',
        community: false,
        enterprise: true,
        chartsGrid: true,
      },
      {
        feature: 'Waterfall',
        community: false,
        enterprise: true,
        chartsGrid: true,
      },
    ],
  },
];

const ComparisonTable = ({ isChecked }) => {
  const [expandedCategories, setExpandedCategories] = useState({});

  useEffect(() => {
    // This effect will update the expanded categories whenever isChecked changes
    const newExpandedCategories = {};
    const currentData = isChecked ? chartsArray : data;
    currentData.forEach((categoryData) => {
      // Set all categories to expanded by default
      newExpandedCategories[categoryData.category] = true;
    });
    setExpandedCategories(newExpandedCategories);
  }, [isChecked]); // Dependency array ensures this effect only runs when isChecked changes

  const toggleCategory = (category) => {
    // This function toggles the expansion of a category when it is clicked
    setExpandedCategories((prevExpanded) => ({
      ...prevExpanded,
      [category]: !prevExpanded[category],
    }));
  };

  // Decide which data to use based on isChecked
  const chartsData = isChecked ? chartsArray : data;

  return (
    <div className="comparison-table">
      <div className="left-column">
        {chartsData.map((categoryData) => (
          <React.Fragment key={categoryData.category}>
            <div
              className={`category category-cell ${expandedCategories[categoryData.category] ? 'expanded' : ''}`}
              onClick={() => toggleCategory(categoryData.category)}
            >
              {categoryData.category}
              <ChevronDown />
            </div>
            {expandedCategories[categoryData.category] &&
              categoryData.features.map((feature) => (
                <div className="feature-row" key={feature.feature}>
                  {feature.link ? (
                    <a href={feature.link} className="feature-link">
                      {feature.feature}
                    </a>
                  ) : (
                    feature.feature
                  )}
                </div>
              ))}
          </React.Fragment>
        ))}
      </div>
      <div className="data-column">
        <div className="feature-heading">Community</div>
        {chartsData.map((categoryData) => (
          <React.Fragment key={`heading-${categoryData.category}-community`}>
            <div className={`feature-cell ${expandedCategories[categoryData.category] ? 'hidden' : 'empty-cell'}`}>-</div>
            {expandedCategories[categoryData.category] &&
              categoryData.features.map((feature) => (
                <div
                  className={`feature-cell ${feature.community ? 'enabled' : 'disabled'}`}
                  key={feature.feature}
                >
                  {feature.community ? <Icon name="tick" /> : '-'}
                </div>
              ))}
          </React.Fragment>
        ))}
      </div>
      <div className="data-column">
        <div className="feature-heading">Enterprise</div>
        {chartsData.map((categoryData) => (
          <React.Fragment key={`heading-${categoryData.category}-enterprise`}>
            <div className={`feature-cell ${expandedCategories[categoryData.category] ? 'hidden' : 'empty-cell'}`}>-</div>
            {expandedCategories[categoryData.category] &&
              categoryData.features.map((feature) => (
                <div
                  className={`feature-cell ${feature.enterprise ? 'enabled' : 'disabled'}`}
                  key={feature.feature}
                >
                  {feature.enterprise ? <Icon name="tick" /> : '-'}
                </div>
              ))}
          </React.Fragment>
        ))}
      </div>
      <div className="data-column">
        <div className="feature-heading">Grid + Charts</div>
        {chartsData.map((categoryData) => (
          <React.Fragment key={`heading-${categoryData.category}-chartsGrid`}>
            <div className={`feature-cell ${expandedCategories[categoryData.category] ? 'hidden' : 'empty-cell'}`}>-</div>
            {expandedCategories[categoryData.category] &&
              categoryData.features.map((feature) => (
                <div
                  className={`feature-cell ${feature.chartsGrid ? 'enabled' : 'disabled'}`}
                  key={feature.feature}
                >
                  {feature.chartsGrid ? <Icon name="tick" /> : '-'}
                </div>
              ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default ComparisonTable;