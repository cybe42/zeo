<h1>Zeo</h1>
<h4>Required to run Zeo Multiplayer:</h2>
- Docker
<h5>or if you plan on not running in a Docker environment,</h5>
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

<br>
<br>

<h2>Running without Docker</h2>
<h3>(This is assuming you already cloned the repository)</h3>

``` $ npm install ```
<br>
``` $ node webserver.js ```

<h1>However, it is still recommended you run in a Docker Environment as otherwise it can pose security risks such as the host machine being compromised.</h1>
