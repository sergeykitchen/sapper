'use strict';

var sapper = function () {
  var loose = void 0;
  var win = void 0;
  var noBombCells = void 0;
  var field = void 0;
  var rows = void 0;
  var stopwatch = void 0;
  var timerOn = void 0;
  var timerId = void 0;
  var strTime = void 0;
  var message = void 0;
  var timerAnim = void 0;
  var flags = void 0;

  // функция генерирует таблицу принимает массив клеток
  function fieldGeneator(arr) {
    field = document.createElement('table');

    for (var i = 0; i < arr.length; i++) {
      var row = document.createElement('tr');
      for (var j = 0; j < arr[i].length; j++) {
        var cell = document.createElement('td');
        cell.className = 'cell';

        if (arr[i][j].flag) {
          cell.innerHTML = '⚑';
        }
        if (arr[i][j].isOpen) cell.className = 'isOpen';

        if (!arr[i][j].isOpen) {
          cell.className = 'close';
        } else if (arr[i][j].isBomb) {
          cell.classList.add('bomb');
          if (arr[i][j].check) cell.style.backgroundColor = 'yellow';
        } else if (!arr[i][j].value) {
          cell.innerHTML = '';
        } else {
          cell.innerHTML = arr[i][j].value;
          cell.className = 'isOpen';
          switch (arr[i][j].value) {
            case 1:
              cell.style.color = 'rgb(203, 251, 11)';
              break;
            case 2:
              cell.style.color = 'rgb(27, 174, 237)';
              break;
            case 3:
              cell.style.color = 'rgb(215, 36, 144)';
              break;
            case 4:
              cell.style.color = 'rgb(230, 138, 25)';
              break;
          }
        }

        row.appendChild(cell);
      }

      field.appendChild(row);
    }

    return field;
  };

  // функция обработчик принимает target события и функцию
  function changeField(target, fun) {
    while (target != this) {
      if (target.tagName == 'TD') {
        field.remove();
        field = null;
        fun(target, rows);
        field = fieldGeneator(rows);
        play.container.appendChild(field);
        break;
      }
      target = target.parentNode;
    }
  };

  // функция установки флажка
  function setFlag(cell, arr) {
    var horiz = cell.parentElement.rowIndex;
    var vertic = cell.cellIndex;
    for (var i = 0; i < arr.length; i++) {
      for (var j = 0; j < arr[i].length; j++) {
        if (i == horiz && j == vertic) {
          if (arr[i][j].flag) {
            arr[i][j].flag = false;
            flags++;
          } else {
            arr[i][j].flag = true;
            flags--;
          }
          if (flags <= 0) flags = 0;
        }
      }
    }
  };

  // функция oткрывания ячеек принимает ячейку и массив
  function removeColor(cell, arr) {
    var horiz = cell.parentElement.rowIndex;
    var vertic = cell.cellIndex;
    for (var i = 0; i < arr.length; i++) {
      for (var j = 0; j < arr[i].length; j++) {

        if (i == horiz && j == vertic) {

          if (arr[i][j].isBomb) {
            noBombCells++;
            arr[i][j].check = true;
            arr[i][j].isOpen = true;
            loose = true;
          }

          if (!arr[i][j].value) {
            // если клетка пустая, открыть соседние пустые
            openCells(arr, i, j);
          } else {
            arr[i][j].isOpen = true;

            noBombCells--;
          }
        }
      }
    }
    if (loose) {
      openBombs(rows);
      timeStop();
    }
    if (!noBombCells) {
      win = true;
      timeStop();
    }
  };

  // функция получить номера бомб
  // 1 - количество клеток, 2 - количество бомб
  function getNumBomb(cells) {
    var amount = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 10;

    var arr = [];
    for (var i = 0, n = amount; i < n; i++) {
      var randInt = Math.floor(Math.random() * (cells - 0 + 1)) + 0;
      if (arr.indexOf(randInt) != -1) {
        i--;
        continue;
      }
      arr.push(randInt);
    }
    return arr.sort(function (a, b) {
      return a - b;
    });
  };

  // функция получить массив с расставленными бомбами
  // 1 - номера бомб, 2 - длина массива, 3 - длина подмассива
  function getRowsArray(numBombs) {
    var width = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 10;
    var height = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 10;

    var count = 0;
    var rows = [];
    for (var i = 0, h = height; i < h; i++) {
      var row = [];
      for (var j = 0, w = width; j < w; j++) {
        var cell = {
          row: i,
          cell: j,
          value: '',
          isBomb: false,
          isOpen: false,
          flag: false,
          check: false
        };
        if (numBombs.indexOf(count) != -1) {
          cell.isBomb = true;
        } else cell.value = 0;
        count++;
        row.push(cell);
      }
      rows.push(row);
    }
    noBombCells = width * height - numBombs.length;
    return rows;
  };

  // функция расставить цифры в соседние клетки, принимает массив слеток
  function insertNumBombs(arr) {
    for (var i = 0; i < arr.length; i++) {
      for (var j = 0; j < arr[i].length; j++) {
        if (arr[i][j].isBomb) {
          for (var k = Math.max(0, i - 1); k <= Math.min(i + 1, arr.length - 1); k++) {
            for (var l = Math.max(0, j - 1); l <= Math.min(j + 1, arr[i].length - 1); l++) {
              arr[k][l].value += 1;
            }
          }
        }
      }
    }
  };

  // открытие соседних пустых ячеек, принимает ячейку и массив
  function openCells(arr, i, j) {
    if (arr[i][j].isOpen) return;
    arr[i][j].isOpen = true;
    if (arr[i][j].flag) flags++;
    noBombCells--;
    for (var k = Math.max(0, i - 1); k <= Math.min(i + 1, arr.length - 1); k++) {
      for (var l = Math.max(0, j - 1); l <= Math.min(j + 1, arr[i].length - 1); l++) {
        if (arr[i][j].value) return;
        openCells(arr, k, l);
      }
    }
    return;
  };

  // раскрыть все мины
  function openBombs(arr) {
    for (var i = 0; i < arr.length; i++) {
      for (var j = 0; j < arr[i].length; j++) {
        if (arr[i][j].isBomb) arr[i][j].isOpen = true;
        arr[i][j].flag = false;
      }
    }
  };

  // функция запуска игры
  function letsPlay() {

    // получили номера бомб
    var numBombs = getNumBomb(100);
    //let numBombs = [0, 9];
    flags = numBombs.length;
    // получили массив строк
    rows = getRowsArray(numBombs);
    // вставить числа
    insertNumBombs(rows);
    // генерируем тавлицу
    field = fieldGeneator(rows);
    play.container.appendChild(field);
  };

  // создание секундомера
  // запустить секундомер
  function timeGo() {
    timerOn = true;
    var now = new Date();
    timerId = setInterval(function () {
      var rand = new Date() - now;
      var time = new Date(rand);
      var min = time.getMinutes();
      if (min < 10) min = '0' + min;
      var sec = time.getSeconds();
      if (sec < 10) sec = '0' + sec;
      strTime = '\u0412\u0430\u0448\u0435 \u0432\u0440\u0435\u043C\u044F ' + min + ':' + sec;
      play.timer.innerHTML = strTime;
    }, 1000);
  };

  // остановить секундомер и показать результат
  function timeStop() {
    clearTimeout(timerId);
    timerId = null;
    if (!strTime) {
      strTime = 'Ваше время 00:00';
    }
    play.timer.innerHTML = strTime;
    timerOn = false;
    if (win) showMessage('\u0412\u044B \u0432\u044B\u0438\u0433\u0440\u0430\u043B\u0438! ' + strTime, 'win');

    if (loose) showMessage('\u0424\u0443-\u0443! \u0412\u044B \u043D\u0430\u0441\u0442\u0443\u043F\u0438\u043B\u0438 !!!', 'loose');
  };

  // вывести сообщение
  function showMessage(str, state) {
    message = document.createElement('span');
    message.innerHTML = str;
    message.className = 'message';
    play.container.appendChild(message);
    if (state == 'win') {
      message.style.backgroundColor = 'rgb(62, 232, 12)';
    }
    message.style.top = -message.offsetTop + 'px';
    message.style.left = play.container.clientWidth / 2 - message.clientWidth / 2 + 'px';
    var n = 0;
    timerAnim = setInterval(function () {
      var mesCoords = message.getBoundingClientRect();
      if (mesCoords.top > 150) {
        clearTimeout(timerAnim);
      }
      n += 1;
      message.style.top = n + 'px';
    }, 30);
  };

  return {
    letsPlay: letsPlay,
    timeGo: timeGo,
    changeField: changeField,
    removeColor: removeColor,
    setFlag: setFlag,
    get flags() {
      return flags;
    },
    set flags(val) {
      flags = val;
    },
    get loose() {
      return loose;
    },
    set loose(val) {
      loose = val;
    },
    get win() {
      return win;
    },
    set win(val) {
      win = val;
    },
    get timerAnim() {
      return timerAnim;
    },
    set timerAnim(val) {
      timerAnim = val;
    },
    get field() {
      return field;
    },
    set field(val) {
      field = val;
    },
    get message() {
      return message;
    },
    set message(val) {
      message = val;
    },
    timeStop: timeStop,
    get strTime() {
      return strTime;
    },
    set strTime(val) {
      strTime = val;
    },
    get timerOn() {
      return timerOn;
    },
    set timerOn(val) {
      timerOn = val;
    }
  };
}();
