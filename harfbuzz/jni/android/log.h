/*
 *  log.h
 *
 *  This is a dummy file, used to please windows build
 *  which do not have the android log function.
 *
 */
#include <stdarg.h>
#ifdef __cplusplus
extern "C" {
#endif

/*
 * Android log priority values, in ascending priority order.
 */
typedef enum android_LogPriority {
    ANDROID_LOG_UNKNOWN = 0,
    ANDROID_LOG_DEFAULT,    /* only for SetMinPriority() */
    ANDROID_LOG_VERBOSE,
    ANDROID_LOG_DEBUG,
    ANDROID_LOG_INFO,
    ANDROID_LOG_WARN,
    ANDROID_LOG_ERROR,
    ANDROID_LOG_FATAL,
    ANDROID_LOG_SILENT,     /* only for SetMinPriority(); must be last */
} android_LogPriority;

#ifdef __cplusplus
}
#endif

void __android_log_print(int level, char* scope, char *format, ...);
