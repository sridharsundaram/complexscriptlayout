var chai, expect, fs, glyph_func, glyph_h_advance_func, glyph_h_kerning_func, harfbuzz, should, using,
  slice = [].slice;

chai = require("chai");

should = chai.should();

expect = chai.expect;

chai.Assertion.includeStack = true;

harfbuzz = require("../../../build/harfbuzz-test");

fs = require("fs");

using = function() {
  var buffer, buffers, func, j, k, len1;
  buffers = 2 <= arguments.length ? slice.call(arguments, 0, j = arguments.length - 1) : (j = 0, []), func = arguments[j++];
  func();
  for (k = 0, len1 = buffers.length; k < len1; k++) {
    buffer = buffers[k];
    harfbuzz.hb_buffer_destroy(buffer);
  }
};

describe("Buffer", function() {
  var buffer;
  buffer = null;
  it("should be created via hb_buffer_create()", function() {
    buffer = harfbuzz.hb_buffer_create();
    return buffer.get("header").get("ref_count").get("ref_count").should.equal(1);
  });
  it("should add a reference via hb_buffer_reference()", function() {
    buffer = harfbuzz.hb_buffer_reference(buffer);
    return buffer.get("header").get("ref_count").get("ref_count").should.equal(2);
  });
  it("should remove a reference via hb_buffer_destroy()", function() {
    harfbuzz.hb_buffer_destroy(buffer);
    return buffer.get("header").get("ref_count").get("ref_count").should.equal(1);
  });
  it("should completely destroy itself via another call to hb_buffer_destroy()", function() {
    return harfbuzz.hb_buffer_destroy(buffer);
  });
  return it("should allow further calls to hb_buffer_destroy() once destroyed", function() {
    harfbuzz.hb_buffer_destroy(buffer);
    return harfbuzz.hb_buffer_destroy(buffer);
  });
});

describe("Adding to buffer", function() {
  return it("should work", function() {
    var buffer;
    return using(buffer = harfbuzz.hb_buffer_create(), function() {
      harfbuzz.hb_buffer_get_length(buffer).should.equal(0);
      harfbuzz.hb_buffer_add(buffer, 65, 1, 0);
      return harfbuzz.hb_buffer_get_length(buffer).should.equal(1);
    });
  });
});

describe("Empty buffer", function() {
  var buffer;
  buffer = null;
  return it("should be available", function() {
    buffer = harfbuzz.hb_buffer_get_empty();
    return buffer.get("header").get("ref_count").get("ref_count").should.equal(-1);
  });
});

glyph_h_advance_func = harfbuzz.callback(harfbuzz.hb_position_t, "glyph_h_advance_func", {
  font: harfbuzz.ptr(harfbuzz.hb_font_t),
  font_data: harfbuzz.ptr(harfbuzz.Void),
  glyph: harfbuzz.hb_codepoint_t,
  user_data: harfbuzz.ptr(harfbuzz.Void)
}, function(font, font_data, glyph, user_data) {
  var hAdvance;
  hAdvance = (function() {
    switch (glyph) {
      case 0x50:
        return 10;
      case 0x69:
        return 6;
      case 0x6E:
        return 5;
      default:
        return 9;
    }
  })();
  console.log("Advance for " + glyph + " is " + hAdvance);
  return hAdvance;
});

glyph_h_kerning_func = harfbuzz.callback(harfbuzz.hb_position_t, "glyph_h_kerning_func", {
  font: harfbuzz.ptr(harfbuzz.hb_font_t),
  font_data: harfbuzz.ptr(harfbuzz.Void),
  left: harfbuzz.hb_codepoint_t,
  right: harfbuzz.hb_codepoint_t,
  user_data: harfbuzz.ptr(harfbuzz.Void)
}, function(font, font_data, left, right, user_data) {
  return 0;
});

glyph_func = harfbuzz.callback(harfbuzz.Bool, "glyph_func", {
  font: harfbuzz.ptr(harfbuzz.hb_font_t),
  font_data: harfbuzz.ptr(harfbuzz.Void),
  unicode: harfbuzz.hb_codepoint_t,
  variant_selector: harfbuzz.hb_codepoint_t,
  glyph: harfbuzz.ptr(harfbuzz.hb_codepoint_t),
  user_data: harfbuzz.ptr(harfbuzz.Void)
}, function(font, font_data, unicode, variant_selector, glyph, user_data) {
  harfbuzz.setValue(glyph.address, unicode, "i32");
  console.log("Called with unicode: " + unicode + ", glyph is " + (glyph.get()));
  return true;
});

