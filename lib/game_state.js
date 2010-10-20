/** Define the various state of a game
*/
var gameState	= {};

gameState.NONE		= 0;	// place holder, not really used
gameState.PRES_PAGE	= 1;	// presentation page
gameState.WAIT_PLAY	= 2;	// wait for the other player
gameState.GAME_READY	= 3;	// game is now ready and will begin shortly
gameState.BALL_READY	= 4;	// ball init aka will start moving shortly
gameState.BALL_MOVING	= 5;	// ball is moving, rackets too... aka the game is going on
gameState.BALL_EXITED	= 6;	// ball exited playground, score update, goto BALL_READY or GAME_OVER
gameState.GAME_OVER	= 7;	// game is over, either one player won, or the other disconnected

// export it via commonjs
module.exports	= gameState;