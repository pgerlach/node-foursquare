var QUERYSTRING = require('querystring'),
	HTTPS = require('https'),
    URL = require('url');


BASESITE = "https://foursquare.com";
ACCESS_TOKEN_URL = "/oauth2/access_token";


function getRequest(url, access_token, callback) {

	var parsedUrl = URL.parse(url, true ),
		request, result = "";

	if (parsedUrl.protocol == "https:" && !parsedUrl.port) {
		parsedUrl.port= 443;
	}

	if( parsedUrl.query === undefined) {
		parsedUrl.query= {};
	}

	if (access_token != null) {
		parsedUrl.query["oauth_token"]= access_token;
	}

	request = HTTPS.request({
		host: parsedUrl.hostname,
		port: parsedUrl.port,
		path: parsedUrl.pathname + "?" + QUERYSTRING.stringify(parsedUrl.query),
		method: "GET"
	}, function(res) {
		res.on('data', function(chunk) {
			result+= chunk;
		});

		res.on("end", function () {
			callback(res.statusCode, result);
		});
	});

	request.end();
}

function extractData(status, result, field, success_handler, error_handler) {

	var json;

	if (status !== undefined && result !== undefined) {

		json = JSON.parse(result);

		// 200
		if (json.meta.code === 200) {
			if (json.response !== undefined && json.response[field] !== undefined) {

				if (success_handler !== undefined) {
					success_handler(json.response[field]);
				}
			}
		}

		// 400
		if (json.meta.code === 400) {
			if (error_handler !== undefined) {
				error_handler(json.meta);
			}
		}
	}
}


exports.getAccessToken = function (params, successHandler) {

	// adding extra params
	params["grant_type"] = "authorization_code";

	var url = BASESITE + ACCESS_TOKEN_URL + "?" + QUERYSTRING.stringify(params);


	var parsedUrl = URL.parse(url, true ),
		request, result = "";

	if (parsedUrl.protocol == "https:" && !parsedUrl.port) {
		parsedUrl.port= 443;
	}

	if( parsedUrl.query === undefined) {
		parsedUrl.query= {};
	}

	request = HTTPS.request({
		host: parsedUrl.hostname,
		port: parsedUrl.port,
		path: parsedUrl.pathname + "?" + QUERYSTRING.stringify(parsedUrl.query),
		method: "POST",
		headers: {
			'Content-Length': 0
		}
	}, function(res) {
		res.on('data', function(chunk) {
			result+= chunk;
		});

		res.on("end", function () {

			var json;

			if (successHandler !== undefined && result !== undefined) {

				json = JSON.parse(result);
				successHandler(json.access_token);
			}
		});
	});

	request.end();
};


exports.getTip = function (tip_id, access_token, success_handler, error_handler) {

	var url = "https://api.foursquare.com/v2/tips/" + tip_id;

	getRequest(url, access_token, function (status, result) {
		extractData(status, result, "tip", success_handler, error_handler);
	});
};

exports.getCheckin = function (checkin_id, access_token, success_handler, error_handler) {

	var url = "https://api.foursquare.com/v2/checkins/" + checkin_id;

	getRequest(url, access_token, function (status, result) {
		extractData(status, result, "checkin", success_handler, error_handler);
	});
};


exports.getVenue = function (venue_id, access_token, success_handler) {

	var url = "https://api.foursquare.com/v2/venues/" + venue_id;

	getRequest(url, access_token, function (status, result) {

		var json;
		if (status !== undefined && result !== undefined) {

			json = JSON.parse(result);

			if (json.meta.code === 200) {
				if (json.response !== undefined && json.response.venue !== undefined) {

					if (success_handler !== undefined) {
						success_handler(json.response.venue);
					}
				}
			}
		}
	});
};

exports.getUser = function (user_id, access_token, success_handler) {

	var url = "https://api.foursquare.com/v2/users/" + user_id;

	getRequest(url, access_token, function (status, result) {

		var json;
		if (status !== undefined && result !== undefined) {

			json = JSON.parse(result);
			if (json !== undefined && json.response !== undefined && json.response.user !== undefined) {

				if (success_handler !== undefined) {
					success_handler(json.response.user);
				}
			}
		}
	});
};