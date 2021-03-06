<?php require_once 'common.php'; ?>
<!doctype html>
<!--[if lt IE 7 ]> <html lang="en" class="no-js ie6"> <![endif]-->
<!--[if IE 7 ]>    <html lang="en" class="no-js ie7"> <![endif]-->
<!--[if IE 8 ]>    <html lang="en" class="no-js ie8"> <![endif]-->
<!--[if IE 9 ]>    <html lang="en" class="no-js ie9"> <![endif]-->
<!--[if (gt IE 9)|!(IE)]><!--> <html lang="en" class="no-js"> <!--<![endif]-->
<head>
	<meta charset="UTF-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
	
	<title>Casual Encounters: The Game</title>
	<meta name="description" content="">
	<meta name="author" content="">
	
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	
	<link rel="shortcut icon" href="favicon.ico">
	<link rel="apple-touch-icon" href="apple-touch-icon.png">
	<link rel="stylesheet" href="css/style.css?v=2">
	<link rel="stylesheet" media="handheld" href="css/handheld.css?v=2">
	<link rel="stylesheet" type="text/css" href="css/custom-theme/jquery-ui-1.8.15.custom.css"  />	
	
	<script src="js/libs/modernizr-1.7.min.js"></script>
	<style type="text/css">	
		header {
			text-align: center;
		}
		header, #main, footer {
			width: 800px;
			margin: 0 auto;
		}
		input[type=text]:hover {  
				background-color:#ffff66;  
				border-color:#999999;  
		}
		form {
			margin:0 auto;
			width:500px;
			padding:14px;
		}
		.stylized h1 {
			font-size:14px;
			font-weight:bold;
			margin-bottom:8px;
		}
		.stylized p{
			font-size:11px;
			color:#666666;
			margin-bottom:20px;
			border-bottom:solid 1px #b7ddf2;
			padding-bottom:10px;
		}
		.stylized label{
			display:block;
			font-weight:bold;
			text-align:right;
			width:140px;
			float:left;
		}
		.stylized .small{
			color:#666666;
			display:block;
			font-size:11px;
			font-weight:normal;
			text-align:right;
			width:140px;
		}
		.stylized input[type='text'], .buttongroup {
			float:left;
			font-size:12px;
			padding:4px 2px;
			border:solid 1px #aacfe4;
			width:300px;
			margin:2px 0 20px 10px;
		}

		.stylized button{
			clear:both;
			margin-left:150px;
			width:125px;
			height:31px;
			background:#666666;
			text-align:center;
			line-height:31px;
			color:#FFFFFF;
			font-size:11px;
			font-weight:bold;
		}
		
		
	</style>
</head>
<body>
	<div id="container">
		<header>
			<img src="gs/header.png" />
		</header>

		<div id="main" role="main">

			<div id="main_nav"> <!-- Begin Tabs -->
			
				<ul>
					<li><a href="#play-now">Play now!</a></li>
					<li><a href="#what">What is this?</a></li>
					<li><a href="#who">Who made it?</a></li>
				</ul>
				
				<!-- Begin Play Now Form -->
				<div id="play-now">

					<form id="play" class="stylized" method="get" action="play.php">
						<h1>I'm ready to play!</h1>
						<p>Please provide names for up to three players and the cities and categories that you would like to use in your game.<br />
						<br />
						Confused?  Check out the "What is this?" tab!
						</p>
						
						<label>Player One*
						<span class="small">player one name</span>
						</label>
						<input type="text" name="players[]" class="required" value="Thing One" maxlength="10" />
						
						<label>Player Two
						<span class="small">player two name</span>
						</label>
						<input type="text" name="players[]" value="Thing Two" maxlength="10" />
						
						<label>Player Three
						<span class="small">player three name</span>
						</label>
						<input type="text" name="players[]"  maxlength="9" />
						
						<label>Cities
						<span class="small">which cities should be included in your game?</span>
						</label>
						<div class="buttongroup">
						<?php foreach($_CITIES as $city): ?>
						<input name="cities[]" value="<?php echo $city; ?>" type="checkbox" checked  /> <a target="_blank" href="http://<?php echo $city; ?>.craigslist.org/search/cas?hasPic=1"><?php echo ucfirst($city); ?></a><br />
						<?php endforeach; ?>
						</div>
						
						<label>Categories
						<span class="small">which categories do you want included in your game?</span>
						</label>
						<div class="buttongroup">
							<?php
							$search = array("4", "m", "w", "t", "ManWoman", "ManMan", "WomanWoman");
							$replace = array(" seeks ", "Man", "Woman", "Transexual", "Man & Woman", "Man & Man", "Woman & Woman");
							for($i=0; $i<count($_CATEGORIES); $i++)
							{
								$cat = $_CATEGORIES[$i];
								$label = str_replace($search, $replace, $cat);	
								$checked = ($i<5) ? "checked " : "";
								printf('<input name="categories[]" value="%s" type="checkbox" %s/> %s (%s)<br />', $cat, $checked, $label, $cat);
							}
							?>
						</div>
				
						<label>Rounds
						<span class="small">How many rounds in your game?</span>
						</label>
						<input type="text" name="rounds" value="10" />
						
						<button type="submit">Play!</button>
						<p>* required</p>
						<div class="spacer"></div>
						
					</form>
				</div>
				<!-- End Play Now Form -->
				
				<div id="what">
					<h1>What is this?</h1>
					<p>Casual Encounters: The Game is a web-based game that uses posts from <a href="http://newyork.craigslist.org/cas/">
					the popular Craigslist category, Casual Encounters</a>.</p>
				</div>
				
				<div id="who">
					<h1>Who made this?</h1>
					<p>
						<ul>
							<li>Jon Cohrs <a href="http://twitter.com/splnlss" target="blank">@splnlss</a></li>
							<li>Jeff Crouse <a href="http://twitter.com/jefftimesten" target="blank">@jefftimesten</a></li>
							<li>Aaron Meyers <a href="http://twitter.com/aarontweets" target="blank">@aarontweets</a></li>
							<li>Kaho Abe <a href="http://twitter.com/kahodesu" target="blank">@kahodesu</a></li>
							<li>Amelia Marzec <a href="http://twitter.com/ameliapractice" target="blank">@ameliapractice</a></li>
							<!--<li>Cassandra Gero</li>-->
						</ul>
					</p>
				</div>
				
			</div> <!-- End Tabs -->

		</div>

		<footer>

		</footer>
	</div>

	<script type="text/javascript" src="//ajax.googleapis.com/ajax/libs/jquery/1.6.2/jquery.min.js"></script>
	<script type="text/javascript" src="//ajax.googleapis.com/ajax/libs/jqueryui/1.8.16/jquery-ui.min.js"></script>

	<script>
	$(function() {
		$('#main_nav').tabs();
	});
	</script>
	
	<!--[if lt IE 7 ]>
	<script src="js/libs/dd_belatedpng.js"></script>
	<script> DD_belatedPNG.fix('img, .png_bg');</script>
	<![endif]-->

	<script>
		var _gaq=[['_setAccount','UA-74771-20'],['_trackPageview']];
		(function(d,t){var g=d.createElement(t),s=d.getElementsByTagName(t)[0];g.async=1;
		g.src=('https:'==location.protocol?'//ssl':'//www')+'.google-analytics.com/ga.js';
		s.parentNode.insertBefore(g,s)}(document,'script'));
	</script>
</body>
</html>