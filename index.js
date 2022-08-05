const express = require('express');
const redis = require('redis');
const axios = require('axios');

const PORT = 5000;
const REDIS_PORT = 6379;

const app = express();
const client = redis.createClient({
    port: REDIS_PORT,
    legacyMode:true
})
client.connect()
// .then(() => {
//     app.get('/repos/:username',getRepos);
// })
app.get('/repos/:username', cache, getRepos);

app.listen(PORT,() => console.log(`server running on port ${PORT}`))

function setResponse(username,repos) {
    return `<h2>${username} has ${repos} Github public repository</h2>`
}

function getRepos(req,res,next) {
    console.log('Fetching data...');
    const {username} = req.params;
    console.log("username:",username);
    axios.get(`https://api.github.com/users/${username}`)
    .then((response) => {
        const repo = response.data.public_repos;
        client.setEx(username,3600,repo)
        res.send(setResponse(username,repo));
    })
    .catch(e => {
        console.log("error:",e);
        res.status(500);
    })
}

function cache(req,res,next) {
    const {username}= req.params;

    client.get(username,(err,data)=>{
        if (err) {
            throw err
        } 
        
        if (data !== null){
            res.send(setResponse(username,data))
        }else{
            next();
        }
    })

}





