" Indentation for DarijaCode
" Language: DarijaCode
" Filenames: *.drj

if exists("b:did_indent")
    finish
endif

let b:did_indent = 1

setlocal indentexpr=DrjIndent(v:lnum)
setlocal indentkeys=!^F,o,O,e,},0},0)

function! DrjIndent(lnum) abort
    let line = getline(a:lnum)
    let prevlnum = prevnonblank(a:lnum - 1)
    
    if prevlnum == 0
        return 0
    endif
    
    let prevline = getline(prevlnum)
    let previndent = indent(prevlnum)
    
    " Decrease indent if current line starts with closing brace
    if line =~# '^\s*}'
        return previndent - shiftwidth()
    endif
    
    " Decrease indent if current line starts with closing bracket
    if line =~# '^\s*\]'
        return previndent - shiftwidth()
    endif
    
    " Decrease indent if current line starts with closing paren
    if line =~# '^\s*)'
        return previndent - shiftwidth()
    endif
    
    " Increase indent after opening brace
    if prevline =~# '{\s*$'
        return previndent + shiftwidth()
    endif
    
    " Increase indent after opening bracket
    if prevline =~# '\[\s*$'
        return previndent + shiftwidth()
    endif
    
    " Increase indent after opening paren
    if prevline =~# '(\s*$'
        return previndent + shiftwidth()
    endif
    
    " Maintain indent by default
    return previndent
endfunction
