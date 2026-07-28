#ifndef DJ_VALUE_H
#define DJ_VALUE_H

typedef enum {
    DJ_NULL,
    DJ_BOOL,
    DJ_INT,
    DJ_FLOAT,
    DJ_STRING
} DjType;

typedef struct {
    DjType type;

    union {
        long integer;
        double number;
        int boolean;
        char *string;
    } value;
} DjValue;

DjValue dj_int(long x);
DjValue dj_float(double x);
DjValue dj_bool(int x);
DjValue dj_string(char *x);
DjValue dj_null(void);

#endif
