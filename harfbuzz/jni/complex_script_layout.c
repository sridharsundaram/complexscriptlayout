/**
  Copyright 2013 Mazalearn
  */

#include <stdio.h>
#include <string.h>
#include <math.h>
#include <jni.h>
#include <android/log.h>

#include <hb-ft.h>
#define LOG_LEVEL ANDROID_LOG_WARN
#define MAX_FONTS 5
static hb_font_t **font = NULL;
static hb_direction_t *direction = NULL;
static char fontFilePaths[MAX_FONTS][1000];
static hb_script_t script;
static JNIEnv* jenv;
static jobject jobj;

/**
 * initialize freetype library and fontface and language
 */
JNIEXPORT void JNICALL Java_com_badlogic_gdx_graphics_g2d_freetype_ComplexScriptLayout_jniInitialize(
    JNIEnv* env, jobject thiz, jlong face, jstring jFontFilePath, jstring jLanguage) {
    jenv = env;
    jobj = thiz;

    static FT_Face ft_face;
    FT_Error error;
    char* fontFilePath;
    const char* language;
    int languageLen;
    int i = 0;
    
    fontFilePath = (*env)->GetStringUTFChars(env, jFontFilePath, 0);
    language = (*env)->GetStringUTFChars(env, jLanguage, 0);
    languageLen = (*env)->GetStringLength(env, jLanguage);

    if (font == NULL) {
		font = (hb_font_t **)malloc(sizeof(hb_font_t *) * MAX_FONTS);
		for (i = 0; i < MAX_FONTS; i++) {
		  font[i] = NULL;
		  fontFilePaths[i][0] = '\0';
		}
		i = 0;
		direction = (hb_direction_t *) malloc(sizeof(hb_direction_t) * MAX_FONTS);
    } else {
    	for (i = 0; i < MAX_FONTS; i++) {
    		if (strlen(fontFilePaths[i]) == 0 || !strcmp(fontFilePaths[i], fontFilePath)) break;
    	}
    	if (strlen(fontFilePaths[i]) != 0) {
    		// Already allocated - initialization not required
  		    __android_log_print(LOG_LEVEL, "jniInitialize", "Already initialized %s\n", fontFilePath);
    	    (*env)->ReleaseStringUTFChars(env, jLanguage, language);
    	    (*env)->ReleaseStringUTFChars(env, jFontFilePath, fontFilePath);
    		return;
    	}
    }
    strcpy(fontFilePaths[i], fontFilePath);
    __android_log_print(LOG_LEVEL, "jniInitialize", "Successfully initialized FreeType library\n");
    __android_log_print(LOG_LEVEL, "jniInitialize", "fontFilePath - %s\n", fontFilePath);

    ft_face = (FT_Face) face;
    font[i] = hb_ft_font_create(ft_face, NULL);
    direction[i] = !strcmp("Arab", language) ? HB_DIRECTION_RTL : HB_DIRECTION_LTR;
    __android_log_print(LOG_LEVEL, "jniInitialize", "language = %s direction = %d\n", language, direction[i]);
    __android_log_print(LOG_LEVEL, "jniInitialize", "Successfully created font-face object\n");

    //hb_buffer_set_unicode_funcs(buffer, hb_icu_get_unicode_funcs());
    //alternatively you can use hb_buffer_set_unicode_funcs(buffer, hb_glib_get_unicode_funcs());

    //hb_buffer_set_direction(buffer, HB_DIRECTION_LTR); /* or LTR */
    
    // Pick up script from http://unicode.org/iso15924/iso15924-codes.html
    script = hb_script_from_string (language, languageLen);
    (*env)->ReleaseStringUTFChars(env, jLanguage, language);
    (*env)->ReleaseStringUTFChars(env, jFontFilePath, fontFilePath);
    
    //hb_buffer_set_language(buffer, hb_language_from_string("ka"));
//    hb_font_destroy(font);
//    FT_Done_Face(ft_face);
//    FT_Done_FreeType(ft_library);

}
/**
 * @return array of glyphs corresponding to unicode text
 */
