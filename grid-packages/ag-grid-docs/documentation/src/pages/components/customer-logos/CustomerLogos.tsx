import React from "react";

import styles from "./CustomerLogos.module.scss";
import { CustomerLogosData, CustomerLogosDataItem } from "./customerLogosData";

function filterAndSortByKey(data: CustomerLogosData, sortKey: keyof CustomerLogosDataItem) {
  return Object.values(data)
    .filter((d) => {
      const value = d[sortKey];
      return value !== undefined && value >= 0;
    })
    .sort((a, b) => {
      return a[sortKey]! - b[sortKey]!;
    });
}

const LogoItems = ({ logos }: { logos: CustomerLogosDataItem[] }) => {
  return <>
    {
      logos.map(({ name, logoUrl }) => {
        return <li key={name}>
          <img title={name} className={styles.logoImage} src={logoUrl} alt={name} />
        </li>;
      })
    }
  </>;
}

export const CustomerLogos = ({ data }: { data: CustomerLogosData }) => {
  const logos = filterAndSortByKey(data, 'order');
  const mobileLogos = filterAndSortByKey(data, 'mobileOrder');

  return (
    <>
      <ul className={styles.container}>
        <LogoItems logos={logos} />
      </ul>
      <ul className={styles.mobileContainer}>
        <LogoItems logos={mobileLogos} />
      </ul>
    </>
  );
}
