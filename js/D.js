String.prototype.forIncludes = function () {
    let result = false
    let args = [...arguments]
    for (m of args) {
        if (this.includes(m)) {
            result = true
            break
        }
    }
    return result
}

const log = function () {
    let args = [...arguments]
    args = args.map(ele => {
        let type_ = typeof ele
        if (type_ === 'string' && ele.forIncludes('`', '·', '    ')) {
            return `(${ele}) 类型：${type_}`
        } else {
            return ele
        }
    })
    console.log(...args)
}