JNIEXPORT jintArray JNICALL Java_com_badlogic_gdx_graphics_g2d_freetype_ComplexScriptLayout_jniGetGlyphsForText(
    JNIEnv* env, jobject thiz, jstring jFontFilePath, jstring jUnicodeText) {

	jenv = env;
	jobj = thiz;

    hb_buffer_t *buffer;
    int glyph_count;
    hb_glyph_info_t *glyph_info;
    jintArray glyphs = NULL;
    int localArrayCopy[1];
    const char* fontFilePath;

    FT_UInt glyph_index;
    FT_Error error;

    jboolean iscopy;
    const jchar *text;
    int textLen, i, fontIdx;

    __android_log_print(LOG_LEVEL, "getGlyphsForText", "Entering");
    fontFilePath = (*env)->GetStringUTFChars(env, jFontFilePath, 0);
	  for (fontIdx = 0; fontIdx < MAX_FONTS; fontIdx++) {
		  if (!strcmp(fontFilePaths[fontIdx], fontFilePath)) break;
    }
    if (fontIdx == MAX_FONTS) fontIdx = 0;
    __android_log_print(LOG_LEVEL, "getGlyphsForText", "fontFilePaths = %d %s\n", fontIdx, fontFilePaths[fontIdx]);
    if (font[fontIdx] == NULL) {
        __android_log_print(ANDROID_LOG_ERROR, "getGlyphsForText", "font is null %d\n", fontIdx);
    }
    text = (*env)->GetStringChars(env, jUnicodeText, &iscopy);
    textLen = (*env)->GetStringLength(env, jUnicodeText);

    /* Create a buffer for harfbuzz to use */
    buffer = hb_buffer_create();
    hb_buffer_set_script(buffer, script);
    hb_buffer_set_direction(buffer, direction[fontIdx]);

    /* Layout the text */
    __android_log_print(LOG_LEVEL, "getGlyphsForText", "Text being shaped = %s\n", text);
    for (i = 0; i < textLen; i++) {
       __android_log_print(LOG_LEVEL, "", ",%d %x", i, text[i]);
    }
    hb_buffer_add_utf16(buffer, text, textLen, 0, textLen);
    __android_log_print(LOG_LEVEL, "getGlyphsForText", "\nBefore HarfBuzz shape()\n");
    hb_shape(font[fontIdx], buffer, NULL, 0);
    __android_log_print(LOG_LEVEL, "getGlyphsForText", "After HarfBuzz shape()\n");

    glyph_count = hb_buffer_get_length(buffer);
    glyph_info = hb_buffer_get_glyph_infos(buffer, 0);

    glyphs = (jintArray)(*env)->NewIntArray(env, glyph_count);
    for (i = 0; i < glyph_count; i++) {
      glyph_index = glyph_info[i].codepoint;
      __android_log_print(LOG_LEVEL, "", ",%d %x", i, glyph_index);
      localArrayCopy[0] = (int) glyph_index;
      (*env)->SetIntArrayRegion(env, glyphs, (jsize) i, (jsize) 1, (jint *) localArrayCopy);
    }
    __android_log_print(LOG_LEVEL, "getGlyphsForText", "\nreleasing memory\n");

    hb_buffer_destroy(buffer);

    (*env)->ReleaseStringChars(env, jUnicodeText, text);
    (*env)->ReleaseStringChars(env, jFontFilePath, fontFilePath);
    // Delete local refs
    //(*env)->DeleteLocalRef(env, glyphs);
    return glyphs;
}

#ifndef IOS
FT_Error FT_Load_Glyph (FT_Face ft_face, FT_UInt glyph_index, FT_Int32 load_flags) {
    jclass class = (*jenv)->GetObjectClass(jenv, jobj);

    if (class != NULL) {

        jmethodID loadGlyph = (*jenv)->GetMethodID(jenv, class, "loadGlyph", "(II)Z");
        if (loadGlyph == NULL) {
            __android_log_print(LOG_LEVEL, "getGlyphsForText", "\nCould not find method loadGlyph\n");
            return 0;
        }
        return (*jenv)->CallBooleanMethod(jenv, jobj, loadGlyph, glyph_index, load_flags);
    }
    return 0;
};

FT_UInt FT_Get_Char_Index(FT_Face ft_face, FT_ULong unicode) {
    jclass class = (*jenv)->GetObjectClass(jenv, jobj);

    if (class != NULL) {

        jmethodID getCharIndex = (*jenv)->GetMethodID(jenv, class, "getCharIndex", "(I)I");
        if (getCharIndex == NULL) {
            __android_log_print(LOG_LEVEL, "getGlyphsForText", "\nCould not find method getCharIndex\n");
            return 0;
        }
        return (*jenv)->CallIntMethod(jenv, jobj, getCharIndex, unicode);
    }
    return 0;
};

void FT_Get_Advance(FT_Face ft_face, FT_UInt glyph_index, FT_Int32 load_flags, FT_Fixed *padvance) {
    jclass class = (*jenv)->GetObjectClass(jenv, jobj);

    if (class != NULL) {

        jmethodID getAdvance = (*jenv)->GetMethodID(jenv, class, "getAdvance", "(II)I");
        if (getAdvance == NULL) {
            __android_log_print(LOG_LEVEL, "getGlyphsForText", "\nCould not find method getAdvance\n");
            return;
        }
        *padvance = (*jenv)->CallIntMethod(jenv, jobj, getAdvance, glyph_index, load_flags);
    }
    return;
}

// Dummy stubs - never used for our purposes

void FT_Load_Sfnt_Table() {}
FT_UInt FT_Get_Name_Index(FT_Face face, FT_String*  glyph_name) { return 0;}
FT_Error FT_Get_Glyph_Name(FT_Face face, FT_UInt glyph_index, FT_Pointer buffer, FT_UInt buffer_max) {return 0;}
FT_Error FT_Get_Kerning(FT_Face face, FT_UInt left_glyph, FT_UInt right_glyph, FT_UInt kern_mode, FT_Vector *akerning) {return 0;}
FT_Error FT_New_Memory_Face(FT_Library library, const FT_Byte* file_base, FT_Long file_size, FT_Long face_index, FT_Face *aface) {return 0;}
FT_Error FT_Select_Charmap(FT_Face face, FT_Encoding encoding) {return 0;}
FT_Error FT_Set_Char_Size(FT_Face face, FT_F26Dot6 char_width, FT_F26Dot6 char_height, FT_UInt horz_resolution, FT_UInt vert_resolution) {return 0;}
FT_Error FT_Done_Face(FT_Face face) {return 0;}
FT_Error FT_Init_FreeType(FT_Library *alibrary) {return 0;}
FT_Error FT_Done_FreeType(FT_Library library) {return 0;}

#endif