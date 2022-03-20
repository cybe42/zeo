class Client extends EventTarget {
    constructor() {
        super()
        this.emit = (e, d) => this.dispatchEvent(new CustomEvent(e, { detail: d}));
        this.ws = new WebSocket("ws://localhost:4685");
        this.players = {};
        this.player = {};
        
        this.ws.onmessage = _msg => _msg.data.arrayBuffer().then(msg=>decompressJSON(msg).then(packet=>{
            if(packet === false) return;
            this.emit("msg", packet)
        }));
    }
    on(a, b, c) {
        return this.addEventListener(a,e=>b(e.detail),c);
    }
}

const instance = new Client();
instance.on("msg", (packet) => {
    console.log(packet);
})