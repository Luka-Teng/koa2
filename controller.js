const fs = require('fs')
const router = require('koa-router')()
function addControllers(router, dir) {
    var files = fs.readdirSync(__dirname + '/' + dir)
    var js_files = files.filter((f)=>{
        return f.endsWith('.js')
    })
    for (var f of js_files) {
        console.log(`process controller: ${f}...`)
        let mapping = require(__dirname + '/controllers/' + f)
        addMapping(router, mapping)
    }
}

function addMapping(router, mapping) {
    for (let url in mapping) {
        if (url.startsWith('GET')) {
            let path = url.substring(4)
            router.get(path, mapping[url])
            console.log(`register URL mapping: GET ${path}`)
        } else if (url.startsWith('POST')) {
            let path = url.substring(5)
            router.post(path, mapping[url])
            console.log(`reigister URL mapping: POST ${path}`)
        } else {
            console.log(`invalid URL: ${url}`)
        }
    }
}

module.exports = function (dir) {
    let controllers_dir = dir || 'controllers'
    addControllers(router, controllers_dir)
    return router.routes()
}