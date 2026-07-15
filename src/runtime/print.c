#include <stdio.h>
#include "print.h"

typedef enum {
    DJ_NULL,
    DJ_BOOL,
    DJ_NUMBER,
    DJ_STRING
} DjValueType;

typedef struct {
    DjValueType type;

    union {
        double number;
        int boolean;
        char *string;
    } as;
} DjValue;

void dj_print(DjValue value) {
    switch (value.type) {

        case DJ_NUMBER:
            printf("%g\n", value.as.number);
            break;

        case DJ_STRING:
            printf("%s\n", value.as.string);
            break;

        case DJ_BOOL:
            printf(value.as.boolean ? "true\n" : "false\n");
            break;

        case DJ_NULL:
            printf("null\n");
            break;
    }
}
