const queue = [];
const GETTER_TIMEOUT = 2000;
const MS = 1000;

const putCounterText = (counterNumber, counterValue) => {
  const counterElem = document.querySelector(`[data-counter="${counterNumber}"]`);
  counterElem.textContent = counterValue;
};

const putIdenticatorBackground = (identicatorName, isOff) => {
  const identicatorElem = document.querySelector(`.identicator[data-name="${identicatorName}"]`);
  identicatorElem.style.backgroundColor = isOff ? 'red' : 'green';
};

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

const resetCount = () => {
  Object.keys(getter.counters).forEach(key => {
    getter.counters[key] = 0;
    putCounterText(key, 0);
  });
};

const timeOutWrapper = obj => {
  const { stop, ms } = obj;
  if (stop) return;

  obj.timerId = setTimeout(() => {
    obj.run();
    timeOutWrapper(obj);
  }, ms);
};

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

const generatorBtn = document.querySelector('.generator');
generatorBtn.addEventListener('click', () => toggleRunning(generator));

const getterBtn = document.querySelector('.getter');
getterBtn.addEventListener('click', () => toggleRunning(getter));

const resetBtn = document.querySelector('.reset');
resetBtn.addEventListener('click', resetCount);
