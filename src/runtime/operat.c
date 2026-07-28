#include "headers/operat.h"

DjValue dj_add(DjValue a, DjValue b){
    DjValue result;

    if (a.type == DJ_INT && b.type == DJ_INT) {
        result.type = DJ_INT;
        result.value.integer = a.value.integer + b.value.integer;
        return result;
    }

    result.type = DJ_NULL;
    return result;
}
