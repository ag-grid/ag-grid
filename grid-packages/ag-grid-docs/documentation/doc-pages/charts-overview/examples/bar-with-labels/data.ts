// Source: https://www.ons.gov.uk/employmentandlabourmarket/peopleinwork/employmentandemployeetypes/bulletins/jobsandvacanciesintheuk/february2020
export function getData(): any[] {
    return [
        { job: 'Administrative and support service activities', change: 29 },
        { job: 'Other service activities', change: 28 },
        { job: 'Human health and social work activities', change: 23 },
        { job: 'Real estate activities', change: 22 },
        { job: 'Education', change: 21 },
        { job: 'Other jobs', change: 21 },
        { job: 'Agriculture forestry and fishing', change: 17 },
        { job: 'Arts & recreation', change: 13 },
        { job: 'Transport & storage', change: -20 },
        { job: 'Wholesale and retail trade:\nrepair of motor vehicles', change: -36 },
        { job: 'Construction', change: -42 },
    ];
}