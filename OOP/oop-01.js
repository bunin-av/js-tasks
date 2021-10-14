// # Задания на тему объектно-ориентированного программирования в JS

// ## string.capitalize


// Необходимо добавить все строкам в JavaScript метод capitalize, который делает первую букву в строке заглавной

String.prototype.capitalize = function () {
  const [first, ...rest] = this
  return first.toUpperCase() + rest.join('')
}

String.prototype.capitalize = function () {
  return this[0].toUpperCase() + this.slice(1)
}

"foo".capitalize() // Foo


// #
// # array.filterMap


// Необходимо добавить все массивам в JavaScript метод filterMap, который принимает 2 функции: фильтр и map

Array.prototype.filterMap = function (filterCb, mapCb) {
  return (this.filter(filterCb)).map(mapCb)
}

Array.prototype.filterMap = function (filterCb, mapCb) {
  const arr = []
  for (const el of this) {
    if (filterCb(el)) arr.push(mapCb(el))
  }
  return arr
}

  [1, 2, 3, 4].filterMap((el) => el > 2, (el) => el ** 2);
// [9, 16]

// #
// # Кастомный  toString


// Необходимо сделать конкретному массиву метод toString, который возвращает первый элемент .. последний.


function addToString(arr) {
  arr.toString = function () {
    if (arr.length > 1) {
      return `${arr[0]}..${arr[arr.length - 1]}`
    } else if (arr.length === 1) {
      return `${arr[0]}`
    }
    return ``
  }
  return arr
}

addToString([1, 2, 3, 4]).toString()

// 1..4
addToString([1, 2, 3, 4]).toString()

// 1
addToString([1]).toString()

//
addToString([]).toString()


// #
// # User


// Необходимо создать функцию-конструктор, которая создает пользователя с заданным именем (имя и фамилия) и возрастом.
// А также, необходимо определить функции, sayName (возвращает полное имя) и has18 (true, если есть 18)

function User(firstName, lastName, age) {
  this.firstName = firstName
  this.lastName = lastName
  this.age = age
}

User.prototype.has18 = function () {
  return this.age >= 18
}

User.prototype.sayName = function () {
  return `${this.firstName} ${this.lastName}`
}

class User1 {
  constructor(firstName, lastName, age) {
    this.firstName = firstName
    this.lastName = lastName
    this.age = age
  }

  has18() {
    return this.age >= 18
  }

  sayName() {
    return `${this.firstName} ${this.lastName}`
  }
}

const user = new User('Andrey', 'Kobets', 32);

user.has18() // true

user.sayName() // 'Andrey Kobets'


// #
// # User #2


// Необходимо создать функцию-конструктор, которая создает пользователя с заданным именем (имя и фамилия) и возрастом.
// А также, необходимо определить функции, sayName (возвращает полное имя) и has18 (true, если есть 18)

function User2({fname, lname, age}) {
  this.fname = fname
  this.lname = lname
  this.age = age
}

User2.prototype.has18 = function () {
  return this.age >= 18
}

User2.prototype.sayName = function () {
  return `${this.fname} ${this.lname}`
}

const user = new User2({
  fname: 'Andrey',
  lname: 'Kobets',
  age: 32
});

user.has18() // true

user.sayName() // 'Andrey Kobets'


// #
// # Object.create


// Необходимо написать аналог Object.create с использованием __proto__

function objectCreate(obj, propertiesObj) {
  const res = {}
  res.__proto__ = obj
  return Object.defineProperties(res, propertiesObj || {})
}

objectCreate({a: 1})


// #
// # Object.create #2


// Необходимо написать аналог Object.create с использованием Object.setPrototypeOf

function objectCreate2(obj, propertiesObj) {
  const res = {}
  Object.setPrototypeOf(res, obj)
  return Object.defineProperties(res, propertiesObj || {})
}

objectCreate2({a: 1})


// #
// # Object.create #3

// Необходимо написать аналог Object.create с использованием new function

function objectCreate3(obj, propertiesObj) {
  const res = new function () {
  }
  return Object.defineProperties(res, propertiesObj || {})
}

objectCreate3({a: 1})
