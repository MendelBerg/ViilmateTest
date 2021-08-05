// Initialize the global variables
const queue = [];
const GETTER_TIMEOUT = 2000;
const MS = 1000;

/* 
There are three counters in markup which have an attribute data-counter="number".
The function putCounterText finds the sought-for counter by counter number and puts into it new value (amount of objects). 
*/

const putCounterText = (counterNumber, counterValue) => {
  const counterElem = document.querySelector(`[data-counter="${counterNumber}"]`);
  counterElem.textContent = counterValue;
};

/*
There are three identicators in markup which have an attribute data-name="name".
The function putIdenticatorBackground finds the sought-for identicator by identicator name and changes the background color. If value of isOff - true, it sets the red color, else green.
*/

const putIdenticatorBackground = (identicatorName, isOff) => {
  const identicatorElem = document.querySelector(`.identicator[data-name="${identicatorName}"]`);
  identicatorElem.style.backgroundColor = isOff ? 'red' : 'green';
};

/*
Creating a generator by IIFE (Immediately Invoked Function Expression).

The function returns an object which has the following properties:
name - name of object, it is used in cases when we need to set new background color for the identicator 
stop - status of method run working in function timeOutWrapper. Values can be: true, false.
timerId - contains the timer id which it get in function timeOutWrapper.
ms - milliseconds. It is used for setting the second parameter in setTimeout.
run - method, pushes into queue new object with one property - number in range [1,100]. In cases when queue is empty, method calls putIdenticatorBackground to set the red color for identicator. At the end method run generate new random amount for property ms in range [1,10] seconds.
*/

const generator = (() => ({
  name: 'generator',
  stop: true,
  timerId: null,
  ms: (Math.floor(Math.random() * (10 - 1 + 1)) + 1) * MS,

  run() {
    if (!queue.length) putIdenticatorBackground('queue', false);

    queue.push({
      data: Math.floor(Math.random() * (100 - 1 + 1)) + 1,
    });

    this.ms = (Math.floor(Math.random() * (10 - 1 + 1)) + 1) * MS;
  },
}))();

/*
Creating a getter by IIFE (Immediately Invoked Function Expression).

The function returns an object which has the following properties:
name - name of object, it is used in cases when we need to set new background color for the identicator 
stop - status of method run working in function timeOutWrapper. Values can be: true, false.
timerId - contains the timer id which it get in function timeOutWrapper.
ms - milliseconds. It is used for setting the second parameter in setTimeout. Initial value - default milliseconds for getter - 2000 ms.
failed - amount of cases when getter tries to get an object from the empty queue.
counters - object with three properties. It contains value of three counters, which contains amount of gotten objects. The first counter contains amount of objects, which has data property in range [1,30), the second counter in case [30,70), the third - [70,100].

run - method, shifts an object from the queue. 
If after that queue is empty and value of failed property is 0 (the queue has not been empty before) method calls putIdenticatorBackground to set the red color for identicator.
If the method got undefined from the empty queue, method increments the value of ms property on 1000 ms and stop working.
If the method shifted an object from the not empty queue, the method continues working and sets the initial values for ms and failed properties (2000ms using constant variable, 0).
The method gets a number property from gotten object. Using this value in ternary operator for creating variable counterNumber,the variable gets value in range [1,3].
At the end run method calls putCounterText and increment the value of one of counters property.
*/

const getter = (() => ({
  name: 'getter',
  stop: true,
  timerId: null,
  ms: GETTER_TIMEOUT,
  failed: 0,

  counters: {
    1: 0,
    2: 0,
    3: 0,
  },

  run() {
    const object = queue.shift();
    if (!queue.length && !this.failed) putIdenticatorBackground('queue', true);

    if (!object) {
      this.ms = GETTER_TIMEOUT + ++this.failed * MS;
      return;
    }

    if (this.failed) {
      this.failed = 0;
      this.ms = GETTER_TIMEOUT;
    }

    const { data } = object;
    const counterNumber = data < 30 ? 1 : data < 70 ? 2 : 3;
    putCounterText(counterNumber, ++this.counters[counterNumber]);
  },
}))();

/*
resetCount - function. It set the initial value (0) for property "counters" of getter and it calls putCounterText to set these values into markup.
There is used the method Object.keys - creates an array with keys of "counters". The key has the same value with number in data-counter in markup. One key is used to set initial value in "counters" properties and in a tag.
*/

const resetCount = () => {
  Object.keys(getter.counters).forEach(key => {
    getter.counters[key] = 0;
    putCounterText(key, 0);
  });
};

/*
timeOutWrapper - function (recursion). It gets an object (generator or getter).
It uses properties "stop" and "ms" from object.
"ms" is used as the second argument in setTimeout.
In cases when "stop" is true - function stops running.
Else it calls setTimeout and set the setTimeout's id into object's property "timerId".
method "run" is calles in setTimeout's callback and then timeOutWrapper calls itself to repeat this action.
*/

const timeOutWrapper = obj => {
  const { stop, ms } = obj;
  if (stop) return;

  obj.timerId = setTimeout(() => {
    obj.run();
    timeOutWrapper(obj);
  }, ms);
};

/*
toggleRunning - function. It toggles the property "stop" in gotten object.
Then it gets three properties - stop, timerId and name.
It calls putIdenticatorBackground to set new background color for identicator.
If toggled value (stop) is true - function removes the setTimeout using the value of timerId and clearTimeout.
Else (stop is false) toggleRunning calls timeOutWrapper to start working the method "run" of gotten object.
*/

const toggleRunning = obj => {
  obj.stop = !obj.stop;
  const { stop, timerId, name } = obj;
  putIdenticatorBackground(name, stop);

  if (stop) {
    clearTimeout(timerId);
  } else {
    timeOutWrapper(obj);
  }
};

/*
Get button with class name "generator" and add an event for it.
This button toggles value for generator's property "stop".
*/

const generatorBtn = document.querySelector('.generator');
generatorBtn.addEventListener('click', () => toggleRunning(generator));

/*
Get button with class name "getter" and add an event for it.
This button toggles value for getter's property "stop".
*/

const getterBtn = document.querySelector('.getter');
getterBtn.addEventListener('click', () => toggleRunning(getter));

/*
Get button with class name "reset" and add an event for it.
This button resets values for all counters.
*/

const resetBtn = document.querySelector('.reset');
resetBtn.addEventListener('click', resetCount);
