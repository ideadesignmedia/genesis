class MyCustomElement extends HTMLElement {
    constructor() {
      super();
      console.log('Custom countdown/Sign up - Idea Design Media');
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
                border-radius: 50px;
                font-size: 1rem;
                color: white;
                text-shadow: 1px 1px 3px #00000070;
                text-align: center;
                font-weight: 800;
                text-transform: uppercase;
                cursor: default;
            }
            #iSign {
                padding: 5px;
                margin: 0px;
                border-radius: 25px;
                font-size: 1.2rem;
                color: white;
                text-shadow: 2px 2px 3px #000000;
                background: linear-gradient(0deg, #ffb1b1, #004280);
                box-shadow: 1px 2px 3px #ffb1b150;
                letter-spacing: 5px;
                font-weight: 600;
                border: 3px solid #004280;
                cursor: pointer;
                transition: 500ms ease-out;
            }
            #iSign:hover {
                letter-spacing: 11px;
                transition: 300ms ease;
                color: #cbf4ff;
            }
        </style>
        <div id="iContain">
            <div id="iTime"></div>
            <div id="iSign">SIGN UP</div>
        </div>
        `;
    }
    connectedCallback() {
        this.shadowRoot.querySelector('#iSign').addEventListener('click', function(e){
            if (e.target.id === 'iSign') {
                e.target.innerHTML = 'Loading...'
                window.location = 'https://www.eventbrite.com/e/genesis-tickets-112265210266?aff=Website'
            }
        })
        let difference = new Date("2020-08-09").setHours(19) - new Date();
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
            difference = new Date("2020-08-09").setHours(19) - new Date();
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
  customElements.define('cd-sign', MyCustomElement);
  const el = document.createElement('cd-sign');