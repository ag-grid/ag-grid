import React from "react";
import { addNonBreakingSpaceBetweenLastWords } from "../../utils/add-non-breaking-space-between-last-words";

import styles from "./Quotes.module.scss";
import { QuotesData, QuotesDataItem } from "./QuotesData";

function filterAndSortByKey(data: QuotesData, sortKey: keyof QuotesDataItem) {
  return Object.values(data)
    .filter((d) => {
      const value = d[sortKey];
      return value !== undefined && value >= 0;
    })
    .sort((a, b) => {
      return a[sortKey]! - b[sortKey]!;
    });
}

const QuoteItems = ({ quotes }: { quotes: QuotesDataItem[] }) => {
  return <>
    {
      quotes.map(({ name, avatarUrl, orgName, orgIconUrl, orgRole, text }) => {
        const nonWidowText = addNonBreakingSpaceBetweenLastWords(text);
        return <li key={name}>
          <figure>
            <blockquote>
              <p>{nonWidowText}</p>
            </blockquote>
            <figcaption>
              <img className={styles.avatar} title={name} src={avatarUrl} alt={name} />
              <span className={styles.name}>{name}</span>
              <div className={styles.orgContainer}>
                <span className={styles.orgRole}>{orgRole}</span>
                <img className={styles.orgIcon} title={orgName} src={orgIconUrl} alt={orgName} />
                <span className={styles.orgName}>{orgName}</span>
              </div>
            </figcaption>
          </figure>
        </li>;
      })
    }
  </>;
}

export const Quotes = ({ data }: { data: QuotesData }) => {
  const quotes = filterAndSortByKey(data, 'order');

  return (
    <ul className={styles.container}>
      <QuoteItems quotes={quotes} />
    </ul>
  );
}
