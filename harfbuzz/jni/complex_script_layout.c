/**
 * Copyright © 2012 Shiva Kumar H R
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a 
 * copy of this software and associated documentation files (the "Software"), 
 * to deal in the Software without restriction, including without limitation 
 * the rights to use, copy, modify, merge, publish, distribute, sublicense, 
 * and/or sell copies of the Software, and to permit persons to whom the 
 * Software is furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included 
 * in all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS 
 * OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL 
 * THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, 
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

#include <stdio.h>
#include <string.h>
#include <math.h>
#include <jni.h>
#include <android/log.h>

#include <hb-ft.h>

static hb_font_t *font;
static hb_script_t script;

/**
 * initialize freetype library and fontface and language
 */
void Java_com_badlogic_gdx_graphics_g2d_harfbuzz_ComplexScriptLayout_jniInitialize(
    JNIEnv* env, jobject thiz, jstring jFontFilePath, jstring jLanguage) {

    static FT_Library ft_library;
    static FT_Face ft_face;

    FT_Error error;
    const char* fontFilePath;
    const char* language;
    int languageLen;
    int fontFilePathLen;
    jboolean iscopy;

    fontFilePath = (*env)->GetStringUTFChars(env, jFontFilePath, 0);
    language = (*env)->GetStringUTFChars(env, jLanguage, 0);
    languageLen = (*env)->GetStringLength(env, jLanguage);

    error = FT_Init_FreeType(&ft_library); /* initialize library */
    if (error) {
      __android_log_print(6, "jniInitialize", "Error initializing FreeType library\n");
      return;
    }
    __android_log_print(2, "jniInitialize", "Successfully initialized FreeType library\n");
    __android_log_print(2, "jniInitialize: fontFilePath - ", fontFilePath);

    error = FT_New_Face(ft_library, fontFilePath, 0, &ft_face); /* create face object */
    (*env)->ReleaseStringUTFChars(env, jFontFilePath, fontFilePath);
    if (error == FT_Err_Unknown_File_Format) {
      __android_log_print(6, "jniInitialize", "Font format is not supported");
      return;
    } else if (error) {
      __android_log_print(6, "jniInitialize", "Font file not accessible");
      return;
    }
    __android_log_print(2, "jniInitialize", "Successfully created font-face object\n");

    font = hb_ft_font_create(ft_face, NULL);

    //hb_buffer_set_unicode_funcs(buffer, hb_icu_get_unicode_funcs());
    //alternatively you can use hb_buffer_set_unicode_funcs(buffer, hb_glib_get_unicode_funcs());

    //hb_buffer_set_direction(buffer, HB_DIRECTION_LTR); /* or LTR */
    
    // Pick up script from http://unicode.org/iso15924/iso15924-codes.html
    script = hb_script_from_string (language, languageLen);
    (*env)->ReleaseStringUTFChars(env, jLanguage, language);
    
    //hb_buffer_set_language(buffer, hb_language_from_string("ka"));
//    hb_font_destroy(font);
//    FT_Done_Face(ft_face);
//    FT_Done_FreeType(ft_library);

}

/**
 * @return array of glyphs corresponding to unicode text
 */
jintArray Java_com_badlogic_gdx_graphics_g2d_harfbuzz_ComplexScriptLayout_jniGetGlyphsForText(
    JNIEnv* env, jobject thiz, jstring jUnicodeText, jint jStart, jint jEnd) {

    hb_buffer_t *buffer;
    int glyph_count;
    hb_glyph_info_t *glyph_info;
    hb_glyph_position_t *glyph_pos;
    jintArray glyphs = NULL;
    int localArrayCopy[1];

    FT_UInt glyph_index;
    FT_Error error;

    jboolean iscopy;
    const jchar *text;
    int textLen, i;

    text = (*env)->GetStringChars(env, jUnicodeText, &iscopy);
    textLen = (*env)->GetStringLength(env, jUnicodeText);

    /* Create a buffer for harfbuzz to use */
    buffer = hb_buffer_create();
    hb_buffer_set_script(buffer, script);

    /* Layout the text */
    __android_log_print(2, "getGlyphsAfterShaping", "Text being shaped = %s\n", text);
    hb_buffer_add_utf16(buffer, text, textLen, jStart, jEnd);
    __android_log_print(2, "getGlyphsAfterShaping", "Before HarfBuzz shape()\n");
    hb_shape(font, buffer, NULL, 0);
    __android_log_print(2, "getGlyphsAfterShaping", "After HarfBuzz shape()\n");

    glyph_count = hb_buffer_get_length(buffer);
    glyph_info = hb_buffer_get_glyph_infos(buffer, 0);
    glyph_pos = hb_buffer_get_glyph_positions(buffer, 0);

    glyphs = (jintArray)(*env)->NewIntArray(env, glyph_count); 
    for (i = 0; i < glyph_count; i++) {
      glyph_index = glyph_info[i].codepoint;
      __android_log_print(2, "getGlyphsAfterShaping", "Glyph%d = %x", i, glyph_index);
      localArrayCopy[0] = (int) glyph_index;
      (*env)->SetIntArrayRegion(env, (jintArray) glyphs, (jsize) i, (jsize) 1, (jint *) localArrayCopy);
    }

    hb_buffer_destroy(buffer);

    (*env)->ReleaseStringChars(env, jUnicodeText, text);

    return glyphs;
}