import React, { useState } from 'react';
import '@design-system/modules/ComparisonTable.scss';

const data = [
  {
    category: 'Data Grid',
    features: [
      {
        feature: 'Column groups',
        community: true,
        enterprise: true,
        chartsGrid: true,
      },
      {
        feature: 'Column spanning',
        community: true,
        enterprise: true,
        chartsGrid: false,
      },
      {
        feature: 'Column resizing',
        community: true,
        enterprise: true,
        chartsGrid: true,
      },
      {
        feature: 'Column autosizing',
        community: true,
        enterprise: true,
        chartsGrid: true,
      },
    ],
  },
  {
    category: 'Charts',
    features: [
      {
        feature: 'Column groups',
        community: true,
        enterprise: true,
        chartsGrid: true,
      },
      {
        feature: 'Column spanning',
        community: true,
        enterprise: true,
        chartsGrid: false,
      },
      {
        feature: 'Column resizing',
        community: true,
        enterprise: true,
        chartsGrid: true,
      },
      {
        feature: 'Column autosizing',
        community: true,
        enterprise: true,
        chartsGrid: true,
      },
    ],
  }
  // Add more categories and features as needed
];

const ComparisonTable = () => {
  const [expandedCategories, setExpandedCategories] = useState({});

  const toggleCategory = (category) => {
    setExpandedCategories((prevExpanded) => ({
      ...prevExpanded,
      [category]: !prevExpanded[category],
    }));
  };

  return (
    <div className="comparison-table">
      <div className="left-column">
        {data.map((categoryData) => (
          <React.Fragment key={categoryData.category}>
            <div
              className={`category category-cell ${expandedCategories[categoryData.category] ? 'expanded' : ''}`}
              onClick={() => toggleCategory(categoryData.category)}
            >
              {categoryData.category}
            </div>
            {expandedCategories[categoryData.category] &&
              categoryData.features.map((feature) => (
                <div className="feature-row" key={feature.feature}>
                  {feature.feature}
                </div>
              ))}
          </React.Fragment>
        ))}
      </div>
      <div className="data-column">
        <div className="feature-heading">Community</div>
        {data.map((categoryData) => (
          <React.Fragment key={`heading-${categoryData.category}-community`}>
            <div className={`feature-cell ${expandedCategories[categoryData.category] ? 'hidden' : 'empty-cell'}`}>-</div>
            {expandedCategories[categoryData.category] &&
              categoryData.features.map((feature) => (
                <div
                  className={`feature-cell ${feature.community ? 'enabled' : 'disabled'}`}
                  key={feature.feature}
                >
                  {feature.community ? '✔' : '-'}
                </div>
              ))}
          </React.Fragment>
        ))}
      </div>
      <div className="data-column">
        <div className="feature-heading">Enterprise</div>
        {data.map((categoryData) => (
          <React.Fragment key={`heading-${categoryData.category}-enterprise`}>
            <div className={`feature-cell ${expandedCategories[categoryData.category] ? 'hidden' : 'empty-cell'}`}>-</div>
            {expandedCategories[categoryData.category] &&
              categoryData.features.map((feature) => (
                <div
                  className={`feature-cell ${feature.enterprise ? 'enabled' : 'disabled'}`}
                  key={feature.feature}
                >
                  {feature.enterprise ? '✔' : '-'}
                </div>
              ))}
          </React.Fragment>
        ))}
      </div>
      <div className="data-column">
        <div className="feature-heading">Grid + Charts</div>
        {data.map((categoryData) => (
          <React.Fragment key={`heading-${categoryData.category}-chartsGrid`}>
            <div className={`feature-cell ${expandedCategories[categoryData.category] ? 'hidden' : 'empty-cell'}`}>-</div>
            {expandedCategories[categoryData.category] &&
              categoryData.features.map((feature) => (
                <div
                  className={`feature-cell ${feature.chartsGrid ? 'enabled' : 'disabled'}`}
                  key={feature.feature}
                >
                  {feature.chartsGrid ? '✔' : '-'}
                </div>
              ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
export default ComparisonTable;