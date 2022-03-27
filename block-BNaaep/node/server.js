const http = require('http');
const url = require('url');
const fs = require('fs');
const querystring = require('querystring');
const path = require('path');

let usersPath = __dirname + `/contacts/`;
let server = http.createServer(handleRequest);

function handleRequest(req, res) {
  let store = '';
  let parsedUrl = url.parse(req.url, true);
  req.on('data', (chunk) => {
    store += chunk;
  });

  req.on('end', () => {
    if (req.method === 'GET' && parsedUrl.pathname === '/') {
      fs.createReadStream('./index.html').pipe(res);
    } else if (req.method === 'GET' && parsedUrl.pathname === '/about') {
      fs.createReadStream('./about.html').pipe(res);
    } else if (req.method === 'GET' && parsedUrl.pathname === '/contact') {
      fs.createReadStream('./contact.html').pipe(res);
    } else if (req.method === 'POST' && parsedUrl.pathname === '/contact') {
      var data = querystring.parse(store);
      let username = data.username;
      fs.open(usersPath + username + '.json', 'wx', (err, fd) => {
        if (err) {
          res.setHeader('Content-Type', 'text/html');
          res.write(
            `<h2 style="text-align:center;color:red;">Username already taken</h2>`
          );
          res.end();
        } else {
          fs.writeFile(fd, JSON.stringify(data), (err) => {
            if (err) {
              res.setHeader('Content-Type', 'text/html');
              res.write(
                `<h2 style="text-align:center;color:red;">Something went wrong</h2>`
              );
              res.end();
            } else {
              fs.close(fd, () => {
                res.setHeader('Content-Type', 'text/html');
                res.write(
                  `<h2 style="text-align:center;color:green;">${username} registered successfully</h2>`
                );
                res.end();
              });
            }
          });
        }
      });
    } else if (req.url.split('.').pop() === 'css') {
      res.setHeader('Content-Type', 'text/css');
      fs.readFile(__dirname + req.url, (err, content) => {
        if (err) return console.log(err);
        res.end(content);
      });
    } else if (
      ['jpeg', 'jpg', 'png', 'gif'].includes(req.url.split('.').pop())
    ) {
      // set header for css file
      res.setHeader('Content-Type', 'text/image*');
      // read css file and send it in response
      fs.readFile(__dirname + req.url, (err, content) => {
        if (err) return console.log(err);
        res.end(content);
      });
    } else if (parsedUrl.pathname === '/users' && req.method === 'GET') {
      let user = parsedUrl.query.username;
      let path = __dirname + '/contacts/' + user + '.json';

      if (user) {
        fs.readFile(path, (err, content) => {
          if (err) return console.log(err);
          let data = JSON.parse(content.toString());
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.write(`<h2>${data.name}</h2>`);
          res.write(`<h2>${data.email}</h2>`);
          res.write(`<h2>${data.username}</h2>`);
          res.write(`<h2>${data.age}</h2>`);
          res.write(`<h2>${data.about}</h2>`);
          return res.end();
        });
      }
    }
  });
}

server.listen(5000, () => {
  console.log(`Server listning to port 5000!`);
});