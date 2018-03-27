/**
  Copyright 2018 Mazalearn
  */

#include <stdio.h>
#include <string.h>
#include <math.h>
#include <wchar.h>
#include <android/log.h>

#include <hb-ft.h>
#define LOG_LEVEL ANDROID_LOG_WARN
#define MAX_FONTS 5
#define FONT_FILE_PATH "c:/users/sridhar/git/complexscriptlayout/harfbuzz/jni/NotoSansDevanagari-Regular.ttf"

static hb_font_t **font = NULL;
static char fontFilePaths[MAX_FONTS][1000];
static hb_script_t script;
static FT_Library ft_library;

/**
 * initialize freetype library and fontface and language
 */
void jniInitialize(
    char* fontFilePath, char* language) {

    static FT_Face ft_face;
    FT_Error error;
    int languageLen;
    int i = 0;
    
    languageLen = strlen(language);

    if (font == NULL) {
    	error = FT_Init_FreeType(&ft_library); /* initialize library */
		if (error) {
		  __android_log_print(ANDROID_LOG_ERROR, "jniInitialize", "Error initializing FreeType library\n");
		  return;
		}
		font = (hb_font_t **)malloc(sizeof(hb_font_t *) * MAX_FONTS);
		for (i = 0; i < MAX_FONTS; i++) {
		  font[i] = NULL;
		  fontFilePaths[i][0] = '\0';
		}
		i = 0;
    } else {
    	for (i = 0; i < MAX_FONTS; i++) {
    		if (strlen(fontFilePaths[i]) == 0 || !strcmp(fontFilePaths[i], fontFilePath)) break;
    	}
    	if (strlen(fontFilePaths[i]) != 0) {
    		// Already allocated - initialization not required
  		    __android_log_print(LOG_LEVEL, "jniInitialize", "Already initialized %s\n", fontFilePath);
    		return;
    	}
    }
    strcpy(fontFilePaths[i], fontFilePath);
    __android_log_print(LOG_LEVEL, "jniInitialize", "Successfully initialized FreeType library\n");
    __android_log_print(LOG_LEVEL, "jniInitialize", "fontFilePath - %s\n", fontFilePath);

    error = FT_New_Face(ft_library, fontFilePath, 0, &ft_face); /* create face object */
    if (error == FT_Err_Unknown_File_Format) {
      __android_log_print(ANDROID_LOG_ERROR, "jniInitialize", "Font format is not supported\n");
      return;
    } else if (error) {
      __android_log_print(ANDROID_LOG_ERROR, "jniInitialize", "Font file not accessible");
      return;
    }

    font[i] = hb_ft_font_create(ft_face, NULL);
    __android_log_print(LOG_LEVEL, "jniInitialize", "Successfully created font-face object\n");

    //hb_buffer_set_unicode_funcs(buffer, hb_icu_get_unicode_funcs());
    //alternatively you can use hb_buffer_set_unicode_funcs(buffer, hb_glib_get_unicode_funcs());

    //hb_buffer_set_direction(buffer, HB_DIRECTION_LTR); /* or LTR */
    
    // Pick up script from http://unicode.org/iso15924/iso15924-codes.html
    script = hb_script_from_string (language, languageLen);    
}

/**
 * @return array of glyphs corresponding to unicode text
 */
wchar_t* jniGetGlyphsForText(
    char* fontFilePath, wchar_t* unicodeText) {

    int textLen;
    hb_buffer_t *buffer;
    int glyph_count;
    hb_glyph_info_t *glyph_info;
    hb_glyph_position_t *glyph_pos;
    wchar_t *glyphs;

    FT_UInt glyph_index;
    FT_Error error;

    int i, fontIdx;

    __android_log_print(LOG_LEVEL, "getGlyphsForText", "Entering");
	  for (fontIdx = 0; fontIdx < MAX_FONTS; fontIdx++) {
		  if (!strcmp(fontFilePaths[fontIdx], fontFilePath)) break;
    }
    if (fontIdx == MAX_FONTS) fontIdx = 0;
    __android_log_print(LOG_LEVEL, "getGlyphsForText", "fontFilePaths = %d %s\n", fontIdx, fontFilePaths[fontIdx]);
    if (font[fontIdx] == NULL) {
        __android_log_print(ANDROID_LOG_ERROR, "getGlyphsForText", "font is null %d\n", fontIdx);
    }

    /* Create a buffer for harfbuzz to use */
    buffer = hb_buffer_create();
    hb_buffer_set_script(buffer, script);

    /* Layout the text */
    __android_log_print(LOG_LEVEL, "getGlyphsForText", "Text being shaped = %hs\n", unicodeText);
    textLen = wcslen(unicodeText);
    for (i = 0; i < textLen; i++) {
       __android_log_print(LOG_LEVEL, "", ",%d %x", i, unicodeText[i]);
    }
    hb_buffer_add_utf16(buffer, unicodeText, textLen, 0, textLen);
    __android_log_print(LOG_LEVEL, "getGlyphsForText", "\nBefore HarfBuzz shape()\n");
    hb_shape(font[fontIdx], buffer, NULL, 0);
    __android_log_print(LOG_LEVEL, "getGlyphsForText", "After HarfBuzz shape()\n");

    glyph_count = hb_buffer_get_length(buffer);
    glyph_info = hb_buffer_get_glyph_infos(buffer, 0);
    glyph_pos = hb_buffer_get_glyph_positions(buffer, 0);

    glyphs = (wchar_t *) malloc( (glyph_count + 1) * sizeof(wchar_t));
    for (i = 0; i < glyph_count; i++) {
      glyph_index = glyph_info[i].codepoint;
      __android_log_print(LOG_LEVEL, "", ",%d %x", i, glyph_index);
      glyphs[i] = glyph_index;
    }
    glyphs[i]= 0; // terminating null char
    __android_log_print(LOG_LEVEL, "getGlyphsForText", "\nreleasing memory\n");

    hb_buffer_destroy(buffer);
    return glyphs;
}

int main(int argc, char **argv) {
   wchar_t unicodeText[] = {0x939,0x93f,0x902,0x926,0x940,0x20, 0x0};// "हिंदी "
   printf("Running...%hs\n", unicodeText);

   jniInitialize(FONT_FILE_PATH, "Deva");
   wchar_t* glyphs = jniGetGlyphsForText(FONT_FILE_PATH, unicodeText);
   printf("Expected = %s\nActual   = ", "0 23d ,1 3d ,2 25e ,3 2a ,4 25f ,5 3");
   for (int i = 0; i < wcslen(glyphs); i++) {
     printf("%d %x ,", i, glyphs[i]);
   }
   printf("\n");
}
