require 'watchr'

watch('test/(.*)\.js') {|t| system "make all"}
watch('lib/(.*)\.js')  {|t| system "make all"}

