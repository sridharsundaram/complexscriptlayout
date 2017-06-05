/*
 *  log.h
 *
 *  This is a dummy file, used to please windows build
 *  which do not have the android log function.
 *
 */
#include <stdarg.h>

void __android_log_print(int level, char* scope, char *format, ...);
