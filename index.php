<html lang="pt-BR">
  <head>
    <meta charset="utf-8"/>
    <meta name="viewport" content="user-scalable=no, width=device-width, initial-scale=1, maximum-scale=1" />


    <link rel="stylesheet" type="text/css" href="./node_modules/bootstrap/dist/css/bootstrap.min.css" />
    <link rel="stylesheet" type="text/css" href="./assets/mobile-menu-hamburger/css/hamburger.css"/>    
    <link rel="stylesheet" type="text/css" href="./src/css/list.css" />
    <link rel="stylesheet" type="text/css" href="./src/css/map.css" />
  </head>
  <body>
    <div id="container">
      <header>
        <div id="hamburger">
            <div></div>
            <div></div>
            <div></div>
        </div>
      </header>

      <nav>
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
      </nav>

      <!--The Layer that will be layed over the content
      so that the content is unclickable while menu is shown-->
      <div id="contentLayer"></div>

      <!--The content of the site-->
      <div id="content">

        <div id="map"></div>


        
      </div>
    </div>

    <div id="select-route-modal"class="modal fade" tabindex="-1" role="dialog">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
            <h4 class="modal-title">Selecione uma rota</h4>
          </div>
          <div class="modal-body">
            <div id="routes" class="scrollable-y">
              <ul class="list">
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>

    <script type="text/javascript" src="./node_modules/jquery/dist/jquery.min.js"></script>
    <script type="text/javascript" src="./node_modules/jquery-ui/dist/jquery-ui.min.js"></script>
    <script type="text/javascript" src="./node_modules/bootstrap/dist/js/bootstrap.min.js"></script>
    <script src="./assets/mobile-menu-hamburger/js/hamburger.js"></script>
    <script type="text/javascript" src="./node_modules/list.js/dist/list.min.js"></script>
    <script type="text/javascript" src="./src/js/map.js">
    </script>
    <script async defer
      src="https://maps.googleapis.com/maps/api/js?key=AIzaSyBo-P_mMZcX7fsogZX6UYZN3s5jG6KbSDo&callback=initMap&libraries=geometry">
    </script>
  </body>
</html>