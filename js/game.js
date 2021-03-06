/* -------------------------------------------------------------

	A Casual Encounters The Game object
	by Jeff Crouse and Aaron Meyers
	Aug 16 2011
	use wisely
	
------------------------------------------------------------- */

// The root game object.  Shouldn't really be created directly, rather through one of the 
// 3 subclasses (WebGLGame, CanvasGame, or HTMLGame)
Game = function(_players, _categories, _cities, _num_rounds)
{	
	_players = _players||[];
	console.log("Game constructor called with "+_players.length+" players");

	this.players= 			[];				// An array of player objects
	for(i in _players)
		this.players.push({name: _players[i], score: 0, has_guessed: false});
	
	
	this.categories= 		_categories||[];// An array of strings (m4m, w4m, etc)
	this.category=			null;			// The randomly chosen category
	
	this.cities=			_cities||[];	// An array of all cities
	this.city=				null;			// The city that the current round is from
	
	this.items=				[];				// Craigslist pages loaded from the API
	this.item_i=			null;			// The randomly chosen index (0-2)
	this.image=				new Image();	// An image loaded from the random item (items[item_i].image)

	// sounds
	this.applause= 			make_sound("applause");
	this.trombone= 			make_sound("sad_trombone");
	
	this.time_remaining= 	0;				// The time remaining in the current round
	this.round_length= 		20000;			// The duration of a single round in millis
	this.tick_interval=		10;
	this.xhr_ptr=			null;			// ajax pointer
	this.guesses= 			0;				// The number of guesses that have been made in the current round
	this.num_rounds= 		_num_rounds||0;	// Total number of founds
	this.round= 			0;				// The current round
	this.paused= 			false;			// Whether the game is currently paused
	
	// callback functions
	this.start_round_cb= 	null;
	this.end_round_cb= 		null;
	this.end_game_cb= 		null;
	this.update_cb=			null;

	// if there is only one player, activate 'click' mode
	if(this.players.length==1)
	{
		$("#answer-0").click(function(){ game.guess(0, 0); });
		$("#answer-1").click(function(){ game.guess(0, 1); });
		$("#answer-2").click(function(){ game.guess(0, 2); });
	}
}



