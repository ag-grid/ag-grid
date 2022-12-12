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
    adobe: {
        name: "Adobe",
        logoUrl: 'images/customer-logos-white/adobe.svg',
        order: 10,
        mobileOrder: 10,
    },
    apple: {
        name: "Apple",
        logoUrl: 'images/customer-logos-white/apple.svg',
        order: 20,
        mobileOrder: 20,
    },
    amazon: {
        name: "Amazon",
        logoUrl: 'images/customer-logos-white/amazon.svg',
        order: 30,
        mobileOrder: 30,
    },
    netflix: {
        name: "Netflix",
        logoUrl: 'images/customer-logos-white/netflix.svg',
        order: 30,
        mobileOrder: 30,
    },
    google: {
        name: "Google",
        logoUrl: 'images/customer-logos-white/google.svg',
        order: 30,
        mobileOrder: 30,
    },
    hsbc: {
        name: "HSBC",
        logoUrl: 'images/customer-logos-white/hsbc.svg',
        order: 30,
        mobileOrder: 30,
    },
    nvidia: {
        name: "Nvidia",
        logoUrl: 'images/customer-logos-white/nvidia.svg',
        order: 30,
        mobileOrder: 30,
    },
    NASA: {
        name: "NASA",
        logoUrl: 'images/customer-logos-white/NASA.svg',
        order: 30,
        mobileOrder: 30,
    },
    microsoft: {
        name: "Microsoft",
        logoUrl: 'images/customer-logos-white/microsoft.svg',
        order: 30,
        mobileOrder: 30,
    },
    visa: {
        name: "Visa",
        logoUrl: 'images/customer-logos-white/visa.svg',
        order: 30,
        mobileOrder: 30,
    },
    citigroup: {
        name: "Citigroup",
        logoUrl: 'images/customer-logos-white/citigroup.svg',
        order: 30,
        mobileOrder: 30,
    },
    americanExpress: {
        name: "American Express",
        logoUrl: 'images/customer-logos-white/american-express.svg',
        order: 30,
        mobileOrder: 30,
    },
};
