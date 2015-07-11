module.exports = function(app, async, request, conn, cps, twitter) {

    ////////////////////////////////////
    ///        LANDING PAGE          ///
    ////////////////////////////////////
	app.get('/', function(req, res) {
		res.sendFile('public/index.html');
	});
 
    /////////////////////////////////////
    ///         CREATE USER           ///
    /////////////////////////////////////
    app.post('/createUser', function(req, res) {
        // Grabs twitter handle of user to create
        var loggedUser = parseAuth(req.get('Authorization')); 
        console.log(loggedUser);
        console.log(twitter);
        var id = loggedUser;
        var insert_req = new cps.InsertRequest(
            '<document><id>'+id+'</id>'+cps.Term(" ", "name")+cps.Term(" ", "twitter_photo")+cps.Term("user", "type")+cps.Term(" ", "oauth_token")+cps.Term(" ", "refresh_token")+cps.Term(" ", "friends")+cps.Term(" ", "upVotes")+cps.Term(" ", "downVotes")+'</document>');
        console.log(insert_req);
        conn.sendRequest(insert_req, function(err, response) {
            if (!err) {
                // Find their friends
                var client = new twitter({ 
                });
                
               var params = {
                    count: 200
               } 

               client.get('friends/list', params, function(error, tweets, response) {
                    if (!error) {
                        var friendsArray = [];
                        for( var i = 0; i< tweets.users.length; i++) {
                            var friendsObj = {
                                name: tweets.users[i].name ,
                                id: tweets.users[i].screen_name        
                            };
                            console.log(friendsObj);
                            friendsArray.push(friendsObj);
                        }
                        var replace_request = new cps.PartialReplaceRequest({ id: loggedUser, friends : friendsArray});
                            conn.sendRequest(replace_request, function (err, replace_resp) {
                            if (!err) {
                                res.sendStatus(200);
                            } else {
                                res.sendStatus(400);
                            }
                        }, 'json');
                    } else {
                        console.log("TWITTER ERROR");
                        console.log(error);
                        res.sendStatus(400);
                    } 
               });
            } else {
                console.log(err);
                res.sendStatus(400);
            }
        });
    });
 
    /////////////////////////////////////
    ///         GET USER              ///
    /////////////////////////////////////
    app.get('/user', function(req, res) {
        var loggedUser = parseAuth(req.get('Authorization'));
        var user = req.query.user;
        // Build the query for user
        var search_req = new cps.SearchRequest(cps.Term(user, "id"));
        conn.sendRequest(search_req, function (err, response) {
            if (!err) {
                console.log('USER EXISTS SENDING INFORMATION');
                res.send(response.results.document[0]).sendStatus(200);
            } else {
                console.log('USER DOES NOT EXISTS');
                res.sendStatus(400);
            }
        }); 
    });

    /////////////////////////////////////
    ///        GET FRIENDS of         ///
    /////////////////////////////////////
    app.get('/followers', function(req, res) {
        var user = req.query.user;
        var search_req = new cps.SearchRequest(cps.Term(user, "id"));
        conn.sendRequest(search_req, function (err, response) {
            if (!err) {
                console.log('USER EXISTS SENDING INFORMATION');
                res.send(response.results.document[0].friends);
            } else {
                console.log('USER DOES NOT EXISTS');
                res.sendStatus(400);
            }
        }); 
    });

    /////////////////////////////////////
    ///         POST FRIEND S         ///
    ///////////////////////////////////// 
    app.post('/follow', function(req, res) {
        var loggedUser = parseAuth(req.get('Authorization'));
        var user = req.query.user;
        var realName = req.query.name;
        var friendsObj = {
            name: realName,
            id: user
        };
        friendsObj = JSON.stringify(friendsObj);
        console.log(friendsObj);
        var replace_request = new cps.PartialReplaceRequest({ 'id': loggedUser, 'friends' : friendsObj});
            conn.sendRequest(replace_request, function (err, replace_resp) {
            if (!err) {
                res.sendStatus(200);
            } else {
                res.sendStatus(400);
            }
        }, 'json');
    });

    function parseAuth(loggedUser) {
        var results = loggedUser.split(" ");
        results = results[1];
        return results;    
    };
};