// Game Functions
Game.prototype = 
{		
	// ------------------------------------------
	// Loads 3 'items' from api.php into 'items' var
	// start_round() -> ajax_success() -> image_loaded()
	start_round: function()
	{
		console.log("start_round()");
		
		// Reset the items array, the guess count, and the css colors
		this.reset_round();
	
		// Pick a new category
		var i = Math.floor( Math.random() * this.categories.length );
		this.category = this.categories[i];		
		
		$("#round_info").html("Loading "+this.category+' <img src="gs/ajax-loader.gif" />');
		
		// Make the call to the API
		this.xhr_ptr = $.ajax({
			url: "api.php",
			dataType: 'json',
			data: {'query': this.category, 'cities': this.cities },
			success: function(response) { game.ajax_success(response); }
		});
	},


	// ------------------------------------------
	update: function()
	{
		if(this.paused || this.time_remaining<=0) return;

		this.time_remaining -= this.tick_interval;
		
		var pct = (this.time_remaining / this.round_length)*100;
		$("#time_bar").css('width', pct+"%");
	
		if(this.time_remaining>0)
		{
			setTimeout("game.update()", this.tick_interval);
		}
		else
		{
			console.log("time is up");
			this.end_round();
		}
		
		if(this.update_cb!=null)
			this.update_cb();
	},

	
	// ------------------------------------------
	key_pressed: function( e ) 
	{
		var character = String.fromCharCode(e.keyCode ? e.keyCode : e.which);
		console.log("keyPress " + character);
		
		if(character==' ')
			this.toggle_paused();
		
		if(this.players.length==1) return;
		
		if(this.players.length==2) switch(character)
		{
			case 'q':	this.guess(0, 0);	break;
			case 'w': 	this.guess(0, 1);	break;
			case 'e':	this.guess(0, 2);	break;
			case 'i': 	this.guess(1, 0);	break;
			case 'o': 	this.guess(1, 1);	break;
			case 'p': 	this.guess(1, 2);	break;
		}

		if(this.players.length==3) switch(character)
		{
			case 'q':	this.guess(0, 0);	break;
			case 'w': 	this.guess(0, 1);	break;
			case 'e':	this.guess(0, 2);	break;
			case 'c':	this.guess(1, 0);	break;
			case 'v': 	this.guess(1, 1);	break;
			case 'b':	this.guess(1, 2);	break;
			case 'i': 	this.guess(2, 0);	break;
			case 'o': 	this.guess(2, 1);	break;
			case 'p': 	this.guess(2, 2);	break;
		}
	},
	
	
	// ------------------------------------------
	toggle_paused: function()
	{
		console.log("toggle_paused()");
		
		this.paused = !this.paused;
		if(this.paused) $("#round_info").html( "paused" );		
		else 
		{	
			$("#round_info").html("round "+this.round+" / "+this.num_rounds+": "+this.category+" - "+this.city);
			this.update();
		}
	},



	// ------------------------------------------
	// Parse response, set city, category, choose the correct answer,
	// load the image from that answer.
	// called from start_round()
	ajax_success: function(response)
	{
		// If we get a bad response, wait a second and try to load again
		if(response.error!=undefined || response.length!=3)
		{
			console.log("error from api. '"+response.error+"' trying again");
			setTimeout("game.start_round()", 1000);
			return;
		}
		else 
		{	
			// Save the response array to member var 'items'
			this.items = response;
			this.city = this.items[0].city;	// they all come from the same city, so just take the first
			console.log("api success: "+this.items.length+" items");

			// Choose a random item from the array
			// keep the index of the chosen item so that we can 
			// tell if a player chose the correct answer later
			this.item_i = Math.floor(Math.random()*3);
			console.log("correct answer is: "+this.item_i);
			

			this.image = new Image();
			// We have to make it a "local image" by using this php proxy
			this.image.src = "imgproxy.php?url="+this.items[this.item_i].image;
			console.log("loading image "+this.image.src);
			
			
			$(this.image).load(function(){
				game.image_loaded();
			}).error(function() { 		
				// Try again if $(image) didn't load properly
				console.log("error loading an image. trying again");
				setTimeout("game.start_round()", 1000);
			});	
		}
	},


	// ------------------------------------------
	// called from ajax_success() when image has loaded successfully
	// This finally kicks off the round
	image_loaded: function()
	{
		console.log("success loading "+this.image.src);

		// get rid of any 'load' function that has been bound
		// to the $(image) in previous rounds
		$(this.image).unbind('load');

		this.round++;
		
		// Fill the divs
		$("#round_info").html("round "+this.round+" / "+this.num_rounds+": "+this.category+" - "+this.city);
		for(var i=0; i<this.items.length; i++) 
			$("#answer-"+i).html(this.items[i].title);


		console.log("setting time_remaining to "+this.round_length);
		this.time_remaining = this.round_length;
		
		if(this.start_round_cb!=null)
			this.start_round_cb();
		
		this.update();
	},
	
	
	// ------------------------------------------
	// Resets player attributes and HTML stuff on page
	// Called from start_round() and reset_game()
	reset_round: function()
	{
		console.log("reset_round()");
		
		this.guesses=0;
		this.items.length=0;
		for(i in this.players)
		{
			$("#player-"+i+"-name").css('color', 'white');
			this.players[i].has_guessed = false;
		}
		for(i=0; i<3; i++)
		{
			$('#answer-'+i).css('color', 'white');
		}
	},

	
	// ------------------------------------------
	// Moves the image fully into place and stops the timer
	// Also starts a new round if needed, or ends the game
	// called from tick() and the key listener
	end_round: function()
	{
		console.log("end_round()");
		this.time_remaining=0;

		if(this.end_round_cb!=null)
			this.end_round_cb();

		if(this.round < this.num_rounds)
		{
			console.log("starting new round in 2 seconds");
			setTimeout('game.start_round()', 5000);
		}
		else this.end_game();
	},


	
	// ------------------------------------------
	// called from end_round()
	end_game: function()
	{
		console.log("end_game()");
		
		var winner = this.get_winner();
		if(this.end_game_cb!=null)
			this.end_game_cb( this.get_winner() );
	},
	
	
	// ------------------------------------------
	reset_game: function()
	{
		for(i in game.players)
		{
			game.players[i].score = 0;
			$("#player-"+i+"-score").html('0');
		}
		game.round=0;
		game.start_round();
	},
	
	
	// ------------------------------------------
	// called from end_game()
	get_winner: function()
	{
		var total=this.players[0].score;
		var best_score=this.players[0].score;
		var winner=0;
		
		for(i=1; i<this.players.length; i++)
		{
			total += this.players[i].score;
			if(this.players[i].score > best_score) 
			{
				best_score=this.players[i].score;
				winner=i;
			}
		}
		if(total==0) 
			return null;
		else 
			return this.players[winner];
	},
	
	
	
	// ------------------------------------------
	// p = player index, i = the guess
	// called from the key listener
	guess: function(p, i)
	{
		console.log("guess("+p+", "+i+")");
		
		// if the game is paused, or the player has already guessed in this round, 
		// or if a round isn't running, ignore
		if(this.paused) 
		{ 
			console.log("ignoring guess: paused");
			return;
		}
		if(this.players[p].has_guessed) 
		{ 
			console.log("ignoring guess: already guessed");
			return;
		}
		if(this.time_remaining<=0) 
		{ 
			console.log("ignoring guess: round is over");
			return;
		}
		/*
		if(this.round_length - this.time_remaining > this.round_length/10) 
		{ 
			console.log("ignoring guess: to soon");
			return;
		}
		*/
		
		if( this.guesses>=this.players.length ) 
			alert("ERROR! SANITY IS BROKEN!");
		
		this.players[p].has_guessed = true;
		
		if(this.item_i==i)	// correct guess
		{
			this.players[p].score += Math.ceil(this.time_remaining);
			console.log("player "+p+" correct. score is now "+this.players[p].score);
			$("#player-"+p+"-name").css('color', 'green');
			$("#player-"+p+"-score").html( this.players[p].score );
			$('#answer-'+i).css('color', 'green');
			this.end_round();
			
			if(this.applause.duration>0)
			{
				this.applause.currentTime=0;
				this.applause.play();
			}
			return;
		}
		else			// incorrect guess
		{
			this.players[p].score -= Math.ceil(this.time_remaining/2);
			console.log("player "+p+" wrong.  score is now "+this.players[p].score);
			$("#player-"+p+"-name").css('color', 'red');
			$("#player-"+p+"-score").html( this.players[p].score );
			$('#answer-'+i).css('color', 'red');
			
			if(this.trombone.duration>0)
			{
				this.trombone.currentTime=0;
				this.trombone.play();
			}
		}
		
		// If the player guessed correctly, or if both players have guessed, end the round.
		this.guesses++;
		console.log("guesses="+this.guesses);
		if(this.guesses>=this.players.length) this.end_round();
	},
	
};





