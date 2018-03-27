var ft_lib = {
  FT_Load_Glyph: function ($face, $glyph, $load_flags) {
                    return !!Module._c_Face_loadGlyph($face, $glyph, $load_flags);
                  },

  FT_Get_Char_Index: function(face, unicode) { 
                   return Module._c_Face_getCharIndex(face, unicode); 
                  },
  
  FT_Get_Advance: function (face, glyph, flags, valptr) {
                   var FT_LOAD_VERTICAL_LAYOUT = 1 << 4;
				    _FT_Load_Glyph(face, glyph, flags);
				    var g = Module._c_Face_getGlyph(face);
				    var $$0 = 0;
				    if (flags & FT_LOAD_VERTICAL_LAYOUT) {
				      $$0 = (Module._c_GlyphSlot_getAdvanceY(face, glyph, valptr) << 10);
				    } else {
				      $$0 = (Module._c_GlyphSlot_getAdvanceX(face, glyph, valptr) << 10);
				    }
				    HEAP32[valptr >> 2] = $$0;
				    return $$0;   
				  }
};
mergeInto(LibraryManager.library, ft_lib);

