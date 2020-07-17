class loadCircle extends HTMLElement {
    constructor(){
        super()
        this.attachShadow({mode:'open'})
        this.shadowRoot.innerHTML = `<style>
            #Holder {
                max-width: 100%;
                padding: 10px;
                margin: 0px;
                position: relative;
                z-index: 200;
            }
        </style><div id="Holder"></div>`
    }
    connectedCallback(){
        bodymovin.loadAnimation({
            container: document.querySelector('checkout-div').shadowRoot.querySelector('load-circle').shadowRoot.getElementById('Holder'),
            renderer: 'svg',
            loop: true,
            autoplay: true,
            path: '/static/content/loadcircle.json'
        })
    }
}
customElements.define('load-circle', loadCircle);