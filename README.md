<h1>Zeo</h1>
<br>
<h4>Software Required to run Zeo Multiplayer:</h4>
- Docker
<br>
<p>or if you plan on not running in a Docker environment,</p>
<h4>you will need:</h4>
- Node.js
<br>
- NPM
<br>
<br>
<h2>How to run in a Docker environment</h2>
<h3>To build the Docker environment,</h3>
<h3>type these commands:</h3>

``` $ chmod +x builddocker.sh ```
<br>
``` $ chmod +x rundocker.sh ```
<br>
``` # ./builddocker.sh ```
  
<br>
<br>
 
<h2>To run the Docker environment:</h2>

``` # ./rundocker.sh ```
<p>Both the WebServer and the WebSocket server will start, The WebServer hosts the main HTML File using Express and the WebSocket Server listens for connections at the port 4685.</p>

<br>
<br>

<h2>Running without Docker</h2>
<h3>(This is assuming you already cloned the repository)</h3>

``` $ npm install ```
<br>
``` $ node webserver.js ```

<h1>However, it is still recommended you run in a Docker Environment as otherwise it can pose security risks such as the host machine being compromised.</h1>
