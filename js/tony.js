const log = function () {
    console.log.apply(console, arguments)
}

const bindEventBig = function () {
    let imagesDiv = document.querySelector('#id-div-images')
    imagesDiv.addEventListener('click', (event) => {
        let target = event.target
        let big = imagesDiv.querySelector('.big')
        if (target.classList.contains('little') && big === null) {
            let src = target.src
            let t = `<img class="big" src="${src}">`
            let p = target.parentElement
            p.insertAdjacentHTML('beforeend', t)
        } else if (target.classList.contains('big')) {
            target.remove()
        } else {
            log('不是图像   ')
        }
    })
}

const _main = function () {
    bindEventBig()
}

_main()