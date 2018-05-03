// 服务器程序，处理请求，把数据处理卡发给前端
// 给前端的 ajax 提供 api

// express_demo.js 文件
var fs = require('fs')

// 引入 express 并且创建一个 express 实例赋值给 app
var express = require('express')
var bodyParser = require('body-parser')
var app = express()

var todoList = []

// 配置静态文件目录
app.use(express.static('static_files'))

// 让前端发过来的数据自动用 json 解析的套路
app.use(bodyParser.json())

var log = console.log.bind(console)

var sendHtml = (path, response) => {
    var options = {
        encoding: 'utf-8',
    }
    fs.readFile(path, options, (error, data) => {
        // console.log(`读取的 html 文件 ${path} 内容是`, data)
        // 用 response.send 函数返回数据给浏览器
        response.send(data)
    })
}

var sendJSON = (response, data) => {
    var r = JSON.stringify(data, null, 2)
    response.send(r)
}
// 用 get 定义一个给用户访问的网址
// request 是浏览器发送的请求
// response 是要发给浏览器的响应
app.get('/', (request, response) => {
    var path = 'todo.html'
    // var options = {
    //     encoding: 'utf-8',
    // }
    // fs.readFile(path, options, (error, data) => {
    //     log(`读取的 html 文件 ${path} 内容是`, data)
    //     // 用 response.send 函数返回数据给浏览器
    //     log('data type', typeof data)
    //     response.send(data)
    // })
    sendHtml(path, response)
})

app.get('/todo/all', (requrest, response) => {
    // var r = JSON.stringify(todoList, null, 2)
    // response.send(r)
    sendJSON(response, todoList)
})

var todoAdd = (form) => {
    log('form', form)
    // 给新增的 todo 加上 id 属性
    // 在 todoList.push 之前
    // 如果 todoList.length 为 0
    // todo 的 id 为 1
    // 如果 todoList.length 大于 0
    // todo 的 id 为 todoList 中最后一个元素的 id+1
    if (todoList.length == 0) {
        form.id = 1
    } else {
        var lastTodo = todoList[todoList.length - 1]
        form.id = lastTodo.id + 1
    }
    // todo 有一个属性 done，默认为 false，用来标识 todo 有没有完成
    form.done = false
    todoList.push(form)
    return form
}

app.post('/todo/add', (request, response) => {
    var form = request.body
    var todo = todoAdd(form)
    sendJSON(response, todo)
})

var todoDelete = (id) => {
    id = Number(id)
    // 在 todoList 中找到 id 对应的数据, 删除掉
    var index = -1
    for (var i = 0; i < todoList.length; i++) {
        var t = todoList[i]
        if (t.id == id) {
            // 找到了
            index = i
            break
        }
    }
    // 判断 index 来查看是否找到了相应的数据
    if (index > -1) {
        // 找到了, 用 splice 函数删除
        // splice 函数返回的是包含被删除元素的数组
        // 所以要用 [0] 取出数据
        var t = todoList.splice(index, 1)[0]
        return t
    } else {
        // 没找到
        return {}
    }
}

// delete 这个路由函数用了 动态路由 的概念
// 其中 :id 是一个动态的变量
// 它可以匹配如下的 url
// /todo/delete/1
// /todo/delete/2
// /todo/delete/3
// 还可以匹配错误的请求
// /todo/delete/error
app.get('/todo/delete/:id', (request, response) => {
    // 动态路由的变量是通过 request.params.名字 的方式得到的
    // 变量类型永远是 string
    var id = request.params.id
    // log('delete 路由', id, typeof id)
    var todo = todoDelete(id)
    sendJSON(response, todo)
})

var todoComplete = (id, form) => {
    id = Number(id)
    // 在 todoList 中找到 id 对应的数据
    var index = -1
    for (var i = 0; i < todoList.length; i++) {
        var t = todoList[i]
        if (t.id == id) {
            // 找到了
            index = i
            break
        }
    }
    // 判断 index 来查看是否找到了相应的数据
    if (index > -1) {
        // 找到了, 用 splice 函数删除
        // splice 函数返回的是包含被删除元素的数组
        var t = todoList[index].done = form.done
        return t
    } else {
        // 没找到
        return {}
    }
}

app.post('/todo/complete/:id', (request, response) => {
    // 动态路由的变量是通过 request.params.名字 的方式得到的
    // 变量类型永远是 string
    var id = request.params.id
    var form = request.body
    // log('complete 路由', id, typeof id)
    var todo = todoComplete(id, form)
    sendJSON(response, todo)
})

var todoUpdate = (id, form) => {
    id = Number(id)
    // 在 todoList 中找到 id 对应的数据
    var index = -1
    for (var i = 0; i < todoList.length; i++) {
        var t = todoList[i]
        if (t.id == id) {
            // 找到了
            index = i
            break
        }
    }
    // 判断 index 来查看是否找到了相应的数据
    if (index > -1) {
        // 找到了, 用 splice 函数删除
        // splice 函数返回的是包含被删除元素的数组
        var t = todoList[index].task = form.task
        return t
    } else {
        // 没找到
        return {}
    }
}

app.post('/todo/update/:id', (request, response) => {
    // 动态路由的变量是通过 request.params.名字 的方式得到的
    // 变量类型永远是 string
    var id = request.params.id
    var form = request.form
    // log('update 路由', id, typeof id)
    var todo = todoUpdate(id, form)
    sendJSON(response, todo)
})


// listen 函数的第一个参数是我们要监听的端口
// 这个端口是要浏览器输入的
// 默认的端口是 80
// 所以如果你监听 80 端口的话，浏览器就不需要输入端口了
// 但是 1024 以下的端口是系统保留端口，需要管理员权限才能使用
var server = app.listen(8000, (...args) => {
    // log('server', args, args.length)
    var host = server.address().address
    var port = server.address().port

    console.log(`应用实例，访问地址为 http://${host}:${port}`)
})
