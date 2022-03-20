class Multiplayer extends EventTarget {
    constructor() {
        super()
        this.emit = (e, d) => this.dispatchEvent(new CustomEvent(e, { detail: d}));
        this.ws = new WebSocket("ws://localhost:4685");
        this.id = null;
        this.events = {};
        this.player = {};
        this.actions = {};
        this.players = {};
        this.events_idx = [];
        this.actions_idx = [];
        this.has_received_events = false;
        this.has_received_actions = false;
        this.send = (action, data) => compress({a: this.actions[action], d: data}).then(packet=>this.ws.send(packet));
        
        this.ws.onmessage = _msg => _msg.data.arrayBuffer().then(msg=>decompressJSON(msg).then(_packet=>{
            if(_packet === false) return;
            const packet = Object.assign({
                e: null,
                d: null
            }, _packet);
            const hre = this.has_received_events;
            const hra = this.has_received_actions;
            if(!hre) {
                if(packet.e === 0) {
                    this.events = packet.d.events;
                    this.events_idx = packet.d.events_idx;
                    this.has_received_events = true;
                }
            } else if(!hra) {
                if(packet.e === 1) {
                    this.actions = packet.d.actions;
                    this.actions_idx = packet.d.actions_idx;
                    this.has_received_actions = true;
                }
            }
            if(!hre || !hra) return;
            const event_name = this.events_idx[packet.e];
            console.log(event_name, packet.d);
            switch(event_name) {
                case "action":
                    const action_name = this.actions_idx[packet.d.a];
                    switch(this.actions_idx[packet.d.a]) {
                        case "move":
                            const _pl_id = packet.d.id;
                            this.players[_pl_id].x = packet.d.x
                            this.players[_pl_id].y = packet.d.y
                            break;
                    }
                case "get_players_list":
                    this.players = packet.d
                    break;
                case "get_self":
                    this.player = packet.d.d;
                    this.id = packet.d.id;
                    break;
                case "join":
                    this.players[packet.d.id] = packet.d.d;
                    break;
                case "leave":
                    delete this.players[packet.d];
                    break;
            }
            
        }));
    }
    move(x, y) {
        this.player.x = x;
        this.player.y = y;
        this.send("move", {
            x,
            y
        });
    }
    on(a, b, c) {
        return this.addEventListener(a,e=>b(e.detail),c);
    }
}

const multiplayer = new Multiplayer();
/*multiplayer.on("msg", (packet) => {
    console.log(packet);
})*/