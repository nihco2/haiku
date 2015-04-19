<?php
if(preg_match('/~/',$_SERVER['REQUEST_URI'])){
        $cms_env = "cms-dev";
}
if(preg_match('/tribeca/',$_SERVER['HTTP_HOST'])){
        $cms_env = "cms-tribeca";
}
else{
        $cms_env = "cms";
}

$force = (isset($_GET['force'])) ? "&force=".$_GET['force'] : '';
$self = "&self=http://".$_SERVER['HTTP_HOST'].$_SERVER['REQUEST_URI'];

$facebook_datas = file_get_contents("http://".$cms_env.".interactivehaiku.com/framework/fetch_facebook.php?id=2".$force.$self);
$myHaiku = json_decode($facebook_datas);
?>


<!DOCTYPE html>
<!--[if lt IE 7]>      <html class="no-js lt-ie9 lt-ie8 lt-ie7"> <![endif]-->
<!--[if IE 7]>         <html class="no-js lt-ie9 lt-ie8"> <![endif]-->
<!--[if IE 8]>         <html class="no-js lt-ie9"> <![endif]-->
<!--[if gt IE 8]><!-->
<html class="no-js">
<!--<![endif]-->

<head>
<title><?php echo $myHaiku->title; ?></title>
<meta name="description" content="<?php echo $myHaiku->share_fb; ?>">
<meta name="keywords"content="ONF,NFB,ARTE,Haïkus interactifs,Interactive haiku,Interaktive haikus,Haïku,Haiku,Interactif,Court interactif,Interactive,Interactive short,Caspar Sonnen,William Uricchio ,Héctor Ayuso,David Carzon,Ciel Hunter,Jonathan Harris,Marie-Pier Gauthier,Alexander Knetig,Hugues Sweeney,Cosmografik,Dpt.co,Le populomètre,Famograph,Der Beliebtheitsmesser,Datum,Cat’s Cradle,Le berceau du chat,Fadenspiel,Yogacara,Z…,La mélodie du quotidien,Music in the key of life,Die Musik des Alltags,Une vie en jeu,Life is short,Das Leben ist kurz,Speech Success,Un discours!,Schönredner,Le marcheur de saison,The Seasonal Stroller,Der Wanderer der Jahreszeiten,Phi,Démasquer les inconnus,Facing the nameless,Unbekannte Entlarven,Grand Bruit">
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
  <link rel="shortcut icon" type="image/x-icon" href="favicon.ico" />
  <link rel="apple-touch-icon" sizes="57x57" href="touch-icon-iphone.png">
  <link rel="apple-touch-icon" sizes="76x76" href="touch-icon-ipad.png">
  <link rel="apple-touch-icon" sizes="120x120" href="touch-icon-iphone-retina.png">
  <link rel="apple-touch-icon" sizes="152x152" href="touch-icon-ipad-retina.png">
  <link href='http://fonts.googleapis.com/css?family=Amatic+SC' rel='stylesheet' type='text/css'>
  <link href='http://fonts.googleapis.com/css?family=Antic+Slab' rel='stylesheet' type='text/css'>
  <link rel="stylesheet" href="css/normalize.min.css">
  <link rel="stylesheet" href="css/bootstrap.min.css">
  <link rel="stylesheet" href="css/main.css">
  <!--[if lt IE 9]>
            <script src="//html5shiv.googlecode.com/svn/trunk/html5.js"></script>
            <script>window.html5 || document.write('<script src="js/vendor/html5shiv.js"><\/script>')</script> 

        <![endif]-->
<script id="script-haiku" data-haiku="2" src="http://<?php echo $cms_env; ?>.interactivehaiku.com/framework/js/haiku-onf.min.js"></script>
<meta property="og:locale" content="<?php echo $myHaiku->code; ?>"> 
<meta property="og:image" content="<?php echo $myHaiku->fbimage; ?>">
<meta property="og:title" content="<?php echo $myHaiku->title; ?>">
<meta property="og:description" content="<?php echo $myHaiku->share_fb; ?>">
<meta property="og:url" content="<?php echo $myHaiku->domain; ?> ">

