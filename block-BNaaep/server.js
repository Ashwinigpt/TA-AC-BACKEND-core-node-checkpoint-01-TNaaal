var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');
var path = require('path');

var contact = path.join(__dirname, "/contact.html");

var contactDir = path.join(__dirname, "./contacts/")
console.log(contactDir)

// http server is created
let server = http.createServer(handelRequest);

function handelRequest(req, res) {
  // checking requested method and url
  console.log(`req.method:${req.method} & req.url:${req.url}`);

  var store = '';
  req.on('data', (chunk) => {
    store = store + chunk;
  });

  req.on('end', () => {

    // handel request on index path and render index page
    if (req.method === 'GET' && req.url === '/') {
      // added content type to header
      res.setHeader('Content-Type', 'text/html');
      // read file and response threw pipe
      fs.createReadStream('index.html').pipe(res);
    }

    // handel request on about path and render about page
    if (req.method === 'GET' && req.url === '/about') {
      // added content type to header
      res.setHeader('Content-Type', 'text/html');
      // read file and response threw pipe
      fs.createReadStream('about.html').pipe(res);
    }

    // handel routes for CSS stylesheet attached to index and about page
    if (req.method === 'GET' && req.url.split(".").pop() === "css") {
      // set header for css file
      res.setHeader('Content-Type', 'text/css');
      // read css file and send it in response
      fs.createReadStream(__dirname + "/stylesheet/style.css").pipe(res);
    }

    var img = path.join(__dirname, "/assets/")
    // handel routes for images in assets folder
    if (req.url.split('.').pop() === 'png' || req.url.split('.').pop() === 'jpg') {
      // set header for image file
      res.setHeader('Content-Type', `image/png`);
      // read the image send to response
      fs.createReadStream(__dirname + '/assets/index.png').pipe(res);
    }

    // handel request on contact path which render a HTML form
    if (req.method === 'GET' && req.url === '/contact') {
      res.setHeader('Content-Type', 'text/html');
      fs.createReadStream(contact).pipe(res);
    }

    // handel POST request on form and data come from contact
    if (req.method === 'POST' && req.url === '/form') {
      // convert data into query string
      let parsedData = qs.parse(store);
      // grab out the username from parsedData
      let username = parsedData.username;
      // check whether this username exists in users directory or not 
      // We have to create a file using username + append .json to create a proper file
      // wx flag ensures that given username.json should not already exist in users directory, otherwise throws an error
      fs.open(contactDir + parsedData.username + ".json", "wx", (err, fd) => {
        console.log(err);
        // fd is pointing to newly created file inside users directory
        // once file is created, we can write content to file
        // since store has all the data of the user              
        fs.writeFile(fd, JSON.stringify(qs.parse(store)), 'utf-8', (err) => {
          console.log(err);
          // err indicated file was not written
          // if no error, file was written successfully
          // close the file
          fs.close(fd, (err) => {
            // if no err, send response to client
            console.log(err)
            res.end(`${username} successfully created`);
          });
        });
      });
    }
  })
}

server.listen(5000, () => {
  console.log("server listening on port 5000");
})