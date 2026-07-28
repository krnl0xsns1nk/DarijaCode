#include <stdio.h>
#include "headers/print.h"

void dj_print(DjValue value) {
    switch (value.type) {
        case DJ_INT:
            printf("%ld\n", value.value.integer);
            break;

        case DJ_FLOAT:
            printf("%g\n", value.value.number);
            break;

        case DJ_STRING:
            printf("%s\n", value.value.string);
            break;

        case DJ_BOOL:
            printf(value.value.boolean ? "sa7i7\n" : "ghalat\n");
            break;

        case DJ_NULL:
            printf("walo\n");
            break;
    }
}
