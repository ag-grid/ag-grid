import React from "react";

import styles from "./HomepageCustomerLogos.module.scss";
import { CustomerLogos } from './CustomerLogos';
import { customerLogosData } from "./customerLogosData";

export const HomepageCustomerLogos = () => {
  return (
    <>
      <CustomerLogos data={customerLogosData} />
      <p className={styles.tagLine}>Powering data applications at the worlds largest companies</p>
    </>
  );
}
