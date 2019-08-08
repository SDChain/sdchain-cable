const api = require('./common/api');
const utils = require('./common/utils');

async function getFee() {
  const res = await api.getFee();
  return res
};

async function submit(txBlob) {
  const res = await api.submit(txBlob);
  return {
    result: res
  }
};

async function sign(txJson, secret) {
  const res = await api.sign(txJson, secret);
  return {
    result: res
  }
};

async function getTransaction(hash) {
  const res = await api.getTransaction(hash);
  return {
    transaction: res
  }
};

async function submitTransaction(txJson, secret, options) {
  let _txJson = txJson;
  if (!options.unsign) {
    const resSign = await api.sign(txJson, secret);
    _txJson = resSign.signedTransaction
  }
  const res = await api.submit(_txJson, options);
  return {
    result: res
  }
};

async function submitPayment(address, options) {
  options.unsign = utils.toBoolean(options.unsign)
  options.payment.unsign = options.unsign
  const resPre = await api.preparePayment(address, options.payment);
  if (options.submit === 'false') {
    return {
      txJson: JSON.parse(resPre.txJson)
    }
  }
  const res = await submitTransaction(resPre.txJson, options.secret, options);
  return res
};


async function submitOrder(address, options) {
  options.unsign = utils.toBoolean(options.unsign)
  options.order.unsign = options.unsign
  const resPre = await api.prepareOrder(address, options.order);
  if (options.submit === 'false') {
    return {
      txJson: JSON.parse(resPre.txJson)
    }
  }
  const res = await submitTransaction(resPre.txJson, options.secret, options);
  return res
};

async function submitOrderCancellation(address, options) {
  options.unsign = utils.toBoolean(options.unsign)
  options.order.unsign = options.unsign
  const resPre = await api.prepareOrderCancellation(address, options.order);
  if (options.submit === 'false') {
    return {
      txJson: JSON.parse(resPre.txJson)
    }
  }
  const res = await submitTransaction(resPre.txJson, options.secret, options);
  return res
};

async function submitTrustline(address, options) {
  options.unsign = utils.toBoolean(options.unsign)
  options.trustline.unsign = options.unsign
  const resPre = await api.prepareTrustline(address, options.trustline);
  if (options.submit === 'false') {
    return {
      txJson: JSON.parse(resPre.txJson)
    }
  }
  const res = await submitTransaction(resPre.txJson, options.secret, options);
  return res
};

async function submitSettings(address, options) {
  options.unsign = utils.toBoolean(options.unsign)
  options.settings.unsign = options.unsign
  const resPre = await api.prepareSetting(address, options.settings);
  if (options.submit === 'false') {
    return {
      txJson: JSON.parse(resPre.txJson)
    }
  }
  const res = await submitTransaction(resPre.txJson, options.secret, options);
  return res
};


async function submitMultiPayment(address, options) {
  options.unsign = utils.toBoolean(options.unsign)
  options.payments.unsign = options.unsign
  const resPre = await api.prepareMultiPayment(address, options.payments);
  if (options.submit === 'false') {
    return {
      txJson: JSON.parse(resPre.txJson)
    }
  }
  const res = await submitTransaction(resPre.txJson, options.secret, options);
  return res
}


module.exports = {
  getFee,
  sign,
  submit,
  submitPayment,
  submitOrder,
  submitOrderCancellation,
  submitSettings,
  submitTrustline,
  getTransaction,
  submitMultiPayment,
}