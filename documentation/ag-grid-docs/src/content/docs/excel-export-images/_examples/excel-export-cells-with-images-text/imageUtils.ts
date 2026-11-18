import type { IOlympicData } from './interfaces';

const createBlob = (response: Response) => response.blob();

const fromBlobToBase64 = (blob: Blob) =>
    new Promise<string>((res) => {
        const reader = new FileReader();
        reader.onloadend = () => res(reader.result as string);
        reader.readAsDataURL(blob);
    });

const createBase64ImageFromURL = (url: string) =>
    fetch(url)
        .then(createBlob)
        .then((blob) => fromBlobToBase64(blob));

const createBase64ImagesFromURLArray = (arr: string[]) => {
    const map = new Map<string, string>();
    const promiseArray = arr.reduce<Promise<string>[]>((promises, currentUrl) => {
        if (!map.has(currentUrl)) {
            const promise = createBase64ImageFromURL(currentUrl);
            promise.then((base64) => map.set(currentUrl, base64));
            promises.push(promise);
        }

        return promises;
    }, []);

    return Promise.all(promiseArray).then(() => map);
};

// Example specific code
const createCountryCodeMap = (countryCodeObject: Record<string, string>) =>
    fetch('https://flagcdn.com/en/codes.json')
        .then((response) => response.json())
        .then((codes) => {
            Object.keys(codes).forEach((code) => (countryCodeObject[codes[code]] = code));
            return countryCodeObject;
        });

export const createBase64FlagsFromResponse = (
    response: Response,
    countryCodeObject: Record<string, string>,
    base64FlagsObject: Record<string, string>
) => {
    const urlPrefix = 'https://flagcdn.com/w20/';
    const extension = '.png';
    return response
        .json()
        .then((data: IOlympicData[]) =>
            createCountryCodeMap(countryCodeObject).then(() => data.filter((rec) => rec.country != null))
        )
        .then((data) => {
            const urls = data.map((rec) => {
                const countryCode = countryCodeObject[rec.country];
                return urlPrefix + countryCode + extension;
            });

            return createBase64ImagesFromURLArray(urls).then((map) => {
                map.forEach((value, key) => {
                    const code = key.replace(urlPrefix, '').replace(extension, '');
                    base64FlagsObject[code] = value;
                });
                return data;
            });
        })
        .then((data) => data);
};
