require 'watchr'

watch('test/(.*)\.js') {|t| system "make test"}
watch('lib/(.*)\.js')  {|t| system "make test"}

