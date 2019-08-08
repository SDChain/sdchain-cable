const api = require('./common/api');

function balances(address, options) {
  options.ledger = options.ledger || 'validated'
  return api.getBalances(address, options)
}

async function getSettings(address, options) {
  options.ledger = options.ledger || 'validated'
  return {
    settings: await api.getSettings(address, options)
  }

}

async function getTrustlines(address, options) {
  options.ledger = options.ledger || 'validated'
  const resTrustlines = await api.getTrustLines(address, options)
  return {
    trustlines: resTrustlines.lines,
    marker: resTrustlines.marker
  }

}

async function getOrders(address, options) {
  const page = options.page ? parseInt(options.page) : 1;
  const limit = options.limit ? parseInt(options.limit) : 10;
  let allRes = [];
  const filter = {
    isV1: options.isV1 ? true : false,
    marker: undefined,
    ledger: options.ledger || 'validated'
  };
  while (true) {
    const res = await api.getOrders(address, filter);
    filter.marker = res.marker;
    if (res.orders.length > 0) {
      allRes = allRes.concat(res.orders);
    }
    if (!filter.marker) {
      break;
    }
  }
  const allLen = allRes.length;
  let endIndex = allLen - (page - 1) * limit;
  let startIndex = allLen - (page - 1) * limit - limit;
  if (endIndex < 0) {
    return {
      orders: []
    };
  }
  if (startIndex < 0) {
    startIndex = 0;
  }
  const result = allRes.slice(startIndex, endIndex);
  return {
    orders: result.reverse()
  };
}

async function getTransactions(address, options) {
  const res = await accountTransactions(address, options);
  return res;
}

async function getTransaction(address, hash, options) {
  const res = await api.getTransaction(hash, options);
  if (res.type == 'Payment') {
    res.type = (address === res.account ? 'outgoing' : (address === res.destination ? 'incoming' : 'pass'));
  }
  return {
    transaction: res
  };
}


async function accountTransactions(address, options) {
  const type = options.type || '';
  const startLedger = options.start_ledger ? parseInt(options.start_ledger) : 0;
  const endLedger = options.end_ledger ? parseInt(options.end_ledger) : 0;
  const perPage = options.per_page ? parseInt(options.per_page) : 10;
  const page = options.page ? parseInt(options.page) : 1;
  const minDate = options.minDate || '';
  const maxDate = options.maxDate || '';
  const includeFail = options.exclude_failed === 'false' ? false : true
  let minTime = 0;
  let maxTime = 0;
  if (minDate != '') {
    minTime = parseInt(new Date(minDate).getTime() / 1000);
  }
  if (maxDate != '') {
    maxTime = parseInt(new Date(maxDate).getTime() / 1000);
  }
  let typeArr = [];
  if (type != '') {
    const types = type.toLowerCase();
    typeArr = types.split(',');
  }

  const startPageNum = (page - 1) * perPage + 1;
  const endPageNum = startPageNum + perPage - 1;

  const filter = {};
  filter.isV1 = options.isV1;
  if (startLedger > 0) {
    filter.ledgerIndexMin = startLedger;
  }
  if (endLedger > 0) {
    filter.ledgerIndexMax = endLedger;
  }

  const result = {
    transactions: []
  };
  let recordNum = 0;
  while (true) {
    if (result.transactions.length >= perPage) {
      break;
    }
    const res = await api.getTransactions(address, filter);
    if (!res.transactions || res.transactions.length <= 0) {
      break;
    }
    res.transactions.forEach((item) => {
      if (result.transactions.length >= perPage) {
        return;
      }
      if (typeArr.length > 0 && typeArr.indexOf(item.type.toLowerCase()) < 0) {
        return;
      }
      if (item.type == 'Payment') {
        item.type = (address === item.account ? 'outgoing' : (address === item.destination ? 'incoming' : 'pass'));
      }
      if (minTime > 0 && item.date < minTime) {
        return;
      }
      if (maxTime > 0 && item.date > maxTime) {
        return;
      }
      if (!includeFail && (item.state === 'failed' || item.result !== 'tesSUCCESS')) {
        return;
      }
      if (options.source_account && (item.account !== options.source_account)) {
        return;
      }
      if (options.destination_account && (item.destination !== options.destination_account)) {
        return;
      }
      if (options.direction) {
        if (options.direction === 'outgoing' && item.account !== address) {
          return;
        }
        if (options.direction === 'incoming' && item.destination && item.destination !== address) {
          return;
        }
      }
      recordNum++;
      if (recordNum >= startPageNum && recordNum <= endPageNum) {
        result.transactions.push(item);
      }
    });
    if (result.transactions.length >= perPage) {
      break;
    }
    if (!res.marker) {
      break;
    }
    filter.marker = res.marker;
  }
  return result;
};

async function getPayments(address, options) {
  options.type = 'payment';
  options.exclude_failed = options.exclude_failed === 'true' ? 'true' : 'false';
  const res = await accountTransactions(address, options)
  const payments = res.transactions;
  for (let i in payments) {
    const payment = {
      hash: payments[i].hash,
      ledger: payments[i].ledger + '',
      result: payments[i].result,
      source_account: payments[i].account,
      destination_account: payments[i].destination,
      amount: payments[i].amount,
      direction: payments[i].direction,
      timestamp: payments[i].time,
      date: payments[i].date,
      fee: payments[i].fee,
      memos: payments[i].memos,
      simple_memos: payments[i].simple_memos,
      txnFee: payments[i].txnFee
    }
    payments[i] = payment;
  }
  return {
    payments: payments
  };

}

async function getGatewayBalances(address, options) {
  options.ledger = options.ledger || "validated";
  const res = await api.getGatewayBalances(address, options)
  return {
    ledger: res.ledgerIndex || res.ledgerCurrentIndex,
    account: res.account,
    balances: res.balances,
    obligations: res.obligations
  };
}



/**
 * 查看token信息
 * @param {*} options 
 */
async function getTokenInfo(options) {
  options.ledger = options.ledger || "validated";
  let info = await api.getTokenInfo(options)
  return info
}


async function getAllAsset(options) {
  options.ledger = options.ledger || "validated"
  let info = await api.getAllAsset(options)
  return info
}


async function getAccountToken(options) {
  options.ledger = options.ledger || "validated"
  let info = await api.getAccountToken(options)
  return info
}

async function getAssetBalance(options) {
  options.ledger = options.ledger || 'validated'
  let info = await api.getAssetBalance(options)
  return info
}


module.exports = {
  balances,
  getSettings,
  getTrustlines,
  getOrders,
  getTransactions,
  getPayments,
  getTransaction,
  getGatewayBalances,
  getTokenInfo,
  getAllAsset,
  getAccountToken,
  getAssetBalance
}