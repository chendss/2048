const log = function () {
    let args = [...arguments]
    args = args.map(ele => {
        let type_ = typeof ele
        if (type_ === 'string' && !ele.includes('`')) {
            return `(${ele}) 类型：${type_}`
        } else {
            return ele
        }
    })
    console.log(...args)
}

var targetDict = {
    moveCount: 0,
    exclude: [],
    enlargeCount: 0,
    transCount: 0,
}

var cleanTarget = function () {
    targetDict.exclude = []
    targetDict.moveCount = 0
    targetDict.enlargeCount = 0
    targetDict.transCount = 0
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
    let numbers = this.numbers,
        result = []
    for (let y = 0; y < 4; y++) {
        let cell = []
        for (let x = 0; x < 4; x++) {
            let item = numbers[x][y]
            cell.push(item)
        }
        result.push(cell)
    }
    return result
}

NumberArray.prototype.lineReversed = function (numbers) {
    return numbers.map((l) => {
        let nl = Array.from(l)
        return nl.reverse()
    })
}

NumberArray.prototype.init = function () {
    this.numbersInit()
    this.lineFlip = this.lineReversed(this.numbers)
    this.verticalNumbers = this.verticalNumbersInit()
    this.verticalFlip = this.lineReversed(this.verticalNumbers)
}

var listEqual = function (list) {
    let result = true
    for (let i = 0; i < list.length - 1; i++) {
        if (list[i] !== list[i + 1]) {
            result = false
            break
        }
    }
    return result
}

var judgeFour = function (lines, dict) {
    let len = lines.length
    if (listEqual(lines)) {
        // 所有数相等
        dict.equal = true
        dict.special = 1
    } else if (listEqual(lines.slice(0, len - 1))) {
        // 前3个数相等
        dict.special = 1
    } else if (lines[0] === lines[1] && lines[1] !== lines[2]) {
        // 保证前两个数相等,中间两个数不等
        if (lines[2] === lines[3]) {
            // 后两个数相等
            dict.equal = true
            dict.special = 1
        } else {
            dict.equal = true
        }
    } else if (lines[1] === lines[2] || lines[2] === lines[3]) {
        // 只有一队相等的数
        dict.special = 1
    }
    return dict
}

var judgeThree = function (lines, base, dict) {
    let len = lines.length
    if (listEqual(lines)) {
        // 3个数相等
        dict.special = 1
    } else if (lines[0] === lines[1]) {
        // 前俩个数相等
        dict.equal = true
    } else if (lines[1] === lines[2]) {
        dict.special = 1
    }
    return dict
}

var judgeTwo = function (lines, base, dict) {
    if (lines[0] === lines[1]) {
        dict.equal = true
    }
    return dict
}

var isEqual = function (lines, base) {
    let len = lines.length
    let result = {
        special: 0,
        equal: false,
    }
    if (len === 4) {
        result = judgeFour(lines, result)
    } else if (len === 3) {
        result = judgeThree(lines, base, result)
    } else if (len === 2) {
        result = judgeTwo(lines, base, result)
    }
    return result
}

var squeezeToRight = function (index, lineNumbers) {
    let result = []
    for (let i = index; i < lineNumbers.length; i++) {
        let text = lineNumbers[i].textContent
        if (text !== '') {
            result.push(text)
        }
    }
    return result
}

var isEnlarge = function (index, lineNumbers) {
    let newLine = squeezeToRight(index, lineNumbers)
    let result = false
    let base = {}
    if (index === 0) {
        base = lineNumbers[0].textContent
    } else {
        base = lineNumbers[index - 1].textContent
    }
    result = isEqual(newLine, base)
    return result
}

var calculateSteps = function (index, enlargeDict, lines) {
    let count = 0
    let len = lines.length
    if (enlargeDict.equal) {
        count = enlargeDict.special
        count++
    } else {
        count = enlargeDict.special
    }
    for (let i = index + 1; i < len; i++) {
        let nextText = lines[i].textContent
        if (nextText === '') {
            count++
        }
    }
    return count
}

var setDict = function (lines, index, count, enlarge) {
    let startId = lines[index].getAttribute('id')
    let endId = lines[index + count].getAttribute('id')

    let result = {
        end: endId,
        start: startId,
        isEnlarge: enlarge.equal,
    }
    return result
}

