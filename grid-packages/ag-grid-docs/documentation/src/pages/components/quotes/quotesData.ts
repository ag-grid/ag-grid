export interface QuotesDataItem {
  name: string,
  avatarUrl: string,
  orgName: string,
  orgIconUrl: string,
  orgRole: string,
  text: string,

  /**
    * The order to show on desktop. Leave empty to not show it.
  */
  order?: number,
};

export type QuotesData = Record<string, QuotesDataItem>;

export const quotesData: QuotesData = {
  angularPerson: {
    name: "Brian Love",
    avatarUrl: "images/developer-quotes/portraits/brian-love-portrait.png",
    orgName: "Google Developer Experts",
    orgIconUrl: "images/developer-quotes/orgIcons/google-developer-expert-logo.png",
    orgRole: "Expert at",
    text: "Accusamus eveniet tempore suscipit qui consectetur sequi rem repudiandae id. Nihil facilis qui veniam fugiat eum tempore. Reprehenderit nulla sint ea quis voluptatibus.Dolor optio aperiam accusantium magni quae.",
    order: 10,
  },
  ryanCarniato: {
    name: "Ryan Carniato",
    avatarUrl: "images/developer-quotes/portraits/ryan-carniato-portrait.png",
    orgName: "SolidJS",
    orgIconUrl: "images/fw-logos/solid.svg",
    orgRole: "Creator",
    text: "Reprehenderit atque repudiandae ut soluta aut voluptatem sint mollitia. Voluptatum hic eum consequatur qui beatae quia ut consequatur dolores.",
    order: 20,
  },
  tannerLinsley: {
    name: "Tanner Linsley",
    avatarUrl: "images/developer-quotes/portraits/tanner-linsley-portrait.png",
    orgName: "TanStack",
    orgIconUrl: "images/developer-quotes/orgIcons/tanstack-logo.png",
    orgRole: "Creator",
    text: "There are a lot of component-based table libraries out there, but I believe AG Grid is the gold standard and is by far my favourite. AG Grid is perfect for building Enterprise Applications.",
    order: 30,
  },
};
