#import
s/^@import ['"][\.A-z0-9\-]+["']$/&;/

#variables
s/\{([A-z-]+)\}/#{$\1}/

# add semicolumns
s/^(\s{4}+[A-z\-]+:?)\s(["\(\) #,\.\%A-z0-9-]+)(\s!important)?(\s+\/\/.+)?$/\1: \2\3;\4/

# rule
s/^(\s{4}+)?(@keyframes )?[\{\}#$:\(\)\.A-z0-9\-]+(\s[\.A-z0-9\-]+)+?$/& {/

# nested rule
s/^\s{4,8}$/}/

# bogus, close the starter
# s/^$/}/

# variables 
# s/\sag-/ $ag-/

s/(ag-.+) = (.+)/$\1: \2;/
