module.exports = function(app, async, conn, cps, bodyParser) {
    var jsonParser = bodyParser.json();
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
};
