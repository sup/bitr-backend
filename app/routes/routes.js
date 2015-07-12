module.exports = function(app, async, request, conn, cps, twitter, bodyParser) {

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
               };

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

    /////////////////////////////////////
    //      GET ACTIVITIES BY USER     //
    /////////////////////////////////////
    app.get('/activities', function(req, res) {
        var logged_user = req.get('Authorization');
        logged_user = logged_user.split(" ");
        logged_user = logged_user[1];
        console.log(logged_user);
        // Split comma separated users into list
        var user_list = (req.query.user).split(",");
        // Add <user> tag to each user
        for (var i = 0; i < user_list.length; i++) {
            user_list[i] = cps.Term(user_list[i], "user");
        }
        // Create OR query string
        var user_string = user_list.join(" ");
        var query_string = "{" + user_string + "}";
        // Create search object and output response JSON
        var search_req = new cps.SearchRequest(query_string);
        conn.sendRequest(search_req, function(err, response) {
            if(!err) {
                res.send(response.results.document);
            }
            else {
                console.log(err);
            }
        });
    });

    /////////////////////////////////////
    //     GET ACTIVITIES BY RADIUS    //
    /////////////////////////////////////
    app.get('/map_events', function(req, res) {
        var logged_user = req.get('Authorization');
        logged_user = logged_user.split(" ");
        logged_user = logged_user[1];
        console.log(logged_user);
        // Get latitude, longitude, and radius from query variables
        var lat = req.query.lat;
        var lng = req.query.lng;
        var r = req.query.r;
        var search_req = new cps.SearchRequest("  &gt;&lt;circle", 0, 5);
        search_req.setParam("shapes", "<circle><center>"+lat+" "+lng+"</center><radius>"+r+" mi</radius><coord1_tag_name>lat</coord1_tag_name><coord2_tag_name>lng</coord2_tag_name></circle>");
        // Create search object and output response JSON
        conn.sendRequest(search_req, function(err, response) {
            if(!err) {
                if (response.results !== undefined) {
                    res.send(response.results.document);
                }
                else {
                    res.send("No nearby activities!");
                }
            }
            else {
                console.log(err);
            }
        });
    });

    /////////////////////////////////////
    //     UPVOTE ACTIVITIES BY ID     //
    /////////////////////////////////////
    app.get('/score', function(req, res) {
        var logged_user = req.get('Authorization');
        logged_user = logged_user.split(" ");
        logged_user = logged_user[1];
        console.log(logged_user);
        // Get latitude, longitude, and radius from query variables
        var activity_id = req.query.activity_id;
        var vote = req.query.vote === "true";
        var search_req = new cps.SearchRequest(cps.Term(activity_id, "id"));
        // Create search object and output response JSON
        conn.sendRequest(search_req, function(err, response) {
            if(!err) {
                if (response.results !== undefined) {
                    res.send(response.results.document);
                }
                else {
                    res.send("No nearby activities!");
                }
            }
            else {
                console.log(err);
            }
        });
    });

    /////////////////////////////////////
    //     ADD ACTIVITIES BY USER      //
    /////////////////////////////////////
    app.post('/activities', jsonParser, function(req, res) {
        // Get User
        var logged_user = req.get('Authorization');
        logged_user = logged_user.split(" ");
        logged_user = logged_user[1];
        console.log(logged_user);
        // Get request parameters
        console.log(req.body);
        var post_object = req.body;
        var vote = post_object.vote === "true";
        var photo_link = post_object.photo_link;
        var lat = post_object.lat;
        var lng = post_object.lng;
        // Check if this location has been added before by this user
        var query_string = [logged_user, lat, lng].join(" ");
        // Create search object and check if the user already was added
        var search_req = new cps.SearchRequest(query_string);
        conn.sendRequest(search_req, function(err, response) {
            // Case: Successful request or error
            if(!err) {
                // Case: Empty response or existing values
                if(response.results === undefined) {
                    var timestamp = new Date() | 0;
                    var activity_id = logged_user + timestamp;
                    var activity_document = '<document>'+
                                                cps.Term(activity_id, "id") +
                                                cps.Term(logged_user, "user") +
                                                cps.Term(vote, "vote") +
                                                cps.Term(0, "score") +
                                                cps.Term(photo_link, "photo_link") +
                                                cps.Term(lat, "lat") +
                                                cps.Term(lng, "lng") +
                                                cps.Term(timestamp, "timestamp") +
                                            '</document>';
                    var insert = new cps.InsertRequest(activity_document);
                    conn.sendRequest(insert, function(err, response) {
                        // Case: Activity successfully added or error.
                        if(!err) {
                            res.send({"success": "Activity successfully added."});
                        }
                        else {
                            console.log(err);
                        }
                    });
                }
                else {
                    res.send({"error": "User has already upvoted this area."});
                }
            }
            else {
                console.log(err);
            }
        });
    });

    function parseAuth(loggedUser) {
        var results = loggedUser.split(" ");
        results = results[1];
        return results;
    }
};
