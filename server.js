var express = require('express');
var path = require('path')

var app = express();

var port = process.env.PORT || 8000;

app.use(express.static(__dirname + './public'));

app.listen(port,(err,data)=>{
    if(err) console.log(err);
    console.log("server is up and listening 8000");
})