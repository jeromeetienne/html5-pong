/**
 * Class to handle finite state automata
 * - It is up to the caller to setup the States
 * - a state has a value and callbacks to enter/leave it
 * - thus this state machine is independant of the states and transition
 * - FIXME it will be much cleaner with a EventEmitter
*/
var StateMachine	= function StateMachine(){
	//////////////////////////////////////////////////////////////////////////
	//		class variables						//
	//////////////////////////////////////////////////////////////////////////
	// private variables
	var curState		= null;
	var enterFunctions	= {};
	var leaveFunctions	= {};

	//////////////////////////////////////////////////////////////////////////
	//		misc							//
	//////////////////////////////////////////////////////////////////////////
	/** Return the current state
	*/
	var current	= function(){
		return curState;
	}
	/** Goto a given state
	*/
	var goTo	= function(newState){
		// leave current state
		var leaveFunction	= leaveFunctions[curState];
		if(leaveFunction)	leaveFunction();
		// set newState
		curState	= newState;
		// enter the newState
		var enterFunction	= enterFunctions[curState];
		if(enterFunction)	enterFunction();
	}

	/** Register the enter/leave function for a given state
	*/
	var register	= function(state, enterFunction, leaveFunction){
		// sanity check - this state MUST NOT be already set
		console.assert( enterFunctions[state] === undefined );
		console.assert( leaveFunctions[state] === undefined );
		// set the state callbacks
		enterFunctions[state]	= enterFunction;
		leaveFunctions[state]	= leaveFunction;
	}
	/** Unregister the callback for this state
	*/
	var unRegister	= function(state){
		// sanity check - this state MUST NOT be already set
		console.assert( enterFunctions[state] !== undefined );
		console.assert( leaveFunctions[state] !== undefined );
		// delete the callbacks
		delete enterFunctions[state];
		delete leaveFunctions[state];
	}	
	
	//////////////////////////////////////////////////////////////////////////
	//		run initialisation					//
	//////////////////////////////////////////////////////////////////////////
	// return public properties
	return {
		register	: register,
		unRegister	: unRegister,
		current		: current,
		goTo		: goTo
	}
}

/**
 * Class method to create an object
 * - thus avoid new operator
*/
StateMachine.create	= function(){
	return new StateMachine();
}

// export it via commonjs
exports.create	= StateMachine.create;