</head>

<body>
  <!--[if IE]>
    <div id="browser-alert" class="alert alert-danger" role="alert">
      <h4>Achtung</h4>
      <p>Dieses Projekt wird von ihrem aktuellen Browser nicht unterstützt.<br>
      Bitte wählen Sie einen anderen Browser (Firefox oder Chrome).</p>
    </div>
  <![endif]-->
  <header id="intro">
    <div class="loader">0%</div>
    <h1 class="logo">Der Wanderer der Jahreszeiten, ein interaktiver Haiku von Cosmografik, illustriert von Barbara Govin</h1>
    <a class="btn-start js-btn-start"></a>
  </header>
  <div id="warning" class="modal fade">
    <div class="modal-dialog modal-sm">
      <div class="modal-content">
        <h2>Achtung</h2>
        <img src="assets/finger.gif" alt="finger" class="devices" />
        </br>
        <p><strong>Dieser interaktive Haiku reagiert auf Touchscreenbefehle.</strong></p>
        <p>Wir empfehlen Ihnen,</br>die Webseite auf Ihrem Mobiltelefon</br>oder Tablet zu besuchen.</p>
        </br>
        <p>Gute Reise !</p>
        <a class="continue">Weitermachen</a>
      </div>
    </div>
  </div>
  <section id="wrapper">
  </section>
  <aside id="gems">
    <span class="restart"><img src="assets/reload.png" alt="reload" /></span>
    <div class="logo"></div>
    <div class="center">
      <h4 class="season-share activate">Sie können Ihren Lieblingshaiku teilen!</h4>
      <h4 class="season-share">Sie haben keinen Haiku zum Teilen aufgesammelt.<br>Suchen sie in der Landschaft, wir haben sie versteckt...</h4>
      <div class="center-gems">
        <div id="gem1" class="gem" data-season="summer" data-x="245" data-y="2600" data-container="body" data-toggle="popover" data-placement="bottom">
          <div class="content">
            <ul class="social-share">
              <li class="fb" data-provider="facebook" data-haiku="%22Ich%20lasse%20mich%20nieder%20/%20Im%20Glanz%20von%20welkenden%20Bl%C3%A4ttern%22%20Santoka%20Taneda"></li>
              <li class="tw" data-provider="twitter" data-haiku="%22Ich%20lasse%20mich%20nieder%20/%20Im%20Glanz%20von%20welkenden%20Bl%C3%A4ttern%22%20via%20%40ONF%20und%20%40ARTEde"></li>
            </ul>
            <p>Ich lasse mich nieder
              <br>Im Glanz von welkenden Blättern.</p>
            <p class="author">Santoka Taneda</p>
          </div>
        </div>
        <div id="gem2" class="gem" data-season="autumn" data-x="100" data-y="1300" data-container="body" data-toggle="popover" data-placement="bottom">
          <div class="content">
            <ul class="social-share">
              <li class="fb" data-provider="facebook" data-haiku="%22In%20meiner%20Einsamkeit%20/%20Bin%20ich%20erwacht%20vom%20Klang%20/%20Der%20fallenden%20Eichel%22%20Ros%C3%A9ki"></li>
              <li class="tw" data-provider="twitter" data-haiku="%22In%20meiner%20Einsamkeit%20/%20Bin%20ich%20erwacht%20vom%20Klang%20/%20Der%20fallenden%20Eichel%22%20via%20%40ONF%20und%20%40ARTEde%20"></li>
            </ul>
            <p>In meiner Einsamkeit
              <br>Bin ich erwacht vom Klang
              <br>Der fallenden Eichel.</p>
            <p class="author">Roséki</p>
          </div>
        </div>
        <div id="gem3" class="gem" data-season="winter" data-x="20" data-y="1850" data-container="body" data-toggle="popover" data-placement="bottom">
          <div class="content">
            <ul class="social-share">
              <li class="fb" data-provider="facebook" data-haiku="%22Kein%20Himmel%20/%20Keine%20Erde%20-%20aber%20immer%20noch%20/%20Fallen%20Schneeflocken%22%20Hashin"></li>
              <li class="tw" data-provider="twitter" data-haiku="%22Kein%20Himmel%20/%20Keine%20Erde%20-%20aber%20immer%20noch%20/%20Fallen%20Schneeflocken%22%20via%20%40ONF%20und%20%40ARTEde"></li>
            </ul>
            <p>Kein Himmel
              <br>keine Erde – aber immer noch
              <br>fallen Schneeflocken.</p>
            <p class="author">Hashin</p>
          </div>
        </div>
        <div id="gem4" class="gem" data-season="spring" data-x="150" data-y="3520" data-container="html" data-toggle="popover" data-placement="bottom">
          <div class="content">
            <ul class="social-share">
              <li class="fb" data-provider="facebook" data-haiku="%22In%20dem%20Wasser,%20das%20/%20heut%20ich%20sch%C3%B6pfe,%20leuchtet%20schon%20/%20erster%20Fr%C3%BChlingsglanz%22%20Ringa%C3%AF"></li>
              <li class="tw" data-provider="twitter" data-haiku="%22In%20dem%20Wasser,%20das%20/%20heut%20ich%20sch%C3%B6pfe,%20leuchtet%20schon%20/%20erster%20Fr%C3%BChlingsglanz%22%20via%20%40ONF%20%40ARTEde"></li>
            </ul>
            <p>In dem Wasser, das
              <br>heut ich schöpfe, leuchtet schon
              <br>erster Frühlingsglanz!</p>
            <p class="author">Ringaï</p>
          </div>
        </div>
      </div>
      <div id="final">
      </div>
    </div>
  </aside>
  <ul id="bkgs" class="cb-slideshow">
    <li>
      <span class='bg_summer'></span>
    </li>
    <li><span class='bg_autumn'></span></li>
    <li><span class='bg_winter'></span></li>
    <li><span class='bg_spring'></span></li>
  </ul>
  <div id="landscape">
    <p>Drehen Sie Ihr Handy</p>
    <div><img src="assets/landscape_device.png" alt="landscape_device" /></div>
  </div>
  <script>
  var createjs = window;
  window.jQuery || document.write('<script src="js/vendor/jquery-1.11.1.min.js"><\/script>');
  </script>
  <script src="js/vendor/react.min.js"></script>
  <script src="js/vendor/preloadjs-0.4.1.min.js"></script>
  <script src="js/vendor/easeljs-0.7.1.min.js"></script>
  <script src="js/vendor/tweenjs-0.5.1.min.js"></script>
  <script src="js/vendor/soundjs-0.5.2.min.js"></script>
  <script src="js/vendor/hammer.min.js"></script>
  <script src="js/vendor/tooltip.js"></script>
  <script src="js/vendor/popover.js"></script>
  <script src="js/vendor/modal.js"></script>
  <script src="js/haiku.min.js"></script>
  <script>
  window.addEventListener("haiku_intro_completed", startHaiku);

  function startHaiku(e) {
    window.removeEventListener("haiku_intro_completed", startHaiku);
  }

  var HaikuComponent = React.createFactory(Haiku);


  function getURLParameter(name) {
    return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [, ""])[1].replace(/\+/g, '%20')) || null
  }

  if (getURLParameter('tribeca')) {
    $('.social-share').hide();
  }

  React.render(
    HaikuComponent(),
    document.getElementById('wrapper')
  );

  window.fbAsyncInit = function() {
    FB.init({
      appId: '805988352770010',
      xfbml: true,
      version: 'v2.2'
    });
  };

  (function(d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) {
      return;
    }
    js = d.createElement(s);
    js.id = id;
    js.src = "//connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
  }(document, 'script', 'facebook-jssdk'));
  </script>
</body>

</html>
