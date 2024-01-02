var http = require('http');
//var ip = require("ip");
const {networkInterfaces} = require('os');

const ip = Object.values(require("os").networkInterfaces())
    .flat()
    .filter((item) => !item.internal && item.family === "IPv4")
    .find(Boolean).address;



http.createServer(function(req, res){
    res.writeHead(200, {'Content-Type': 'text/html'});
    //let msg = '<h1>Hello World</h1><p> the ip address is: ' + ip.address();
    // let msg = '<h1>Hello World again</h1><p> the ip address is: ' + ip;
    // let msg = '<h1>Hello World again</h1><p> the ip address is: ' + req.socket.localAddress;
    let aresult = getips();
    let msg = '<h1>Hello World again</h1><p> the ip address is: ' +  JSON.stringify(aresult);
    res.end(msg);
}).listen(3080);

function getips(){
    const nets = networkInterfaces();
    const results = Object.create(null);

    for(const name of Object.keys(nets)){
        for (const net of nets[name]){
            const familyV4Value = typeof net.family ==='string' ? 'IPv4' : 4
            if(net.family === familyV4Value && !net.internal){
                if(!results[name]){
                    results[name] = [];
                }
                results[name].push(net.address);
            }
        }
    }
    return results;
}