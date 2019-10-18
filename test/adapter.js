const {PromiseAplus} = require('../lib/index')

module.exports.deferred = function(){
  let resolve, reject;
  return {
    promise: new PromiseAplus(function(rslv, rjct){
      resolve = rslv;
      reject = rjct;
    }),
    resolve: resolve,
    reject: reject,
  }
}
