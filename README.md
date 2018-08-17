# Deprecated

This sample is no longer maintained, please visit [Autodesk-Forge](https://github.com/Autodesk-Forge/) for other samples.

## View & Data Gallery


The View & Data Gallery is a demo website implemented using a Node.js back-end and an AngularJs front-end. See the [demo](http://viewer.autodesk.io/node/gallery/#/gallery).



##Dependencies

This sample uses Node.Js and MongoDb back-end.

This sample depends on the [view anda data API JavaScript library](https://github.com/Developer-Autodesk/library-javascript-view.and.data.api) 

##Setup/Usage Instructions


* Install [nodejs](https://nodejs.org)

* Install and run MongoDB, see [their tutorial](http://docs.mongodb.org/manual/tutorial) for instructions. 

* You can check mongoDB, node, and npm versions with the following commands:
  ```
  $ mongo —version
  $ node –v
  $ npm -v
  ```

* Browse to the sub directory "website" and type `npm install` in terminal/command line to resolve the following node dependencies:
  - express.js
  - cookie-parser
  - body-parser
  - serve-favicon
  - morgan
  - socket.io
  - request
  - xhr
  - nodemailer-direct-transport
  - formidable
  - mongodb

* In /website/credentials.js: Replace the place holders of ClientId and ClientSecret with your own credentials, which are obtained by creating an App on http://developer.autodesk.com 

* (Optional) In /website/config.js: Replace the place holders for GalleryPort, MongoDbName, MongoDbPort

* Mandatory for upload: In /website/www/config.js: Replace the place holder for BucketName. Bucket name needs to be unique accross the whole View & Data webservice, so a good pratice is to append your clientId to it. 

* If you are on windows, go to \website\mongdb.bat, check and update the path if needed. Run `mongodb.bat` to start up MongoDB, and then run `server.bat` to start up node server. If you are using Mac, start up MongoDb following [their tutorial](http://docs.mongodb.org/manual/tutorial), and then start up node server by running `node server.js` from /website folder.

* To run the sample, go to http://localhost:GalleryPort/node/gallery/ on your browser.

## License

That samples are licensed under the terms of the [MIT License](http://opensource.org/licenses/MIT). Please see the [LICENSE](LICENSE) file for full details.

##Written by 

Philippe Leefsma
