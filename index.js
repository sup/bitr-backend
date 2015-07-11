// =================
//		Setup
// =================
var express = require('express');
var app = express();
var async = require('async');
var morgan = require('morgan');
var cps = require('./node_modules/cps-api');
var conn = new cps.Connection('tcp://cloud-us-0.clusterpoint.com:9007', 'bitter', 'USERNAME', 'PASSWORD', 'document', 'document/id', {account: 100781});

app.set('port', (process.env.PORT || 3000));
app.use(express.static('./public'));
app.use(morgan('dev'));

require('./app/routes/routes.js')(app, async, conn);

app.listen(app.get('port'), function() {
	console.log('listening on port ' + app.get('port'));
});


