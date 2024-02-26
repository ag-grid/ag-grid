export const fetchTextFile = (url: string) => {
    return fetch(url).then((res) => res.text());
};
