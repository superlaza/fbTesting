
#Node.js NOTES
##npm installs
General info - [On global/local](http://stackoverflow.com/questions/11715486/node-js-why-does-my-project-says-cant-find-module-when-it-is-installed-global)
###express
* **install** npm install -g express@3.x
* **notes** the -g (global) flag was necessary, and I was also running the shell as admin.
* **use** 

###nodemon
* **install** npm install -g nodemon
* **notes** replaces node calls in cmd, allows for quick dev turnaround
* **use** nodemon [your app.js]

###mime
* **install** npm install -g mime
* **notes** used to determine mimetype
* **use** 

###formidable
* **install** npm install formidable
* **notes** used to handle form upload. good with multipart form uploads
* **use** [formidable](https://github.com/felixge/node-formidable)

###bower
* **install** npm install -g bower
* **notes** Bower works by fetching and installing packages from all over, taking care of hunting, finding, downloading, and saving the stuff you’re looking for. Bower keeps track of these packages in a manifest file, bower.json. How you use packages is up to you. Bower provides hooks to facilitate using packages in your tools and workflows.Bower is optimized for the front-end. Bower uses a flat dependency tree, requiring only one version for each package, reducing page load to a minimum.
* **use** bower install <package> [bower packages](http://bower.io/#install-packages)

###socket.io
* **install** npm install socket.io
* **notes** Socket.IO enables real-time bidirectional event-based communication. IF YOU HAVE MS VISUAL STUDIO INSTALLED, SEE [THIS ISSUE ON GITHUB](https://github.com/Automattic/socket.io/issues/1151) AND [THIS DISCUSSION ON SO](http://stackoverflow.com/questions/14180012/npm-install-for-some-packages-sqlite3-socket-io-fail-with-error-msb8020-on-wi).
  **What worked for me was opening the developer command prompt for VS20xx as administrator and typing npm install socket.io --msvs-version=2013. If that doesn't work, I also set this env. variable on the cmd "set GYP_MSVS_VERSION=2012". On the client side, only including the socket.io.js script from the CDN worked for me, having a local copy DID NOT WORK.**
* **use** [docs](http://socket.io/docs/). 