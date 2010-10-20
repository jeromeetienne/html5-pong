/** Define the various state of a game
*/
var gameState	= {};

gameState.NONE		= 'none';		// place holder, not really used
gameState.PRES_PAGE	= 'presPage';		// presentation page
gameState.GAME_READY	= 'gameReady';		// game is now ready and will begin shortly
gameState.BALL_READY	= 'ballReady';		// ball init aka will start moving shortly
gameState.BALL_MOVING	= 'ballMoving';		// ball is moving, rackets too... aka the game is going on
gameState.BALL_EXITED	= 'ballExisted';	// ball exited playground, score update, goto BALL_READY or GAME_OVER
gameState.GAME_OVER	= 'gameOver';		// game is over, either one player won, or the other disconnected

// export it via commonjs
module.exports	= gameState;