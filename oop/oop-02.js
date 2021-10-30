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
  constructor: Money2,
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

  ({}).hasOwnProperty.call(obj, 'foo')


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


// js
// Реализовать функцию, которая принимает JS объект, а вторым параметром - функцию, которая
// будет вызываться каждый раз когда одно из этих свойств меняется

function watch(obj, cb) {
  const propsObj = {}
  for (let el in obj) {
    propsObj[el] = {
      configurable: true,
      enumerable: true,
      get() {
        if (typeof obj[el] === 'object') {
          return watch(obj[el], cb)
        }
        return obj[el]
      },
      set(value) {
        const oldValue = obj[el]
        obj[el] = value
        cb(obj[el], oldValue)
      }
    }
  }
  return Object.create(obj, propsObj)
}


const obj = {
  a: 1,
  b: {c: 2}
};

let q = watch(obj, (value, oldValue) => {
  console.log(value, oldValue);
});

function watch(obj, cb) {
  const propsObj = {}
  for (const el in obj) {
    if (typeof obj[el] === 'object') watch(obj[el], cb)
    const newKey = Symbol(el)
    obj[newKey] = obj[el]
    propsObj[el] = {
      configurable: true,
      enumerable: true,
      get() {
        return this[newKey]
      },
      set(value) {
        const oldValue = this[newKey]
        this[newKey] = value
        cb(this[newKey], oldValue)
      }
    }
  }
  Object.defineProperties(obj, propsObj)
}


const obj = {
  a: 1,
  b: {c: 2}
};

watch(obj, (value, oldValue) => {
  console.log(value, oldValue);
});

obj.a++;
obj.b.c++;

const newObj = watch()


// Необходимо написать класс KVStorage, который бы реализовывал базовый CRUD API для работы с локальным хранилищем.
// Первым параметром конструктор класса должен получать "движок" или "стратегию", где именно хранить данные.
// Движки следует хранить как статические свойства класса. Методы класса должны возвращать Promise.
// Следует реализовать 2 движка: localStorage и IndexedDb.

class IndexedDb {
  set({dbName, storeName, key, value}) {
    return new Promise((res, rej) => {
      const request = indexedDB.open(dbName)
      request.onerror = rej
      const db = request.result

      if (!db.objectStoreNames.contains(storeName)) {
        request.onupgradeneeded = function () {
          const store = db.createObjectStore(storeName, {keyPath: 'id'})
          store.put({[key]: value, id: new Date().getTime()})
        }
        request.onsuccess = function () {
          request.result.close()
          res({dbName, storeName, key, value})
        }

      } else {
        const tx = db.transaction(storeName, "readwrite");
        const store = tx.objectStore(storeName);

        const result = store.put({[key]: value, id: new Date().getTime()});

        tx.oncomplete = function () {
          request.result.close()
          res({dbName, storeName, key, value})
        }
        result.onerror = rej
      }
    })
  }

  get({dbName, storeName, key, value}) {
    return new Promise((res, rej) => {
      const request = indexedDB.open(dbName)
      request.onerror = rej
      const db = request.result

      if (!db.objectStoreNames.contains(storeName)) {
        rej('Invalid store name')
      }

      const tx = db.transaction(storeName, 'readonly')
      const store = tx.objectStore(storeName)
      const idx = store.index(key)

      const req = idx.get(value)
      req.onsuccess = function () {
        if (req.result != null) {
          res(req.result)
        } else {
          rej('No match found')
        }
      }
    })
  }

  remove({dbName, storeName, value}) {
    return new Promise((res, rej) => {
      const request = indexedDB.open(dbName)
      request.onerror = rej
      const db = request.result

      if (!db.objectStoreNames.contains(storeName)) {
        rej('Invalid store name')
      }

      const tx = db.transaction(storeName, 'readonly')
      const store = tx.objectStore(storeName)
      store.delete(value)

    })
  }
}

class LocalStorage {
  _reject(key, cb) {
    if (typeof key !== 'string') return cb('Invalid key type')
  }

  set({key, value}) {
    return new Promise((res, rej) => {
      this._reject(key, rej)

      const prepValue = JSON.stringify(value)
      localStorage.setItem(key, prepValue)
      res(key, value)
    })
  }

  get(key) {
    return new Promise((res, rej) => {
      this._reject(key, rej)

      const value = JSON.parse(localStorage.getItem(key))
      res(value)
    })
  }

  remove(key) {
    return new Promise((res, rej) => {
      this._reject(key, rej)

      localStorage.removeItem(key)
      res(key)
    })
  }
}

class KVStorage {
  constructor(strategy) {
    this.stratagy = strategy
  }

  static localStorage = new LocalStorage()

  static indexedDb = new IndexedDb()

  set(props) {
    this.stratagy.set(props)
  }

  get(props) {
    this.stratagy.get(props)
  }

  remove(props) {
    this.stratagy.remove(props)
  }
}

let obj = {dbName: 'store', storeName: 'books', key: 'title', value: 'Tom Sawyer'}
const storage = new KVStorage(KVStorage.localStorage);

storage.set('foo', {bla: 1}).then(async () => {
  console.log(await storage.get('foo'));
});