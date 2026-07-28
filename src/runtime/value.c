#include <stdlib.h>
#include <string.h>

#include "headers/value.h"


DjValue dj_null(void)
{
    DjValue value;

    value.type = DJ_NULL;

    return value;
}


DjValue dj_bool(int x)
{
    DjValue value;

    value.type = DJ_BOOL;
    value.value.boolean = x;

    return value;
}


DjValue dj_int(long x)
{
    DjValue value;

    value.type = DJ_INT;
    value.value.integer = x;

    return value;
}


DjValue dj_float(double x)
{
    DjValue value;

    value.type = DJ_FLOAT;
    value.value.number = x;

    return value;
}


DjValue dj_string(char* x)
{
    DjValue value;

    value.type = DJ_STRING;
    value.value.string = strdup(x);

    return value;
}
