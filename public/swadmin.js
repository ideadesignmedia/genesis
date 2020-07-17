startAdmin = function(){
    console.log('started admin')
    let that = new XMLHttpRequest()
    that.onerror = function(e){
        console.log(e)
    }
    that.onreadystatechange = function(){
        if (this.readyState === 4) {
            let data = JSON.parse(this.responseText)
            if (data.error === false) {
                console.log(`ALL INFO: ${JSON.stringify(data)}`)
                customers = data.customers
                visitors = data.visitors
                orders = data.orders
                products = data.products
                loadOrders()
                addNav()
            } else {
                console.log(this.responseText)
            }
        }
    }
    that.open('get', '/idm/admindata', true)
    that.send()
}
loadLiteral = function(elem, data, literal) {
    if (elem == null || data == null || typeof literal !== 'function') {
        throw new Error('CANNOT LOAD LITERAL FROM ' + `${elem}, ${data}, ${literal}. Please ensure that you are entering an element, an array of data and a template literal generator`)
    } else {
        data.forEach(item => {
            elem.innerHTML = elem.innerHTML + literal(item)
        })
    }
}
oDate = function(date){
    let that = date.split(' GMT')
    return that[0]
}
oItems = function(items){
    let temp = ''
    items.forEach((item, index) => {
        for (i = 0; i < products.length; i++) {
            if (products[i]._id == item.product) {
                temp = ( temp + `<div class="iHold"><div class="itemName">${products[i].name}</div><div class="itemQuantity">${item.quantity}</div></div>`)
            }
        }
    })
    return temp
}
cName = function(id){
    let ice
    customers.forEach(customer => {
        if (customer.email == id) {
            return ice = `${customer.firstName} ${customer.lastName} ${customer.email}`
        }
    })
    return ice
}
neworder = function(order){
    return `<div id="${order._id}" class="noi">
    <div class="orderdate">${oDate(order.orderDate)}</div>
    <div class="customer">${cName(order.customer)}</div>
    <div class="items">${oItems(order.orderItems)}</div>
    <div class="markcomplete">ORDER COMPLETED</div>
    </div>`
}
allorder = function(order){
    if (order.completed === true) {
        return `<div class="aoi" style="background-color: black">
        <div id="details" style="color: lightgreen;">${JSON.stringify(order)}</div>
        </div>`
    } else if (order.paid === true) {
        return `<div class="aoi" style="background-color: lightgrey">
        <div id="details">${JSON.stringify(order)}</div>
        </div>`
    } else {
        return `<div class="aoi">
        <div id="details">${JSON.stringify(order)}</div>
        </div>`
    }
}
totalVisits = function(){
    let that = 0
    for (i = 0; i < visitors.length; i++) {
        that = parseInt(visitors[i].visits) + that
    }
    return that
}
addNav = function(){
    document.getElementById('visitorcount').innerHTML = `TOTAL STORE VISITORS: ${visitors.length}, TOTAL VISITS: ${totalVisits()}`
    document.getElementById('allordersN').addEventListener('click', function(){
        document.getElementById('allorders').classList.remove('hidden')
        document.getElementById('neworders').className = 'hidden'
        document.getElementById('allordersN').className = 'nava'
        document.getElementById('newordersN').className = 'navi'
    })
    document.getElementById('newordersN').addEventListener('click', function(){
        document.getElementById('allorders').className = 'hidden'
        document.getElementById('neworders').classList.remove('hidden')
        document.getElementById('allordersN').className = 'navi'
        document.getElementById('newordersN').className = 'nava'
    })
}
loadOrders = function(){
    const ao = document.getElementById('allorders')
    const no = document.getElementById('neworders')
    let incomplete = orders.filter(ord => {
        if (ord.completed === false && ord.paid === true) {
            return ord
        }
    })
    document.getElementById('newordersN').innerHTML = `NEW ORDERS(${incomplete.length})`
    document.getElementById('allordersN').innerHTML = `ALL ORDERS(${orders.length})`
    loadLiteral(no, incomplete, neworder)
    loadLiteral(ao, orders, allorder)
    no.addEventListener('click', function(e){
        if (e.target.className === 'markcomplete') {
            markComplete(e.target.parentElement.id).then(result => {
                if (result === true) {
                    e.target.parentElement.remove()
                } else {
                    e.target.innerHTML = 'FAILED...'
                    setTimeout(()=>{
                        e.target.innerHTML = 'ORDER COMPLETED'
                    })   
                }
            }).catch(err => {
                e.target.innerHTML = 'FAILED...'
                setTimeout(()=>{
                    e.target.innerHTML = 'ORDER COMPLETED'
                })
                console.log(err)
            })
        }
    })
}
markComplete = function(id){
    return new Promise((res, rej) => {
        let that = new XMLHttpRequest()
        that.onerror = function(e){
            return rej(e)
        }
        that.onreadystatechange = function(){
            if (this.readyState === 4) {
                let data = JSON.parse(this.responseText)
                if (data.error === false) {
                    return res(true)
                } else {
                    return res(false)
                }
            }
        }
        that.open('post', '/idm/markcompleted', true)
        let auth = {
            auth: 'swag!',
            id: id
        }
        that.setRequestHeader('Content-type', 'application/json')
        that.send(JSON.stringify(auth))
    })
}