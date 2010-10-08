var http	= require('http');
var socket_io	= require('../vendor/socket.io-node');

/**
 * Represent a ball in the server
*/
var Ball	= function(ctor_opts){
	//////////////////////////////////////////////////////////////////////////
	//		class variables						//
	//////////////////////////////////////////////////////////////////////////
	// copy ctor_opts + set default values if needed
	var position	= ctor_opts.position	|| { x: 0.5, y: 0.5 };
	var vector	= ctor_opts.vector	|| { angle: Math.PI/5, speed: 0.03};

	//////////////////////////////////////////////////////////////////////////
	//		misc							//
	//////////////////////////////////////////////////////////////////////////
	var tickNow	= function(){
		//console.log("tick ball angle", vector.angle, "dy", Math.sin(vector.angle), "pos y", position.y)
		position.x	+= Math.cos(vector.angle) * vector.speed;
		position.y	+= Math.sin(vector.angle) * vector.speed;
	}
	/**
	 * return the game context for this player
	*/
	var gameCtx	= function(){
		return {
			x	: position.x,
			y	: position.y
		}
	}

	//////////////////////////////////////////////////////////////////////////
	//		run initialisation					//
	//////////////////////////////////////////////////////////////////////////
	// return public properties
	return {
		position	: position,
		vector		: vector,
		tickNow		: tickNow,
		gameCtx		: gameCtx
	}
}

/**
 * Represent a Player in the server
*/
var Player	= function Player(ctor_opts){
	//////////////////////////////////////////////////////////////////////////
	//		class variables						//
	//////////////////////////////////////////////////////////////////////////
	// copy ctor_opts + set default values if needed
	var ioClient	= ctor_opts.ioClient	|| console.assert(false);
	var side	= ctor_opts.side	|| console.assert(false);
	var position	= ctor_opts.position	|| { y: 0.5 };
	var score	= ctor_opts.score	|| 0;
	// sanity check - check parameters
	console.assert( ['left', 'right'].indexOf(side) != -1 );
	console.assert( typeof score == "number" );
	// private variables
	var lastInput	= null;

	//////////////////////////////////////////////////////////////////////////
	//		ctor/dtor						//
	//////////////////////////////////////////////////////////////////////////
	var ctor	= function(){
		ioClientCtor();
	}
	var dtor	= function(){
	}

	//////////////////////////////////////////////////////////////////////////
	//		ioClient						//
	//////////////////////////////////////////////////////////////////////////
	var ioClientCtor	= function(){
		ioClient.on('message', ioClientOnMessage);
		ioClient.on('disconnect', ioClientOnDisconnect);
	}
	var ioClientOnMessage	= function(msg_json){
		var message	= JSON.parse(msg_json);
		if( message.type == "userInput" ){
			lastInput	= message.data;
			position	= { y: message.data.y }
		}
	}
	var ioClientOnDisconnect= function(){
		console.assert(false);	// TODO 
	}
	var ioClientSend	= function(data){
		ioClient.send(JSON.stringify(data));
	}
	
	//////////////////////////////////////////////////////////////////////////
	//		misc							//
	//////////////////////////////////////////////////////////////////////////
	var incScore	= function(){
		score	+= 1;
	}
	var tickNow	= function(){
		
	}
	/**
	 * return the game context for this player
	*/
	var gameCtx	= function(){
		return {
			score	: score,
			y	: position.y
		}
	}
	
	var collideBall	= function(ball_old_pos, ball_new_pos){
		var limitLeft	= 0;
		var limitRight	= 1;
		var racketH	= 15*1/150;
		var limitRacketL= limitLeft  + (12*1/300);	// TODO those constant depends
		var limitRacketR= limitRight - (12*1/300);
		var limitRacketU= position.y - racketH/2;
		var limitRacketD= position.y + racketH/2;
		var o	= ball_old_pos;
		var n	= ball_new_pos;
		var i	= {
			x:	side === 'left' ? limitRacketL : limitRacketR,
			y:	null
		}
		
		// determine if ball is going thru the limitRacket
		var sign	= function(x){ return x < 0 ? -1 : 1 }
		if( sign(o.x-i.x) == sign(n.x-i.x) )	return false;

console.log("crossing racket line")


		// compute i.x
		// - basic equation OIx/ONx = OIy/ONy
		// - OIy = i.x - o.x = ONy*OIx/ONx
		i.y	= o.y + (n.y-o.y) * (i.x-o.x) / (n.x-o.x);

console.log("i.y", i.y, "limitRacketU", limitRacketU, "limitRacketD", limitRacketD)


		if( i.y < limitRacketU )	return false;
		if( i.y > limitRacketD )	return false;

console.log("collide")
//console.assert(false);
		
		// if all previous tests passed, return true
		return true;
	}

	//////////////////////////////////////////////////////////////////////////
	//		run initialisation					//
	//////////////////////////////////////////////////////////////////////////
	// call the contructor
	ctor();	
	// return public properties
	return {
		position	: position,
		side		: side,
		score		: score,
		incScore	: incScore,
		send		: ioClientSend,
		tickNow		: tickNow,
		gameCtx		: gameCtx,
		collideBall	: collideBall
	}
}

