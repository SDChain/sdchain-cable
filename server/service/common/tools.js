'use strict'
const path = require('path')
const fs = require('fs')

function sleep (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function mkdir (dir) {
  let p = path.dirname(path.normalize(dir))
  let isAbs = path.isAbsolute(p)
  let current_path = ''
  p = p.split(path.sep)
  if (isAbs) {
    current_path = p[0]
    if ((current_path.length <= 0) && (path.sep == '/')) {
      current_path = '/'
    }
    p.shift()
  }

  for (let i = 0; i < p.length; ++i) {
    current_path = path.join(current_path, p[i])
    if (!fs.existsSync(current_path)) {
      fs.mkdirSync(current_path)
    }
  }
}

module.exports = {
    sleep,
    mkdir
}
