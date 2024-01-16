import { bench } from '@arktype/attest';
import { ColDef } from './src/ts/entities/colDef';

 export interface IRowData {
      f: () => void;
      a: number;
      c: string | Date;
      d: Date;
      d2: Date;
      b?: IRowData;
      b2: IRowData | undefined;
  }
  
  export interface IRowData2 {
      a: number[];
      c: string[];
      d: Date[];
      d2: Date[];
      b: IRowData2;
      b2: IRowData2;
  }

/*   export interface ColDef<TData = any, TValue = any> {
    field: ColDefField<TData, TValue>;
} */

   bench('IRowData', () => {
      return { field: 'c' } as ColDef<IRowData>;
  })
  .types([1004, 'instantiations']);
  
  bench('IRowData2', () => {
      return { field: 'a' } as ColDef<IRowData2>;
  })
  .types([907, 'instantiations']);
  
  bench('ITem[]', () => {
      return { field: 'A', tooltipField: 'A.B' } as ColDef<IItem>;
  })
  .types([9955, 'instantiations']);
 
  
type TT = boolean | never;
const t: TT = false;

export interface IItem {
    item: IItem;
    A?: { B?: string; C?: Object };
    D?: string;
    E?: { F?: string; G?: string; H?: string };
    I?: {
      J?: string;
      K?: Array<{ L: { M: string; N?: boolean; O?: string } }>;
      P?: string;
    };
    Q?: {
      R?: string;
      S?: string;
      T?: Array<{ U: string }>;
      V?: { W: string };
    };
    X: IItem;
    Y?: {
      Z?: string;
      AA?: string;
      T?: Array<{ U: string }>;
      V?: any;
    };
    W?: {
      Z?: string;
      AA?: string;
      T?: Array<{ U: string }>;
      V?: Partial<{ W: any }>;
    };
    AB?: Date;
    AC?: number;
    AD?: Date;
    AE?: boolean;
    AF?: IClock;
    AG?: boolean;
    AH?: Array<{
      AI?: string;
      AJ?: Date;
      AK?: Date;
      AL?: {
        AM?: string;
        AN?: string;
        T?: Array<{ U: string }>;
        V?: boolean;
      };
      AO?: {
        AP?: string;
        AQ?: string;
        T?: Array<{ U: string }>;
        V?: boolean;
      };
      AR?: IClock;
      AS?: number;
    }>;
    AT?: Partial<{
      AU?: string;
      AV: string;
      AW?: {
        AX?: string;
        AY: string;
        AZ?: boolean;
        BA?: Array<{ BB?: string; BC?: string; BD?: string; BE?: string }>;
        BF?: string;
        BG?: string;
        BH?: string;
        BI?: string;
        BJ?: {
          BK?: string;
          BL?: string;
          BM?: boolean;
          BN?: number;
          BO?: Date;
          BP?: string;
          BQ?: number;
          BR?: string;
          BS?: { BT: number; BU: Date }[];
        };
        BV?: string;
      };
    }>;
    AJ?: string;
    AK?: string;
    AL?: string;
    AM?: string;
    AN?: number;
    AO?: Array<{
      AP: Partial<{
        AQ?: string;
        AR?: string;
        AS?: any;
        AT?: Partial<IModel>;
        AU?: { AV: string; AW?: boolean; AX?: string };
        AY?: boolean;
      }>;
      AU: Partial<{ AV?: string; AW?: boolean; AX?: string }>;
      AZ?: string;
      BA?: string;
      BB?: number;
      BC?: string;
      BD?: string;
      BE?: string;
      BF?: string;
      BG?: string;
      BH?: string;
      BI?: string;
      BJ?: boolean;
    }>;
    AP?: Array<{
      AQ?: string;
      AR?: Array<{ AS: string }>;
      AT?: Array<{ AU: string }>;
      AV?: string;
      AW?: string;
      AX?: Date;
    }>;
    BY?: boolean;
    BZ?: boolean;
    CA?: string;
  }
  
  export interface IModel {
    AD?: { AE?: any };
    AF?: boolean;
    AG?: number;
    AH?: boolean;
    AI?: number;
    AJ?: Array<string>;
    AK?: number;
    AL?: Partial<{
      AM: string;
      AN?: boolean;
      AO?: number;
      AP?: Partial<IModel>;
    }>;
    AP?: Partial<IModel>;
    AQ?: number;
    AR?: string;
    AS?: string;
    AT?: string;
    AU?: number;
    AV?: string;
    AW?: string;
    AX?: string;
    AY?: boolean;
    AZ?: number;
    BA?: string;
    BB?: string;
    BC?: number;
    BD?: boolean;
    BE?: number;
    BF?: string;
    BG?: boolean;
    BH?: number;
    BI?: Partial<IModel>;
    BJ?: boolean;
    BK?: string;
    BL?: string;
    BM?: string;
    BN?: number;
    BO?: boolean;
    BP?: string;
    BQ?: number;
    BR?: string;
    BS?: number;
    BT?: boolean;
    BU?: number;
  }
  
  export interface IClock {
    AD?: string;
    AE?: string;
    AF?: number | null;
    AG?: Date | null;
    AH?: number;
    AI?: boolean;
    AJ?: Array<IClock>;
    AK?: Date;
  }