module.exports = function(app, async, conn, cps, bodyParser) {

	app.get('/', function(req, res) {
		res.sendFile('public/index.html');
	});

    app.get('/db', function(req, res) {
       
         var id = 1;
        var twitterHandle = "lolbutts";
        var insert = new cps.InsertRequest('<document><id>'+id+'</id>'+cps.Term(twitterHandle, "twitter-handle")+'</document>');
        conn.sendRequest(insert, function(err, response) {
           if (err) {
                res.send(response);
                return console.error(err);
           }
           console.log('New user registered: ' + response);
                res.send(response);
        });
    });

};
