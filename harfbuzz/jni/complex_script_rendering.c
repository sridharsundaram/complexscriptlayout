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

/**
 * @return number of glyphs in buffer
 */
int Java_com_mazalearn_harfbuzz_getGlyphsAfterShaping(JNIEnv* env, jobject thiz,
                jstring unicodeText, jint start, jint end, jobject lock) {
        FT_Library ft_library;
        FT_Face ft_face;

        hb_font_t *font;
        hb_buffer_t *buffer;
        int glyph_count;
        hb_glyph_info_t *glyph_info;
        hb_glyph_position_t *glyph_pos;
        hb_bool_t fail;
        jintArray glyphs;
        int localArrayCopy[1];

        FT_UInt glyph_index;
        FT_Error error;

        char* fontFilePath;
        jboolean iscopy;
        const jchar *text;
        int num_chars, i;

        fontFilePath = "/sdcard/Android/data/org.iisc.mile.indictext.android/Lohit-Kannada.ttf";
        text = (*env)->GetStringChars(env, unicodeText, &iscopy);
        num_chars = (*env)->GetStringLength(env, unicodeText);

        error = FT_Init_FreeType(&ft_library); /* initialize library */
        if (error) {
                __android_log_print(6, "getGlyphsAfterShaping", "Error initializing FreeType library\n");
                return;
        }
        __android_log_print(2, "getGlyphsAfterShaping", "Successfully initialized FreeType library\n");

        error = FT_New_Face(ft_library, fontFilePath, 0, &ft_face); /* create face object */
        if (error == FT_Err_Unknown_File_Format) {
                __android_log_print(6, "drawIndicText",
                                "The font file could be opened and read, but it appears that its font format is unsupported");
                return;
        } else if (error) {
                __android_log_print(6, "getGlyphsAfterShaping",
                                "The font file could not be opened or read, or it might be broken");
                return;
        }
        __android_log_print(2, "getGlyphsAfterShaping", "Successfully created font-face object\n");

        font = hb_ft_font_create(ft_face, NULL);

//???        error = FT_Set_Pixel_Sizes(ft_face, 0, charHeight); /* set character size */
        /* error handling omitted */
//        __android_log_print(2, "getGlyphsAfterShaping", "Successfully set character size to %d\n", charHeight);

        __android_log_print(2, "getGlyphsAfterShaping", "Text being shaped = %s\n", text);

        /* Create a buffer for harfbuzz to use */
        buffer = hb_buffer_create();

        //hb_buffer_set_unicode_funcs(buffer, hb_icu_get_unicode_funcs());
        //alternatively you can use hb_buffer_set_unicode_funcs(buffer, hb_glib_get_unicode_funcs());

        //hb_buffer_set_direction(buffer, HB_DIRECTION_LTR); /* or LTR */
        hb_buffer_set_script(buffer, HB_SCRIPT_KANNADA); /* see hb-unicode.h */
        //hb_buffer_set_language(buffer, hb_language_from_string("ka"));

        /* Layout the text */
        hb_buffer_add_utf16(buffer, text, num_chars, 0, num_chars);
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

        (*env)->ReleaseStringChars(env, unicodeText, text);
        hb_font_destroy(font);
        FT_Done_Face(ft_face);
        FT_Done_FreeType(ft_library);

        return glyph_count;
}