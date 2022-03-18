const pako = require('pako');

function tryparse(str) {
    let jsn;
    let didparse = true;
    try {
        jsn = JSON.parse(str);
    } catch(err) { didparse = false; }
    return didparse ? jsn : didparse;
}

let _appendBuffer = function(buffer1, buffer2) {
    let tmp = new Uint8Array(buffer1.byteLength + buffer2.byteLength);
    tmp.set(new Uint8Array(buffer1), 0);
    tmp.set(new Uint8Array(buffer2), buffer1.byteLength);
    return tmp.buffer;
};

async function compress(_data) {
    let data = _data;
    if(typeof data == 'object') data = JSON.stringify(data);
    if(data.length === 0) return new Uint8Array([0x00]).buffer;

    const blob = new Blob([data], {type: 'text/plain; charset=utf-8'});

    const data_buf = await blob.arrayBuffer();//new Uint8Array(data).buffer;
    const compressed = pako.deflate(data_buf).buffer;
    let new_buffer;
    if(compressed.length + 1 < data_buf.length + 1) {
        new_buffer = _appendBuffer(compressed, new Uint8Array([0x01]).buffer);
    } else {
        new_buffer = _appendBuffer(data_buf, new Uint8Array([0x00]).buffer);
    }
    return new_buffer;
}


async function decompress(buf) {
    if(buf.length === 0) return '';
    const isItCompressed = new Uint8Array(buf)[buf.byteLength - 1];
    let data
    if(isItCompressed === 0x01) {
        data = pako.inflate(buf.slice(0,buf.byteLength-1)).buffer;
    } else if(isItCompressed === 0x00) {
        data = buf.slice(0,buf.byteLength-1);
    } else {
        throw Error("Could not find the iscompressed header in the buffer. expected 0x00 or 0x01 but received: \""+isItCompressed+"\"");
        return;
    }

    const blob = new Blob([data], {type: 'text/plain; charset=utf-8'});
    data = await blob.text();
    let tryParse = tryparse(data.toString());
    return tryParse === false ? data : tryParse;
}