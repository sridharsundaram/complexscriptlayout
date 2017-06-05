/***************************************************************************/
/*                                                                         */
/*  log.c                                                                */
/*                                                                         */
/*    Workaround for andoid log function in windows.                                        */
/*                                                                         */
/***************************************************************************/

#include <stdio.h>
#include <string.h>
#include <stdarg.h>
#include <android/log.h>

void __android_log_print(int level, char* scope, char *format, ...) {
	char c[1000];
	strcpy(c, scope);
	strcat(c, format);
	va_list argp;
	va_start(argp, format);
	vfprintf(stderr, c, argp);
	va_end(argp);
}
