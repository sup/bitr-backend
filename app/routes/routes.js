module.exports = function(app, async, conn) {
	app.get('/', function(req, res){
		res.sendFile('public/index.html');
	});
};
