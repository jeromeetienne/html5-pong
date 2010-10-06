var http	= require('http');
var socket_io	= require('../vendor/socket.io-node');


var Ball	= function(ctor_opts){
	//////////////////////////////////////////////////////////////////////////
	//		class variables						//
	//////////////////////////////////////////////////////////////////////////
	// copy ctor_opts + set default values if needed
	var position	= ctor_opts.position	|| { x: 0.5, y: 0.5 };
	var speed	= ctor_opts.speed	|| 0;
	var angle	= ctor_opts.angle	|| 0;

	//////////////////////////////////////////////////////////////////////////
	//		run initialisation					//
	//////////////////////////////////////////////////////////////////////////
	// return public properties
	return {
		position	: position,
		speed		: speed,
		angle		: angle
	}
}


var Player	= function(ctor_opts){
	//////////////////////////////////////////////////////////////////////////
	//		class variables						//
	//////////////////////////////////////////////////////////////////////////
	// copy ctor_opts + set default values if needed
	var side	= ctor_opts.side	|| console.assert(false);
	var position	= ctor_opts.position	|| { y: 0.5 };
	var score	= ctor_opts.score	|| 0;
	// sanity check - check parameters
	console.assert( ['left', 'right'].indexOf(side) != -1 );
	console.assert( typeof score == "number" );
	// private variable
	var position	= null;
	var lastInput	= null;

	//////////////////////////////////////////////////////////////////////////
	//		misc							//
	//////////////////////////////////////////////////////////////////////////
	var incScore	= function(){
		score	+= 1;
	}

	var setInput= function(newInput){
		// update lastUserInput
		lastInput	= newInput;
	}

	//////////////////////////////////////////////////////////////////////////
	//		run initialisation					//
	//////////////////////////////////////////////////////////////////////////
	// return public properties
	return {
		position	: position,
		side		: side,
		score		: score,
		incScore	: incScore,
		setInput	: setInput
	}
}

/**
 * @class Represent a game on the server
*/
var Game	= function(){
	var LEFT	= 0;
	var RIGHT	= 1;
	var players	= [];

	/**
	 * Return true if this game isFull
	*/
	var isFull	= function(){
		return playerCount() == 2;	
	}
	/**
	 * Return the number of players
	*/
	var playerCount	= function(){
		return players.length;
	}
	/**
	 * Add a new player
	*/
	var playerAdd	= function(io_client){
		// sanity check 
		console.assert( !isFull() );
		var playerNum	= players.length;
		players.push(io_client);
		return playerNum;
	}
	
	return {
		playerAdd	: playerAdd,
		isFull		: isFull
	};
}


var games	= [];

var gamesFindNotFull	= function(){
	for(var i = 0; i < games.length; i++){
		var game	= games[i];
		if( game.isFull() === false )	return game;
	}
	var game	= new Game();
	games.push(game);
	return game;
}

		
var server = http.createServer(function(req, res){});
server.listen(8080);
		
// socket.io, I choose you
// simplest chat application evar
// options= {log : function(msg){}}
var io_listener	= socket_io.listen(server, {});
//var io_listener	= io.listen(server, {log : function(msg){}});
		
io_listener.on('connection', function(client){
	console.log("got client id", client.sessionId);
	client.send(JSON.stringify("prout"));
	
	var game	= gamesFindNotFull();
	var playerNum	= game.playerAdd(client);
	
	client.send(JSON.stringify({
		type:	'connect',
		data:	{
			playerNum	: playerNum
		}
	}))
	

	client.on('message', function(message){
		console.log("sessionId", client.sessionId, "msg", message);
	});

	client.on('disconnect', function(){
		client.broadcast({ announcement: client.sessionId + ' disconnected' });
	});
});