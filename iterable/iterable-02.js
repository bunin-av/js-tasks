//# Задания на тему Generator API

// ## forEach


// Написать функцию, которая принимает Iterable объект и возвращает Promise, который зарезолвится,
// когда обход будет закончен. Сам обход должен разбиваться на чанки, если выполняется дольше чем 60мс за раз.

function forEach(iterable, cb) {
  let time = performance.now()
  return new Promise((resolve) => {
    function* gen() {
      for (const el of iterable) {
        cb(el)
        if (performance.now() - time > 60) {
          yield 'chunk'
        }
      }
      return resolve()
    }

    const res = gen()
    const doIter = () => {
      const {value} = res.next()
      if (value) {
        setTimeout(() => {
          time = performance.now()
          doIter()
        }, 50 + (Math.random() * 50))
      }
    }
    doIter()
  })
}


// ## forEach2


// Написать функцию, которая принимает Iterable объект и возвращает Promise, который зарезолвится,
// когда обход будет закончен. Суммарный обход всех таких forEach не должен превышать 200мс за раз.
let time = performance.now()

function forEach2(iterable, cb) {
  return new Promise((resolve, reject) => {
    let iterator = iterable[Symbol.iterator]()
    let counter = 0
    const doIter = () => {
      counter++
      let {value, done} = iterator.next()
      cb(value)
      if (performance.now() - time > 200 || counter === 9000) {
        return setTimeout(() => {
          time = performance.now()
          doIter()
          counter = 0
        }, 150 + (Math.random() * 150))
      }
      if (done) return resolve()
      doIter()
    }
    doIter()
  })
}


const arr = new Array(1e4).fill(1)
forEach2(arr).then(() => {
  console.log('Done!');
});

forEach2(arr).then(() => {
  console.log('Done!');
});

forEach2(arr).then(() => {
  console.log('Done!');
});

forEach2(arr).then(() => {
  console.log('Done!');
});

forEach2(arr).then(() => {
  console.log('Done!');
});


// ## runAsync


// Написать функцию, которая позволяет писать "плоские" асинхронные программы по аналогии с async/await.
// В отличии от нативного await в случае если значение не промис - оно должно резолвиться синхронно.

function runAsync(iter, val) {
  try {
    const {value, done} = iter.next(val)
    if (done) return Promise.resolve(value)
    if (!value.then) return runAsync(iter, value)
    return Promise.resolve(value).then(
      (v) => runAsync(iter, v),
      async (e) => {
        const res = iter.throw(e)
        if (res.done) return res.value
        return runAsync(iter, await res)
      }
    )
  } catch (e) {
    return Promise.reject(e)
  }
}


// ## join

// Написать функцию join, которая принимает некоторое количество Iterable объектов и возращает новый,
// который бы обходил все переданные объекты. Для решения задачи нужно использовать yield*.

function* join(...params) {
  for (const param of params) {
    yield* param
  }
}

let obj1 = new Set([1, 2, 3])
let obj2 = new Set([4, 5, 6])
let obj3 = new Set([7, 8, 9])

Array.from(join(obj1, obj2, obj3));