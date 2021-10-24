class SyncPromise {

  constructor(executor) {
    this.state = 'pending'

    this.value = undefined
    this.reason = undefined

    this.onFulfilled = []
    this.onRejected = []

    let
      resolve,
      reject

    try {
      resolve = (value) => {
        if (this.state !== 'pending') return

        if (value && typeof value.then === 'function') {
          value.then(resolve, reject)
          return
        }

        this.state = 'fulfilled'
        this.value = value

        this.onFulfilled.forEach(el => el(this.value))
      }

      reject = (reason) => {
        if (this.state !== 'pending') return

        this.state = 'rejected'
        this.reason = reason
        //
        // Promise.resolve().then(() => {
        //   if (this.onRejected.length === 0) return Promise.reject(this.reason)
        // })

        // if (this.onRejected.length === 0) {
        //   // queueMicrotask(() => Promise.reject(this.reason))
        //   return Promise.reject(this.reason)
        //   return;
        // }
        queueMicrotask(() => {
          if (this.onRejected.length === 0) Promise.reject(this.reason)
        })


        this.onRejected.forEach(el => el(this.reason))
      }

      executor(resolve, reject)

    } catch (e) {
      reject(e)
    }
  }

  then(onFulfilled, onRejected) {
    return new SyncPromise((resolve, reject) => {
      const wrappedResolve = () => {
        try {
          typeof onFulfilled === 'function'
            ? resolve(onFulfilled(this.value))
            : resolve(this.value)
        } catch (e) {
          reject(e)
        }
      }

      const wrappedReject = () => {
        if (typeof onRejected === 'function') {
          try {
            resolve(onRejected(this.reason))
          } catch (e) {
            reject(e)
          }
        } else reject(this.reason)
      }

      if (this.state === 'fulfilled') {
        wrappedResolve()
        return;
      }

      if (this.state === 'rejected') {
        wrappedReject()
        return;
      }

      if (this.state === 'pending') {
        this.onFulfilled.push(() => {
          wrappedResolve()
        })
        this.onRejected.push(() => {
          wrappedReject()
        })
      }
    })
  }

  catch(onRejected) {
    return new SyncPromise((resolve, reject) => {
      const wrappedReject = () => {
        if (typeof onRejected === 'function') {
          try {
            resolve(onRejected(this.reason))
          } catch (e) {
            reject(e)
          }
        } else reject(this.reason)
      }

      if (this.state === 'fulfilled') {
        resolve(this.value)
        return;
      }

      if (this.state === 'rejected') {
        wrappedReject()
        return;
      }

      if (this.state === 'pending') {
        this.onFulfilled.push(resolve)

        this.onRejected.push(() => {
          wrappedReject()
        })
      }
    })
  }

  finally(cb) {
    return new SyncPromise((resolve, reject) => {
      if (this.state === 'fulfilled' || this.state === 'rejected') {
        try {
          const result = cb()
          if (result && typeof result.then === 'function') {
            result
              .then(() => resolve(this.value))
              .catch(() => reject(result))
            return;
          }
          resolve(this.value)
        } catch (e) {
          reject(e)
        }
        return;
      }
      if (this.state === 'pending') {
        try {
          this.onFulfilled.push(() => resolve(this.value))
        } catch (e) {
          reject(e)
        }
      }
    })
  }


  static all(iterable) {
    return new SyncPromise((res, rej) => {
      const arr = [...iterable]
      if (arr.length === 0) res([])

      const resArr = new Array(arr.length)
      let done = 0

      for (let i = 0; i < arr.length; i++) {
        SyncPromise.resolve(arr[i])
          .then(value => {
            resArr[i] = value
            done++
          })
          .catch(rej)
          .finally(() => done === arr.length && res(resArr))
      }
    })
  }

  static allSettled(iterable) {
    return new SyncPromise((res) => {
      const arr = [...iterable]
      if (arr.length === 0) res([])

      const resArr = new Array(arr.length)
      let done = 0

      for (let i = 0; i < arr.length; i++) {
        SyncPromise.resolve(arr[i])
          .then(value => {
            resArr[i] = {status: 'fulfilled', value}
            done++
          })
          .catch(reason => {
            resArr[i] = {status: 'rejected', reason}
            done++
          })
          .finally(() => done === arr.length && res(resArr))
      }
    })
  }

  static race(iterable) {
    return new SyncPromise((res, rej) => {
      const arr = [...iterable]
      if (arr.length === 0) res()

      for (const el of iterable) {
        SyncPromise.resolve(el).then(res, rej)
      }
    })
  }

  static any(iterable) {
    return new SyncPromise((res, rej) => {
      const arr = [...iterable]
      if (arr.length === 0) rej('AggregateError: All promises were rejected')
      let done = 0

      for (const el of arr) {
        SyncPromise.resolve(el)
          .then(res)
          .catch(() => done++)
          .finally(() => done === arr.length && rej('AggregateError: All promises were rejected'))
      }
    })
  }

  static resolve(value) {
    if (value instanceof SyncPromise) return value
    return new SyncPromise(res => res(value))
  }

  static reject(reason) {
    return new SyncPromise((_, rej) => rej(reason))
  }

}

