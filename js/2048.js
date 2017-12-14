const log = function () {
    let args = [...arguments]
    args.forEach(ele => {
        if (typeof ele === 'string' && !ele.includes('`')) {
            return `(${ele})`
        } else {
            return ele
        }
    })
    console.log(...args)
}

var targetDict = {
    count: 0,
    exclude: []
}

var NumberArray = function () {
    this.numbers = []
    this.lineFlip = []
    this.verticalFlip = []
    this.verticalNumbers = []
    this.init()
}

NumberArray.prototype.numbersInit = function () {
    let X = 4,
        Y = 4
    for (let x = 1; x <= X; x++) {
        let lineNumbers = []
        for (let y = 1; y <= Y; y++) {
            let item = document.querySelector(`#c-${x}-${y}`)
            lineNumbers.push(item)
        }
        this.numbers.push(lineNumbers)
    }
}

NumberArray.prototype.verticalNumbersInit = function () {
    // 将numbers的数据每一列存在一个新的数组
    // 4*4的遍历，同一行的下标是[i][i]
    let numbers = this.numbers
    let result = []
    numbers.forEach(lines => {

    })
}

NumberArray.prototype.lineReversed = function () {
    return this.numbers.map((l) => {
        let nl = Array.from(l)
        return nl.reverse()
    })
}

NumberArray.prototype.init = function () {
    this.numbersInit()
    this.lineFlip = this.lineReversed()
}

var moveDict = function (index, lineNumbers) {
    let result = {}
    let count = 0
    if (lineNumbers[index].textContent !== '') {
        for (let i = index + 1; i < lineNumbers.length; i++) {
            let nextItemText = lineNumbers[i].textContent
            if (nextItemText === '') {
                count++
            }
        }
        let startId = lineNumbers[index].getAttribute('id')
        let endId = lineNumbers[index + count].getAttribute('id')
        if (endId === undefined) {
            log('undefined      ', index, lineNumbers[index], lineNumbers.length)
        }
        result = {
            'start': startId,
            'end': endId,
        }
    } else {}
    return result
}

var moveDictList = function (list) {
    let dictList = []
    list.forEach(lineNumbers => {
        for (let i = 0; i < lineNumbers.length; i++) {
            let key = lineNumbers[i].getAttribute('id')
            let dict = moveDict(i, lineNumbers)
            dictList.push(dict)
        }
    })
    dictList = dictList.filter(((d) => {
        if (Object.keys(d).length > 0) {
            if (d['start'] === d['end']) {
                targetDict.exclude.push(d['start'])
            }
            return true
        } else {
            return false
        }
    }))
    return dictList
}

var numberInit = function (item) {
    item.setAttribute('class', '')
    item.textContent = ''
}

var setNumber = function (item, colorClass, text) {
    if (text === '') {
        return
    } else {
        numberInit(item)
        item.classList.add(colorClass)
        item.textContent = text
    }
}

var transformClass = function (startId, endId) {
    let vertical = 0 // 竖直
    let horizontal = 0 // 水平

    let startV = startId.split('-')[1]
    let startH = startId.split('-')[2]

    let endV = endId.split('-')[1]
    let endH = endId.split('-')[2]

    let result = ''

    vertical = endV - startV
    horizontal = endH - startH
    if (vertical !== 0 && horizontal !== 0) {
        log('不能飞啊？代码出错了     ', startId, endId)
    } else if (horizontal >= 0) {
        result = `rightMove-${horizontal}`
    } else if (horizontal <= 0) {
        horizontal = -horizontal
        result = `leftMove-${horizontal}`
    } else if (vertical >= 0) {
        log('竖直方向还没写        ', startId, endId)
    } else if (vertical <= 0) {
        log('竖直方向还没写        ', startId, endId)
    } else {
        // TODO
    }
    return result
}

var cellDict = function (startItem, cells) {
    let id = startItem.getAttribute('id')
    let x = id.split('-')[1] - 1
    let y = id.split('-')[2] - 1
    return cells[x][y]
}

var CleaningElements = function (oldCells) {
    //  获得动画结束后的元素位置
    //  这个函数有bug，当元素没有动的时候会被清理掉
    let list = new NumberArray()
    let newCells = extractedList(list.numbers)
    let exclude = targetDict.exclude
    for (let i = 0; i < oldCells.length; i++) {
        let cell = oldCells[i]
        for (let j = 0; j < cell.length; j++) {
            let oldItem = oldCells[i][j]
            let newItem = newCells[i][j]
            let id = oldItem.id
            if (oldItem.text === newItem.text && !exclude.includes(id)) {
                let cleanItem = document.querySelector(`#${id}`)
                numberInit(cleanItem)
            } else {
                continue
            }
        }
    }
    targetDict.count = 0
    targetDict.exclude = []
}

var transformEnd = function (startItem, endItem, cells, dictList) {
    //  给目标元素附上类和值
    //  当所有动画执行结束调用清空函数
    let count = 0
    startItem.addEventListener('transitionend', (event) => {
        if (count > 0) {
            return
        } else {
            let targetText = cellDict(startItem, cells).text
            setNumber(endItem, `p${targetText}`, targetText)
            targetDict.count = targetDict.count + 1
            count++
            if (targetDict.count === dictList.length) {
                CleaningElements(cells)
            }
        }
    })
}

var extractedList = function (list) {
    let result = []
    Array.from(list).forEach(cells => {
        let cell = cells.map((l) => {
            let dict = {
                class: l.className,
                text: l.textContent,
                id: l.getAttribute('id'),
            }
            return dict
        })
        result.push(cell)
    })
    return result
}

var transform = function (dict, cells, dictList) {
    //  计算给初始元素附上的动画
    //  动画结束后，调用动画结束函数
    let startId = dict['start']
    let endId = dict['end']

    let startItem = document.querySelector(`#${startId}`)
    let endItem = document.querySelector(`#${endId}`)

    let className = transformClass(startId, endId)
    let targetText = startItem.textContent

    startItem.classList.add(className)
    transformEnd(startItem, endItem, cells, dictList)
}

var move = function (numbers, cells) {
    let dictList = moveDictList(numbers)
    dictList = dictList.reverse()
    for (let i = 0; i < dictList.length; i++) {
        let dict = dictList[i]
        if (dictList.length !== 0) {
            transform(dict, cells, dictList)
        }
    }
}

var left = function () {
    let list = new NumberArray()
    let numbers = list.lineFlip
    let cells = extractedList(list.numbers)
    move(numbers, cells)
}

var right = function () {
    // 获得数字的二维数组
    // 遍历所有元素，找到目标元素id,把元素id和目标元素id存在一个字典里
    // 发生移动元素的动画
    // 动画结束后将目标位置更改为元素的对应的值
    // 目标位置如果和起始元素值相等发生放大效果
    let list = new NumberArray()
    let cells = extractedList(list.numbers)
    move(list.numbers, cells)
}

var keyboardDown = function () {
    window.addEventListener('keydown', (event) => {
        const e = event
        if (e.keyCode === 39) {
            log('right      ')
            right()
        } else if (e.keyCode === 37) {
            log('left      ')
            left()
        } else if (e.keyCode === 38) {
            log('top      ')
            top()
        } else if (e.keyCode === 40) {
            log('down      ')
            down()
        } else {
            log('按了鬼畜键？     ')
        }
    })
}

const _main = function () {
    keyboardDown()

}

_main()