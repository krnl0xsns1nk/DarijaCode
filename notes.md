





while (not EOF)
    char = current()
    1. Are we inside a string?
       Yes -> keep reading until the closing "
             emit STRING
             continue
    2. Is this whitespace?
       Yes -> finish any pending word
             advance
             continue
    3. Is this a symbol?
       Yes -> finish any pending word
             emit symbol
             advance
             continue
    4. Is this a letter?
       Yes -> append to current word
             advance
             continue
    5. Is this a digit?
       Yes -> append to current number
             advance
             continue
    6. Otherwise
       Error: unknown character
