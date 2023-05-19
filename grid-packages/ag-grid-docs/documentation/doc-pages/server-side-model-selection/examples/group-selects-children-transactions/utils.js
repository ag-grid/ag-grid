let currentServerRecordId = data.length;
function createRowOnServer(portfolio, product, book) {
  const groupDidExist = data.some((record) => record.portfolio === 'Aggressive');
  const newRecord = {
    tradeId: ++currentServerRecordId,
    portfolio: portfolio,
    product: product,
    book: book,
    current: 0,
    previous: 0,
  }
  data.push(newRecord);

  return {
    success: true,
    newGroupCreated: !groupDidExist,
    newRecord: newRecord,
  }
}