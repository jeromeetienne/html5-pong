# raw makefile
# - ease repeatitive operations

BREQUIRE_ROOT	= vendor/brequire

all:	clean brequire

server:
	(cd lib && node server.js)

brequire:
	$(BREQUIRE_ROOT)/bin/brequire lib/ public/brequired_lib

clean:
	rm -f public/brequired_lib/*.js
