/** Define the various type of msg exchanged between the client and server
*/
var msgType	= {};

msgType.NONE		= 'none';		// place holder, not really used
msgType.GAME_CTX	= 'gameCtx';		// a game context. data: TODOC
msgType.STATE_CHANGE	= 'stateChange';	// a change of state. data: { 'newState': value, 'args' : value }

// export it via commonjs
module.exports	= msgType;