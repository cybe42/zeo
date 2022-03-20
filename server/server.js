const { isFloat32Array } = require("util/types");
const WebSocket = require("ws");
const nanoid = require("nanoid").nanoid;
const zlib = require("zlib");

function tryparse(str) {
    let jsn;
    let didparse = true;
    try {
        jsn = JSON.parse(str);
    } catch(err) { didparse = false; }
    return didparse ? jsn : didparse;
}

function compress(_data) {
    let data = _data;
    if(typeof data == 'object') data = JSON.stringify(data);
    if(data.length === 0) return Buffer.from(0x00);
    const data_buf = Buffer.from(data);
    const compressed = zlib.deflateSync(data_buf);
    let new_buffer;
    if(compressed.length + 1 < data_buf.length + 1) {
        new_buffer = Buffer.concat([compressed, Buffer.from([0x01])]);
    } else {
        new_buffer = Buffer.concat([data_buf, Buffer.from([0x00])]);
    }
    return new_buffer;
}


function decompress(buf) {
    if(buf.length === 0) return '';
    const isItCompressed = buf[buf.length - 1];
    let data
    if(isItCompressed === 0x01) {
        data = zlib.inflateSync(buf.slice(0,buf.length-1));       
    } else if(isItCompressed === 0x00) {
        data = buf.slice(0,buf.length-1);
    } else {
        throw Error("Could not find the iscompressed header in the buffer. expected 0x00 or 0x01 but received: \""+isItCompressed+"\"");
        return;
    }
    let tryParse = tryparse(data.toString());
    return tryParse === false ? data : tryParse;
}



// Create an online game server
const wss = new WebSocket.Server({ port: 4685 });

const events_idx = [
    "get_events_list",
    "get_actions_list",
    "get_self",
    "get_players_list",
    "join",
    "leave",
    "action",
    "chat"
]

let events = {};
for(let jjj=0;jjj<events_idx.length;jjj++) {
    events[events_idx[jjj]] = jjj;
}


const actions_idx = [
    "move"
];

let actions = {};
for(let jjj=0;jjj<actions_idx.length;jjj++) {
    actions[actions_idx[jjj]] = jjj;
}

function broadcast(event, data) {
    wss.clients.forEach(client=>client.send(compress({
        e: event,
        d: data
    })));
}
function broadcast_action(action, data) {
    broadcast(events["action"], Object.assign(data, {a: action}));
}

let players = {}
wss.on("connection", function connection(ws) {
    function broadcast_out(event, data) {
        wss.clients.forEach(client=>{
            if(client === ws) return;
            client.send(compress({
                e: event,
                d: data
            }));
        })
    }
    function broadcast_out_action(action, data) {
        broadcast_out(events["action"], Object.assign(data, {a: action}));
    }
    function send(event, data) {
        if(event ===undefined) throw new Error("ae");
        ws.send(compress({
            e: event,
            d: data
        }));
    }
    function send_action(action, data) {
        send(events["action"], Object.assign(data, {a: action}));
    }
    let id = nanoid();
    players[id] = {
        x: 0,
        y: 0,
        name: "Unknown"+Math.floor(Math.random()*10000000)
    };
    send(events["get_events_list"], {
        events,
        events_idx
    });
    send(events["get_actions_list"], {
        actions,
        actions_idx
    });
    send(events["get_self"], {
        id,
        d: players[id]
    })
    let _temp_players = Object.assign({}, players);
    delete _temp_players[id];
    send(events["get_players_list"], _temp_players);
    broadcast_out(events["join"], {
        id,
        d: players[id]
    });
    ws.on("message", function incoming(message) {
        let msg;
        try {
            msg = decompress(message);
        } catch(er) {
            console.log("failed to decompress");
            return;
        }
        if(msg === false) return;
        console.log(msg);
        let packet = Object.assign({
            a: null,
            d: {}
        },msg);
        if(actions_idx[packet.a] == undefined) return;
        switch(actions_idx[packet.a]) {
            case "move":
                packet = Object.assign({
                    a: null,
                    d: Object.assign({
                        x: 0,
                        y: 0
                    }, packet.d)
                }, packet);
                players[id].x = packet.x;
                players[id].y = packet.y;
                const action = actions[packet.a];
                console.log("Player "+players[id].name+" action: "+action === undefined ? "unknown action" : action);
                broadcast_out_action(packet.a, {
                    id,
                    a: packet.a,
                    x: packet.d.x,
                    y: packet.d.y
                })

                break;
        }
        
        /*
        console.log(msg);
        let packet = Object.assign({
            a: actions["move"],
            d: {
                x: 0,
                y: 0
            }
        },msg);
        if(actions_idx[packet.a] == undefined) packet.a = actions["move"];
        players[id].x = packet.x;
        players[id].y = packet.y;
        const action = actions[packet.a];
        console.log("Player "+players[id].name+" action: "+action === undefined ? "unknown action" : action);
        broadcast_out_action(packet.a, {
            id,
            a: packet.a,
            x: packet.d.x,
            y: packet.d.y
        })*/
    });
    
    ws.on("close", ()=>{
        broadcast_out(events["leave"], id);
        delete players[id];
    });
});


// When the server starts
wss.on("listening", function listening() {
    // Log the port the server is listening on
    console.log("The server is listening on port: %d", wss.address().port);
});


// When the server stops
wss.on("close", function close() {
    // Log the port the server is listening on
    console.log("Closed on %d", wss.address().port);
});


// When the server stops
wss.on("error", function error(err) {
    // Log the port the server is listening on
    console.log("Error on %d: %s", wss.address().port, err.message);
});


// When the server stops
wss.on("headers", function headers(headers) {
    // Log the port the server is listening on
    console.log("Headers on %d: %s", wss.address().port, headers);
});