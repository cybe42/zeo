require("./server/server");
const express = require("express");
const app = express();

app.get("/", (req, res)=>{
    res.sendFile(__dirname + "/test.html")
});

app.get("/libs/compression_web.js", (req, res)=>{
    res.sendFile(__dirname + "/clientlibs/compression_web.js")
});

app.get("/libs/clientnetlib.js", (req, res)=>{
    res.sendFile(__dirname + "/clientlibs/clientnetlib.js")
});

app.listen(8080);