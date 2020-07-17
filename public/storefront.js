window.products = []
window.cartSelection = []
window.customer = {}
window.intent = ''
loadLiteral = function(elem, data, literal) {
    if (elem == null || data == null || typeof literal !== 'function') {
        throw new Error('CANNOT LOAD LITERAL FROM ' + `${elem}, ${data}, ${literal}. Please ensure that you are entering an element, an array of data and a template literal generator`)
    } else {
        data.forEach(item => {
            elem.innerHTML = elem.innerHTML + literal(item)
        })
    }
}
requestProducts = function(){
    return new Promise((res, rej) => {
        getData = function(page, cb) {
            var thereq = new XMLHttpRequest();
            thereq.open("GET", '/products', true);
            thereq.send();
            thereq.onreadystatechange = function(){
                if (this.readyState == 4) {
                    NewServerData = JSON.parse(thereq.responseText);
                    console.log(`NEW SERVER DATA = ${JSON.stringify(NewServerData)}`)
                    if (typeof cb === 'function') {
                        cb(NewServerData);
                    }
                }
            }
        }
        let cb = function(data) {
            if (data.error !== true) {
                res(data)
            } else {
                res(null)
            }
        }
        getData('/products', cb);
    })
}
productTemp = function(product){
    return `<div id="${product._id}" class="pHold">
    <div class="pName">${product.name}</div>
    <div class="pImage"><img style="max-width: 100%;" src="${product.image}"></div>
    <div class="pDescript">${product.description} <div style="color: #c49045">ONLY ${product.quantity} LEFT! <mini-time date="08-07-2020" was="${product.price + 10}" now="${product.price}"></mini-time></div></div>
    <quant-counter></quant-counter>
    <size-selector></size-selector>
    <div class="pAdd">ADD TO CART ($${product.price})</div>
    </div>`
}
quants = function(array){
    let that = ''
    for(i = 0; i < array.length; i++) {
        that = that + `${array[i].size}(${array[i].number})`
    }
    return that
}
totquants = function(array){
    let that = 0
    for (i = 0; i < array.length; i++) {
        that = that + parseInt(array[i].number)
    }
    return that
}
cartItem = function(item){
    for (i = 0; i < products.length; i++) {
        if (products[i]._id === item.product ) {
            return `<div id="${item.product}" class="CI">
            <div class="cName">${products[i].name}</div>
            <div class="cQuant">${quants(item.quantity)}</div>
            <div class="cRemove">REMOVE</div>
            </div>`
        }
    }

}
loadCart = function(){
    let cart = document.querySelector('cart-div').shadowRoot.querySelector('#cart')
    cart.innerHTML = ''
    loadLiteral(cart, cartSelection, cartItem);
    loadClicks(Array.from(cart.children));
    document.querySelector('cart-div').shadowRoot.querySelector('#purchase').innerHTML = `PURCHASE($${cartPrice()})`
    let checkout = document.querySelector('checkout-div').shadowRoot
    checkout.querySelector('#gotoorder').innerHTML = `CLICK HERE TO CONFIRM YOUR TOTAL: $${cartPrice()}`
    let coh = checkout.querySelector('#COH')
    coh.innerHTML = ''
    loadLiteral(coh, cartSelection, checkoutItem)
    loadClicks(Array.from(coh.children));
}
loadClicks = function(array) {
    array.forEach(item => {
        console.log(item)
        item.addEventListener('click', function(e){
            if (e.target.className === 'cRemove') {
                console.log('clicked')
                removeFromCart(e.target.parentElement.id);
                loadCart()
            }
        })
    })
}
checkoutItem = function(item){
    for (i = 0; i < products.length; i++) {
        if (products[i]._id === item.product) {
            let boot = products[i].price
            let me = totquants(item.quantity)
            return `<div id="${item.product}" class="COi">
            <img style="max-width: 25%;" src="${products[i].image}">
            <div class="coName">${products[i].name}</div>
            <div class="coPrice">$${me*boot}</div>
            <div class="cRemove">REMOVE</div>
            </div>`
        }
    }
}
loadCheckout = function(){
    loadLiteral(document.querySelector('#COH'), cartSelection, checkoutItem)
    loadClicks(document.querySelectorAll('.COi'))
}

