require 'watchr'

watch('test/(.*)\.js') {|t| system "make test"}
watch('src/(.*)\.js')  {|t| system "make test"}

