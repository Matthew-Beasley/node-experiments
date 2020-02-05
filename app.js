const fs = require('fs');
const http = require('http');

const readFile = (file) => {
  return new Promise((resolve, reject) => {
    fs.readFile(file, (err, data) => {
      if (err) {
        reject(err)
      }
      else {
        resolve(data.toString());
      }
    })
  })
}


const writeFile = (file, data) => {
  return new Promise((resolve, reject) => {
    console.log(JSON.stringify(data))
    fs.writeFile(file, JSON.stringify(data), (err, data) => {
      if (err) {
        reject(err)
      }
      else {
        resolve(data);
      }
    })
  })
}


const addUser = (pet) => {
  return readFile('./pets.json')
    .then(data => {
      console.log(data)
      const pets = JSON.parse(data);
      pets.push(pet);
      pets[pets.length - 1].id = pets.length;
      return writeFile('./pets.json', pets)
  })
}


http.createServer((req, res) => {
  if (req.url === '/api/pets') {
    readFile('./pets.json')
      .then(data => {
        res.writeHead(200, { 'Content-Type': 'text/json' });
        res.write(data);
        res.end();
      }).catch(ex => {
        res.statusCode = 500;
        res.write(ex.message);
        res.end();
      })
  }
  else if (req.url === '/') {
    if (req.method === 'GET') {
      readFile('./index.html')
        .then(data => {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.write(data);
          res.end();
        }).catch(ex => {
          res.statusCode = 500;
          res.write(ex.message);
          res.end();
        })
    }
    else if (req.method === 'POST') {
      let body = '';
      req.on('data', (chunk) => {
        body += chunk;
      });
      req.on('end', () => {
        const pet = JSON.parse(body);
        addUser(pet)
          .then(petData => {
            res.write(petData);
            res.end();
          })
          .catch(ex => {
            res.statusCode = 500;
            res.write(ex);
            res.end();
          })
      })
    }
  }
}).listen(3000);
