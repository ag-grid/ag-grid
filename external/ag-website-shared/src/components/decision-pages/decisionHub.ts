export interface DecisionHubCard {
    title: string;
    /** One line on what the page covers, used as the card text and the link description. */
    description: string;
    /** Authored URL, resolved with the site's `resolveUrl`. */
    url: string;
}

export interface DecisionHubContent {
    title: string;
    description: string;
    heading: string;
    subHeading: string;
    listHeading: string;
}

/** Cards sorted by title, so the hub order is stable however the collection loads. */
export const sortHubCards = (cards: DecisionHubCard[]): DecisionHubCard[] =>
    [...cards].sort((a, b) => a.title.localeCompare(b.title));
