<html lang="pt-BR">
  <head>
    <meta charset="utf-8"/>
    <meta name="viewport" content="user-scalable=no, width=device-width, initial-scale=1, maximum-scale=1" />

    <link rel="stylesheet" type="text/css" href="./src/css/map.css" />
    <link rel="stylesheet" type="text/css" href="./src/css/list.css" />
  </head>
  <body>
    <div id="map"></div>
    <div id="panel">
      <div id="route">
        <h3 id="route-name" class="center-text">UFC</h3>
        <p id="route-description">
        </p>
        
      </div>
      <div id="messages-title" class="center-text"><b>Mensagens</b></div>
      <div id="messages">
        <ul class="list">
          <li class="hidden">
            <h3 class="title">Jonny Stromberg</h3>
            <p class="message">1986</p>
            <p class="date">dklsajd</p>
          </li>
        </ul>
      </div>
    </div>
    <script type="text/javascript" src="./node_modules/polyline/src/polyline.js"></script>
    <script type="text/javascript" src="./node_modules/jquery/dist/jquery.min.js"></script>
    <script type="text/javascript" src="./node_modules/list.js/dist/list.min.js"></script>
    <script type="text/javascript" src="./src/js/map.js">
    </script>
    <script async defer
      src="https://maps.googleapis.com/maps/api/js?key=AIzaSyBo-P_mMZcX7fsogZX6UYZN3s5jG6KbSDo&callback=initMap&libraries=geometry">
    </script>
  </body>
</html>