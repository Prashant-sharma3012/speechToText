var express = require('express');
var path = require('path')

var app = express();

process.env.PWD = process.cwd();
app.use(express.static(path.join(process.env.PWD, 'client')));

// app.use(express.static('./client'));

app.listen(8000,(err,data)=>{
    if(err) console.log(err);
    console.log("server is up and listening 8000");
})