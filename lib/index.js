const PENDING = 'pending';
const FULFiLLED = 'fulfiiled';
const REJECTED = 'rejected';

function isFunction(func) {
  return typeof func === 'function';
}

function PromiseAplus(func) {
  this.states = PENDING;
  this.fulfilledCallbacks = [];
  this.rejectedCallbacks = [];
  this.value = null;

  function resolve(value) {
    if (this.states === PENDING) {
      this.states = FULFiLLED;
      this.value = value;
      setTimeout(() => {
        this.fulfilledCallbacks.forEach((fn) => fn(this.value));
      }, 0);
    }
  }

  function reject(err) {
    if (this.states === PENDING) {
      this.state = REJECTED;
      setTimeout(() => {
        this.rejectedCallbacks.forEach((fn) => fn(err));
      }, 0);
    }
  }

  if (isFunction(func)) {
    func(
      resolve.bind(this),
      reject.bind(this),
    );
  }
}

PromiseAplus.prototype.then = function then(onFulfilled, onRejected) {
  const promise = new PromiseAplus((resolve, reject) => {
    if (isFunction(onFulfilled)) {
      this.fulfilledCallbacks.push((value) => {
        const nextVal = onFulfilled(value);
        resolve(nextVal);
      });
    }
  });

  // if (isFunction(onRejected)) {
  //   this.rejectedCallbacks.push(onRejected);
  // }
  return promise;
};


PromiseAplus.resolve = function (value) {
  return new PromiseAplus(((resolve) => {
    resolve(value);
  }));
};

PromiseAplus.prototype.reject = function () {};

module.exports.PromiseAplus = PromiseAplus;
