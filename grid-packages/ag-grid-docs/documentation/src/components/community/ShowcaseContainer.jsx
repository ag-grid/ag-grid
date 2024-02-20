import React, { useEffect, useState } from 'react';
import ShowcaseList from './ShowcaseList';
import showcaseStyles from '@design-system/modules/CommunityShowcase.module.scss';
import classnames from 'classnames';

const extractDistinctTags = (data) => {
    const tagsSet = new Set(); // Use a Set to store unique tags
    const frameworkSet = new Set();
    const productSet = new Set(["Grid", "Charts"]); // Initialize with an array
    data.forEach(item => {
        if (item.frameworks && Array.isArray(item.frameworks)) {
            item.frameworks.forEach(framework => frameworkSet.add(framework));
        }
        if (item.tags && Array.isArray(item.tags)) {
            item.tags.forEach(tag => tagsSet.add(tag));
        }
    });
    
    // Combine the arrays if needed (assumption here, based on the initial approach)
    return [...Array.from(frameworkSet), ...Array.from(productSet), ...Array.from(tagsSet)];
}

const extractFavouriteProducts = (data) => {
  const favouriteSet = new Set();
  data.forEach(item => {
    if (item.favourite) {
      favouriteSet.add(item);
    }
  })
  return Array.from(favouriteSet);
}

const ShowcaseContainer = ({ showcase }) => {
    const showcaseTags = extractDistinctTags(showcase);
    const favouriteShowcase = extractFavouriteProducts(showcase);
    const [filteredShowcase, setFilteredShowcase] = useState(showcase);
    const [activeFilters, setActiveFilters] = useState([]);
  
    const onTagClicked = (e) => {
      const isTagActive = activeFilters.includes(e.target.innerText);
      if (isTagActive) {
        setActiveFilters(activeFilters.filter(item => item !== e.target.innerText));
      } else {
        setActiveFilters(activeFilters => [...activeFilters, e.target.innerText]);
      }
    };
  
    useEffect(() => {
      const newFilteredShowcase = showcase.filter(item => 
        activeFilters.every(filter => item.tags?.includes(filter) || item.frameworks?.includes(filter) || item.products?.includes(filter))
      );
      setFilteredShowcase(newFilteredShowcase);
    }, [activeFilters]);
  
    return (
      <>
      <div className={showcaseStyles.tagsContainer}>
        <h3>Filter</h3>
        {showcaseTags.map((tag, index) => {
            return <button className={(activeFilters.includes(tag) ? showcaseStyles.activeTag : "")} key={index} onClick={onTagClicked}>{tag}</button>
        })}
        </div>
        {activeFilters.length > 0 &&  <ShowcaseList products={filteredShowcase} />}
        {activeFilters.length == 0 && 
        <>
          <span className={showcaseStyles.title}>Favourites</span>
          <ShowcaseList products={favouriteShowcase} />
          <span className={showcaseStyles.title}>All Products</span>
          <ShowcaseList products={filteredShowcase} /> 
        </>
        }
      </>
    );
};

export default ShowcaseContainer;
