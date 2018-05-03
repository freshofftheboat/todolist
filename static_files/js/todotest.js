/*
1. 页面中添加输入框和提交按钮增加 todo
2. 载入 todo
3. 显示 todo
4. 每个 todo 有删除按钮
5. 删除按钮可以删除 todo
6. 每个 todo 有编辑按钮
7. 数据更新后，更新页面内容
8. 增加 css
*/

// part1: 库函数
var log = console.log.bind(console)
var e = (selector) => document.querySelector(selector)
var appendHtml = (element, html) => element.insertAdjacentHTML('beforeend', html)

var ajax = function(method, path, data, callback) {
    var r = new XMLHttpRequest()
    r.open(method, path, true)
    r.setRequestHeader('Content-Type', 'application/json')
    r.onreadystatechange = () => {
        if (r.readyState == 4) {
            log('r', r)
            callback(r.response)
        }
    }
    r.send(data)
}

// part2: 业务函数
// 1. 页面中添加输入框和提交按钮增加 todo
var insertInput = () => {
    var container = e('#id-div-todo-container')
    var t = `
        <div>
            <input id="id-input-task">
            <button id="id-button-add" class="todo-add" data-action="todo_add">add</button>
        </div>
    `
    appendHtml(container, t)
}

var insertCss = () => {
    var t = `
        <style>
            .todo-cell {
                outline: 1px solid blue;
            }
        </style>
    `
    var element = document.head
    appendHtml(element, t)
}

var templateTodo = (todo) => {
    var task = todo.task
    var id = todo.id
    var t = `
        <div class="todo-cell" data-id="${id}">
            <button class="todo-delete" data-action="todo_delete">delete</button>
            <button class="todo-edit" data-action="todo_done">完成</button>
            <span class="todo-task" data-action="todo_edit">${task}</span>
        </div>
    `
    return t
}

var insertTodo = (todo) => {
    var container = e('#id-div-todo-container')
    var html = templateTodo(todo)
    appendHtml(container, html)
}

var insertTodos = (todos) => {
    for (var i = 0; i < todos.length; i++) {
        var t = todos[i]
        insertTodo(t)
    }
}

// part3: 与服务器交换数据的函数
class TodoApi {
    constructor() {
        this.baseurl = '/todo'
    }

    get(path, callback) {
        var url = this.baseurl + path
        ajax('GET', url, '', function(r) {
            var t = JSON.parse(r)
            callback(t)
        })
    }

    post(path, data, callback) {
        var url = this.baseurl + path
        data = JSON.stringify(data)
        ajax('POST', url, data, function(r) {
            var t = JSON.parse(r)
            callback(t)
        })
    }

    all(callback) {
        var path = '/all'
        this.get(path, callback)
    }

    delete(todoId, callback) {
        var path = '/delete/' + todoId
        this.get(path, callback)
    }

    add(data, callback) {
        var path = '/add'
        this.post(path, data, callback)
    }

    update(todoId, data, callback) {
        var path = '/update/' + todoId
        this.post(path, data, callback)
    }

    done(todoId, data, callback) {
        var path = '/complete/' + todoId
        this.post(path, data, callback)
    }
}

// part3: 绑定事件的函数
var actionUpdate = (event) => {
    var self = event.target
    log('按了回车')
    // 取消事件的默认行为：enter 键的默认换行
    event.preventDefault()
    self.contentEditable = false
    var todoCell = self.closest('.todo-cell')
    // 拿到 todo_id 并且传给删除函数
    // 用 ajax 发送给服务器
    var todoId = todoCell.dataset.id
    var data = {
        task: self.innerHTML,
    }

    var api = new TodoApi()
    api.update(todoId, data, (todo) => {
        log('更新成功', todo)
    })
}

var actionAdd = () => {
    log('add button click')
    // 获取用户输入的内容
    var input = e('#id-input-task')
    var value = input.value
    var data = {
        task: value,
    }
    var api = new TodoApi()
    api.add(data, (todo) => {
        log('创建 todo 成功', todo)
        // 向页面插入被创建的 todo
        insertTodo(todo)
    })
}

var actionDelete = (event) => {
    var self = event.target
    log('delete button click')
    var todoCell = self.closest('.todo-cell')
    // 拿到要删除的 tudo-id
    var todoId = todoCell.dataset.id
    var api = new TodoApi()
    api.delete(todoId, (todo) => {
        log('删除成功', todo)
        todoCell.remove()
    })
}

var actionEdit = (event) => {
    var self = event.target
    log('edit span click')
    var todoCell = self.closest('.todo-cell')
    var task = todoCell.querySelector('.todo-task')
    task.contentEditable = true
    task.focus()
}

var actionDone = (event) => {
    var self = event.target
    log('done button click')
    var todoCell = self.closest('.todo-cell')
    var todoId = todoCell.dataset.id
    if(todoCell.classList.contains('completed')) {
        var data = {
            done: false,
        }
    } else {
        data = {
            done: true,
        }
    }
    var api = new TodoApi()
    api.done(todoId, data, (todo) => {
        log('任务完成', todo)
        todoCell.classList.toggle('completed')
    })
}

var bindEventDelegates = () => {
    var container = e('#id-div-todo-container')
    // 所有可处理的事件
    // 表驱动法
    var actions = {
        todo_add: actionAdd,
        todo_delete: actionDelete,
        todo_edit: actionEdit,
        todo_done: actionDone,
    }
    container.addEventListener('click', function(event) {
        var self = event.target

        var actionName = self.dataset.action
        var action = actions[actionName]
        if (action != undefined) {
            action(event)
        }
    })
}

var bindEventUpdate = () => {
    // 绑定 Enter 的事件委托
    var container = e('#id-div-todo-container')
    container.addEventListener('keydown', function(event) {
        var self = event.target
        if (self.classList.contains('todo-task')) {
            if (event.key == 'Enter') {
                actionUpdate(event)
            }
        }
    })
}

var bindEvents = () => {
    bindEventDelegates()
    // bindEventAdd()
    // bindEventDelete()
    // bindEventEdit()
    bindEventUpdate()
}

// 2. 载入所有 todo 并插入页面
var loadTodos = () => {
    var api = new TodoApi()
    api.all((todos) => {
        log('载入所有 todos', todos)
        // 向页面插入被创建的 todo
        insertTodos(todos)
    })
}

var __main = () => {
    // 初始化程序, 插入 input 标签和 CSS
    insertInput()
    insertCss()
    // 绑定事件委托
    bindEvents()
    // 载入所有 todos 并在页面中显示
    loadTodos()
}

__main()
