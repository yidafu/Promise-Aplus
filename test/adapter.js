const {PromiseAplus} = require('../lib/index')

module.exports.deferred = function(){
  return {
    promise: PromiseAplus.resolve(),
    resolve: PromiseAplus.resolve,
    reject: PromiseAplus.reject,
  }
}
