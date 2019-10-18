const PENDING = 'pending';
const FULFiLLED = 'fulfiiled';
const REJECTED = 'rejected';

function isFunction(func) {
  return typeof func === 'function';
}

function isPromise(p) {
  return p && p.constructor === PromiseAplus;
}

function isObject(o) {
  return o !== null && typeof o === 'object';
  // return Object.prototype.toString.call(o) === '[object Object]';
}

function PromiseAplus(func) {
  this.state = PENDING;
  this.promisesQueue = [];
  this.value = null;
  this.handler = {
    resolve: function onFulfilledCallback(value) {
      return value;
    },
    reject: function onRejectedCallback(err) {
      throw err;
    },
  };

  function resolve(value = null) {
    PromiseAplus._resolutionProcedure(this, value);
  }

  function reject(err = null) {
    this._reject(err);
  }

  if (isFunction(func)) {
    func(resolve.bind(this), reject.bind(this));
  }
}

PromiseAplus.prototype.then = function then(onFulfilled, onRejected) {
  const promise = new PromiseAplus();

  if (isFunction(onFulfilled)) {
    promise.handler.resolve = onFulfilled;
  }

  if (isFunction(onRejected)) {
    promise.handler.reject = onRejected;
  }

  this.promisesQueue.push(promise);

  this._process();

  return promise;
};

PromiseAplus.prototype._resolve = function resolve(value) {
  if (this.state === PENDING) {
    this.value = value;
    this.state = FULFiLLED;
    this._process(value);
  }
};

PromiseAplus.prototype._reject = function reject(err) {
  if (this.state === PENDING) {
    this.value = err;
    this.state = REJECTED;
    this._process(err);
  }
};

PromiseAplus.prototype._process = function process() {
  if (this.state === PENDING) return;

  setTimeout(() => {
    while (this.promisesQueue.length) {
      const promise = this.promisesQueue.shift();
      let handler = null;

      if (this.state === FULFiLLED) {
        handler = promise.handler.resolve;
      } else if (this.state === REJECTED) {
        handler = promise.handler.reject;
      }

      let nextValue;
      try {
        nextValue = handler(this.value);
      } catch (err) {
        promise._reject(err);
        continue;
      }
      PromiseAplus._resolutionProcedure(promise, nextValue);
    }
  }, 0);
};

PromiseAplus._resolutionProcedure = function resolutionProcedure(promise, x) {
  if (promise === x) {
    promise._reject(
      new TypeError('The promise and its value refer to the same object'),
    );
  } else if (isPromise(x)) {
    switch (x.state) {
      case PENDING: {
        x.then((value) => {
          PromiseAplus._resolutionProcedure(promise, value);
        }, (err) => {
          promise._reject(err);
        });
        break;
      }
      case FULFiLLED: {
        promise._resolve(x.value);
        break;
      }
      case REJECTED: {
        promise._reject(x.value);
        break;
      }
    }
  } else if (isObject(x) || isFunction(x)) {
    let then;
    let called = false;
    try {
      then = x.then;
    } catch (err) {
      (!called && promise._reject(err));
      return;
    }

    if (isFunction(then)) {
      try {
        then.call(x,
          (y) => {
            (!called && PromiseAplus._resolutionProcedure(promise, y), called = true);
          },
          (r) => {
            (!called && promise._reject(r), called = true);
          });
      } catch (err) {
        (!called && promise._reject(err));
        called = true;
      }
    } else {
      promise._resolve(x);
      called = true;
    }
  } else {
    promise._resolve(x);
  }
};

PromiseAplus.resolve = function (value) {
  return new PromiseAplus(((resolve) => {
    resolve(value);
  }));
};

PromiseAplus.reject = function (err) {
  return new PromiseAplus(((resolve, reject) => {
    reject(err);
  }));
};

module.exports.PromiseAplus = PromiseAplus;
