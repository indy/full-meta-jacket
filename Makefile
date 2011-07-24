docs:
	docco index.js
	docco lib/*.js

test:
	expresso test/*.test.js

.PHONY: test docs
