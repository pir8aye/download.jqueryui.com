#!/usr/bin/env node
/*jshint node: true */
"use strict";

var fs = require( "fs" ),
	connect = require( "connect" ),
	handlebars = require( "handlebars" ),
	formidable = require( "formidable" ),
	Builder = require( "./build-backend" );

var httpPort = 8088,
	httpHost = "localhost",
	staticDir = "build-static",
	routes = {
		home: "/",
		download: "/download"
	};

var homeTemplate = handlebars.compile( fs.readFileSync( "build-frontend.html", "utf8" ) );

var components = require( "./manifest" );

function route(app) {
	app.get( routes.home, function( request, response, next ) {
		response.end( homeTemplate( {
			components: components
		}));
	});
	app.post( routes.download, function( request, response, next) {
		var form = new formidable.IncomingForm();
		form.parse( request, function( err, fields, files ) {
			var list = [];
			for ( var field in fields ) {
				list.push( field );
			}
			response.setHeader( "Content-Type", "application/zip" );
			response.setHeader( "Content-Disposition", "attachment; filename=jquery-ui-custom-1.9.zip" );
			new Builder( list ).writeTo( response, function() {
				response.end();
			});
		});
	});
}

connect.createServer(
	connect.router(route),
	connect.static(staticDir)
).listen(httpPort, httpHost, function() {
	console.log( "HTTP Server running at http://%s:%d", httpHost, httpPort );
});
