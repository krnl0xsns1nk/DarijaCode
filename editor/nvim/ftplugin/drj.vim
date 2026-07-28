" Filetype settings for DarijaCode
" Language: DarijaCode
" Filenames: *.drj

if exists("b:did_ftplugin")
    finish
endif

let b:did_ftplugin = 1

" Tab settings
setlocal expandtab
setlocal shiftwidth=4
setlocal tabstop=4
setlocal softtabstop=4

" Comment string
setlocal commentstring=//\ %s

" Text wrapping
setlocal textwidth=100

" Keyword completion
"setlocal iskeyword=a-z,A-Z,0-9,_

" Enable syntax highlighting
syntax on

" Set local options for better editing
setlocal autoindent
setlocal smartindent
