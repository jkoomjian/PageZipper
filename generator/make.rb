#!/usr/local/bin/ruby -w

require 'fileutils'

@src = "../src"
@ffext_src = "ffextension"
@chrome_src = "chrome_ext"
@output = "../compiled"
@bookmarklet_name = "pagezipper_10.js"
@ext_name = "pagezipper.js"
@prod = ARGV[0] == "prod"
@jsFiles = [
                    "header.js",
                    "jquery.js",
                    "pagezipper.js",
                    "compat.js",
                    "image.js",
                    "jstoolkit.js",
                    "menu.js",
                    "next_url.js",
                    "page_loader_ajax.js",
                    "page_loader_iframe.js",
                    "page_loader.js",
                    "util.js",
                    ]

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

##bookmarklet
puts "Build Bookmarklet"
clean()
build_pgzp("#{@output}/#{@bookmarklet_name}", "loader_bookmarklet.js")

##copy the ff extension
puts "Build Firefox Extension"
`cp -r #{@src}/#{@ffext_src} #{@output}`
build_pgzp("#{@output}/#{@ffext_src}/content/#{@ext_name}", "loader_firefox.js")

##copy chrome extension
puts "Build Chrome Extension"
`cp -r #{@src}/#{@chrome_src} #{@output}`
`cp -r #{@src}/#{@ffext_src}/skin/*.png #{@output}/#{@chrome_src}`
build_pgzp("#{@output}/#{@chrome_src}/#{@ext_name}", "loader_chrome.js");