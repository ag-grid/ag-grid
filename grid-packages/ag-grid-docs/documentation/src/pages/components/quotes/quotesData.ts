export interface QuotesDataItem {
  name: string,
  avatarUrl: string,
  creatorOf: string,
  creatorOfIconUrl: string,
  text: string,

  /**
   * The order to show on desktop. Leave empty to not show it.
   */
  order?: number,
};

export type QuotesData = Record<string, QuotesDataItem>;

export const quotesData: QuotesData = {
  angularPerson: {
    name: "Angular person",
    avatarUrl: "images/fw-logos/angular.svg",
    creatorOf: "AngularJS",
    creatorOfIconUrl: "images/fw-logos/angular.svg",
    text: "There are a lot of component-based table libraries out there, but I believe AG Grid is the gold standard and is by far my favourite. AG Grid is perfect for building Enterprise Applications.",
    order: 10,
  },
  ryanCarniato: {
      name: "Ryan Carniato",
      avatarUrl: "images/fw-logos/react.svg",
      creatorOf: "SolidJS",
      creatorOfIconUrl: "images/fw-logos/react.svg",
      text: "Accusamus eveniet tempore suscipit qui consectetur sequi rem repudiandae id. Nihil facilis qui veniam fugiat eum tempore. Reprehenderit nulla sint ea quis voluptatibus.Dolor optio aperiam accusantium magni quae.",
      order: 20,
  },
  tannerLinsley: {
    name: "Tanner Linsley",
    avatarUrl: "images/fw-logos/react.svg",
    creatorOf: "TanStack",
    creatorOfIconUrl: "images/fw-logos/react.svg",
    text: "Reprehenderit atque repudiandae ut soluta aut voluptatem sint mollitia. Voluptatum hic eum consequatur qui beatae quia ut consequatur dolores.",
    order: 30,
},
};