/**
 * @class Represent a game on the server
*/
var Game	= function Game(ctor_opts){
	//////////////////////////////////////////////////////////////////////////
	//		class variables						//
	//////////////////////////////////////////////////////////////////////////
	// copy ctor_opts + set default values if needed
	var tickPeriod	= ctor_opts.tickPeriod	|| 50.0;
	// private variables
	var LEFT	= 0;
	var RIGHT	= 1;
	var players	= [];

	//////////////////////////////////////////////////////////////////////////
	//		ctor/dtor						//
	//////////////////////////////////////////////////////////////////////////
	var ctor	= function(){
		ioClientCtor();
	}
	var dtor	= function(){
	}

	//////////////////////////////////////////////////////////////////////////
	//		misc							//
	//////////////////////////////////////////////////////////////////////////
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
	var ioClientAdd	= function(ioClient){
		console.log("add a client")
		// sanity check 
		console.assert( !isFull() );
		// create the new player
		var player	= new Player({
			ioClient	: ioClient,
			side		: playerCount() == LEFT ? 'left' : 'right'
		})
		// add the new player
		players.push(player);
		// if the game is now full, start it
		if( isFull() )	gameStart()
	}
	
	var gameStart	= function(){
		console.log("game start")
		// create the ball
		ball	= new Ball({});
		// notify both players that the game is starting
		players.forEach(function(player){
			player.send({
				type	: "alert",
				data	: "Connected"
			});
		});
		// start ticking		
		setTimeout(tickNow, tickPeriod)
	}
	
	var tickNow	= function(){
		//console.log("tick")
		// tick all players
		players.forEach(function(player){
			player.tickNow();
		});
		// save ball_old_pos
		var ball_old_pos	= {
			x	: ball.position.x,
			y	: ball.position.y
		};
		// tick the ball
		ball.tickNow();

		// start of init collision
		var limitUp	= 0;
		var limitDown	= 1;
		var limitLeft	= 0;
		var limitRight	= 1;
		var limitRacketL= limitLeft  + (12*1/300);	// TODO those constant depends
		var limitRacketR= limitRight - (12*1/300);
		if( ball.position.y < limitUp ){
			ball.position.y		= limitUp + (limitUp - ball.position.y)
			ball.vector.angle	= -ball.vector.angle;
			console.assert(ball.position.y);
		}else if( ball.position.y > limitDown ){
			ball.position.y		= limitDown + (limitDown - ball.position.y)
			ball.vector.angle	= -ball.vector.angle;
			console.assert(ball.position.y);
		}else if( ball.position.x > limitRight ){
			// TODO ball loose
		}else if( ball.position.x < limitLeft ){
			// TODO ball loose
		}
		
		// test collision with each player
		var ball_new_pos	= ball.position;
		if( players[LEFT].collideBall(ball_old_pos, ball_new_pos) ){
			ball.position.x		= limitRacketL + (limitRacketL - ball.position.x)
			ball.vector.angle	= Math.PI/2 + (Math.PI/2 - ball.vector.angle);
		} else if( players[RIGHT].collideBall(ball_old_pos, ball_new_pos) ){
			ball.position.x		= limitRacketR + (limitRacketR - ball.position.x)
			ball.vector.angle	= Math.PI/2 + (Math.PI/2 - ball.vector.angle);
		}

		

		// build gameCtx
		var gameCtx	= {
			players	: [
				players[0].gameCtx(),
				players[1].gameCtx(),
			],
			ball	: ball.gameCtx()
		}		
		// send gameCtx to each Player
		players.forEach(function(player){
			player.send({
				type	: 'gameCtx',
				data	: gameCtx
			});
		});
		
		// go on ticking
		// - FIXME isnt that uselessly drifting ?
		setTimeout(tickNow, tickPeriod);
	}

	//////////////////////////////////////////////////////////////////////////
	//		run initialisation					//
	//////////////////////////////////////////////////////////////////////////
	// return public properties
	return {
		ioClientAdd	: ioClientAdd,
		isFull		: isFull
	};
}


var games	= [];

var gamesFindNotFull	= function(){
	for(var i = 0; i < games.length; i++){
		var game	= games[i];
		if( game.isFull() === false )	return game;
	}
	var game	= new Game({});
	games.push(game);
	return game;
}

		
		
// socket.io listener to accept websocket
var server = http.createServer(function(req, res){});
server.listen(8080);
var io_listener	= socket_io.listen(server, {});
//var io_listener	= io.listen(server, {log : function(msg){}});		
io_listener.on('connection', function(client){
	var game	= gamesFindNotFull();
	game.ioClientAdd(client);
});