// 01- ## sleep
// > Необходимо написать функцию возвращающую Promise, который зарезолвится через заданное количество миллисекунд.

function sleep(ms) {
  return new Promise(res => {
    setTimeout(res, ms)
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

// rejectAfterSleep(200, 'boom!').catch((err) => {
//     console.log(err);
// });

// 03- ## timeout

// > Необходимо написать функцию, которая принимает объект Promise и некоторое количество миллисекунд и возвращает новый Promise. Если переданный Promise не успевает зарезолвится до истечения этого времени, то результирующий Promise должен быть зареджекчен с ошибкой new Error('Timeout').

const timeout = (promise, ms) => {
  let isResolved = false
  let data = promise.then(data => {
    isResolved = true
    return data
  })
  return new Promise((res, rej) => {
    setTimeout(() => {
      if (isResolved) {
        return res(data)
      }
      rej('Timeout')
    }, ms)
  })
}


// timeout(sleep(500), 600).then(console.log, console.log);

// 04- ## all
//
// > Необходимо написать функцию, которая идентична Promise.all.

function promiseAll(promisesArray) {
  return new Promise(function (res, rej) {
    promisesArray.reduce((acc, el) => {
      (async function () {
        try {
          acc.push(await el)
          if (acc.length === promisesArray.length) res(acc)
        } catch (e) {
          rej(e)
        }
      })()
      return acc
    }, [])
  })
}

function promiseAll2(promisesArray) {
  return new Promise(function (res, rej) {
    promisesArray.reduce((acc, el) => {
      el
        .then(r => {
          acc.push(r)
          if (acc.length === promisesArray.length) res(acc)
        })
        .catch(rej)
      return acc
    }, [])
  })
}

function sleep2(ms) {
  return new Promise(res => {
    setTimeout(() => res('Yo'), ms)
  })
}

//
// promiseAll2([rejectAfterSleep(1000, 'ERROR'), sleep2(300), sleep2(5000),]).then(console.log).catch(console.log)
//
// promiseAll2([sleep2(2000), sleep2(300), sleep2(5000),]).then(console.log).catch(console.log)

// 05- ## allSettled
//
// > Необходимо написать функцию, которая идентична Promise.allSettled.

function promiseAllSettled(promisesArray) {
  return new Promise(function (res) {
    promisesArray.reduce((acc, el) => {
      (async function () {
        try {
          acc.push(await el)
        } catch (e) {
          acc.push(e)
        } finally {
          if (acc.length === promisesArray.length) res(acc)
        }
      })()
      return acc
    }, [])
  })
}

function promiseAllSettled2(promisesArray) {
  return new Promise(function (res) {
    promisesArray.reduce((acc, el) => {
      el
        .then(r => acc.push(r))
        .catch(e => acc.push(e))
        .then(() => {
          if (acc.length === promisesArray.length) res(acc)
        })
      return acc
    }, [])
  })
}


// promiseAllSettled2([rejectAfterSleep(2000, 'ERROR'), sleep2(300), sleep2(5000),]).then(console.log).catch(console.log)
//
// promiseAllSettled2([sleep2(2000), sleep2(300), sleep2(5000),]).then(console.log).catch(console.log)

// 06- ## race
//
// > Необходимо написать функцию, которая идентична Promise.race.

function promiseRace(promiseArray) {
  return new Promise((res, rej) => {
    promiseArray.reduce((acc, el) => {
      (async () => {
        try {
          res(await el)
        } catch (e) {
          rej(e)
        }
      })()
      return acc
    }, [])
  })
}

function promiseRace2(promiseArray) {
  return new Promise((res, rej) => {
    promiseArray.reduce((acc, el) => {
      el
        .then(res)
        .catch(rej)
      return acc
    }, [])
  })
}

function promiseRace3(promiseArray) {
  return new Promise((res, rej) => {
    promiseArray.forEach(el => {
      el
        .then(res)
        .catch(rej)
    })
  })
}


promiseRace3([rejectAfterSleep(1000, 'ERROR'), sleep2(5000), sleep2(5000),]).then(console.log).catch(console.log)

promiseRace3([sleep2(2000), sleep2(3000), sleep2(5000),]).then(console.log).catch(console.log)

// 07- ## once
//
// > Необходимо написать функцию, которая бы добавлял обработчик события на заданный элемент и возвращала Promise. Promise должен зарезолвится при срабатывании события. В качестве значения Promise должен возвращать объект события.

const addListener = (element)=> {
  document.addEventListener()
}
