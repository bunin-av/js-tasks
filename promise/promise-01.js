// 01- ## sleep
// > Необходимо написать функцию возвращающую Promise, который зарезолвится через заданное количество миллисекунд.

function sleep(ms) {
  return new Promise(res => {
    setTimeout(res, ms)
  })
}

function sleep2(ms) {
  return new Promise(res => {
    setTimeout(() => res('Resolved'), ms)
  })
}

function sleep3(ms, msg) {
  return () => new Promise(res => {
    setTimeout(() => res('Resolved: ' + msg), ms)
  })
}

// sleep(200).then(() => {
//     console.log('Я проснулся!');
// });

// 02- ## rejectAfterSleep

// > Необходимо написать функцию возвращающую Promise, который зареджектится через заданное количество миллисекунд. Вторым аргументов функция принимает объект ошибки

function rejectAfterSleep(ms, msg) {
  return new Promise((_, rej) => {
    setTimeout(() => rej(msg), ms)
  })
}

function rejectAfterSleep2(ms, msg) {
  return () => new Promise((_, rej) => {
    setTimeout(() => rej(msg), ms)
  })
}

// rejectAfterSleep(200, 'boom!').catch((err) => {
//     console.log(err);
// });

// 03- ## timeout

// > Необходимо написать функцию, которая принимает объект Promise и некоторое количество миллисекунд и возвращает новый Promise. Если переданный Promise не успевает зарезолвится до истечения этого времени, то результирующий Promise должен быть зареджекчен с ошибкой new Error('Timeout').

// const timeout = (promise, ms) => {
//   let isResolved = false
//   const data = promise.then(data => {
//     isResolved = true
//     return data
//   })
//   return new Promise((res, rej) => {
//     setTimeout(() => {
//       if (isResolved) {
//         return res(data)
//       }
//       rej('Timeout')
//     }, ms)
//   })
// }

const timeout2 = (promise, ms) => {
  return new Promise((res, rej) => {
    promise.then(res, rej)
    setTimeout(() => rej('Timeout'), ms)
  })
}

const timeout3 = (promise, ms) => {
  return Promise.race([rejectAfterSleep(ms, 'Timeout'), promise])
}

// timeout2(sleep2(500), 400).then(console.log, console.log);

// 04- ## all
//
// > Необходимо написать функцию, которая идентична Promise.all.


function promiseAll(promises) {
  const arr = [...promises]

  return new Promise((res, rej) => {
    let resultArray = []
    for (const promise of arr) {
      promise
        .then(result => {
          resultArray.push(result)
          if (resultArray.length === arr.length) res(resultArray)
        })
        .catch(rej)
    }
  })
}


function promiseAll2(promises) {
  const arr = [...promises]

  return new Promise((res, rej) => {
    let resultArray = []
    for (let el of arr) {
      (async () => {
        try {
          resultArray.push(await el)
          if (resultArray.length === arr.length) res(resultArray)
        } catch (e) {
          rej(e)
        }
      })()
    }
  })
}

// promiseAll2([rejectAfterSleep(1000, 'ERROR'), sleep2(300), sleep2(5000),]).then(console.log).catch(console.log)
//
// promiseAll2([sleep2(2000), sleep2(300), sleep2(5000),]).then(console.log).catch(console.log)

// 05- ## allSettled
//
// > Необходимо написать функцию, которая идентична Promise.allSettled.

const promiseAllSettled = (promises) => {
  const arr = [...promises]

  return new Promise(res => {
    let resultArray = []
    for (const promise of arr) {
      promise
        .then(result => resultArray.push({status: 'resolved', value: result}))
        .catch(e => resultArray.push({status: 'rejected', reason: e}))
        .then(() => {
          if (resultArray.length === arr.length) res(resultArray)
        })
    }
  })
}


// promiseAllSettled([rejectAfterSleep(2000, 'ERROR'), sleep2(300), sleep2(5000),]).then(console.log).catch(console.log)
//
// promiseAllSettled([sleep2(2000), sleep2(300), sleep2(5000),]).then(console.log).catch(console.log)

// 06- ## race
//
// > Необходимо написать функцию, которая идентична Promise.race.


const promiseRace = (promises) => {
  const arr = [...promises]

  return new Promise((res, rej) => {
    for (const promise of arr) {
      promise
        .then(res)
        .catch(rej)
    }
  })
}


