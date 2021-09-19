// ## abortablePromise

// > Необходимо написать функцию, которая принимала бы некоторый Promise и экземпляр AbortController и возвращала бы новый. Этот промис можно отменить с помощью использования переданного AbortController. При отмене промис режектится.


const abortablePromise = (promise, controller) => {
  return new Promise((res, rej) => {
    controller.addEventListener('abort', rej, {once: true})
    promise.then(res)
  })
}


const controller = new AbortController();

const myPromise = new Promise(() => 'yo')

const promise = abortablePromise(myPromise, controller.signal).catch(console.error);

controller.abort();


// ## nonNullable

// > Нужно написать функцию, которая принимает функцию и возвращает новую. Новая функция в качестве результата возвращает Promise. Если новой функции передать null в качестве аргументов, то промис должен режектится.

function nonNullable(fn) {
  return function (...params) {
    return new Promise((res, rej) => {
      for (let param of params) {
        if (param === null) rej('argument is null')
      }
      res(fn(...params))
    })
  }
}

function sum(a, b) {
  return a + b;
}

function prod(a, b) {
  return a * b;
}

const sum2 = nonNullable(sum);
const prod2 = nonNullable(prod);

prod2(10, null).then(sum2).catch(console.error);


// ## syncPromise

// > Необходимо написать функцию, которая по своему интерфейсу идентична конструктору Promise, но возвращала бы объект, в котором методы then, catch и finally выполнятся немедленно, если промис уже зарезолвлен. Сементика работы методов в остальном должны быть идентична нативным промисам.


const syncPromise = (fn) => {
  let state = 'pending'
  let result = undefined

  let res = []
  let rej = []

  const resolve = (value) => {
    if (state !== 'pending') return
    state = 'fulfilled'
    result = value
    if (res.length !== 0) {
      for (let fn of res) {
        fn(result)
      }
      return result
    }
    return result
  }

  const reject = (value) => {
    if (state !== 'pending') return
    state = 'rejected'
    result = value
    if (rej.length !== 0) {
      for (let fn of rej) {
        fn(result)
      }
      return result
    }
    return result = Promise.reject(value)
  }

  try {
    fn(resolve, reject)
  } catch (e) {
    reject(e)
  }

  return {
    then(cb1, cb2) {
      try {
        if (state === 'fulfilled') {
          return syncPromise((resolve) => resolve(typeof cb1 === 'function' ? cb1(result) : result))
        }
        if (state === 'rejected') {
          if (typeof cb2 !== 'function') return result
          return syncPromise((resolve) => resolve(cb2(result)))
        }
        return syncPromise((resolve, reject) => {
          res.push((arg) => resolve(typeof cb1 === 'function' ? cb1(arg) : arg));
          if (typeof cb2 === 'function') {
            rej.push((arg) => resolve(cb2(arg)))
          } else {
            rej.push((arg) => reject(arg))
          }
        })
      } catch (e) {
        return syncPromise((resolve, reject) => reject(e))
      }
    },
    catch(cb) {
      try {
        if (state === 'rejected') {
          if (typeof cb !== 'function') return result
          return syncPromise((resolve) => resolve(cb(result)))
        }
        return syncPromise((resolve) => {
          rej.push((arg) => resolve(cb ? cb(arg) : arg));
        })
      } catch (e) {
        return syncPromise((resolve, reject) => reject(e))
      }
    },
    finally(cb) {
      try {
        return syncPromise((resolve) => {
          res.push(() => {
            cb()
            resolve(result)
          })
        })
      } catch (e) {
        return syncPromise((resolve, reject) => reject(e))
      }
    }
  }
}
//
// syncPromise((r, r2) => {
//   setTimeout(() => r2(1), 2000)
// }).then(null, (v) => {
//   console.log(v + 2)
//   return v + 2
// }).then(console.log)
//
// syncPromise((r, r2) => {
//   setTimeout(() => r2(1), 2000)
// }).then((v) => {
//   console.log(v + 2)
//   return v + 2
// }).then(console.log)
//
// syncPromise((resolve) => resolve(1))
//   .then((a) => {
//     console.log(a)
//     return a
//   })
//   .then((a) => setTimeout(() => console.log(a), 1000))
//
//
// syncPromise((resolve, reject) => reject(1)).then(console.log).then(null, console.log);
//
//
// syncPromise((r1, r2) => r2(1)).then(null, console.log);
// console.log(2);
