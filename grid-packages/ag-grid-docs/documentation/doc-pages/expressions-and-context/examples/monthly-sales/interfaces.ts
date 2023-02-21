export interface IYearlySales {
    country: string
    city: string
    jan_act: number
    jan_bud: number
    feb_act: number
    feb_bud: number
    mar_act: number
    mar_bud: number
    apr_act: number
    apr_bud: number
    may_act: number
    may_bud: number
    jun_act: number
    jun_bud: number
    jul_act: number
    jul_bud: number
    aug_act: number
    aug_bud: number
    sep_act: number
    sep_bud: number
    oct_act: number
    oct_bud: number
    nov_act: number
    nov_bud: number
    dec_act: number
    dec_bud: number
    id: number
}

export interface IMonth {
    month: number;
    months: string[]
}
