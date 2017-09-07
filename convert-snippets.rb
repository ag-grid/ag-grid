#!/usr/bin/env ruby

Dir.glob('src/*/*.php').each do |file|

    puts "converting #{file}\n"

    contents = File.read(file)

    contents.gsub!(/<span class="codeComment">(.+)?<\/span>/, '\1')
    contents.gsub!(/<pre(?: ng-non-bindable)?>\s?(.+?)\s?<\/pre>/m) do |match|
        snippet = $1

        snippet.gsub!(/<(\/?)code>/, '')
        snippet.gsub!(/</, '&lt;')
        snippet.gsub!(/>/, '&gt;')

        "<snippet>\n#{snippet}</snippet>"
    end

    File.open(file, 'w') do |f|
        f.write contents
    end
end
