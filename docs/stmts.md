printStmt:
        kteb("value")
        kteb(value)
variables:
        dir user = "krnl0xsns1nk"
        khli name = "krnl0xsns1nk"
        user = "other"
        name = "username" // error
        _
        dir user: text = "username"
        dir username := "text"
        khli age: ra9m = 21
        khli year := 2005
        user = 21; age = 20; age = "user" // error
        username = 1; year = "text"; year = 2001 // error
types:
        number: ra9m
        string: text


