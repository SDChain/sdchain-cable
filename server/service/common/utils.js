function parseCurrencyQuery (query) {
  const params = query.split('+')

  if (!isNaN(params[0])) {
    return {
      value: (params.length >= 1 ? params[0] : ''),
      currency: (params.length >= 2 ? params[1] : ''),
      issuer: (params.length >= 3 ? params[2] : '')
    }
  }
  return {
    currency: (params.length >= 1 ? params[0] : ''),
    issuer: (params.length >= 2 ? params[1] : undefined)
  }
}

function toBoolean(str){
  let bool = true;
  switch(str){
    case false:
    bool = false
    case '':
    bool = false
    break
    case undefined:
    bool = false
    break
    case '0':
    bool = false
    break
    case 0:
    bool = false
    break
    case 'false':
    bool = false
    break
  }
  return bool

}
module.exports = {
    parseCurrencyQuery,
    toBoolean
}
