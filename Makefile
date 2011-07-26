test:
	expresso test/*.test.js

docs:
	docco index.js
	docco lib/*.js


.PHONY: test docs
