function deletePortfolioOnServer(portfolio) {
    const oldDataSize = data.length;
    data = data.filter((record) => record.portfolio !== portfolio);
    return {
      success: oldDataSize !== data.length,
    };
  }
  
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
  
  function changePortfolioOnServer(oldPortfolio, newPortfolio) {
    const groupDidExist = data.some((record) => record.portfolio === newPortfolio);
    const updatedRecords = [];
    data.forEach((record) => {
      if (record.portfolio === oldPortfolio) {
        record.portfolio = newPortfolio;
        updatedRecords.push(record);
      }
    });
    return {
      success: !!updatedRecords.length,
      newGroupCreated: !groupDidExist,
      updatedRecords: updatedRecords,
    }
  }