" Vim syntax file for DarijaCode
" Language: DarijaCode
" Filenames: *.drj

if exists("b:current_syntax")
    finish
endif

let b:current_syntax = "drj"

" Keywords
syntax keyword drjKeyword dir khli fn raj3 rj3
syntax keyword drjKeyword ila awla wla mahd dwr
syntax keyword drjKeyword qta3 kml class dirFlblasa
syntax keyword drjKeyword this public private
syntax keyword drjKeyword sadr sadrF jib mn
syntax keyword drjKeyword jrb chd sf
syntax keyword drjKeyword naw3 jdid wratMn tabit
syntax keyword drjKeyword st3ml dalla qabl
syntax keyword drjKeyword kteb qra

" Boolean values (both JS style and Arabic style)
syntax keyword drjBoolean Sa7i7 ghalat

" Built-in types
syntax keyword drjType ra9m nass tona2i khawi
syntax keyword drjType walo mm3rofch

" Built-in functions
syntax keyword drjBuiltin toul qt3 majuscil minuscil chad
syntax keyword drjBuiltin abs sqrt expo s7i7 achari
syntax keyword drjBuiltin len zid hyd rtab qlb
syntax keyword drjBuiltin kaml

" Single line comments
"
"
syntax match drjComment "//.*$" contains=drjTodo containedin=ALL
syntax region drjComment start="/\*" end="\*/" contains=drjTodo containedin=ALL



"syntax match drjComment "//.*$" contains=drjTodo

" Multi-line comments
"syntax region drjComment start="/\*" end="\*/" contains=drjTodo

" TODO and FIXME in comments
syntax keyword drjTodo TODO FIXME XXX contained

" String literals - double quotes
syntax region drjString start='"' end='"' skip='\\"' contains=drjEscape

" String literals - single quotes
syntax region drjString start="'" end="'" skip="\\'" contains=drjEscape

" Template strings - backticks
syntax region drjTemplate start='`' end='`' contains=drjTemplateVar,drjEscape

" Template variables ${...}
syntax region drjTemplateVar start='${' end='}' contained

" Escape sequences
syntax match drjEscape "\\[ntr\\\"']" contained

" Numbers - integers and floats
syntax match drjNumber "\<\d\+\>"
syntax match drjNumber "\<\d\+\.\d*\>"
syntax match drjNumber "\<\.\d\+\>"

" Operators
syntax match drjOperator "+"
syntax match drjOperator "-"
syntax match drjOperator "\*"
syntax match drjOperator "/"
syntax match drjOperator "%"
syntax match drjOperator "\*\*"
syntax match drjOperator "="
syntax match drjOperator "=="
syntax match drjOperator "!="
syntax match drjOperator "<"
syntax match drjOperator ">"
syntax match drjOperator "<="
syntax match drjOperator ">="
syntax match drjOperator "&&"
syntax match drjOperator "||"
syntax match drjOperator "!"
syntax match drjOperator ":="
syntax match drjOperator "+="
syntax match drjOperator "-="
syntax match drjOperator "\*="
syntax match drjOperator "/="
syntax match drjOperator "++"
syntax match drjOperator "--"

" Delimiters
syntax match drjDelimiter "("
syntax match drjDelimiter ")"
syntax match drjDelimiter "{"
syntax match drjDelimiter "}"
syntax match drjDelimiter "\["
syntax match drjDelimiter "\]"
syntax match drjDelimiter ","
syntax match drjDelimiter "\."
syntax match drjDelimiter ":"
syntax match drjDelimiter ";"

" Function declarations
syntax match drjFunction "\<dalla\s\+\w\+\s*(" contains=drjKeyword

" Define highlights
highlight link drjKeyword Keyword
highlight link drjBoolean Boolean
highlight link drjType Type
highlight link drjBuiltin Function
highlight link drjComment Comment
highlight link drjTodo Todo
highlight link drjString String
highlight link drjTemplate String
highlight link drjTemplateVar PreProc
highlight link drjEscape SpecialChar
highlight link drjNumber Number
highlight link drjOperator Operator
highlight link drjDelimiter Delimiter
