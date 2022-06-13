export type Data = { time: number, value: number };

export function getData(count: number): Data[]  {
  let baseValue = Math.random() * 1000;
  let time = +new Date(2011, 0, 1);
  let smallBaseValue: number;
 
  const next = (idx: number) => {
    smallBaseValue =
      idx % 30 === 0
        ? Math.random() * 700
        : smallBaseValue + Math.random() * 500 - 250;
    baseValue += Math.random() * 20 - 10;
    return Math.max(0, Math.round(baseValue + smallBaseValue) + 3000);
  }

  const data = [];
  data.length = count;

  let i = 0;
  while (i < count) {
    data[i] = {
      time,
      value: next(i++),
    };
    time += 1000;
  }

  return data;
}
