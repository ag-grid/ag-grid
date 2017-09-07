#!/usr/bin/env ruby

Dir.glob('src/*/*.php').each do |file|
    File.open(file, 'r') do |f|
        p f.read 
        exit 
    end
end
