var port = process.env.PORT || 3000,
    http = require('https'),
    fs = require('fs'),
    html = fs.readFileSync('index.html');

var express = require('express');
var app = express();

var log = function(entry) {
    fs.appendFileSync('/tmp/sample-app.log', new Date().toISOString() + ' - ' + entry + '\n');
};

var server = http.createServer(function (req, res) {
    if (req.method === 'POST') {
        var body = '';

        var headers = {
             'Authorization': 'Bearer wx4UPZuJ7DBbVcQER5OTdKJa8MwIsFVL-Ympzf6jqIx_V6lRMavTgUm1TuYrGW3qUUHuOS0JlqkCzZEtC4W7lpd4f3Ia65H73o5rjKS7aljo4kzOsetQ0LAkhyOzWnYx'
          };

        req.on('data', function(chunk) {
            body += chunk;
        });

        req.on('end', function() {
            if (req.url === '/') {
                log('Received message: ' + body);
            } else if (req.url = '/scheduled') {
                log('Received task ' + req.headers['x-aws-sqsd-taskname'] + ' scheduled at ' + req.headers['x-aws-sqsd-scheduled-at']);
            }

            res.writeHead(200, 'OK', {'Content-Type': 'text/plain'});
            res.end();
        });
    } else {
        res.writeHead(200);
        res.write(html);
        res.end();
    }
});

//nearby search places
app.get('/getPlaces/:keyw/:cat/:dist/:lat/:lon/:apiKey', function (req, result) {
    var data = {
        "detail" : {
            "keyw": req.params.keyw,
            "cat": req.params.cat,
            "dist": req.params.dist,
            "lat": req.params.lat,
            "lon": req.params.lon,
            "apiKey": req.params.apiKey
        }
    };

    var url= "https://maps.googleapis.com/maps/api/place/nearbysearch/json?location="+req.params.lat+","+req.params.lon+"&radius="+req.params.dist+"&type="+req.params.cat+"&keyword="+req.params.keyw+"&key="+req.params.apiKey;
    http.get(url, function(res) {
        res.setEncoding('utf8');
        var body = '';
        res.on('data', function(chunk) {
            body += chunk;
        });
      
      res.on('end', function (chunk) {
        result.header("Access-Control-Allow-Origin", "*");
        result.header("Access-Control-Allow-Headers", "X-Requested-With");
        result.setHeader('content-type', 'application/json');
        result.send(body);
      });
    }).end();
});

//get next page using page token
app.get('/getNextPage/:pageToken/:apiKey', function (req, result) {
    var data = {
        "detail" : {
            "pageToken": req.params.pageToken,
            "apiKey": req.params.apiKey
        }
    };
    var url= "https://maps.googleapis.com/maps/api/place/nearbysearch/json?pagetoken="+req.params.pageToken+"&key="+req.params.apiKey;
     http.get(url, function(res) {
        res.setEncoding('utf8');
        var body = '';
        res.on('data', function(chunk) {
            body += chunk;
        });
      
      res.on('end', function (chunk) {
        result.header("Access-Control-Allow-Origin", "*");
        result.header("Access-Control-Allow-Headers", "X-Requested-With");
        result.setHeader('content-type', 'application/json');
        result.send(body);
      });
    }).end();
});

//get place details 
app.get('/getDetailPage/:placeId/:apiKey', function (req, result) {
    var data = {
        "detail" : {
            "pageToken": req.params.pageToken,
            "apiKey": req.params.apiKey
        }
    };
    var url= "https://maps.googleapis.com/maps/api/place/details/json?placeid="+placeId+"&key="+req.params.apiKey;
     http.get(url, function(res) {
        res.setEncoding('utf8');
        var body = '';
        res.on('data', function(chunk) {
            body += chunk;
        });
      
      res.on('end', function (chunk) {
        result.header("Access-Control-Allow-Origin", "*");
        result.header("Access-Control-Allow-Headers", "X-Requested-With");
        result.setHeader('content-type', 'application/json');
        result.send(body);
      });
    }).end();
});

