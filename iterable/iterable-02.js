//# Задания на тему Generator API

// ## forEach


// Написать функцию, которая принимает Iterable объект и возвращает Promise, который зарезолвится,
// когда обход будет закончен. Сам обход должен разбиваться на чанки, если выполняется дольше чем 60мс за раз.

function forEach(iterable) {
  return new Promise(resolve => {
    let timer = performance.now()

    function* iterTimeout() {
      for (const el of iterable) {
        if (performance.now() - timer > 60) yield 'chunk'
      }
      return resolve()
    }

    const {next} = iterTimeout()
    const doIter = () => {
      timer = performance.now()
      const {value} = next()
      if (value) setTimeout(doIter, 0)
    }
    doIter()
  })
}

const myIterable = new Set([1, 2, 3])
const arr = new Array(1e4).fill(1)
forEach(arr).then(() => {
  console.log('Done!');
});


// ## forEach2


// Написать функцию, которая принимает Iterable объект и возвращает Promise, который зарезолвится,
// когда обход будет закончен. Суммарный обход всех таких forEach не должен превышать 200мс за раз.

function forEach2(iterable){

}

forEach(myIterable).then(() => {
  console.log('Done!');
});

forEach(myIterable).then(() => {
  console.log('Done!');
});

forEach(myIterable).then(() => {
  console.log('Done!');
});

forEach(myIterable).then(() => {
  console.log('Done!');
});


// ## runAsync

  ```js
// Написать функцию, которая позволяет писать "плоские" асинхронные программы по аналогии с async/await.
// В отличии от нативного await в случае если значение не промис - оно должно резолвиться синхронное.

runAsync(function *() {
  const foo = yield getSome(yield 1);
  // ...
});
```

// ## join

  ```js
// Написать функцию join, которая принимает некоторое количество Iterable объектов и возращает новый,
// который бы обходил все переданные объекты. Для решения задачи нужно использовать yield*.

Array.from(join(obj1, obj2, obj3));
```
