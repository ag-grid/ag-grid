const NUM_DATA_POINTS = 400

export function getData() {
  const data: Array<{ year: number; spending: number }> = []
  for (let i = 0; i < NUM_DATA_POINTS; i++) {
    data.push({
      year: new Date().getFullYear() - NUM_DATA_POINTS + i,
      spending:
        i === 0
          ? Math.max(0, Math.min(100, random() * 100))
          : Math.max(
              0,
              Math.min(100, data[i - 1].spending + random() * 10 - 5)
            ),
    })
  }
  return data
}

// Simple seeded randomisation for consistent data - https://stackoverflow.com/a/19303725
let seed = 1234
function random() {
  const x = Math.sin(seed++) * 10000
  return x - Math.floor(x)
}
