<html lang="pt-BR">
  <head>
    <meta charset="utf-8"/>
    <meta name="viewport" content="user-scalable=no, width=device-width, initial-scale=1, maximum-scale=1" />


    <link rel="stylesheet" type="text/css" href="./node_modules/bootstrap/dist/css/bootstrap.min.css" />
    <link rel="stylesheet" type="text/css" href="./src/css/map.css" />
    <link rel="stylesheet" type="text/css" href="./src/css/list.css" />
  </head>
  <body>
    <div id="map"></div>
    <div id="panel">
      <div id="route" class="clickable-item">
        <h3 id="route-name" class="center-text">UFC</h3>
        <p id="route-description">
        </p>
      </div>
      <div id="messages-title" class="center-text"><b>Mensagens</b></div>
      <div id="messages">
        <ul class="list">
        </ul>
      </div>
    </div>

    <div id="select-route-modal"class="modal fade" tabindex="-1" role="dialog">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
            <h4 class="modal-title">Rotas</h4>
          </div>
          <div class="modal-body scrollable-y">
            <div id="routes">
              <ul class="list">
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>

    <script type="text/javascript" src="./node_modules/jquery/dist/jquery.min.js"></script>
    <script type="text/javascript" src="./node_modules/bootstrap/dist/js/bootstrap.min.js"></script>
    <script type="text/javascript" src="./node_modules/list.js/dist/list.min.js"></script>
    <script type="text/javascript" src="./src/js/map.js">
    </script>
    <script async defer
      src="https://maps.googleapis.com/maps/api/js?key=AIzaSyBo-P_mMZcX7fsogZX6UYZN3s5jG6KbSDo&callback=initMap&libraries=geometry">
    </script>
  </body>
</html>