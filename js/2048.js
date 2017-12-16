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
    exclude: [],
    enlargeCount: 0,
    type: '',
    transCount: 0,
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

var isEqual = function (lines) {
    let result = false
    let len = lines.length
    if (len > 2) {
        if (lines[0] === lines[1] == lines[2]) {
            result.special = 1
        }
    } else if (lines[0] === lines[1] && len > 1) {
        result = true
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
    result = isEqual(newLine)
    return result
}

var calculateSteps = function (index, enlarge, lines) {
    let count = 0
    let len = lines.length
    if (enlarge) {
        count++
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
        isEnlarge: enlarge,
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
            let key = lineNumbers[i].getAttribute('id')
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
    let result = {
        vertical: 0, // 竖直
        horizontal: 0, // 水平
    }

    let startV = startId.split('-')[1]
    let startH = startId.split('-')[2]

    let endV = endId.split('-')[1]
    let endH = endId.split('-')[2]

    result.vertical = endV - startV
    result.horizontal = endH - startH
    return result
}

var transformClass = function (startId, endId) {
    let coo = coordinate(startId, endId)
    let vertical = coo.vertical
    let horizontal = coo.horizontal
    let result = ''

    if (vertical !== 0 && horizontal !== 0) {
        log('不能飞啊？代码出错了     ', startId, endId)
    } else if (horizontal >= 0 && vertical == 0) {
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
    targetDict.transCount = 0
    targetDict.exclude = []
    log('不删除的元素     ', exclude)
}

var enlargeEnd = function (item, len, cells) {
    let count = 0
    log('为什么不动？     ', item)
    item.addEventListener('transitionend', function (event) {
        if (count > 0) {
            return
        } else {
            count++
            targetDict.enlargeCount = targetDict.enlargeCount + 1
            item.classList.remove('enlarge')
            if (targetDict.enlargeCount === len) {
                targetDict.enlargeCount = 0
            }
        }
    })
}

var cleanNumber = function (id) {
    let item = document.querySelector(`#${id}`)
    let parent = item.parentElement
    let text = item.textContent

    item.remove()
    let t = `<number id="${id}">${text}</number>`
    parent.insertAdjacentHTML('beforeend', t)
}

var enlargeTransform = function (dictList, cells) {
    let enlargeList = dictList.filter((function (d) {
        return d.isEnlarge === true
    }))
    let len = enlargeList.length
    for (let i = 0; i < len; i++) {
        let id = enlargeList[i].end
        cleanNumber(id)
        let item = document.querySelector(`#${id}`)
        let text = item.textContent * 2

        setNumber(item, text)
        enlargeEnd(item, len, cells)
        item.classList.add('enlarge')
    }
}

var repeatKeyDown = function () {
    let type = targetDict.type
    if (type === 'right') {
        right()
    } else if (type === 'left') {
        left()
    } else if (type === 'top') {
        topMove()
    } else if (type === 'down') {
        down()
    }
}

var moveCallBack = function (startItem, endItem, cells, dictList) {
    let targetText = cellDict(startItem, cells).text
    setNumber(endItem, targetText)
    targetDict.count = targetDict.count + 1
    if (targetDict.count === dictList.length) {
        CleaningElements(cells)
        enlargeTransform(dictList, cells)
    }
}

var transformEnd = function (startItem, endItem, cells, dictList) {
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
        if (targetDict.transCount !== 0 || targetDict.enlargeCount !== 0) {
            log('上一步还没完结        ', targetDict)
            return
        }
        const e = event
        targetDict.transCount = targetDict.transCount + 1
        if (e.keyCode === 39) {
            log('right      ')
            targetDict.type = 'right'
            right()
        } else if (e.keyCode === 37) {
            log('left      ')
            targetDict.type = 'left'
            left()
        } else if (e.keyCode === 38) {
            log('top      ')
            targetDict.type = 'top'
            topMove()
        } else if (e.keyCode === 40) {
            log('down      ')
            targetDict.type = 'down'
            down()
        } else {
            log('按了鬼畜键？     ', e.keyCode)
            targetDict.transCount = targetDict.transCount - 1
        }
    })
}

const _main = function () {
    keyboardDown()

}

_main()