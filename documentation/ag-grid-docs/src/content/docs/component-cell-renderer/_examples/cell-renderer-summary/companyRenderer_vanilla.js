function CompanyRenderer(params) {
    const link = `<a href="https://en.wikipedia.org/wiki/${params.value}" target="_blank">${params.value}</a>`
    return link
  }