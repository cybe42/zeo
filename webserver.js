require("./server/server");
const express = require("express");
const app = express();

app.get("/", (req, res)=>{
    res.sendFile(__dirname + "/test.html")
});

app.get("/compression_web.js", (req, res)=>{
    res.sendFile(__dirname + "/compression_web.js")
});

app.listen(8080);