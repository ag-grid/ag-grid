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
          <div
            className={`category ${expandedCategories[categoryData.category] ? 'expanded' : ''}`}
            key={categoryData.category}
          >
            <div className="category-cell" onClick={() => toggleCategory(categoryData.category)}>
              {categoryData.category}
            </div>
            {expandedCategories[categoryData.category] &&
              categoryData.features.map((feature) => (
                <div className="feature-row" key={feature.feature}>
                  {feature.feature}
                </div>
              ))}
          </div>
        ))}
      </div>
      <div className="data-column">
        <div className="feature-heading">Community</div>
        {data.map((categoryData) => (
          <div
            className={`feature-cell ${expandedCategories[categoryData.category] ? '' : 'hidden'}`}
            key={`heading-${categoryData.category}-community`}
          >
            -
          </div>
          )
        )}
        {data.map((categoryData) =>
          categoryData.features.map((feature) => (
            <div
              className={`feature-cell ${feature.community ? 'enabled' : 'disabled'}`}
              key={feature.feature}
              style={{ display: expandedCategories[categoryData.category] ? '' : 'none' }}
            >
              {feature.community ? '✔' : '-'}
            </div>
          ))
        )}
      </div>
      <div className="data-column">
        <div className="feature-heading">Enterprise</div>
        {data.map((categoryData) => (
          <div
            className={`feature-cell ${expandedCategories[categoryData.category] ? '' : 'hidden'}`}
            key={`heading-${categoryData.category}-enterprise`}
          >
            -
          </div>
          )
        )}
        {data.map((categoryData) =>
          categoryData.features.map((feature) => (
            <div
              className={`feature-cell ${feature.enterprise ? 'enabled' : 'disabled'}`}
              key={feature.feature}
              style={{ display: expandedCategories[categoryData.category] ? '' : 'none' }}
            >
              {feature.enterprise ? '✔' : '-'}
            </div>
          ))
        )}
      </div>
      <div className="data-column">
        <div className="feature-heading">Grid + Charts</div>
        {data.map((categoryData) => (
          <div
            className={`feature-cell ${expandedCategories[categoryData.category] ? '' : 'hidden'}`}
            key={`heading-${categoryData.category}-chartsGrid`}
          >
            -
          </div>
          )
        )}
        {data.map((categoryData) =>
          categoryData.features.map((feature) => (
            <div
              className={`feature-cell ${feature.chartsGrid ? 'enabled' : 'disabled'}`}
              key={feature.feature}
              style={{ display: expandedCategories[categoryData.category] ? '' : 'none' }}
            >
              {feature.chartsGrid ? '✔' : '-'}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ComparisonTable;