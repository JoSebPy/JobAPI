const express = require('express');
const fetch = require('node-fetch')
const fs = require('fs')
const ejs = require('ejs')
const app = express();
const { promisify } = require('util');

readdir = promisify(fs.readdir)
readfile = promisify(fs.readFile)

app.use(express.json({limit: "3kb"}));
app.use(express.urlencoded({ extended : false, limit: "3kb" }));
app.set('view engine', 'ejs')

app.use('/public', express.static(__dirname + '/public'));

const hostname = '127.0.0.1';
const port = 3000;

app.route('/')
    .get(sendHomePage)

        
function sendHomePage(request, response){
    get_available_API()
    .then(list=>{
        return response.render( __dirname + "/API.ejs", {list : list})
    })
    .catch((err)=> console.log(err))
}

function get_available_API(){
    
    return new Promise((resolve, reject)=>{
        readdir(__dirname+"/URLs")
        .then(files => files.map(filename => readfile(`${__dirname}/URLs/${filename}`, `utf8`)))
        .then(file_promises => Promise.all(file_promises))
        .then(info=> info.map(data => JSON.parse(data)))
        .then(data=> resolve(data))
    })
}


app.post('/getGithubJobs', getGithub)
    
function getGithub(request, response){
    let link = "https://jobs.github.com/positions.json?"

    console.log(request.body)

    for(property of Object.keys(request.body)){
        link += `&${property}=${request.body[property]}`
    }

    console.log(link)
    fetch(link)
        .then((res)=>res.json())
        .then(data => {
            console.log("Response sent back")
            response.json(data)
        })
}

app.listen(port, hostname, ()=>{console.log(`Listening on ${hostname}:${port}`)})