var moveDict = function (index, lineNumbers) {
    // 把元素全部推到最右边
    // 从左往右判断当前元素的下一个元素是否相等，相等则合并
    let result = {},
        len = lineNumbers.length,
        text = lineNumbers[index].textContent,
        enlarge = isEnlarge(index, lineNumbers)

    if (text !== '') {
        let count = calculateSteps(index, enlarge, lineNumbers)
        result = setDict(lineNumbers, index, count, enlarge)
    }
    return result
}

var moveDictList = function (list) {
    let dictList = []
    list.forEach(lineNumbers => {
        for (let i = 0; i < lineNumbers.length; i++) {
            let dict = moveDict(i, lineNumbers)
            dictList.push(dict)
        }
    })
    dictList = dictList.filter(((d) => {
        if (Object.keys(d).length > 0) {
            targetDict.exclude.push(d['end'])
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

var setNumber = function (item, text) {
    if (text === '') {
        return
    } else {
        let colorClass = `p${text}`
        numberInit(item)
        item.classList.add(colorClass)
        item.textContent = text
    }
}

var coordinate = function (startId, endId) {
    let result = {}

    let [startV, startH] = [startId.split('-')[1], startId.split('-')[2]]

    let [endV, endH] = [endId.split('-')[1], endId.split('-')[2]]

    result.vertical = endV - startV // 竖直
    result.horizontal = endH - startH // 水平
    return result
}

var transformClass = function (startId, endId) {
    let coo = coordinate(startId, endId)
    let [vertical, horizontal] = [coo.vertical, coo.horizontal]
    let result = ''

    if (horizontal >= 0 && vertical == 0) {
        result = `rightMove-${horizontal}`
    } else if (horizontal <= 0 && vertical == 0) {
        horizontal = -horizontal
        result = `leftMove-${horizontal}`
    } else if (vertical >= 0) {
        result = `downMove-${vertical}`
    } else if (vertical <= 0) {
        vertical = -vertical
        result = `topMove-${vertical}`
    } else {
        // TODO
    }
    return result
}

var randomCallBack = function (n = '2') {
    let list = Array.from(document.querySelectorAll('number'))
    let emptyNumbers = list.filter(function (item) {
        return item.textContent === ''
    })
    let maxIndex = emptyNumbers.length
    if (maxIndex === 0) {
        return
    }
    let r = Math.floor(maxIndex * Math.random())
    let item = emptyNumbers[r]
    setNumber(item, n)
}

var isMove = function (dictList) {
    let steps = dictList.map((d) => {
        return coordinate(d['start'], d['end'])
    })
    let sumSteps = steps.filter(((s) => {
        return s.vertical + s.horizontal === 0
    }))
    return (sumSteps.length === 0)
}

var randomGenerationNumber = function (callBack, dictList) {
    let timeOut = 130
    let isM = isMove(dictList)
    if (true) {
        setTimeout(() => {
            callBack()
            cleanTarget()
        }, timeOut)
    } else {
        setTimeout(() => {
            cleanTarget()
        }, timeOut);
        return
    }
}

var cellDict = function (startItem, cells) {
    let id = startItem.getAttribute('id')
    let x = id.split('-')[1] - 1
    let y = id.split('-')[2] - 1
    return cells[x][y]
}

var cellInit = function (i, cell, oldCells, newCells) {
    let exclude = targetDict.exclude
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

var CleaningElements = function (oldCells) {
    //  获得动画结束后的元素位置
    //  判断旧元素坐标与新元素坐标的或者在排除列表里
    //  如果有差异并且不在排除列表里则初始化此元素
    let list = new NumberArray()
    let newCells = extractedList(list.numbers)
    for (let i = 0; i < oldCells.length; i++) {
        let cell = oldCells[i]
        cellInit(i, cell, oldCells, newCells)
    }
    log('不删除的元素     ', targetDict.exclude)

}

var enlargeCallBack = function (list) {
    let len = list.length
    if (len === 0) {
        return
    }
    let id = list[len - 1]
    let item = document.querySelector(`#${id}`)
    for (let i = 0; i < len; i++) {
        let target = list[i]
        let ele = document.querySelector(`#${target}`)
        ele.classList.remove('enlarge')
    }
}

var enlargeEnd = function (enlargeBack, list) {
    setTimeout(() => {
        enlargeBack(list)
    }, 100);
}

var cleanNumber = function (id) {
    let item = document.querySelector(`#${id}`)
    let parent = item.parentElement
    let text = item.textContent

    item.remove()
    let t = `<number id="${id}">${text}</number>`
    parent.insertAdjacentHTML('beforeend', t)
}

var itemAddEnlarge = function (id) {
    let item = document.querySelector(`#${id}`)
    let text = item.textContent * 2
    // cleanNumber(id)
    numberInit(item)

    setNumber(item, text)
    item.classList.add('enlarge')
}

var enlargeTransform = function (dictList, cells) {
    let enlargeList = dictList.filter((function (d) {
        return d.isEnlarge === true
    }))
    let len = enlargeList.length
    let endIdList = enlargeList.map((e) => {
        return e.end
    })
    for (let i = 0; i < len; i++) {
        let id = enlargeList[i].end
        itemAddEnlarge(id)
    }
    enlargeEnd(enlargeCallBack, endIdList)
}

var moveCallBack = function (startItem, endItem, cells, dictList) {
    let targetText = cellDict(startItem, cells).text
    setNumber(endItem, targetText)
    targetDict.moveCount = targetDict.moveCount + 1
    if (targetDict.moveCount === dictList.length) {
        CleaningElements(cells)
        enlargeTransform(dictList, cells)
    }
}

var moveTransEnd = function (startItem, endItem, cells, dictList) {
    //  给目标元素附上类和值
    //  当所有动画执行结束调用清空函数
    let count = 0
    startItem.addEventListener('transitionend', function (event) {
        if (count > 0) {
            return
        } else {
            count++
            moveCallBack(startItem, endItem, cells, dictList)
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
    let endId = dict['end']
    let startId = dict['start']

    let endItem = document.querySelector(`#${endId}`)
    let startItem = document.querySelector(`#${startId}`)

    let targetText = startItem.textContent
    let className = transformClass(startId, endId)

    startItem.classList.add(className)

    moveTransEnd(startItem, endItem, cells, dictList)
}

var move = function (numbers, cells) {
    let dictList = moveDictList(numbers)
    dictList = dictList.reverse()
    randomGenerationNumber(randomCallBack, dictList)
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

var topMove = function () {
    let list = new NumberArray()
    let numbers = list.verticalFlip
    let cells = extractedList(list.numbers)
    move(numbers, cells)
}

var down = function () {
    let list = new NumberArray()
    let numbers = list.verticalNumbers
    let cells = extractedList(list.numbers)
    move(numbers, cells)
}

var keyboardDown = function () {
    window.addEventListener('keydown', (event) => {
        if (targetDict.transCount) {
            log('上一步还没完结        ', targetDict)
            return
        }
        const e = event
        targetDict.transCount = targetDict.transCount + 1
        if (e.keyCode === 39) {
            right()
        } else if (e.keyCode === 37) {
            left()
        } else if (e.keyCode === 38) {
            topMove()
        } else if (e.keyCode === 40) {
            down()
        } else {
            log('按了鬼畜键？     ', e.keyCode)
            targetDict.transCount = targetDict.transCount - 1
        }
    })
}

var mobileTouch = function () {
    let checkerboard = document.querySelector('checkerboard')
    checkerboard.addEventListener('touchmove', (event) => {
        event.preventDefault()
    })
    util.toucher(checkerboard)
        .on('swipeLeft', function (event) {
            left()
        })
        .on('swipeRight', function () {
            right()
        })
        .on('swipeUp', function () {
            topMove()
        }).on('swipeDown', function () {
            down()
        })
}

var cleanAllNumber = function () {
    let numbers = document.querySelectorAll('number')
    numbers.forEach(element => {
        numberInit(element)
    })
}

var init = function () {
    cleanAllNumber()
    for (let i = 1; i <= 2; i = 2 * i) {
        randomCallBack(i * 2)
    }
}

var again = function () {
    let b = document.querySelector('#id-button-again')
    b.addEventListener('click', init)
}

const _main = function () {
    again()
    keyboardDown()
    mobileTouch()
    init()
}

_main()