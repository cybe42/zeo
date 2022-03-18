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

const events = [
    "set_players_list",
    "join",
    "leave",
    "action",
    "chat"
]

let events_idx = {};
for(let jjj=0;jjj<events.length;jjj++) {
    events_idx[events[jjj]] = jjj;
}


const actions = [
    "move"
];

let actions_idx = {};
for(let jjj=0;jjj<actions.length;jjj++) {
    actions_idx[actions[jjj]] = jjj;
}

function broadcast(msg) {
    wss.clients.forEach(client=>client.send(compress(msg)));
}

let players = {}
wss.on("connection", function connection(ws) {
    function broadcast_out(msg) {
        wss.clients.forEach(client=>{
            if(client === ws) return;
            client.send(compress(msg));
        })
    }
    function send(msg) { ws.send(compress(msg)); }
    let id = nanoid();
    players[id] = {
        x: 0,
        y: 0,
        z: 0,
        name: "Unknown"+Math.floor(Math.random()*10000000)
    };
    send({
        e: events["set_players_list"],
        d: players
    });
    broadcast_out({
        e: events["join"],
        d: players[id]
    });
    ws.on("message", function incoming(message) {
        let tryParse = tryparse(message);
        if(tryParse === false) return;
        const packet = Object.assign({
            a: actions["move"],
            x: 0,
            y: 0,
            z: 0
        },tryParse);
        players[id].x = packet.x;
        players[id].y = packet.y;
        players[id].z = packet.z;
        const action = actions[packet.a];
        console.log("Player "+players[id].name+" action: "+action === undefined ? "unknown action" : action);
        const out_packet = {
            e: events["action"],
            d: {
                x: packet.x,
                y: packet.y,
                z: packet.z
            }
        };

        broadcast_out(out_packet);
    });
    
    ws.on("close", ()=>{
        broadcast_out({
            e: events["leave"],
            d: id
        });
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