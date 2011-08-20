site:
	expresso test/sitetemp.js

test:
	expresso test/*.test.js

temptest:
	expresso test/site.test.js

temp:
	expresso test/metadata2.test.js

docs:
	docco index.js
	docco lib/*.js

# use the ruby watchr gem to run tests 
# whenever a source/test file is modified
watch:
	watchr watching.rb

.PHONY: test docs watch
