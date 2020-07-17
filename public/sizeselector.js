class SizeSelector extends HTMLElement {
    constructor(){
        super();
        this.shadow = this.attachShadow({mode:'open'})
        this.shadow.innerHTML = `<style>
            select option {
                font-size: 1.2rem;
            }
            select {
                font-size: 1.2rem;
                background-color: black;
                color: #c49045;
                cursor: pointer;
            }
        </style>
        <div class="sS">
        <form>
            <select name="size">
                <option value="XS">X-Small</option>
                <option value="S">Small</option>
                <option value="M">Medium</option>
                <option value="L">Large</option>
                <option value="XL">X-Large</option>
            </select>
        </form>
        </div>`
    }
    connectedCallback(){
    }
}
customElements.define('size-selector', SizeSelector);
class QuantitySelector extends HTMLElement {
    constructor(){
        super()
        this.attachShadow({mode:'open'})
        this.shadowRoot.innerHTML = `<style>
            .qbuts {
                display: inline-flex;
                align-items: center;
                justify-content: space-between;
            }
            .qs {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                flex-direction: column;
                padding: 5px;
                max-width: 75%;
            }
            input {
                font-size: 1.2rem;
                color: black;
                width: 50%;
            }
            .qbut {
                padding: 15px;
                margin: 0px 5px;
                background-color: white;
                border-radius: 5px;
                color: black;
                font-weight: 800;
                cursor: pointer;
            }
            #minus {
                background-color: #c26daf;
                color: white
            }
        </style>
        <div class="qs">
        <input name="quantity" value="1">
        <div class="qbuts"><div class="qbut" id="plus">+</div><div class="qbut" id="minus">-</div></div>
        </div>`
    }
    connectedCallback(){
        this.shadowRoot.querySelector('#plus').addEventListener('click', ()=>{
            let that = this.shadowRoot.querySelector('input')
            that.value++
        })
        this.shadowRoot.querySelector('#minus').addEventListener('click', ()=>{
            let that = this.shadowRoot.querySelector('input')
            that.value--
        })
    }
}
customElements.define('quant-counter', QuantitySelector);