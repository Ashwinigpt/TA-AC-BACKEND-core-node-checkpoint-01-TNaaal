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
  parsedUrl = url.parse( req.url, true );
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
      fs.createReadStream(__dirname + `/stylesheet/style.css`).pipe(res);
    }

    var img = path.join(__dirname, "/assets/")
    // handel routes for images in assets folder
    var ext = req.url.split('.').pop();
    if (ext === 'png' || ext === 'jpg') {
      // set header for image file
      res.setHeader('Content-Type', `image/${ext}`);
      // read the image send to response
      fs.createReadStream(__dirname + `/assets/${req.url}`).pipe(res);
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
        if(err){
          res.setHeader('Content-Type', 'text/html');
          res.write(fd);
          res.end(`${username} already exists`);
        }
        // fd is pointing to newly created file inside users directory
        // once file is created, we can write content to file
        // since store has all the data of the user              
        fs.writeFile(fd, JSON.stringify(parsedData), 'utf-8', (err) => {
          if(err){
            res.setHeader('Content-Type', 'text/html');
            res.write(fd);
            res.end(`file was not written`);
          }
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
    
    // handle GET request on "/users"

    if ( parsedUrl.pathname === '/users' && req.method === 'GET' ) {
      let user = parsedUrl.query.username;
      let path = __dirname + '/contacts/' + user + '.json';

      if ( user ) {
        fs.readFile( path, ( err, content ) => {
          if ( err ) return console.log( err );
          let data = JSON.parse(content.toString());
          res.writeHead( 200, { 'Content-Type': 'text/html' });
          res.write(`<h2>${data.name}</h2>`)
          res.write(`<h2>${data.email}</h2>`)
          res.write(`<h2>${data.username}</h2>`)
          res.write(`<h2>${data.age}</h2>`)
          res.write(`<h2>${data.bio}</h2>`)
          return res.end();
        } )
      }
    } 
  })
}

server.listen(5000, () => {
  console.log("server listening on port 5000");
})
