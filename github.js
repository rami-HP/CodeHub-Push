// module requirements
var request = require('request');

var portal = 'https://api.github.com';

var userAgent = 'codehub-push';

function createUri(path, args) {
	var base = path + '?';
	if (typeof args !== 'undefined') { 
		for (var prop in args) {
			base += prop + '=' + encodeURIComponent(args[prop]) + '&';
		}
	}
	return base;
}

function parseResponse(callback) {
	return function(err, res, body) {
		var _ref;
		if (Math.floor(res.statusCode / 100) === 5) {
			return callback(new Error('Error ' + res.statusCode));
		}
		try {
			body = JSON.parse(body || '{}');
		} catch (err) {
			return callback(err);
		}
		if (body.message && res.statusCode === 422) {
			return callback(new Error(body.message));
		}
		if (body.message && ((_ref = res.statusCode) === 400 || _ref === 401 || _ref === 404)) {
			return callback(new Error(body.message));
		}
		return callback(null, res.statusCode, body, res.headers);
	};
}

function get(url, oauth, etag, callback, args) {
	var response = function(err, status, body, headers) {
		if (err) return callback(err);
		if (status == 304) return callback(null, {}, etag);
		return callback(null, body, headers.etag);
	};

	request({
		uri: createUri(url, args),
		method: 'GET',
		headers: {
		    'User-Agent': userAgent,
		    'If-None-Match': etag,
		    'Authorization': 'token ' + oauth
		}
	}, parseResponse(response));
}

exports.get = get;


// Get the notifications for an oauth user
exports.notifications = function(oauth, etag, callback) {
	get(portal + '/notifications', oauth, etag, callback);
};