cartTotal = function(){
    if (cartSelection == null) {
        return 0
    } else {
        return cartSelection.length
    }
}
cartPrice = function(){
    if (cartTotal() < 1) {
        return 0
    } else {
        let total = 0
        cartSelection.forEach(item => {
            let that = products.filter(prod => {
                if (JSON.stringify(prod._id) === JSON.stringify(item.product)) {
                    return prod
                }
            })
            if (that.length >= 1) {
                let twil = 0
                for (i = 0; i < item.quantity.length; i++) {
                    twil = twil + parseInt(item.quantity[i].number)
                }
                total = total + (that[0].price * twil)
            }
        })
        return total
    }
}
clearCart = function(){
    let cart = document.querySelector('cart-div').shadowRoot.querySelector('#cart')
    cart.innerHTML = ''
    let checkout = document.querySelector('checkout-div').shadowRoot.querySelector('#COH')
    checkout.innerHTML = ''
    document.querySelector('nav-bar').shadowRoot.querySelector('#cartN').innerHTML = `VIEW CART(${cartTotal()})`
}
addToCart = function(product, quantity, size) {
    let igloo = cartTotal();
    if (igloo >= 1) {
        let checkOpts = function(){
            console.log('check opts')
            return new Promise((res, rej) => {
                for (i = 0; i < cartSelection.length; i++) {
                    let that
                    let bait = cartSelection[i].quantity.filter((it, index) => {
                        if (it.size == size) {
                            that = index
                            return it
                        }
                    })
                    if (cartSelection[i].product === product && bait.length > 0) {
                        let tim = bait
                        console.log('that = ' + that)
                        console.log('bait = ' + bait)
                        console.log(JSON.stringify(cartSelection[i].quantity) + 'quantity now')
                        cartSelection[i].quantity.splice(that, 1);
                        console.log(JSON.stringify(cartSelection[i].quantity) + 'quantity now')
                        console.log(JSON.stringify(tim))
                        for (a = 0; a < tim.length; a++) {
                            console.log(JSON.stringify(tim[a]) + ' ' + size)
                            if (tim[a].size == size) {
                                tim[a].number = tim[a].number + quantity
                            }
                        }
                        cartSelection[i].quantity.push(tim[0]);
                        console.log(JSON.stringify(cartSelection))
                        sessionStorage.setItem('cart', JSON.stringify(cartSelection))
                        loadCart()
                        return res(true)
                    } else if (cartSelection[i].product === product) {
                        cartSelection[i].quantity.push({size: size, number: quantity})
                        sessionStorage.setItem('cart', JSON.stringify(cartSelection))
                        loadCart()
                        return res(true)
                    } else if (i == cartSelection.length - 1) {
                        return res(false)
                    }
                }
            })
        }
        checkOpts().then(result => {
            if (result !== true) {
                cartSelection.push({product: product, quantity: [{size: size, number: quantity}]});
                sessionStorage.setItem('cart', JSON.stringify(cartSelection))
                loadCart();
                document.querySelector('nav-bar').shadowRoot.querySelector('#cartN').innerHTML = `VIEW CART(${cartTotal()})`
            }
        }).catch(e => {
            console.log(e)
        })
    } else {
        cartSelection.push({product: product, quantity: [{size: size, number: quantity}]});
        sessionStorage.setItem('cart', JSON.stringify(cartSelection))
        loadCart();
        document.querySelector('nav-bar').shadowRoot.querySelector('#cartN').innerHTML = `VIEW CART(${cartTotal()})`
    }
}
removeFromCart = function(product) {
    let ink
    let ice = cartSelection.filter((cube, index) => {
        if (cube.product == product) {
            ink = index
            return cube
        }
    })
    cartSelection.splice(ink, 1);
    sessionStorage.setItem('cart', JSON.stringify(cartSelection)) 
    if (cartTotal() >= 1) {
        loadCart();
    } else {
        clearCart();
    }
}
getIntent = function(){
    return new Promise((res, rej) => {
        data = [
            {customer},
            {cartSelection}
        ]
        var serverreq = new XMLHttpRequest;
        serverreq.onerror = function(e){
            return rej(e)
        }
        serverreq.onreadystatechange = function(){
            if (this.readyState == 4) {
                if (this.status === 200) {
                    NewServerData = JSON.parse(serverreq.responseText);
                    console.log(`NEW SERVER DATA: ${JSON.stringify(NewServerData)}`)
                    return res(NewServerData.client_secret)
                } else {
                    return rej()
                }
            }
        }
        serverreq.open("POST", '/createintents', true);
        //x-www-form-urlencoded
        serverreq.setRequestHeader("Content-type", "application/json");
        console.log(`SENDING: ${JSON.stringify(data)}`)
        serverreq.send(JSON.stringify(data));
    })
}
manageOrder = function() {
    return new Promise((res, rej) => {
        data = {
            customer: customer
        }
        let cb = function(data){
            if (!data.error) {
                res(true);
            } else {
                rej()
            }
        }
        var serverreq = new XMLHttpRequest;
        serverreq.onerror = function(e){
            return rej(e)
        }
        serverreq.onreadystatechange = function(){
        if (this.readyState == 4) {
            NewServerData = JSON.parse(serverreq.responseText);
            console.log(JSON.stringify(NewServerData))
            if (this.status === 200) {
                return res(true)
            } else {
                return rej()
            }
        }
        }
        serverreq.open("POST", '/confirmpayments', true);
        serverreq.setRequestHeader("Content-type", "application/json");
        if (data == null) {
            rej('ERROR PROCESSING DATA')
        } else {
            serverreq.send(JSON.stringify(data));
        }
    })
}
class Navigation extends HTMLElement {
    constructor() {
        super();
        this.shadow = this.attachShadow({mode: "open"})
    }
    connectedCallback() {
        this.shadow.innerHTML = `<style>
            #NAV {
                display: inline-flex;
                align-items: center;
                justify-content: space-around;
                width: 100%;
                max-width: 100%;
            }
            .hidden {
                display: none!important;
            }
            #Checkout {
                color: inherit;
                background: linear-gradient(0deg, #000504, #353535);
            }
            .navbut {
                padding: 10px;
                background: linear-gradient(0deg, black, #5476C9);
                box-shadow: 1px 1px 3px rgba(194,109,175,.5);
                letter-spacing: 2px;
                font-weight: 800;
                font-family: mr-eaves-mod;
                margin: 5px;
                color: white;
                text-shadow: 1px 1px 3px rgba(194,109,175,.75);
                text-transform: uppercase;
                border-radius: 2px;
                transition: 300ms ease;
                cursor: pointer;
            }
            .navbut:hover {
                color: #e7a8d9!important;
                transform: rotate(2deg);
                transition: 400ms ease;
            }
            #bts {
                font-size: 2rem;
                margin-bottom: 10px;
                width: 100%;
                max-width: 100%;
                text-align: center;
                cursor: pointer;
                transition: 300ms ease;
            }
            #btsc {
                font-size: 2rem;
                margin-bottom: 10px;
                width: 100%;
                max-width: 100%;
                text-align: center;
                cursor: pointer;
                transition: 300ms ease;
            }
            #bts:hover {
                transition: 300ms ease;
                transform: scale(1.1,1.1);
            }
            #btsc:hover {
                transition: 300ms ease;
                transform: scale(1.1,1.1);
            }
            #cartN {
                color: inherit;
                background: linear-gradient(0deg, #000504, #e7a8d9);
            }
            #cartN:hover {
                transform: rotate(-2deg);
            }
            #genlogo {
                max-width: 100%;
                display: inline-flex;
                align-items: center;
                justify-content: space-evenly;
            }
        </style>
        <div id="genlogo"><img style="max-width: 25%;" src="/static/content/genlogosize.png" alt="logo"><cd-sign></cd-sign></div>
        <div id="NAV"><div id="backtowebsite" class="navbut">Back to Website</div><div id="cartN" class="navbut">VIEW CART(${cartTotal()})</div><div id="Checkout" class="navbut">CHECK OUT</div></div>
        <div id="bts" class="hidden">BACK TO STORE</div><div id="btsc" class="hidden">BACK TO STORE</div>`
        this.shadow.querySelector('#backtowebsite').addEventListener('click', function(){
            this.innerHTML = 'Loading...',
            setTimeout(()=>{
                this.innerHTML = 'Back to Website'
            }, 550)
            window.location = 'https://genesisconf.com/'
        })
        this.shadow.querySelector('#cartN').addEventListener('click', ()=> {
            document.querySelector('cart-div').classList.remove('hidden');
            document.querySelector('prod-div').className = 'hidden'
            document.querySelector('checkout-div').className = 'hidden'
            this.shadow.querySelector('#NAV').className = 'hidden'
            this.shadow.querySelector('#bts').classList.remove('hidden')
        })
        this.shadow.querySelector('#Checkout').addEventListener('click', ()=> {
            document.querySelector('prod-div').className = 'hidden'
            document.querySelector('cart-div').className = 'hidden'
            document.querySelector('checkout-div').classList.remove('hidden');
            this.shadow.querySelector('#NAV').className = 'hidden'
            this.shadow.querySelector('#bts').classList.remove('hidden')
        })
        this.shadow.querySelector('#bts').addEventListener('click', ()=>{
            document.querySelector('prod-div').classList.remove('hidden');
            let that = document.querySelector('checkout-div').shadowRoot
            that.getElementById('COH').classList.remove('hidden')
            that.getElementById('gotoorder').classList.remove('hidden')
            that.getElementById('COC').className = 'hidden'
            that.getElementById('COA').className = 'hidden'
            document.querySelector('cart-div').className = 'hidden'
            document.querySelector('checkout-div').className = 'hidden'
            this.shadow.querySelector('#NAV').classList.remove('hidden');
            this.shadow.querySelector('#bts').className = 'hidden'
        })
        this.shadow.querySelector('#btsc').addEventListener('click', ()=>{
            document.querySelector('prod-div').classList.remove('hidden');
            document.querySelector('cart-div').className = 'hidden'
            let that = document.querySelector('checkout-div').shadowRoot
            that.getElementById('COH').classList.remove('hidden')
            that.getElementById('gotoorder').classList.remove('hidden')
            that.getElementById('PU').className = 'hidden'
            that.getElementById('choice').classList.remove('hidden');
            document.querySelector('checkout-div').className = 'hidden'
            document.querySelector('str-pay').remove()
            this.shadow.querySelector('#NAV').classList.remove('hidden');
            this.shadow.querySelector('#btsc').className = 'hidden'
        })
    }
}
window.customElements.define('nav-bar', Navigation);
class Product extends HTMLElement {
    constructor() {
        super();
        this.shadow = this.attachShadow({mode:"open"})
    }
    connectedCallback(){
        this.shadow.innerHTML = `<style>
        #pCont {
            width: 100%;
		height: auto;
            min-height: 100%;
            max-width: 100%;
            display: grid;
            grid-template-columns: 1fr;
        }
        #pHead {
            font-size: 2rem;
            font-weight: 800;
            font-family: mr-eaves-mod;
        }
        #PH {
            width: 100%;
            max-width: 100%;
            display: grid;
            grid-template-columns: 1fr;
            height: auto;
            overflow-x: hidden;
            background-color: #000504;
		overflow-y: scroll;
        }
        .pHold {
            width: auto;
            max-width: 100%;
            display: inline-flex;
            flex-direction: row;
            justify-content: space-around;
            align-items: center;
            padding: 20px;
        }
        .pName {
            margin-top: 30px;
            width: 100%;
            text-align: center;
            font-size: 3rem;
            font-weight: 800;
            color: #5476C9;
            text-transform: uppercase;
            text-shadow: 1px 0px 5px rgba(226,226,227,.4);
        }
        .pImage {
            width: 50%;
            max-width: 50%;
            overflow; hidden;
            margin: 0px;
        }
        .pDescript {
            text-align: right;
            margin: 5px;
        }
        .pAdd {
            margin: 10px 10px 30px 10px;
            padding: 10px;
            font-size: 1.2rem;
            text-align: center;
            color: white;
            background: linear-gradient(0deg, black, #e7a8d9);
            text-shadow: 1px 1px 3px rgba(194,109,175,.7);
            box-shadow: 1px 1px 5px rgba(194,109,175,.5);
            justify-self: center;
            cursor: pointer;
            transition: 300ms ease;
        }
        .pAdd:hover {
            transform: scale(1.1,1.1);
            transition: 200ms ease;
            background: linear-gradient(0deg, #c49045, #e7a8d9);
        }
        #PH::-webkit-scrollbar {
            display: none;
            }
        #pCont::-webkit-scrollbar {
            display: none;
        }
            
        @media screen and (max-width: 700px) {
            .pHold {
                flex-direction: column!important;
            }
            .pDescript {
                text-align: center;
            }
        }

        </style>
        <div id="pCont">
        <div id="pHead">STORE</div>
        <div id="PH"></div>
        </div>`
        requestProducts().then(result => {
            if (result.error !== true) {
                products = result.products
                this.loadProducts()
            } else {
                products = []
            }
        }).catch((e) => {
            console.log(e)
            products = []
        })
    }
    loadProducts(){
        let ph = this.shadow.querySelector('#PH');
        ph.innerHTML = ''
        products.forEach(product => {
            ph.innerHTML = ph.innerHTML + productTemp(product);
        })
        let prods = Array.from(this.shadow.querySelectorAll('.pAdd'))
        prods.forEach(prod => {
            prod.addEventListener('click', function(e){
                if (e.target.className === 'pAdd') {
                    let myid = e.target.parentNode.id
                    let quant = document.querySelector('prod-div').shadowRoot.getElementById(myid).querySelector('quant-counter').shadowRoot.querySelector('input').value
                    let size = e.target.previousElementSibling.shadowRoot.querySelector('select').value
                    if (quant < 1) {
                        let that = this.innerHTML
                        this.innerHTML = 'AT LEAST ONE PRODUCT PLEASE'
                        document.querySelector('prod-div').shadowRoot.getElementById(myid).querySelector('quant-counter').shadowRoot.querySelector('input').value = 1
                        return setTimeout(()=>{
                            this.innerHTML = that
                        }, 1250)
                    }
                    addToCart(myid, parseInt(quant), size);
                    document.querySelector('prod-div').shadowRoot.getElementById(myid).querySelector('quant-counter').shadowRoot.querySelector('input').value = 1
                    let that = e.target.innerHTML
                    e.target.innerHTML = 'ADDED TO CART'
                    setTimeout(() => {
                        console.log('one second later')
                        this.innerHTML = that
                    }, 1000)
                }
            })
        })
    }
}
window.customElements.define('prod-div', Product);
class Cart extends HTMLElement {
    constructor(){
        super();
        this.shadow = this.attachShadow({mode:"open"})
    }
    connectedCallback(){
        this.shadow.innerHTML = `<style>
            #cart {

            }
            #cartHead {
                font-weight: 800;
                font-size: 2.5rem;
                text-shadow: 2px 2px 5px rgba(0,5,4,.7);
                position: absolute;
                top: 22%;
                left: 2%;
                transform: rotate(-45deg);
                color: white;
                cursor: default;
                transition: 200ms;
            }
            #cartHead:hover {
                color: inherit;
                transition: 1s 200ms;
            }
            #purchase {
                position: fixed;
                bottom: 20px;
                width: 50%;
                text-align: center;
                padding: 20px;
                background: linear-gradient(5deg, #353535, #000504);
                left: 25%;
                box-shadow: 0px -2px 5px rgba(214,126,30,.5);
                text-shadow: 0px -2px 5px rgba(214,126,30,.5);
                transition: 500ms ease-out;
                border-radius: 10px;
                font-size: 2.5rem;
                cursor: pointer;
            }
            #purchase:hover {
                box-shadow: 0px -2px 5px rgba(53,53,53,.75);
                color: rgba(84,118,201,1);
                transform: scale(1.1,1.1);
                transition: 300ms ease-out;
            }
            .CI {
                width: auto;
                padding: 15px;
                margin: 10px;
                display: inline-flex;
                align-items: center;
                justify-content: space-between;
                max-width: 100%;
                background: linear-gradient(5deg, #353535, #000504);
                border-radius: 5px;
                box-shadow: 2px 2px 2px rgba(0,5,4,.8);
                text-shadow: 0px -2px 5px rgba(214,126,30,.5);
            }
            .cName {
                margin-right: 15px;
                font-size: 1.2rem;
                text-align: left;
                cursor: default;
            }
            .cQuant {
                margin: 0px 20px 0px 0px;
                color: rgba(84,118,201,1);
                font-size: 2rem;
                font-family: mr-eaves-mod;
                cursor: default;
            }
            .cRemove {
                background: linear-gradient(5deg, rgba(214,126,30,1), rgba(194,109,175,1));
                padding: 10px;
                border-radius: 5px;
                box-shadow: 1px 1px 3px rgba(214,126,30,.75);
                cursor: pointer;
                transition: 200ms;
            }
            .cRemove:hover {
                transform: scale(1.1,1.1);
            }
            @media screen and (max-width: 600px) {
                #purchase {
                    font-size: 1.8rem;
                }
            }
        </style><div id="cartcont"><div id="cartHead">CART</div><div id="cart"></div><div id="purchase">PURCHASE</div></div>`
        this.shadow.querySelector('#purchase').addEventListener('click', function() {
            if (cartTotal() <= 0) {
                this.innerHTML = 'CART EMPTY!'
                setTimeout(() => {
                    this.innerHTML = 'PURCHASE'
                }, 2000)
            } else {
                document.querySelector('cart-div').className = 'hidden'
                document.querySelector('checkout-div').classList.remove('hidden');
            }
        })
    }
    fillCart(){
        let cart = this.shadow.querySelector('cart')
        window.cartSelection.forEach(item => {
            cart.innerHTML = cart.innerHTML + cartItem(item)
        })
        let these = Array.from(this.shadow.querySelectorAll('.CI'))
        loadClicks(these)
    }
    loadClicks(array) {
        array.forEach(item => {
            item.addEventListener('click', function(e){
                if (e.target.className === 'cRemove') {
                    removeFromCart(e.target.parentElement.id);
                    this.shadow.querySelector('cart').remove(e.target.parentElement.id)
                }
            })
        })
    }
}
window.customElements.define('cart-div', Cart);
class Checkout extends HTMLElement {
    constructor(){
        super();
        this.shadow = this.attachShadow({mode:"open"})
    }
    connectedCallback(){
        this.shadow.innerHTML = `<style>
        .hidden {
            display: none!important;
        }
        #CO {
            width: 100%;
            height: auto;
            display: inline-flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        }
        .COi {
            width: 100%;
            max-width: 100%;
            margin: 20px 0px;
            display: inline-flex;
            align-items: center;
            justify-content: space-around;
            background-color: #E2E2E3;
            color: #000504;
        }
        .cRemove {
            background: linear-gradient(5deg, rgba(214,126,30,1), rgba(194,109,175,1));
            padding: 10px;
            border-radius: 5px;
            color: #E2E2E3;
            box-shadow: 1px 1px 3px rgba(0,5,4,.75);
            cursor: pointer;
            transition: 200ms;
        }
        .cRemove:hover {
            transform: scale(1.1,1.1);
        }
        .coName {
            text-transform: uppercase;
            font-size: 1.2rem;
        }
        .coPrice {
            font-family: mr-eaves-mod;
            font-size: 1.2rem;
        }
        img {
            box-shadow: 1px 1px 3px rgba(0,5,4,.75);
        }
        #gotoorder {
            position: fixed;
            top: 22%;
            left: 10%;
            width: 75%;
            box-shadow: 2px 2px 2px rgba(0,5,4,.8);
            text-shadow: 0px -2px 5px rgba(214,126,30,.5);
            background: linear-gradient(5deg, rgba(0,5,4,1), rgba(84,118,201,1));
            padding: 20px;
            border-radius: 15px;
            color: white;
            cursor: pointer;
            transition: 200ms;
        }
        #gotoorder:hover {
            color: inherit;
            transform: scale(1.1,1.1);
            transition: 300ms ease;
        }
        form {
            width: auto;
            height: auto;
            max-width: 100%;
            display: inline-flex;
            flex-direction: column;
            align-items: center;
            justify-content: space-between;
            background: linear-gradient(5deg, rgba(0,5,4,1), rgba(84,118,201,1));
            box-shadow: 2px 2px 2px rgba(0,5,4,.8);
        }
        .formhead {
            font-size: 2rem;
            text-align: center;
            padding: 10px;
            cursor: default;
        }
        label {
            margin-top: 10px;
        }
        input {
            margin-bottom: 20px;
        }
        #choice {
            width: 100%;
            display: inline-flex;
            flex-direction: row;
            align-items: center;
            justify-content: center;
            background: linear-gradient(5deg, rgba(0,5,4,1), rgba(84,118,201,1));
            box-shadow: 2px 2px 2px rgba(0,5,4,.8);
        }
        #pickup {
            margin: 20px;
            background: linear-gradient(5deg, rgba(214,126,30,1), rgba(194,109,175,1));
            padding: 10px;
            border-radius: 5px;
            box-shadow: 1px 1px 3px rgba(214,126,30,.75);
            cursor: pointer;
            transition: 300ms ease;
        }
        #ship {
            margin: 20px;
            background: linear-gradient(5deg, rgba(214,126,30,1), rgba(194,109,175,1));
            padding: 10px;
            border-radius: 5px;
            box-shadow: 1px 1px 3px rgba(214,126,30,.75);
            cursor: pointer;
            transition: 300ms ease;
        }
        #ship:hover {
            transform: scale(1.1,1.1);
            transition: 300ms ease;
        }
        #pickup:hover {
            transform: scale(1.1,1.1);
            transition: 300ms ease;
        }
        #backtoinfo {
            font-size: 1.2rem;
            margin-right: 20px;
        }
        .opts {
            display: inline-flex;
            align-items: center;
            justify-content: space-around;
        }
        </style>
        <div id="CO">
            <div id="COH"></div>
            <div id="gotoorder">CONFIRM TOTAL: $${cartPrice()}</div>
            <div id="COC" class="hidden">
                <form id="COCf">
                    <div class="formhead">PLEASE ENTER YOUR INFO</div>
                    <div id="COCfw" class="formwarn"></div>
                    <label for="firstName">First Name</label>
                    <input name="firstName">
                    <label for="lastName">Last Name</label>
                    <input name="lastName">
                    <label for="email">Email</label>
                    <input name="email">
                    <label for="pu">I AGREE TO PICK UP MY ITEM AT LIVING WORD IN MESA.</label>
                    <input type="checkbox" name="pu">
                    <input type="submit" value="NEXT">
                </form>
            </div>
            <load-circle class="hidden"></load-circle>
            <div id="COA" class="hidden">
                <div id="choice"><div id="pickup">PICK UP AT CHURCH</div><div id="ship" class="hidden">DELIVER TO ME</div></div>
                <form id="COAf" class="hidden">
                    <div class="formhead">PLEASE ENTER YOUR ADDRESS</div>
                    <div id="COAfw" class="formwarn"></div>
                    <label for="street">Street Address</label>
                    <input type="text" name="street">
                    <label for="city">City</label>
                    <input type="text" name="city">
                    <label for="State">State(AZ ONLY)</label>
                    <select name="state"><option value="AZ">ARIZONA</option></select>
                    <label for="zipcode">Zipcode</label>
                    <input type="text" name="zipcode">
                    <div class="opts">
                    <div id="backtoinfo">BACK</div>
                    <input type="submit" value="NEXT">
                    </div>
                </form>
                <div id="PU" class="hidden">PICK UP AT THE CHURCH. WE WILL SEND YOU A PROOF OF PURCHASE ONCE YOUR PAYMENT HAS BEEN PROCESSED.</div>
            </div>
            <div id="complete" class="hidden">ORDER COMPLETED REDIRECTING TO LANDING PAGE</div>
        </div>`
        const custform = this.shadow.querySelector('#COCf');
        const adform = this.shadow.querySelector('#COAf');
        const conftotal = this.shadow.querySelector('#gotoorder');
        const choice = this.shadow.querySelector('#choice')
        const bti = this.shadow.querySelector('#backtoinfo')
        bti.addEventListener('click', () => {
            this.shadow.querySelector('#COC').classList.remove('hidden')
            this.shadow.querySelector('#choice').classList.remove('hidden')
            this.shadow.querySelector('#COAf').className = 'hidden'
            this.shadow.querySelector('#COA').className = 'hidden'
        })
        conftotal.addEventListener('click', function(){
            if (cartTotal() > 0) {
                this.className = 'hidden'
                let that = document.querySelector('checkout-div').shadowRoot
                that.getElementById('COH').className = 'hidden'
                that.getElementById('COC').classList.remove('hidden');
            } else {
                this.innerHTML = 'PLEASE SELECT SOME PRODUCTS!'
                setTimeout(() => {
                    this.innerHTML = `<div id="gotoorder">CONFIRM TOTAL: $${cartPrice()}</div>`
                },2000)
            }

        })
        custform.addEventListener('submit', function(e){
            e.preventDefault();
            e.stopPropagation();
            let warn = this.querySelector('#COCfw')
            if (this['pu'].checked && this['firstName'].value && /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(this['email'].value) && this['lastName'].value) {
                customer['firstName'] = this['firstName'].value
                customer['lastName'] = this['lastName'].value
                customer['email'] = this['email'].value
                this.parentElement.className = 'hidden'
                // let that = document.querySelector('checkout-div').shadowRoot
                // that.getElementById('COA').classList.remove('hidden')
                document.querySelector('checkout-div').shadowRoot.querySelector('load-circle').classList.remove('hidden')
                getIntent().then(result => {
                    console.log(result)
                    document.querySelector('checkout-div').shadowRoot.querySelector('load-circle').className = 'hidden'
                    document.querySelector('checkout-div').shadowRoot.getElementById('COC').className = 'hidden'
                    let that = document.querySelector('nav-bar').shadowRoot
                    that.querySelector('#bts').className = 'hidden'
                    that.querySelector('#btsc').classList.remove('hidden');
                    createCard()
                    intent = result
                }).catch(e => {
                    console.log(e)
                })
            } else {
		if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(this['email'].value)) { 
			return warn.innerHTML = 'Invalid Email'
		}
                if (!this['firstName'].value || !this['lastName'].value) {
                    return warn.innerHTML = 'PLEASE ENTER YOUR NAME'
                } else if (!this['email'].value) {
                    warn.innerHTML = 'PLEASE ENTER YOUR EMAIL'
                } else if (!this['pu'].checked) {
                   return warn.innerHTML = 'PLEASE AGREE TO PICK UP AT THE CHURCH'
                }
                warn.innerHTML = 'PLEASE FILL IN ALL FORMS'
                console.log('misfilled form')
            }
        })
        choice.addEventListener('click', (e) => {
            if (e.target.id === 'pickup') {
                this.shadow.getElementById('choice').className = 'hidden'
                this.shadow.getElementById('PU').classList.remove('hidden');
                getIntent().then(result => {
                    console.log(result)
                    this.shadow.getElementById('COA').className = 'hidden'
                    let that = document.querySelector('nav-bar').shadowRoot
                    that.getElementById('bts').className = 'hidden'
                    that.getElementById('btsc').classList.remove('hidden');
                    createCard()
                    intent = result
                }).catch(e => {
                    console.log(e)
                    this.shadow.getElementById('PU').innerHTML = e
                })
            } else if (e.target.id === 'ship') {
                this.shadow.getElementById('choice').className = 'hidden'
                this.shadow.getElementById('COAf').classList.remove('hidden');
            }
        })
        adform.addEventListener('submit', function(e){
            e.preventDefault()
            e.stopPropagation()
            if (this['state'].value !== 'AZ') {
                console.log('state changed on form')
            } else if (!this['zipcode'].value || !this['street'].value || !this['city'].value) {
                console.log('invalid info in form')
            } else if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(this['email'])) {
		console.log('invalid email')
		} else {
                customer['address'] = {
                    street: this['street'].value,
                    city: this['city'].value,
                    state: 'AZ',
                    zipcode: this['zipcode'].value
                }
                getIntent().then(result => {
                    console.log(result)
                    document.querySelector('checkout-div').shadowRoot.getElementById('COA').className = 'hidden'
                    let that = document.querySelector('nav-bar').shadowRoot
                    that.querySelector('#bts').className = 'hidden'
                    that.querySelector('#btsc').classList.remove('hidden');
                    createCard()
                    intent = result
                }).catch(e => {
                    console.log(e)
                })
            }
        })
    }
}
window.customElements.define('checkout-div', Checkout);
window.card = null
createCard = function(){
    let that = document.createElement('str-pay')
    document.querySelector('body').append(that);
}
class sPay extends HTMLElement {
    constructor(){
        super();
        let style = {
            base: {
                color: "#32325d",
              }
        }
        if (!card) {
            card = elements.create("card", { style: style });
        }
    }
    connectedCallback(){
        this.innerHTML = `<style>
        #submit {
            width: 100%;
            margin-top: 10px;
            border-radius: 3px;
            color: white;
            background: linear-gradient(0deg, rgba(0,5,4,1), rgba(53,53,53,1));
            box-shadow: 2px 2px 4px rgba(194,109,175,.5);
            text-shadow: 1px 1px 3px rgba(194,109,175,.75);
            font-size: 1.5rem;
            cursor: pointer;
        }
        #paymentHeader {
            font-size: 1.3rem;
            color: rgba(84,118,201,1);
            text-shadow: 1px 2px 1px rbga(0,0,0,.7);
            cursor: default;
        }
        #card-errors {
            font-size: 1rem;
            color: red;
            margin-top: 5px;
        }
        </style>
        <div id="sPay">
        <div id="paymentHeader">PLEASE ENTER YOUR CARD INFORMATION BELOW</div>
        <form id="payment-form">
          <div id="card-element"></div>
          <div id="card-errors" role="alert"></div>
          <button id="submit">Pay</button>
        </form>
      </div>`

      card.mount(document.querySelector('#card-element'));
      card.addEventListener('change', ({error}) => {
        const displayError = document.getElementById('card-errors');
        if (error) {
          displayError.textContent = error.message;
        } else {
          displayError.textContent = '';
        }
      });
      var form = document.querySelector('#payment-form');
      form.addEventListener('submit', function(ev) {
        ev.preventDefault();
        ev.stopPropagation();
        let warn = this.querySelector('#card-errors')
        stripe.handleCardPayment(intent, card, {
          payment_method_data: {
            billing_details: {
              name: `${customer.firstName} ${customer.lastName}`
            }
          }
        }).then(function(result) {
          if (result.error) {
            warn.innerHTML = result.error.message
            console.log(result.error.message);
          } else {
                if (result.paymentIntent.status === 'succeeded') {
                    console.log('PAYMENT SUCCEESS!')
                    manageOrder().then(complete => {
                        if (complete === true) {
                            cartSelection = []
                            sessionStorage.removeItem('cart')
                            setTimeout(()=> {
                                window.location = 'https://genesisconf.com/'
                            }, 5000)
                            loadCart()
                            document.querySelector('str-pay').className = 'hidden'
                            document.querySelector('checkout-div').shadowRoot.getElementById('complete').classList.remove('hidden')
                            setTimeout(()=> {
                                document.querySelector('checkout-div').shadowRoot.getElementById('complete').innerHTML = `PLEASE CHECK YOUR EMAIL FOR YOUR ORDER CONFIRMATION`
                                setTimeout(()=>{
                                    document.querySelector('checkout-div').shadowRoot.getElementById('complete').innerHTML = `ORDER COMPLETED REDIRECTING TO LANDING PAGE`
                                    setTimeout(()=>{
                                        document.querySelector('checkout-div').shadowRoot.getElementById('complete').innerHTML = `PLEASE CHECK YOUR EMAIL FOR YOUR ORDER CONFIRMATION`
                                    })
                                }, 1000)
                            }, 1000)
                        } else {
                            document.querySelector('checkout-div').shadowRoot.getElementById('complete').innerHTML = `YOUR PAYMENT WAS PROCESSED HOWEVER THERE WAS AN ISSUE UPDATING YOUR ORDER. IF YOU DO NOT RECEIVE AN EMAIL PLEASE CALL US.`
                        }
                    })
                } else {
                    console.log(result)
                }
            }
        }).catch(e => {
            console.log(e);
        })
        });
    }
}
window.customElements.define('str-pay', sPay);
document.addEventListener('DOMContentLoaded', function(){
    cartSelection = JSON.parse(sessionStorage.getItem('cart'));
    console.log('CART SELECTIONSS' + cartSelection)
    setTimeout(()=> {
        if (!cartSelection) {
            console.log('no cart found')
            cartSelection = []
        } else {
            console.log('cart = ' + cartSelection.length);
            loadCart()
            document.querySelector('nav-bar').shadowRoot.getElementById('cartN').innerHTML = `VIEW CART(${cartTotal()})`
        }
    }, 500)
})