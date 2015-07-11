module.exports = function(app, async, conn, cps) {

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
                // TODO Async stuff
            }
            else {
                console.log(err);
            }
        });
    });
    /////////////////////////////////////
    //     GET ACTIVITIES BY RADIUS    //
    /////////////////////////////////////
    


    /////////////////////////////////////
    //     ADD ACTIVITIES BY USER      //
    /////////////////////////////////////
    app.post('/activities', function(req, res) {
        // Get User
        var logged_user = req.get('Authorization');
        logged_user = logged_user.split(" ");
        logged_user = logged_user[1];
        console.log(logged_user);
        // Get request parameters
        console.log(req);
        /*var post_object = JSON.parse(req.body);
        var vote = post_object.vote === "true";
        var photo_link = post_object.photo_link;
        var lat = post_object.lat;
        var lng = post_object.lng;
        // Check if this location has been added before by this user
        var query_string = [user, lat, lng].join(" ");
        // Create search object and check if the user already was added
        var search_req = new cps.SearchRequest(query_string);
        conn.sendRequest(search_req, function(err, response) {
            // Case: Successful request or error
            if(!err) {
                // Case: Empty response or existing values
                if(!response.results.document) {
                    var timestamp = new Date() | 0;
                    var activity_id = timestamp + logged_user;
                    var activity_document = '<document>'+
                                                cps.Term(activity_id, "id") +
                                                cps.Term(user, "user") +
                                                cps.Term(vote, "vote") +
                                                cps.Term(photo_link, "photo_link") +
                                                cps.Term(lat, "lat") +
                                                cps.Term(lng, "lng") +
                                            '</document>';
                    var insert = new cps.InsertRequest(activity_document);
                    conn.sendRequest(search_req, function(err, response) {
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
        });*/
    });
};
