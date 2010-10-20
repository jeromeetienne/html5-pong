/** Define the various type of msg exchanged between the client and server
*/
var msgType	= {};

msgType.NONE		= 0;	// place holder, not really used
msgType.GAME_CTX	= 1;	// a game context. data: TODOC
msgType.STATE_CHANGE	= 2;	// a change of state. data: { 'newState': value, 'args' : value }

// export it via commonjs
module.exports	= msgType;