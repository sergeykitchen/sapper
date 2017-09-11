
const sapper = (function() {
  let loose;
  let win;
  let noBombCells;
  let field;
  let rows;
  let stopwatch;
  let timerOn;
  let timerId;
  let strTime;
  let message;
  let timerAnim;
  let flags;

  // функция генерирует таблицу принимает массив клеток
  function fieldGeneator(arr) {
    field = document.createElement('table');

    for(let i = 0; i < arr.length; i++) {
      let row = document.createElement('tr');
      for(let j = 0; j < arr[i].length; j++) {
        let cell = document.createElement('td');
        cell.className = 'cell';

        if(arr[i][j].flag) {
          cell.innerHTML = '⚑';
        }
        if(arr[i][j].isOpen) cell.className = 'isOpen';

        if(!arr[i][j].isOpen) {
          cell.className = 'close';
        }

        else if(arr[i][j].isBomb) {
          cell.classList.add('bomb');
          if(arr[i][j].check)
            cell.style.backgroundColor = 'yellow';
        }
        else if(!arr[i][j].value) {
          cell.innerHTML = '';
        }

        else {
          cell.innerHTML = arr[i][j].value;
          cell.className = 'isOpen'
          switch (arr[i][j].value) {
            case 1: cell.style.color = 'rgb(203, 251, 11)';
              break;
            case 2: cell.style.color = 'rgb(27, 174, 237)';
              break;
            case 3: cell.style.color = 'rgb(215, 36, 144)';
              break;
            case 4: cell.style.color = 'rgb(230, 138, 25)';
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
    while(target != this) {
      if(target.tagName == 'TD') {
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
    let horiz = cell.parentElement.rowIndex;
    let vertic  = cell.cellIndex;
    for(let i = 0; i < arr.length; i++) {
      for(let j = 0; j < arr[i].length; j++) {
        if(i == horiz && j == vertic) {
          if(arr[i][j].flag) {
            arr[i][j].flag = false;
            flags++;
          }
          else {
            arr[i][j].flag = true;
            flags--;
          }
          if(flags <= 0) flags = 0;
        }
      }
    }
  };

  // функция oткрывания ячеек принимает ячейку и массив
  function removeColor (cell, arr) {
    let horiz = cell.parentElement.rowIndex;
    let vertic  = cell.cellIndex;
    for (var i = 0; i < arr.length; i++) {
      for (var j = 0; j < arr[i].length; j++) {

        if(i == horiz && j == vertic) {


          if(arr[i][j].isBomb) {
            noBombCells++;
            arr[i][j].check = true;
            arr[i][j].isOpen = true;
            loose = true;
          }

          if(!arr[i][j].value) {
            // если клетка пустая, открыть соседние пустые
            openCells(arr, i, j);
          }
          else {
            arr[i][j].isOpen = true;

            noBombCells--;
          }
        }
      }
    }
    if(loose) {
      openBombs(rows);
      timeStop();
    }
    if(!noBombCells) {
      win = true;
      timeStop();
    }
  };

  // функция получить номера бомб
  // 1 - количество клеток, 2 - количество бомб
  function getNumBomb(cells, amount = 10) {
    let arr = [];
    for(let i = 0, n = amount; i < n; i++) {
      let randInt = Math.floor(Math.random() * (cells - 0 + 1)) + 0;
      if(arr.indexOf(randInt) != -1) {
        i--;
        continue;
      }
      arr.push(randInt);
    }
    return arr.sort((a,b) => a - b);
  };

  // функция получить массив с расставленными бомбами
  // 1 - номера бомб, 2 - длина массива, 3 - длина подмассива
  function getRowsArray(numBombs, width = 10, height = 10) {
    let count = 0;
    let rows = [];
    for(let i = 0, h = height; i < h; i++) {
      let row = [];
      for(let j = 0, w = width; j < w; j++) {
        let cell = {
          row: i,
          cell: j,
          value: '',
          isBomb: false,
          isOpen: false,
          flag: false,
          check: false
        }
        if(numBombs.indexOf(count) != -1) {
          cell.isBomb = true;
        }

        else cell.value = 0;
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
    for(let i = 0; i < arr.length; i++) {
      for(let j = 0; j < arr[i].length; j++) {
        if(arr[i][j].isBomb) {
          for(var k = Math.max(0, i - 1); k <= Math.min(i + 1, arr.length -1); k++) {
            for(var l = Math.max(0, j - 1); l <= Math.min(j + 1, arr[i].length -1); l++){
               arr[k][l].value += 1;
            }
          }
        }
      }
    }
  };

   // открытие соседних пустых ячеек, принимает ячейку и массив
  function openCells (arr, i, j) {
    if(arr[i][j].isOpen) return;
    arr[i][j].isOpen = true;
    if(arr[i][j].flag) flags++;
    noBombCells--;
    for(var k = Math.max(0, i - 1); k <= Math.min(i + 1, arr.length -1); k++) {
      for(var l = Math.max(0, j - 1); l <= Math.min(j + 1, arr[i].length -1); l++){
        if(arr[i][j].value) return;
       openCells(arr, k, l);
      }
    }
    return;
  };

  // раскрыть все мины
  function openBombs(arr) {
    for(let i = 0; i < arr.length; i++) {
      for(let j = 0; j < arr[i].length; j++) {
        if(arr[i][j].isBomb)
          arr[i][j].isOpen = true;
          arr[i][j].flag = false;
      }
    }
  };

  // функция запуска игры
  function letsPlay() {

    // получили номера бомб
    let numBombs = getNumBomb(100);
    //let numBombs = [0, 9];
    flags = numBombs.length;
    // получили массив строк
    rows =  getRowsArray(numBombs);
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
    let now = new Date();
    timerId= setInterval(() =>{
      let rand = new Date() - now;
      let time = new Date(rand);
      let min = time.getMinutes();
      if(min < 10) min = '0' + min;
      let sec = time.getSeconds();
      if(sec < 10) sec = '0' + sec;
      strTime = `Ваше время ${min}:${sec}`
      play.timer.innerHTML = strTime;
    }, 1000);
  };

  // остановить секундомер и показать результат
  function timeStop() {
    clearTimeout(timerId);
    timerId = null;
    if(!strTime) {
      strTime = 'Ваше время 00:00';
    }
    play.timer.innerHTML = strTime;
    timerOn = false;
    if(win) showMessage(`Вы выиграли! ${strTime}`, 'win')

    if(loose) showMessage(`Фу-у! Вы наступили !!!`, 'loose')
  };

  // вывести сообщение
  function showMessage(str, state) {
    message = document.createElement('span');
    message.innerHTML = str;
    message.className = 'message';
    play.container.appendChild(message);
    if(state == 'win') {
      message.style.backgroundColor = 'rgb(62, 232, 12)';
    }
    message.style.top = -message.offsetTop + 'px';
    message.style.left = play.container.clientWidth / 2 - message.clientWidth / 2 + 'px';
    let n = 0
    timerAnim = setInterval(() => {
      let mesCoords = message.getBoundingClientRect();
      if(mesCoords.top > 150) {
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
  }
})();
