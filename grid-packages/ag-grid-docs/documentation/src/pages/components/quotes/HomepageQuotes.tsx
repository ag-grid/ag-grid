import React from "react";

import { Quotes } from './Quotes';
import { quotesData } from "./quotesData";

import styles from "./HomepageQuotes.module.scss";

export const HomepageQuotes = () => {
  return (
    <div className={styles.container}>
      <h2>By Developers for Developers</h2>
      <Quotes data={quotesData} />
    </div>
  );
}
