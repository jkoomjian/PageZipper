#!/usr/local/bin/ruby -w

require 'fileutils'

@root = File.join(File.dirname(__FILE__), '..')

@src = "#{@root}/src"
@extension_icons = "extension_icons"
@ffext_src = "ffextension"
@chrome_src = "chrome_ext"
@output = "#{@root}/compiled"
@bookmarklet_name = "pagezipper_10.js"
@ext_name = "pagezipper.js"
@prod = ARGV[0] == "prod"
@jsFiles = [
                    "header.js",
                    "lib/jquery.js",
                    "pagezipper.js",
                    "compat.js",
                    "image.js",
                    "lib/jstoolkit.js",
                    "menu.js",
                    "nextlink.js",
                    "next_url_trials.js",
                    "next_url.js",
                    "page_loader_ajax.js",
                    "page_loader_iframe.js",
                    "page_loader.js",
                    "util.js",
                    ]

## ----- Helpers -----

##clean the output directory - don't delete .svn dir
def clean
  Dir.foreach(@output){|f|
    if (f  =~ /^\./) == nil
      puts "del " + f
      `rm -rf #{@output}/#{f}`
    else
      puts "skipping " + f
    end
  }
end

def build_pgzp(output, loader_file)
  ##for each js file, append to output
  @jsFiles.concat([loader_file]).each {|currFile|
    puts currFile

    #for now don't compile
    if @prod
      `java -jar yuicompressor-2.4.2.jar --nomunge #{@src}/#{currFile} >> #{output}`
    else
      `cat #{@src}/#{currFile} >> #{output}`
    end
    `echo "\n" >> #{output}`
  }
  @jsFiles.pop()
end

## ----- Build Bookmarklet -----
puts "Build Bookmarklet"
clean()
build_pgzp("#{@output}/#{@bookmarklet_name}", "loader_bookmarklet.js")

## ----- Build Chrome Extension -----
puts "Build Chrome Extension"
`cp -r #{@src}/#{@chrome_src} #{@output}`
`cp -r #{@src}/extension_* #{@output}/#{@chrome_src}`
build_pgzp("#{@output}/#{@chrome_src}/#{@ext_name}", "loader_chrome.js");

## ----- Build FF Extension -----
## copy the ff extension
## jQuery must be included separately for the FF reviewers
## also the FF reviewers don't want the source to be compressed
## :(
puts "Build Firefox Extension"
`cp -r #{@src}/#{@ffext_src} #{@output}`
`cp -r #{@src}/extension_* #{@output}/#{@ffext_src}`

# remove jquery from src files, and copy it over
jq = @jsFiles.slice!(1)
jq_filename = jq.split("/")[-1]  #only get the filename
`cp -r #{@src}/#{jq} #{@output}/#{@ffext_src}/#{jq_filename}`
@prod = false
build_pgzp("#{@output}/#{@ffext_src}/#{@ext_name}", "loader_firefox.js")