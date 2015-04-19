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
  <!--[if lt IE 9]>
            <script src="//html5shiv.googlecode.com/svn/trunk/html5.js"></script>
            <script>window.html5 || document.write('<script src="js/vendor/html5shiv.js"><\/script>')</script> 
        <![endif]-->
<script id="script-haiku" data-haiku="2" src="http://<?php echo $cms_env; ?>.interactivehaiku.com/framework/js/haiku-onf.min.js"></script>
<meta property="og:locale" content="<?php echo $myHaiku->code; ?>"> 
<meta property="og:image" content="<?php echo $myHaiku->fbimage; ?>">
<meta property="og:title" content="<?php echo $myHaiku->title; ?>">
<meta property="og:description" content="<?php echo $myHaiku->share_fb; ?>">
<meta property="og:url" content="<?php echo $myHaiku->domain; ?>">
 <script>
  (function() {
  	setTimeout(function(){
  		switch(window.haiku_vars.lang){
  			case 'fr':
  			window.location.href = '/~marcheur/lemarcheurdesaison';
  			break;
  			case 'en':
  			window.location.href = '/~marcheur/seasonalstroller/';
  			break;
  			case 'de':
  			window.location.href = '/~marcheur/derwandererderjahreszeiten/';
  			break;
  		}
  	},1000);
   
	})();
 </script>
</head>
</html>