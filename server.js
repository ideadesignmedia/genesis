// requires http
const http = require('http');
// requires the app file
const app = require('./app');
//port it will run on
const port = process.env.PORT || 3000;
// server is created using the app file
const server = http.createServer(app);
//server listens for data from the port
server.listen(port);
// SERVER HAS NODEMON INSTALLED. Will automatically restart when updates are made.