describe("Feature", function() {
  it("should be converted to string", function() {
    var bufPtr, feature;
    feature = new harfbuzz.hb_feature_t();
    feature.set("tag", harfbuzz.HB_TAG("kern"));
    feature.set("value", 0);
    feature.set("start", 0);
    feature.set("end", 0);
    bufPtr = new (harfbuzz.ptr(harfbuzz.Char))();
    bufPtr.address = harfbuzz.allocate(128, "i8", harfbuzz.ALLOC_STACK);
    harfbuzz.hb_feature_to_string(feature, bufPtr, 128);
    return console.log("Feature: " + bufPtr);
  });
  it("should be creatable from string", function() {
    var bufPtr, feature;
    feature = new harfbuzz.hb_feature_t();
    bufPtr = new (harfbuzz.ptr(harfbuzz.Char))();
    bufPtr.address = harfbuzz.allocate(harfbuzz.intArrayFromString("kern"), "i8", harfbuzz.ALLOC_STACK);
    harfbuzz.hb_feature_from_string(bufPtr, 128, feature);
    return console.log("Feature: " + feature);
  });
  return it("should be creatable from string (2)", function() {
    var bufPtr, feature;
    feature = new harfbuzz.hb_feature_t();
    bufPtr = new harfbuzz.string("kern");
    console.log("Buffer's heap: " + bufPtr.$ptr + ", " + bufPtr.$type + ", " + (typeof bufPtr.$type));
    harfbuzz.hb_feature_from_string(bufPtr, -1, feature);
    return console.log("Feature: " + feature);
  });
});

describe("Loading a blob", function() {
  return it("should work", function() {
    var blob, buffer, data, dataBuffer, face, ffuncs, font, glyph, i, j, k, len, lenPtr, pos, ref, ref1, str;
    dataBuffer = fs.readFileSync("src/test/resources/OpenBaskerville-0.0.75.otf", "binary");
    data = harfbuzz.allocate(dataBuffer, "i8", harfbuzz.ALLOC_NORMAL);
    for (i = j = 0, ref = dataBuffer.length; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
      harfbuzz.setValue(data + i, dataBuffer[i], "i8");
    }
    blob = harfbuzz.hb_blob_create(data, dataBuffer.length, 1, null, null);
    face = harfbuzz.hb_face_create(blob, 0);
    harfbuzz.hb_blob_destroy(blob);
    font = harfbuzz.hb_font_create(face);
    harfbuzz.hb_face_destroy(face);
    harfbuzz.hb_font_set_scale(font, 10, 10);
    ffuncs = harfbuzz.hb_font_funcs_create();
    harfbuzz.hb_font_funcs_set_glyph_h_advance_func(ffuncs, glyph_h_advance_func, null, null);
    harfbuzz.hb_font_funcs_set_glyph_func(ffuncs, glyph_func, null, null);
    harfbuzz.hb_font_funcs_set_glyph_h_kerning_func(ffuncs, glyph_h_kerning_func, null, null);
    harfbuzz.hb_font_set_funcs(font, ffuncs, null, null);
    harfbuzz.hb_font_funcs_destroy(ffuncs);
    buffer = harfbuzz.hb_buffer_create();
    str = new harfbuzz.string("Bacon", harfbuzz.ALLOC_STACK);
    harfbuzz.hb_buffer_add_utf8(buffer, str, -1, 0, -1);
    harfbuzz.hb_buffer_guess_segment_properties(buffer);
    harfbuzz.hb_shape(font, buffer, null, 0, null);
    len = harfbuzz.hb_buffer_get_length(buffer);
    console.log("Buffer length: " + len);
    lenPtr = new (harfbuzz.ptr(harfbuzz.Void))();
    glyph = harfbuzz.hb_buffer_get_glyph_infos(buffer, lenPtr);
    pos = harfbuzz.hb_buffer_get_glyph_positions(buffer, null);
    console.log("Ptr'd len: " + (lenPtr.get()));
    for (i = k = 0, ref1 = len; 0 <= ref1 ? k < ref1 : k > ref1; i = 0 <= ref1 ? ++k : --k) {
      console.log("Glyph #" + i + ": " + glyph + " at " + pos);
      glyph = glyph.$next();
      pos = pos.$next();
    }
    harfbuzz.hb_buffer_destroy(buffer);
    return harfbuzz.hb_font_destroy(font);
  });
});


/*
describe "Shapers", ->
	it "should be available: ot, fallback", ->
		shapers = harfbuzz.hb_shape_list_shapers()
		console.log "Shapers: #{shapers}"
		console.log "Shaper: #{shapers.toString()}"
		shapers.toString().should.equal "ot"
		shapers.$next().toString().should.equal "fallback"
		shapers.$next().$next().address.should.equal 0
 */

// ---
// generated by coffee-script 1.9.2