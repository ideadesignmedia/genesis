class MiniTime extends HTMLElement {
    constructor() {
        super();
        console.log('Custom countdown - Idea Design Media');
        this.attachShadow({mode:'open'});
        this.shadowRoot.innerHTML = `
        <style>
            #iContain {
                width: 100%;
                max-width: 100%;
                height: auto;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                position: static;
            }
            #iTime {
                padding: 10px;
                border-radius: 3px;
                font-size: 1rem;
                color: white;
                text-shadow: 1px 1px 3px #00000070;
                text-align: center;
                font-weight: 800;
                text-transform: uppercase;
                cursor: default;
            }
            #iPrice {
                font-size: .8rem;
                color: white;
            }
        </style>
        <div id="iContain">
            <div id="iTime"></div> <div id="iPrice">LIMITED TIME OFFER: <div style="text-decoration: line-through">$${this.getAttribute(['was'])}</div><div style="color: #c49045;"> $${this.getAttribute(['now'])}</div>
        </div>
        `;
    }
    connectedCallback() {
        let init
        if (this.hasAttribute(['date'])) {
            init = new Date(this.getAttribute(['date']))
        } else {
            init = new Date("2020-07-30")
        }
        let difference = init - new Date();
        let remaining = 'STARTED!'
        if (difference > 0) {
            let parts = {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60)
            };
            remaining = Object.keys(parts)
            .map(part => {
                if (!parts[part]) return;
                if (part !== 'seconds') {
                    return `${parts[part]} ${part} : `;
                } else {
                    if (parts[part] >= 10 && parts[part] != 60) {
                        return `${parts[part]}`;
                    } else if (parts[part] >= 1) {
                        return `0${parts[part]}`
                    } else {
                        return `00`
                    }
                }
            }).join(" ")
            this.shadowRoot.querySelector('#iTime').innerHTML = remaining;
        }
        setInterval(() => {
            let init
            if (this.hasAttribute(['date'])) {
                init = new Date(this.getAttribute(['date']))
            } else {
                init = new Date('2020/07/30')
            }
            let difference = init - new Date();
            if (difference > 0) {
                let parts = {
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60)
                };
                remaining = Object.keys(parts)
                .map(part => {
                    if (!parts[part]) return `00`;
                    if (part !== 'seconds') {
                        return `${parts[part]} ${part} : `;
                    } else {
                        if (parts[part] >= 10 && parts[part] != 60) {
                            return `${parts[part]}`;
                        } else if (parts[part] >= 1) {
                            return `0${parts[part]}`
                        }
                    }
                }).join(" ")
                this.shadowRoot.querySelector('#iTime').innerHTML = remaining;
            } else {
                this.shadowRoot.querySelector('#iTime').innerHTML = 'STARTED!'
            }
        }, 1000);
    }
}
customElements.define('mini-time', MiniTime);