export interface QuotesDataItem {
  name: string,
  avatarUrl: string,
  orgName: string,
  orgIconUrl: string,
  orgRole: string,
  text: string,

  /**
    * The order to show. Leave empty to not show it.
  */
  order?: number,
};

export type QuotesData = Record<string, QuotesDataItem>;

export const quotesData: QuotesData = {
  angularPerson: {
    name: "Brian Love",
    avatarUrl: "images/developer-quotes/portraits/brian-love-portrait.png",
    orgName: "Google Developers",
    orgIconUrl: "images/developer-quotes/orgIcons/google-developer-expert-logo.png",
    orgRole: "Expert at",
    text: "If your application needs to display large amounts of data, we recommend AG Grid. Not only is it highly customizable and extensible, it’s also the fastest JavaScript grid on the planet.",
    order: 10,
  },
  ryanCarniato: {
    name: "Ryan Carniato",
    avatarUrl: "images/developer-quotes/portraits/ryan-carniato-portrait.png",
    orgName: "SolidJS",
    orgIconUrl: "images/fw-logos/solid.svg",
    orgRole: "Creator",
    text: "I've been impressed with AG Grid. Not only is it incredibly feature-rich, but it also leverages your framework of choice to do its rendering. This means seamless extensibility and a real way to leverage the framework's strengths. And for SolidJS that's a game changer.",
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
