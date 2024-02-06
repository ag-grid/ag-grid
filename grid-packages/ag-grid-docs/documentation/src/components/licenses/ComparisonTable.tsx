import React, { useState } from 'react';
import '@design-system/modules/ComparisonTable.scss';
import { Icon } from '../../components/Icon';
import {ChevronDown} from 'lucide-react';


const data = [
  {
    category: 'Data Grid',
    features: [
      {
        feature: 'Column groups',
        community: false,
        enterprise: true,
        chartsGrid: true,
        link: 'https://example.com/column-groups', 
      },
      {
        feature: 'Column spanning',
        community: false,
        enterprise: true,
        chartsGrid: false,
        link: 'https://example.com/column-spanning', 
      },
      {
        feature: 'Column resizing',
        community: false,
        enterprise: true,
        chartsGrid: true,
        link: 'https://example.com/column-resizing',
      },
      {
        feature: 'Column autosizing',
        community: false,
        enterprise: true,
        chartsGrid: true,
        link: 'https://example.com/column-autosizing', 
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
        link: 'https://example.com/charts-column-groups', 
      },
      {
        feature: 'Column spanning',
        community: true,
        enterprise: true,
        chartsGrid: false,
        link: 'https://example.com/charts-column-spanning', 
      },
      {
        feature: 'Column resizing',
        community: true,
        enterprise: true,
        chartsGrid: true,
        link: 'https://example.com/charts-column-resizing', 
      },
      {
        feature: 'Column autosizing',
        community: true,
        enterprise: true,
        chartsGrid: true,
        link: 'https://example.com/charts-column-autosizing',
      },
    ],
  },

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
              <ChevronDown/>
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
        <div className="feature-heading">Community </div>
        {data.map((categoryData) => (
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
        {data.map((categoryData) => (
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
        {data.map((categoryData) => (
          <React.Fragment key={`heading-${categoryData.category}-chartsGrid`}>
            <div className={`feature-cell ${expandedCategories[categoryData.category] ? 'hidden' : 'empty-cell'}`}>-</div>
            {expandedCategories[categoryData.category] &&
              categoryData.features.map((feature) => (
                <div
                  className={`feature-cell ${feature.chartsGrid ? 'enabled' : 'disabled'}`}
                  key={feature.feature}
                >
                  {feature.chartsGrid ? <Icon name="tick"  /> : '-'}
                </div>
              ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
export default ComparisonTable;