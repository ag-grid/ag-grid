import type { ColDef } from "./types";

interface OlympicWinner {
  athlete: string;
  age: number;
  country: string;
  year: number;
  date: string;
  sport: string;
  gold: number;
  silver: number;
  bronze: number;
  total: number;
}

const athletes = [
  "Michael Phelps",
  "Usain Bolt",
  "Katie Ledecky",
  "Simone Biles",
  "Carl Lewis",
  "Nadia Comaneci",
  "Mark Spitz",
  "Jesse Owens",
  "Mo Farah",
  "Allyson Felix",
  "Ryan Lochte",
  "Natalie Coughlin",
  "Ian Thorpe",
  "Larisa Latynina",
  "Paavo Nurmi",
];

const countries = [
  "United States",
  "Jamaica",
  "Great Britain",
  "Romania",
  "China",
  "Russia",
  "Australia",
  "Germany",
  "France",
  "Japan",
];

const sports = [
  "Swimming",
  "Athletics",
  "Gymnastics",
  "Cycling",
  "Rowing",
  "Diving",
  "Wrestling",
  "Boxing",
  "Judo",
  "Weightlifting",
];

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomElement<T>(arr: T[]): T {
  return arr[randomInt(0, arr.length - 1)];
}

function generateOlympicWinners(count: number): OlympicWinner[] {
  const years = [2000, 2004, 2008, 2012, 2016, 2020, 2024];
  const results: OlympicWinner[] = [];

  for (let i = 0; i < count; i++) {
    const gold = randomInt(0, 3);
    const silver = randomInt(0, 2);
    const bronze = randomInt(0, 2);
    const year = randomElement(years);

    results.push({
      athlete: randomElement(athletes),
      age: randomInt(18, 35),
      country: randomElement(countries),
      year,
      date: `${randomInt(1, 28)}/${randomInt(1, 12)}/${year}`,
      sport: randomElement(sports),
      gold,
      silver,
      bronze,
      total: gold + silver + bronze,
    });
  }

  return results;
}

export const rowData = generateOlympicWinners(10000) as unknown as Record<
  string,
  unknown
>[];

// Find record holders for pinned top rows
const allWinners = rowData as unknown as OlympicWinner[];

const topTotalMedalist = allWinners.reduce((best, current) =>
  current.total > best.total ? current : best,
);

const topGoldMedalist = allWinners.reduce((best, current) =>
  current.gold > best.gold ? current : best,
);

export const pinnedTopRowData: Record<string, unknown>[] = [
  {
    ...topTotalMedalist,
    id: "",
    athlete: `★ ${topTotalMedalist.athlete} (Most Medals)`,
  },
  {
    ...topGoldMedalist,
    id: "",
    athlete: `★ ${topGoldMedalist.athlete} (Most Gold)`,
  },
];

// Calculate aggregates for pinned bottom rows
const totals = allWinners.reduce(
  (acc, row) => ({
    gold: acc.gold + row.gold,
    silver: acc.silver + row.silver,
    bronze: acc.bronze + row.bronze,
    total: acc.total + row.total,
  }),
  { gold: 0, silver: 0, bronze: 0, total: 0 },
);

const count = allWinners.length;

export const pinnedBottomRowData: Record<string, unknown>[] = [
  {
    id: "",
    athlete: "TOTAL",
    country: `${count} athletes`,
    age: "",
    year: "",
    date: "",
    sport: "",
    gold: totals.gold,
    silver: totals.silver,
    bronze: totals.bronze,
    total: totals.total,
  },
  {
    id: "",
    athlete: "AVERAGE",
    country: "",
    age: Math.round(allWinners.reduce((sum, r) => sum + r.age, 0) / count),
    year: "",
    date: "",
    sport: "",
    gold: (totals.gold / count).toFixed(1),
    silver: (totals.silver / count).toFixed(1),
    bronze: (totals.bronze / count).toFixed(1),
    total: (totals.total / count).toFixed(1),
  },
];

export const colDefs: ColDef[] = [
  {
    name: "id",
    label: "#",
    width: 50,
    pin: "left",
    valueGetter: ({ data, rowIndex }) => data.id ?? rowIndex + 1,
  },
  { name: "athlete", label: "Athlete", width: 180, pin: "left" },
  { name: "country", label: "Country", width: 150 },
  { name: "age", label: "Age", width: 80 },
  { name: "year", label: "Year", width: 90 },
  { name: "date", label: "Date", width: 110 },
  { name: "sport", label: "Sport", width: 130 },
  { name: "gold", label: "Gold", width: 80 },
  { name: "silver", label: "Silver", width: 80 },
  { name: "bronze", label: "Bronze", width: 80 },
  { name: "total", label: "Total", width: 80, pin: "right" },
];
