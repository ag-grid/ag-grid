export interface CustomerLogosDataItem {
  name: string,
  logoUrl: string,
  /**
   * The order to show on desktop. Leave empty to not show it.
   */
  order?: number,
  /**
   * The order to show on mobile. Leave empty to not show it.
   */
  mobileOrder?: number
};

export type CustomerLogosData = Record<string, CustomerLogosDataItem>;

export const customerLogosData: CustomerLogosData = {
  react: {
    name: 'React',
    logoUrl: 'https://ag-grid.com/images/fw-logos/react.svg',
    order: 10,
    mobileOrder: 20
  },
  angular: {
    name: 'Angular',
    logoUrl: 'https://ag-grid.com/images/fw-logos/angular.svg',
    order: 40,
    mobileOrder: 10
  },
  js: {
    name: 'JavaScript',
    logoUrl: 'https://ag-grid.com/images/fw-logos/javascript.svg',
    order: 20,
    mobileOrder: 30
  },
  vue: {
    name: 'Vue',
    logoUrl: 'https://ag-grid.com/images/fw-logos/vue.svg',
    order: 30,
    mobileOrder: 40
  },
};