let q = SyncPromise.resolve(1)
q.finally(() => SyncPromise.reject(5)).catch(console.log)

async function fn() {
  try {
    return await SyncPromise.reject(100)
  } catch (e) {
    return e
  }
}

// console.log(1)
// let q = new SyncPromise((res) => res(3))
// q.then(console.log)
// // let qq = new SyncPromise((res) => res(Promise.resolve(5)))
// console.log(2)
//
//
//   .then(console.log)
// qq.then(console.log).then(console.log)


// ## Наследование

// Необходимо сделать класс денег у которого входным параметром является количество денег.
// Также создать класс для Доллара, Евро и рубля, которые наследуются от денег.
// В качестве параметра конструктор доллара они смогут также принимать не только число,
// но и экземпляр другого класса дочернего от денег - в таком случае, вторым параметром можно будет передать курс конвертации.
// Курс конвертации можно менять с помощью метода.
// Задание нужно сделать 2-мя способами: с помощью ES6 class и с помощью функций.

class Money {
  constructor(amount, exRate) {
    if (amount instanceof Money) {
      this.currency = amount.get()
      this.exRate = exRate
      this._convert()
    } else {
      this.amount = amount
    }
  }

  get() {
    return this.amount
  }

  setMod(exRate) {
    this.exRate = exRate
    this._convert()
    return this
  }

  _convert() {
    this.amount = (this.currency / this.exRate).toFixed(1)
  }
}

class Dollar extends Money {
  constructor(amount, exRate) {
    super(amount, exRate);
  }
}

class Euro extends Dollar {
  constructor(amount, exRate) {
    super(amount, exRate);
  }
}

class Ruble extends Dollar {
  constructor(amount, exRate) {
    super(amount, exRate);
  }
}

function Money2(amount) {
  this.amount = amount
}

Money2.prototype = {
  get() {
    return this.amount
  },
  setMod(exRate) {
    this.exRate = exRate
    this._convert()
    return this
  },
  _convert() {
    this.amount = +(this.currency / this.exRate).toFixed(1)
  }
}

function Dollar2(amount, exRate) {
  if (amount instanceof Money2) {
    Money2.call(this)
    this.currency = amount.get()
    this.exRate = exRate
    this._convert()
  } else {
    Money2.call(this, amount)
  }
}

Dollar2.prototype = Object.create(Money2.prototype)
Dollar2.constructor = Dollar2

function Euro2(amount, exRate) {
  Dollar2.call(this, amount)
}

function Ruble2(amount, exRate) {
  Dollar2.call(this, amount)
}

Euro2.prototype = Object.create(Dollar2.prototype)
Object.defineProperty(Euro2.prototype, 'constructor', {
  value: Euro2,
  enumerable: false, // false, чтобы данное свойство не появлялось в цикле for in
  writable: true,
  // configurable: true,
});

Object.setPrototypeOf(Ruble2.prototype, Dollar2.prototype)
// Ruble2.prototype.__proto__ = Dollar2.prototype

let q = {}
q.__proto__ = Dollar2.prototype
Ruble2.prototype.__proto__ = q

Ruble2.constructor = Ruble2


const rub = new Ruble2(100);

rub.get(); // 100

const dollar = new Dollar2(rub, 75);

dollar.get() // 1.3

// Надо сделать так, чтобы метод setMod можно было "чейнить"
dollar.setMod(80).get() // 1.2


// ## Заимствование


const obj = Object.create(null);

// Тут будет ошибка, т.к. объект создан без прототипа и такого метода у нас нет
obj.hasOwnProperty('foo')

// Как сделать так, чтобы метод появился, но при этом не добавляет его в прототип или сам объект?

({}).hasOwnProperty.call(obj,'foo')




const tree = {
  value: 1,
  children: [
    {
      value: 2,
      children: [
        {
          value: 4,
          children: [
            {
              value: 5,
              children: [
                {
                  value: 6,
                  children: [
                    {
                      value: 7
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    },
    {
      value: 3,
      children: [
        {
          value: 8
        }
      ]
    }
  ],
  * [Symbol.iterator]() {
    for (const key in this) {
      if (key === 'value') yield this[key]
      if (key === 'children') {
        for (const el of this[key]) {
          if (!el[Symbol.iterator]) el[Symbol.iterator] = this[Symbol.iterator]
          yield* el
        }
      }
    }
  }
}

for (const el of tree) {
  console.log(el)
}
