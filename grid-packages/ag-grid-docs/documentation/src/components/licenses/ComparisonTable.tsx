import React, { useState } from 'react';
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
  // Your chart features will go here
  {
    category: 'Series',
    features: [
      {
        feature: 'Bar',
        community: false,
        enterprise: true,
        chartsGrid: true,
        link: 'https://example.com/bar-charts', 
      },
      // Add more features here
    ],
  },
  // Add more categories here
];


const ComparisonTable = ({ isChecked }) => {
  const [expandedCategories, setExpandedCategories] = useState(() => {
    const initialExpandedCategories = {};
    data.forEach((categoryData) => {
      initialExpandedCategories[categoryData.category] = true;
    });
    return initialExpandedCategories;
  });

  const toggleCategory = (category) => {
    setExpandedCategories((prevExpanded) => ({
      ...prevExpanded,
      [category]: !prevExpanded[category],
    }));
  };

  // Modify the data array when isChecked is true (Charts toggled)
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
                  {feature.community || feature.enterprise || feature.chartsGrid ? (
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