//geocoding the location entered
app.get('/geoCode/:addr/:apiKey', function (req, result) {
    var data = {
        "detail" : {
            "addr": req.params.addr,
            "apiKey": req.params.apiKey
        }
    };
    var url= "https://maps.googleapis.com/maps/api/geocode/json?address="+req.params.addr+"&key="+req.params.apiKey;
    http.get(url, function(res) {
        res.setEncoding('utf8');
        var body = '';
        res.on('data', function(chunk) {
            body += chunk;
        });
      
      res.on('end', function (chunk) {
        result.header("Access-Control-Allow-Origin", "*");
        result.header("Access-Control-Allow-Headers", "X-Requested-With");
        result.setHeader('content-type', 'application/json');
        result.send(body);
      });
    }).end();
});

//yelp business match
app.get('/yelpMatch/:name/:addr/:city/:state/:count', function (req, result) {
    var data = {
        "detail" : {
            "name": req.params.name,
            "address": req.params.addr,
            "city":req.params.city,
            "state":req.params.state,
            "country":req.params.count,
        }
    };
    var url= "https://api.yelp.com/v3/businesses/matches/best?name="+req.params.name+"&city="+req.params.city+"&state="+req.params.state+"&country="+req.params.count+"&address1="+req.params.addr;
    
try{

    var options = {
        host: 'api.yelp.com',
        port: 443,
        path: "/v3/businesses/matches/best?name="+encodeURIComponent(req.params.name)+"&city="+encodeURIComponent(req.params.city)+"&state="+encodeURIComponent(req.params.state)+"&country="+encodeURIComponent(req.params.count)+"&address1="+encodeURIComponent(req.params.addr),
        method: 'GET',
        headers: {
            'Authorization': 'Bearer wx4UPZuJ7DBbVcQER5OTdKJa8MwIsFVL-Ympzf6jqIx_V6lRMavTgUm1TuYrGW3qUUHuOS0JlqkCzZEtC4W7lpd4f3Ia65H73o5rjKS7aljo4kzOsetQ0LAkhyOzWnYx'
        }
    };
    http.request(options, function(res) {

        res.setEncoding('utf8');
        var body = '';
        res.on('data', function(chunk) {
            body += chunk;
        });
      
      res.on('end', function (chunk) {
        result.header("Access-Control-Allow-Origin", "*");
        result.header("Access-Control-Allow-Headers", "X-Requested-With");
        result.setHeader('content-type', 'application/json');
        result.send(body);
      });
    }).end();
}
catch(e){
    console.log(e);
}
});


//yelp reviews
app.get('/yelpReview/:bid', function (req, result) {
    var data = {
        "detail" : {
            "bid": req.params.bid,
        }
    };
    var url= "https://api.yelp.com/v3/businesses/"+req.params.bid+"/reviews";
    
try{

    var options = {
        host: 'api.yelp.com',
        port: 443,
        path: "/v3/businesses/"+req.params.bid+"/reviews",
        method: 'GET',
        headers: {
            'Authorization': 'Bearer wx4UPZuJ7DBbVcQER5OTdKJa8MwIsFVL-Ympzf6jqIx_V6lRMavTgUm1TuYrGW3qUUHuOS0JlqkCzZEtC4W7lpd4f3Ia65H73o5rjKS7aljo4kzOsetQ0LAkhyOzWnYx'
        }
    };
    http.request(options, function(res) {

        res.setEncoding('utf8');
        var body = '';
        res.on('data', function(chunk) {
            body += chunk;
        });
      
      res.on('end', function (chunk) {
        result.header("Access-Control-Allow-Origin", "*");
        result.header("Access-Control-Allow-Headers", "X-Requested-With");
        result.setHeader('content-type', 'application/json');
        result.send(body);
      });
    }).end();
}
catch(e){
    console.log(e);
}
});

// Listen on port 3000, IP defaults to 127.0.0.1
app.listen(port);

// Put a friendly message on the terminal
console.log('Server running at http://127.0.0.1:' + port + '/');
