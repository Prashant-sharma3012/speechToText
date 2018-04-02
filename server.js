var express = require('express');

var app = express();

app.use(express.static('./client'));

app.listen(8000,(err,data)=>{
    if(err) console.log(err);
    console.log("server is up and listening 8000");
})