// promiseRace([rejectAfterSleep(1000, 'ERROR'), sleep2(500), sleep2(5000),]).then(console.log).catch(console.log)
//
// promiseRace([sleep2(2000), sleep2(3000), sleep2(5000),]).then(console.log).catch(console.log)

// 07- ## once
//
// > Необходимо написать функцию, которая бы добавляла обработчик события на заданный элемент и возвращала Promise. Promise должен зарезолвится при срабатывании события. В качестве значения Promise должен возвращать объект события.

const addListener = (element, event) => {
  let cb

  return new Promise(res => {
    cb = res // только такой способ придумал, чтобы можно было потом удалить. Можно как-то иначе?)  И еще.. в каких случаях на практике может быть нужно добавлять обработчик с промисом?
    element.addEventListener(event, cb)
  })
    .then(data => {
      element.removeEventListener(event, cb)
      return data
    })
}

const addListener2 = (element, event) => {
  return new Promise(res => {
    const cb = e => {
      element.removeEventListener(event, cb)
      res(e)
    }
    element.addEventListener(event, cb)
  })
}


//08- # promisify
//
// > Необходимо написать функцию, которая бы принимала функцию ожидающую callback и возвращала новую функцию. Новая функция вместо callback должна возвращать Promise. Предполагается, что исходная функция принимает callback последним параметром, т. е. если функция принимает другие аргументы, то они идут ДО callback. Сам callback первым параметром принимает объект ошибки или null, а вторым возвращаемое значение (если нет ошибки).
//


function promisify(fn) {
  return function (...args) {
    return new Promise((res, rej) => {
      fn(...args, (err, result) => {
        if (err) return rej(err)
        res(result)
      })
    })
  };
}

const fs = {
  readFile(file, cb) {
    setTimeout(() => {
      const result = Math.random()
      if (result < 0.5) return cb('Error loading file')
      cb(null, "You Don't Know JS: Async & Performance")
    }, 1000)
  }
}

function openFile(file, cb) {
  fs.readFile(file, cb);
}

const openFilePromise = promisify(openFile);

// openFilePromise('foo.txt').then(
//   console.log,
//   console.error
// );


// > Необходимо написать статический метод для Promise, который бы работал как Promise.all, но с возможностью задания лимита на выполнения "одновременных" задач. В качестве первого параметра, метод должен принимать Iterable объект с функциями, которые возвращают Promise. Сам метод также возвращает Promise.


// Promise.allLimit = function (iterable) {
//   if (!Promise.hasOwnProperty('_limit')){
//     Object.defineProperty(Promise, '_limit', {
//       enumerable: false,
//       configurable: false,
//       writable: true,
//       value: 0
//     });
//   }
//   return new Promise((res, rej) => {
//     if (Promise._limit >= 2) return
//     ++Promise._limit
//     let resultArray = []
//     for (const fn of iterable) {
//       fn()
//         .then(r => {
//           resultArray.push(r)
//           if (resultArray.length === (iterable.length || iterable.size)) {
//             res(resultArray)
//           }
//         })
//         .catch(rej)
//     }
//   })
//     .then(r => {
//       --Promise._limit
//       return r
//     })
// }

Promise.allLimit = function (iterable) {
  const arr = [...iterable]
  let limit = 2
  let resultArray = []
  let index = 0

  return new Promise((res, rej) => {
    const fn = () => {
      while ((index !== arr.length)) {
        // console.log('limit', limit)
        if (limit <= 0) return
        limit--
        arr[index]()
          .then(r => {
            resultArray.push(r)
            limit++
            // console.log(r)
            fn()
            if (arr.length === resultArray.length) res(resultArray)
          })
          .catch(rej)
        index++
      }
    }
    fn()
  })
}

// Promise.allLimit([
//   fetch.bind(null, 'url1'),
//   fetch.bind(null, 'url2'),
//   fetch.bind(null, 'url3'),
//   fetch.bind(null, 'url4')
// ], 2).then(([data1, data2, data3, data4]) => {
//   console.log(data1, data2, data3, data4);
// })
Promise.allLimit([
  sleep3(5000, '#1'), sleep3(2000, '#2'), sleep3(10000, '#3'), sleep3(3000, '#4')
], 2).then(console.log).catch(console.error)

setInterval(() => {
  console.log('1 sec')
}, 1000)

