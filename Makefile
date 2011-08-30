site:
	expresso test/sitetemp.js

test:
	expresso test/*.test.js

docs:
	docco app.js
	docco lib/*.js

# use the ruby watchr gem to run tests 
# whenever a source/test file is modified
watch:
	watchr watching.rb

.PHONY: test docs watch
