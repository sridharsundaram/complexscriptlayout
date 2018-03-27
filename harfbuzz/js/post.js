// Generated by CoffeeScript 1.7.1
var CObject, CString, INVALID_SIZE, NON_HEAP, SelfPtr, Void, addressof, array, callback, define, dumpData, dumpType, enlargeMemory, free, fromNative, nativeTypeOf, ptr, registerMemoryRemapCallback, remapCallbacks, simplePointerTypes, simpleType, sizeof, sizeofType, string, struct, toNative, type, typedef, unregisterCallback, unregisterMemoryRemapCallback, writeTo, __originalEnlargeMemory, _i, _len, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  __slice = [].slice;

Module["free"] = free = function(struct) {
  return _free(struct["$ptr"]);
};

remapCallbacks = [];

Module["registerMemoryRemapCallback"] = registerMemoryRemapCallback = function(remapCallback, userData) {
  var callbackData;
  callbackData = {
    "userData": userData,
    "callback": remapCallback
  };
  remapCallbacks.push(callbackData);
  return callbackData;
};

Module["unregisterMemoryRemapCallback"] = unregisterMemoryRemapCallback = function(callbackData) {
  var index;
  index = remapCallbacks.indexOf(callbackData);
  if (index !== -1) {
    return remapCallbacks.splice(index, 1);
  }
};

__originalEnlargeMemory = enlargeMemory;

enlargeMemory = function() {
  var remapCallback, _i, _len, _results;
  __originalEnlargeMemory();
  _results = [];
  for (_i = 0, _len = remapCallbacks.length; _i < _len; _i++) {
    remapCallback = remapCallbacks[_i];
    _results.push(remapCallback["callback"](Module["HEAPU8"], remapCallback["userData"]));
  }
  return _results;
};

Module["Void"] = Void = "i32";

Module["SelfPtr"] = SelfPtr = {};

NON_HEAP = -1;

INVALID_SIZE = -1;

CObject = (function() {
  function CObject(heap) {
    this["$type"]["resolve"]();
    if (heap == null) {
      heap = allocate(this["$type"]["size"], "i8", ALLOC_NORMAL);
    }
    if (heap !== NON_HEAP) {
      this["$ptr"] = heap;
    }
  }

  CObject.prototype["$offset"] = function(index) {
    if (this["$ptr"] === NON_HEAP) {
      throw new Error("Non-heap");
    }
    return new this["$type"](this["$ptr"] + index * this["$type"]["size"]);
  };

  CObject.prototype["$next"] = function() {
    return this["$offset"](1);
  };

  CObject.prototype["toString"] = function(stack) {
    if (stack == null) {
      stack = [];
    }
    return dumpData(this, this["$type"], stack);
  };

  CObject["resolve"] = function() {
    throw new Error("Unknown type, cannot resolve");
  };

  CObject["writeTo"] = function(address, value) {
    if (value["$ptr"] === NON_HEAP) {
      throw new Error("Non heap object");
    }
    if (value["$ptr"] === 0) {
      throw new Error("Null reference");
    }
    return _memcpy(address, value["$ptr"], this["size"]);
  };

  CObject["fromNative"] = function(value) {
    return new this(value);
  };

  CObject["toNative"] = function(value) {
    if (value === null) {
      return 0;
    } else {
      return value["$ptr"];
    }
  };

  return CObject;

})();

Module["struct"] = struct = function(fields) {
  var CStruct;
  return CStruct = (function(_super) {
    var getters, resolved, setters;

    __extends(CStruct, _super);

    CStruct.prototype["$type"] = CStruct;

    function CStruct(heap) {
      CStruct.__super__.constructor.call(this, heap);
    }

    CStruct.prototype["toString"] = function(stack) {
      var field, type;
      if (stack == null) {
        stack = [];
      }
      return "{" + ((function() {
        var _results;
        _results = [];
        for (field in fields) {
          if (!__hasProp.call(fields, field)) continue;
          type = fields[field];
          _results.push(" " + field + ": " + (dumpData(this['get'](field), type, stack)));
        }
        return _results;
      }).call(this)).join(",") + " }";
    };

    CStruct["toString"] = function(stack) {
      var field, type;
      if (stack == null) {
        stack = [];
      }
      return "{" + ((function() {
        var _results;
        _results = [];
        for (field in fields) {
          if (!__hasProp.call(fields, field)) continue;
          type = fields[field];
          _results.push(" " + field + ": " + (dumpType(type, stack)));
        }
        return _results;
      })()).join(",") + " }";
    };

    resolved = false;

    CStruct["redefine"] = function(newFields) {
      if (resolved) {
        throw new Error("Type " + this + " is already resolved");
      }
      return fields = newFields;
    };

    getters = {};

    setters = {};

    CStruct["resolve"] = function() {
      var field, fieldsNotToResolve, offset, type, _fn;
      if (resolved) {
        return;
      }
      fieldsNotToResolve = [];
      for (field in fields) {
        if (!__hasProp.call(fields, field)) continue;
        type = fields[field];
        if (type === SelfPtr) {
          fields[field] = ptr(this);
          fieldsNotToResolve.push(field);
        }
      }
      offset = 0;
      _fn = function(offset, field, type) {
        var compoundProperty;
        if (simpleType(type)) {
          getters[field] = function(object) {
            return getValue(object["$ptr"] + offset, type);
          };
          return setters[field] = function(object, value) {
            setValue(object["$ptr"] + offset, value, type);
          };
        } else {
          if (fieldsNotToResolve.indexOf(field) === -1) {
            type["resolve"]();
          }
          compoundProperty = null;
          getters[field] = function(object) {
            if (compoundProperty === null) {
              compoundProperty = new type(object["$ptr"] + offset);
            }
            return compoundProperty;
          };
          return setters[field] = function(object, otherStruct) {
            if (otherStruct["$type"] !== type) {
              throw new Error("Cannot load incompatible data: " + type + " vs. " + otherStruct['$type']);
            }
            writeTo(object["$ptr"] + offset, otherStruct, type);
          };
        }
      };
      for (field in fields) {
        if (!__hasProp.call(fields, field)) continue;
        type = fields[field];
        _fn(offset, field, type);
        offset += sizeof(type);
      }
      this["size"] = offset;
      return resolved = true;
    };

    CStruct.prototype["get"] = function(field) {
      return getters[field](this);
    };

    CStruct.prototype["set"] = function(field, value) {
      setters[field](this, value);
    };

    return CStruct;

  })(CObject);
};

Module["array"] = array = function(elemType, count) {
  var CArray;
  return CArray = (function(_super) {
    var checkIndex, resolved;

    __extends(CArray, _super);

    if (elemType == null) {
      throw new Error("Element type is not specified");
    }

    if (typeof count !== "number" || count < 0) {
      throw new Error("Array size must be non-negative: " + count);
    }

    CArray.prototype["$type"] = CArray;

    CArray["count"] = count;

    CArray["elemType"] = elemType;

    function CArray(heap) {
      CArray.__super__.constructor.call(this, heap);
    }

    checkIndex = function(index) {
      if (!((0 <= index && index < count))) {
        throw new Error("Index out of bounds: 0 <= " + index + " < " + count);
      }
      return index;
    };

    CArray.prototype["get"] = function(index) {
      var address;
      address = this["$ptr"] + checkIndex(index) * sizeofType(elemType);
      if (simpleType(elemType)) {
        return getValue(address, elemType);
      } else {
        return new elemType(address);
      }
    };

    CArray.prototype["set"] = function(index, value) {
      var address;
      address = this["$ptr"] + checkIndex(index) * sizeofType(elemType);
      if (simpleType(elemType)) {
        if (typeof value !== "number") {
          throw new Error("Cannot load " + (typeof value) + " to " + elemType);
        }
        setValue(address, value, elemType);
      } else {
        if (value["$type"] !== elemType) {
          throw new Error("Cannot load " + value["$type"] + " to " + elemType);
        }
        writeTo(address, value, elemType);
      }
    };

    CArray.prototype["getAddress"] = function() {
      return this["ptr"](0);
    };

    CArray.prototype["ptr"] = function(index) {
      var type;
      type = simpleType(elemType) ? simplePointerTypes[elemType] : elemType;
      return new type(this["$ptr"] + checkIndex(index) * sizeofType(elemType));
    };

    CArray.prototype["toArray"] = function() {
      var i, _i, _results;
      _results = [];
      for (i = _i = 0; 0 <= count ? _i < count : _i > count; i = 0 <= count ? ++_i : --_i) {
        _results.push(this["get"](i));
      }
      return _results;
    };

    CArray.prototype["toString"] = function(stack) {
      var index;
      if (stack == null) {
        stack = [];
      }
      return "[" + ((function() {
        var _i, _results;
        _results = [];
        for (index = _i = 0; 0 <= count ? _i < count : _i > count; index = 0 <= count ? ++_i : --_i) {
          _results.push(" " + (dumpData(this.get(index), elemType, stack)));
        }
        return _results;
      }).call(this)).join(",") + " ]";
    };

    CArray["toString"] = function(stack) {
      if (stack == null) {
        stack = [];
      }
      return "" + (dumpType(elemType, stack)) + "[" + count + "]";
    };

    resolved = false;

    CArray["resolve"] = function() {
      var size;
      if (resolved) {
        return;
      }
      if (!simpleType(elemType)) {
        elemType["resolve"]();
      }
      size = count * sizeofType(elemType);
      this["size"] = size;
      return resolved = true;
    };

    return CArray;

  })(CObject);
};

Module["ptr"] = ptr = function(targetType) {
  var CPointer;
  return CPointer = (function(_super) {
    var resolved, size, _address;

    __extends(CPointer, _super);

    if (targetType == null) {
      throw new Error("Target type is not specified");
    }

    CPointer.prototype["$type"] = CPointer;

    size = sizeof("i32");

    CPointer["size"] = size;

    _address = 0;

    function CPointer(heap, target) {
      if (heap == null) {
        heap = NON_HEAP;
      }
      if (target == null) {
        target = null;
      }
      CPointer.__super__.constructor.call(this, heap);
      this.nonHeap = heap === NON_HEAP;
      if (this.nonHeap) {
        _address = addressof(target);
      }
    }

    CPointer.prototype["getAddress"] = function() {
      if (this.nonHeap) {
        return _address;
      } else {
        return getValue(this["$ptr"], "i32");
      }
    };

    CPointer.prototype["setAddress"] = function(targetAddress) {
      if (this.nonHeap) {
        return _address = targetAddress;
      } else {
        return setValue(this["$ptr"], targetAddress, "i32");
      }
    };

    CPointer.prototype["get"] = function() {
      var address;
      address = this["getAddress"]();
      if (address === 0) {
        return null;
      } else if (simpleType(targetType)) {
        return getValue(address, targetType);
      } else {
        return new targetType(address);
      }
    };

    CPointer.prototype["set"] = function(target) {
      if (this["getAddress"]() === 0) {
        throw new Error("Null reference");
      }
      writeTo(this["getAddress"](), target, targetType);
    };

    CPointer.prototype["toString"] = function(stack) {
      var address;
      if (stack == null) {
        stack = [];
      }
      address = this["getAddress"]();
      if (address === 0) {
        return "NULL";
      } else {
        return "@" + address + "->" + (dumpData(this['get'](), targetType, stack));
      }
    };

    CPointer["toString"] = function(stack) {
      if (stack == null) {
        stack = [];
      }
      return "*" + (dumpType(targetType, stack));
    };

    resolved = false;

    CPointer["resolve"] = function() {
      if (resolved) {
        return;
      }
      resolved = true;
      if (!simpleType(targetType)) {
        return targetType["resolve"]();
      }
    };

    CPointer["fromNative"] = function(value) {
      var result;
      result = new this();
      result["setAddress"](value);
      return result;
    };

    CPointer["toNative"] = function(value) {
      if (value === null) {
        return 0;
      } else {
        return value["getAddress"]();
      }
    };

    return CPointer;

  })(CObject);
};

Module["string"] = string = CString = (function(_super) {
  __extends(CString, _super);

  CString.prototype["$type"] = CString;

  function CString(arg, alloc) {
    if (alloc == null) {
      alloc = ALLOC_NORMAL;
    }
    if (arg === null) {
      CString.__super__.constructor.call(this, 0);
    } else if (typeof arg === "number") {
      CString.__super__.constructor.call(this, arg);
    } else if (typeof arg === "string") {
      CString.__super__.constructor.call(this, allocate(intArrayFromString(arg), "i8", alloc));
    } else {
      throw new Error("Cannot create a string from " + arg);
    }
  }

  CString.prototype["getAddress"] = function() {
    return this["$ptr"];
  };

  CString.prototype["toString"] = function() {
    return Pointer_stringify(this["$ptr"]);
  };

  CString["toString"] = function() {
    return "*char";
  };

  CString["resolve"] = function() {};

  CString["allocate"] = function(size, alloc) {
    if (alloc == null) {
      alloc = ALLOC_NORMAL;
    }
    return new this(allocate(size, "i8", alloc));
  };

  return CString;

})(CObject);

Module["define"] = define = function(returnType, name, argumentsDef) {
  var argument, argumentNativeTypes, argumentTypes, cFunc, returnNative, type;
  if (argumentsDef == null) {
    argumentsDef = {};
  }
  returnNative = nativeTypeOf(returnType);
  argumentTypes = (function() {
    var _results;
    _results = [];
    for (argument in argumentsDef) {
      if (!__hasProp.call(argumentsDef, argument)) continue;
      type = argumentsDef[argument];
      _results.push(type);
    }
    return _results;
  })();
  argumentNativeTypes = (function() {
    var _i, _len, _results;
    _results = [];
    for (_i = 0, _len = argumentTypes.length; _i < _len; _i++) {
      type = argumentTypes[_i];
      _results.push(nativeTypeOf(type));
    }
    return _results;
  })();
  cFunc = cwrap(name, returnNative, argumentNativeTypes);
  return Module[name] = function() {
    var args, i, nativeArgs, result, resultNative, _i, _ref;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    nativeArgs = new Array(argumentTypes.length);
    for (i = _i = 0, _ref = argumentTypes.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
      nativeArgs[i] = toNative(args[i], argumentTypes[i]);
    }
    resultNative = cFunc.apply(null, nativeArgs);
    result = fromNative(resultNative, returnType);
    return result;
  };
};

Module["callback"] = callback = function(returnType, name, argumentsDef, func) {
  var argument, argumentTypes, callbackFunc, functionIndex, type;
  if (argumentsDef == null) {
    argumentsDef = {};
  }
  argumentTypes = (function() {
    var _results;
    _results = [];
    for (argument in argumentsDef) {
      if (!__hasProp.call(argumentsDef, argument)) continue;
      type = argumentsDef[argument];
      _results.push(type);
    }
    return _results;
  })();
  callbackFunc = function() {
    var args, i, nativeArgs, result, resultNative, _i, _ref;
    nativeArgs = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    args = new Array(argumentTypes.length);
    for (i = _i = 0, _ref = argumentTypes.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
      args[i] = fromNative(nativeArgs[i], argumentTypes[i]);
    }
    result = func.apply(null, args);
    resultNative = toNative(result, returnType);
    return resultNative;
  };
  functionIndex = Runtime.addFunction(callbackFunc, "x");
  if (name != null) {
    Module[name] = functionIndex;
  }
  return functionIndex;
};

Module["unregisterCallback"] = unregisterCallback = function(functionIndex) {
  return Runtime.removeFunction(functionIndex);
};

Module["typedef"] = typedef = function(name, type) {
  type["typeName"] = name;
  return Module[name] = type;
};

addressof = function(value, type) {
  if (simpleType(type)) {
    throw new Error("Simple types don't have an address");
  }
  if (value === null) {
    return 0;
  } else {
    return value["$ptr"];
  }
};

sizeof = function(type) {
  if (simpleType(type)) {
    return Runtime.getNativeFieldSize(type);
  } else {
    return type["size"];
  }
};

sizeofType = function(type) {
  if (simpleType(type)) {
    return Runtime.getNativeTypeSize(type);
  } else {
    return type["size"];
  }
};

writeTo = function(address, value, type) {
  if (simpleType(type)) {
    return setValue(address, value, type);
  } else {
    return type["writeTo"](address, value);
  }
};

simpleType = function(type) {
  return typeof type === "string";
};

nativeTypeOf = function(type) {
  return "number";
};

fromNative = function(value, type) {
  if (simpleType(type)) {
    return value;
  } else {
    return type["fromNative"](value);
  }
};

toNative = function(value, type) {
  if (simpleType(type)) {
    return value;
  } else {
    return type["toNative"](value);
  }
};

dumpType = function(type, stack) {
  var s;
  if (simpleType(type)) {
    s = type;
  } else if (stack.indexOf(type) > -1) {
    s = type["typeName"] ? type["typeName"] : "<backreference>";
  } else {
    if (type["typeName"] == null) {
      stack.push(type);
      s = type["toString"](stack);
      stack.pop();
    } else {
      s = type["typeName"];
    }
  }
  return s;
};

dumpData = function(value, type, stack) {
  var address, s;
  s = null;
  if (simpleType(type)) {
    s = value;
  } else {
    address = value["$ptr"];
    if (address === 0) {
      s = "NULL";
    } else {
      if (stack.indexOf(address) > -1) {
        s = "<backreference>";
      } else {
        stack.push(address);
        s = value["toString"](stack);
        stack.pop();
      }
    }
  }
  return s;
};

simplePointerTypes = {};

_ref = ["i1", "i8", "i16", "i32", "i64", "float", "double"];
for (_i = 0, _len = _ref.length; _i < _len; _i++) {
  type = _ref[_i];
  simplePointerTypes[type] = ptr(type);
}
// Generated by CoffeeScript 1.7.1
var Bool, Char, Enumeration, HB_DIRECTION_BTT, HB_DIRECTION_INVALID, HB_DIRECTION_LTR, HB_DIRECTION_RTL, HB_DIRECTION_TTB, HB_FONT_CALLBACKS, HB_LANGUAGE_INVALID, HB_SHAPER_LIST, HB_TAG, HB_UNICODE_CALLBACKS, HB_UNTAG, Int, Long, Long_Long, Short, Unsigned_Char, Unsigned_Int, Unsigned_Long, Unsigned_Long_Long, Unsigned_Short, fontCallback, hb_atomic_int_t, hb_blob_t, hb_bool_t, hb_buffer_content_type_t, hb_buffer_t, hb_codepoint_t, hb_destroy_func_t, hb_direction_t, hb_face_t, hb_feature_t, hb_font_funcs_t, hb_font_t, hb_glyph_info_t, hb_glyph_position_t, hb_language_impl_t, hb_language_t, hb_lockable_set_t, hb_mask_t, hb_memory_mode_t, hb_mutex_impl_t, hb_mutex_t, hb_object_header_t, hb_position_t, hb_prealloced_array_t, hb_reference_count_t, hb_reference_table_func_t, hb_script_t, hb_segment_properties_t, hb_shape_func_t, hb_shaper_data_t, hb_tag_t, hb_unicode_funcs_t, hb_user_data_array_t, hb_user_data_item_t, hb_user_data_key_t, hb_var_int_t, int16_t, int32_t, int64_t, int8_t, uint16_t, uint32_t, uint64_t, uint8_t, _i, _len;

Module["Bool"] = Bool = "i1";

Module["Char"] = Char = "i8";

Module["Unsigned_Char"] = Unsigned_Char = "i8";

Module["int8_t"] = int8_t = "i8";

Module["uint8_t"] = uint8_t = "i8";

Module["Short"] = Short = "i16";

Module["Unsigned_Short"] = Unsigned_Short = "i16";

Module["int16_t"] = int16_t = "i16";

Module["uint16_t"] = uint16_t = "i16";

Module["Int"] = Int = "i32";

Module["Unsigned_Int"] = Unsigned_Int = "i32";

Module["int32_t"] = int32_t = "i32";

Module["uint32_t"] = uint32_t = "i32";

Module["Long"] = Long = "i64";

Module["Unsigned_Long"] = Unsigned_Long = "i64";

Module["Long_Long"] = Long_Long = "i64";

Module["Unsigned_Long_Long"] = Unsigned_Long_Long = "i64";

Module["int64_t"] = int64_t = "i64";

Module["uint64_t"] = uint64_t = "i64";

Module["Enumeration"] = Enumeration = "i32";

Module["HB_TAG"] = HB_TAG = function(tag) {
  return tag.charCodeAt(0) << 24 | tag.charCodeAt(1) << 16 | tag.charCodeAt(2) << 8 | tag.charCodeAt(3);
};

Module["HB_UNTAG"] = HB_UNTAG = function(tag) {
  return String.fromCharCode(tag >>> 24, (tag >>> 16) & 0xFF, (tag >>> 8) & 0xFF, tag & 0xFF);
};

hb_language_impl_t = typedef("hb_language_impl_t", struct({
  "s": array(Char, 1)
}));

Module["hb_bool_t"] = hb_bool_t = Int;

Module["hb_codepoint_t"] = hb_codepoint_t = uint32_t;

Module["hb_position_t"] = hb_position_t = int32_t;

Module["hb_mask_t"] = hb_mask_t = uint32_t;

Module["hb_var_int_t"] = hb_var_int_t = uint32_t;

Module["hb_tag_t"] = hb_tag_t = uint32_t;

Module["hb_direction_t"] = hb_direction_t = Enumeration;

Module["HB_DIRECTION_INVALID"] = HB_DIRECTION_INVALID = 0;

Module["HB_DIRECTION_LTR"] = HB_DIRECTION_LTR = 4;

Module["HB_DIRECTION_RTL"] = HB_DIRECTION_RTL = 5;

Module["HB_DIRECTION_TTB"] = HB_DIRECTION_TTB = 6;

Module["HB_DIRECTION_BTT"] = HB_DIRECTION_BTT = 7;

Module["hb_script_t"] = hb_script_t = Enumeration;

hb_user_data_key_t = typedef("hb_user_data_key_t", struct({
  "unused": Char
}));

hb_destroy_func_t = ptr(Int);

hb_language_t = ptr(hb_language_impl_t);

Module["HB_LANGUAGE_INVALID"] = HB_LANGUAGE_INVALID = null;

define(hb_language_t, "hb_language_from_string", {
  "str": string,
  "len": Int
});

define(string, "hb_language_to_string", {
  "language": hb_language_t
});

hb_atomic_int_t = Int;

hb_mutex_impl_t = Int;

hb_mutex_t = typedef("hb_mutex_t", struct({
  "m": hb_mutex_impl_t
}));

hb_prealloced_array_t = function(Type, StaticSize) {
  return typedef("hb_prealloced_array_t<" + Type + ", " + StaticSize + ">", struct({
    "len": Unsigned_Int,
    "allocated": Unsigned_Int,
    "array": ptr(Type),
    "static_array": array(Type, StaticSize)
  }));
};

hb_lockable_set_t = function(item_t, lock_t) {
  return typedef("hb_lockable_set_t<" + item_t + ", " + lock_t + ">", struct({
    "items": hb_prealloced_array_t(item_t, 2)
  }));
};

hb_reference_count_t = typedef("hb_reference_count_t", struct({
  "ref_count": hb_atomic_int_t
}));

hb_user_data_item_t = typedef("hb_user_data_item_t", struct({
  "key": ptr(hb_user_data_key_t),
  "data": ptr(Int),
  "destroy": ptr(Int)
}));

hb_user_data_array_t = typedef("hb_user_data_array_t", struct({
  "items": hb_lockable_set_t(hb_user_data_item_t, hb_mutex_t)
}));

hb_object_header_t = typedef("hb_object_header_t", struct({
  "ref_count": hb_reference_count_t,
  "mutex": hb_mutex_t,
  "user_data": hb_user_data_array_t
}));

HB_UNICODE_CALLBACKS = ["combining_class", "eastasian_width", "general_category", "mirroring", "script", "compose", "decompose", "decompose_compatibility"];

hb_unicode_funcs_t = typedef("hb_unicode_funcs_t", struct({
  "header": hb_object_header_t,
  "parent": SelfPtr,
  "immutable": Bool,
  "func": array(ptr("i32"), HB_UNICODE_CALLBACKS.length),
  "user_data": array(ptr("i32"), HB_UNICODE_CALLBACKS.length),
  "destroy": array(ptr("i32"), HB_UNICODE_CALLBACKS.length)
}));

define(hb_unicode_funcs_t, "hb_unicode_funcs_get_default");

define(hb_unicode_funcs_t, "hb_unicode_funcs_reference", {
  "ufuncs": hb_unicode_funcs_t
});

hb_glyph_info_t = typedef("hb_glyph_info_t", struct({
  "codepoint": hb_codepoint_t,
  "mask": hb_mask_t,
  "cluster": uint32_t,
  "var1": hb_var_int_t,
  "var2": hb_var_int_t
}));

hb_glyph_position_t = typedef("hb_glyph_position_t", struct({
  "x_advance": hb_position_t,
  "y_advance": hb_position_t,
  "x_offset": hb_position_t,
  "y_offset": hb_position_t,
  "var": hb_var_int_t
}));

hb_buffer_content_type_t = Enumeration;

hb_segment_properties_t = typedef("hb_segment_properties_t", struct({
  "direction": hb_direction_t,
  "script": hb_script_t,
  "language": hb_language_t
}));

hb_buffer_t = typedef("hb_buffer_t", struct({
  "header": hb_object_header_t,
  "unicode": ptr(hb_unicode_funcs_t),
  "props": hb_segment_properties_t,
  "content_type": hb_buffer_content_type_t,
  "_status": Unsigned_Int,
  "idx": Unsigned_Int,
  "len": Unsigned_Int,
  "out_len": Unsigned_Int,
  "allocated": Unsigned_Int,
  "info": ptr(hb_glyph_info_t),
  "out_info": ptr(hb_glyph_info_t),
  "pos": ptr(hb_glyph_position_t),
  "serial": Unsigned_Int,
  "allocated_var_bytes": array(uint8_t, 8),
  "allocated_var_owner": array(ptr(Char), 8)
}));

define(hb_buffer_t, "hb_buffer_create");

define(hb_buffer_t, "hb_buffer_reference", {
  "buffer": hb_buffer_t
});

define(Void, "hb_buffer_destroy", {
  "buffer": hb_buffer_t
});

define(Void, "hb_buffer_reset", {
  "buffer": hb_buffer_t
});

define(hb_buffer_t, "hb_buffer_get_empty");

define(Void, "hb_buffer_set_content_type", {
  "buffer": hb_buffer_t,
  "content_type": hb_buffer_content_type_t
});

define(Int, "hb_buffer_get_content_type", {
  "buffer": hb_buffer_t
});

define(Unsigned_Int, "hb_buffer_get_length", {
  "buffer": hb_buffer_t
});

define(hb_glyph_info_t, "hb_buffer_get_glyph_infos", {
  "buffer": hb_buffer_t,
  "length": ptr(Unsigned_Int)
});

define(hb_glyph_position_t, "hb_buffer_get_glyph_positions", {
  "buffer": hb_buffer_t,
  "length": ptr(Unsigned_Int)
});

define(Void, "hb_buffer_normalize_glyphs", {
  "buffer": hb_buffer_t
});

define(Void, "hb_buffer_add", {
  "buffer": hb_buffer_t,
  "codepoint": hb_codepoint_t,
  "mask": hb_mask_t,
  "cluster": Unsigned_Int
});

define(Void, "hb_buffer_add_utf8", {
  "buffer": hb_buffer_t,
  "text": string,
  "text_length": Int,
  "item_offset": Unsigned_Int,
  "item_length": Int
});

define(Void, "hb_buffer_add_utf16", {
  "buffer": hb_buffer_t,
  "text": ptr(uint16_t),
  "text_length": Int,
  "item_offset": Unsigned_Int,
  "item_length": Int
});

define(Void, "hb_buffer_add_utf32", {
  "buffer": hb_buffer_t,
  "text": ptr(uint32_t),
  "text_length": Int,
  "item_offset": Unsigned_Int,
  "item_length": Int
});

define(Unsigned_Int, "hb_buffer_get_length", {
  "buffer": hb_buffer_t
});

define(Void, "hb_buffer_guess_segment_properties", {
  "buffer": hb_buffer_t
});

define(Void, "hb_buffer_set_direction", {
  "buffer": hb_buffer_t,
  "direction": hb_direction_t
});

define(hb_direction_t, "hb_buffer_get_direction", {
  "buffer": hb_buffer_t
});

define(Void, "hb_buffer_set_script", {
  "buffer": hb_buffer_t,
  "script": hb_script_t
});

define(hb_script_t, "hb_buffer_get_script", {
  "buffer": hb_buffer_t
});

define(Void, "hb_buffer_set_language", {
  "buffer": hb_buffer_t,
  "language": hb_language_t
});

define(hb_language_t, "hb_buffer_get_language", {
  "buffer": hb_buffer_t
});

hb_memory_mode_t = Enumeration;

hb_blob_t = typedef("hb_blob_t", struct({
  "header": hb_object_header_t,
  "immutable": Bool,
  "data": ptr(Char),
  "length": Unsigned_Int,
  "mode": hb_memory_mode_t,
  "user_data": ptr(Void),
  "destroy": hb_destroy_func_t
}));

define(hb_blob_t, "hb_blob_create", {
  "data": string,
  "length": Unsigned_Int,
  "mode": hb_memory_mode_t,
  "user_data": ptr(Void),
  "destroy": hb_destroy_func_t
});

define(hb_blob_t, "hb_blob_create_sub_blob", {
  "parent": hb_blob_t,
  "offset": Unsigned_Int,
  "length": Unsigned_Int
});

define(hb_blob_t, "hb_blob_get_empty");

define(hb_blob_t, "hb_blob_reference", {
  "blob": hb_blob_t
});

define(Void, "hb_blob_destroy", {
  "blob": hb_blob_t
});

HB_SHAPER_LIST = ["ot", "fallback"];

hb_shaper_data_t = typedef("hb_shaper_data_t", struct({
  "_shapers": array(ptr(Void), HB_SHAPER_LIST.length)
}));

hb_shape_func_t = ptr(Void);

hb_feature_t = typedef("hb_feature_t", struct({
  "tag": hb_tag_t,
  "value": uint32_t,
  "start": Unsigned_Int,
  "end": Unsigned_Int
}));

hb_font_t = typedef("hb_font_t", struct({}));

define(hb_bool_t, "hb_feature_from_string", {
  "str": string,
  "len": Int,
  "feature": hb_feature_t
});

define(Void, "hb_feature_to_string", {
  "feature": hb_feature_t,
  "buf": string,
  "size": Int
});

define(ptr(ptr(Char)), "hb_shape_list_shapers");

define(Void, "hb_shape", {
  "font": hb_font_t,
  "buffer": hb_buffer_t,
  "features": hb_feature_t,
  "num_features": Unsigned_Int
});

define(hb_bool_t, "hb_shape_full", {
  "font": hb_font_t,
  "buffer": hb_buffer_t,
  "features": hb_feature_t,
  "num_features": Unsigned_Int,
  "shaper_list": ptr(ptr(Char))
});

HB_FONT_CALLBACKS = ["glyph", "glyph_h_advance", "glyph_v_advance", "glyph_h_origin", "glyph_v_origin", "glyph_h_kerning", "glyph_v_kerning", "glyph_extents", "glyph_contour_point", "glyph_name", "glyph_from_name"];

hb_reference_table_func_t = ptr(Void);

hb_font_funcs_t = typedef("hb_font_funcs_t", struct({
  "header": hb_object_header_t,
  "immutable": hb_bool_t,
  "get": array(ptr(Void), HB_FONT_CALLBACKS.length),
  "user_data": array(ptr(Void), HB_FONT_CALLBACKS.length),
  "destroy": array(ptr(Void), HB_FONT_CALLBACKS.length)
}));

hb_face_t = typedef("hb_face_t", struct({
  "header": hb_object_header_t,
  "immutable": hb_bool_t,
  "reference_table_func": hb_reference_table_func_t,
  "user_data": ptr(Void),
  "destroy": hb_destroy_func_t,
  "index": Unsigned_Int,
  "upem": Unsigned_Int,
  "shaper_data": hb_shaper_data_t,
  "shape_plans": ptr(Void)
}));

hb_font_t["redefine"]({
  "header": hb_object_header_t,
  "immutable": hb_bool_t,
  "parent": SelfPtr,
  "face": ptr(hb_face_t),
  "x_scale": Int,
  "y_scale": Int,
  "x_ppem": Unsigned_Int,
  "y_ppem": Unsigned_Int,
  "klass": ptr(hb_font_funcs_t),
  "user_data": ptr(Void),
  "destroy": hb_destroy_func_t,
  "shaper_data": hb_shaper_data_t
});

define(hb_face_t, "hb_face_create", {
  "blob": hb_blob_t,
  "index": Unsigned_Int
});

define(Void, "hb_face_destroy", {
  "face": hb_face_t
});

define(hb_font_t, "hb_font_create", {
  "face": hb_face_t
});

define(Void, "hb_font_destroy", {
  "font": hb_font_t
});

define(Void, "hb_font_set_scale", {
  "font": hb_font_t,
  "x_scale": Int,
  "y_scale": Int
});

define(hb_face_t, "hb_font_get_face", {
  "font": hb_font_t
});

define(hb_font_funcs_t, "hb_font_funcs_create");

for (_i = 0, _len = HB_FONT_CALLBACKS.length; _i < _len; _i++) {
  fontCallback = HB_FONT_CALLBACKS[_i];
  define(Void, "hb_font_funcs_set_" + fontCallback + "_func", {
    "ffuncs": hb_font_funcs_t,
    "func": "i32",
    "user_data": ptr(Void),
    "destroy": hb_destroy_func_t
  });
}

define(Void, "hb_font_funcs_destroy", {
  "ffuncs": hb_font_funcs_t
});

define(Void, "hb_font_set_funcs", {
  "font": hb_font_t,
  "klass": hb_font_funcs_t,
  "font_data": ptr(Void),
  "destroy": hb_destroy_func_t
});

define(string, "ucdn_get_unicode_version");

define(Int, "ucdn_get_combining_class", {
  "code": uint32_t
});

define(Int, "ucdn_get_east_asian_width", {
  "code": uint32_t
});

define(Int, "ucdn_get_general_category", {
  "code": uint32_t
});

define(Int, "ucdn_get_bidi_class", {
  "code": uint32_t
});

define(Int, "ucdn_get_script", {
  "code": uint32_t
});

define(Int, "ucdn_get_mirrored", {
  "code": uint32_t
});

define(Int, "ucdn_mirror", {
  "code": uint32_t
});

define(Int, "ucdn_decompose", {
  "code": uint32_t,
  "a": ptr(uint32_t),
  "b": ptr(uint32_t)
});

define(Int, "ucdn_compose", {
  "code": ptr(uint32_t),
  "a": uint32_t,
  "b": uint32_t
});
Module["UCDN_EAST_ASIAN_F"] = 0;
Module["UCDN_EAST_ASIAN_H"] = 1;
Module["UCDN_EAST_ASIAN_W"] = 2;
Module["UCDN_EAST_ASIAN_NA"] = 3;
Module["UCDN_EAST_ASIAN_A"] = 4;
Module["UCDN_EAST_ASIAN_N"] = 5;
Module["UCDN_SCRIPT_COMMON"] = 0;
Module["UCDN_SCRIPT_LATIN"] = 1;
Module["UCDN_SCRIPT_GREEK"] = 2;
Module["UCDN_SCRIPT_CYRILLIC"] = 3;
Module["UCDN_SCRIPT_ARMENIAN"] = 4;
Module["UCDN_SCRIPT_HEBREW"] = 5;
Module["UCDN_SCRIPT_ARABIC"] = 6;
Module["UCDN_SCRIPT_SYRIAC"] = 7;
Module["UCDN_SCRIPT_THAANA"] = 8;
Module["UCDN_SCRIPT_DEVANAGARI"] = 9;
Module["UCDN_SCRIPT_BENGALI"] = 10;
Module["UCDN_SCRIPT_GURMUKHI"] = 11;
Module["UCDN_SCRIPT_GUJARATI"] = 12;
Module["UCDN_SCRIPT_ORIYA"] = 13;
Module["UCDN_SCRIPT_TAMIL"] = 14;
Module["UCDN_SCRIPT_TELUGU"] = 15;
Module["UCDN_SCRIPT_KANNADA"] = 16;
Module["UCDN_SCRIPT_MALAYALAM"] = 17;
Module["UCDN_SCRIPT_SINHALA"] = 18;
Module["UCDN_SCRIPT_THAI"] = 19;
Module["UCDN_SCRIPT_LAO"] = 20;
Module["UCDN_SCRIPT_TIBETAN"] = 21;
Module["UCDN_SCRIPT_MYANMAR"] = 22;
Module["UCDN_SCRIPT_GEORGIAN"] = 23;
Module["UCDN_SCRIPT_HANGUL"] = 24;
Module["UCDN_SCRIPT_ETHIOPIC"] = 25;
Module["UCDN_SCRIPT_CHEROKEE"] = 26;
Module["UCDN_SCRIPT_CANADIAN_ABORIGINAL"] = 27;
Module["UCDN_SCRIPT_OGHAM"] = 28;
Module["UCDN_SCRIPT_RUNIC"] = 29;
Module["UCDN_SCRIPT_KHMER"] = 30;
Module["UCDN_SCRIPT_MONGOLIAN"] = 31;
Module["UCDN_SCRIPT_HIRAGANA"] = 32;
Module["UCDN_SCRIPT_KATAKANA"] = 33;
Module["UCDN_SCRIPT_BOPOMOFO"] = 34;
Module["UCDN_SCRIPT_HAN"] = 35;
Module["UCDN_SCRIPT_YI"] = 36;
Module["UCDN_SCRIPT_OLD_ITALIC"] = 37;
Module["UCDN_SCRIPT_GOTHIC"] = 38;
Module["UCDN_SCRIPT_DESERET"] = 39;
Module["UCDN_SCRIPT_INHERITED"] = 40;
Module["UCDN_SCRIPT_TAGALOG"] = 41;
Module["UCDN_SCRIPT_HANUNOO"] = 42;
Module["UCDN_SCRIPT_BUHID"] = 43;
Module["UCDN_SCRIPT_TAGBANWA"] = 44;
Module["UCDN_SCRIPT_LIMBU"] = 45;
Module["UCDN_SCRIPT_TAI_LE"] = 46;
Module["UCDN_SCRIPT_LINEAR_B"] = 47;
Module["UCDN_SCRIPT_UGARITIC"] = 48;
Module["UCDN_SCRIPT_SHAVIAN"] = 49;
Module["UCDN_SCRIPT_OSMANYA"] = 50;
Module["UCDN_SCRIPT_CYPRIOT"] = 51;
Module["UCDN_SCRIPT_BRAILLE"] = 52;
Module["UCDN_SCRIPT_BUGINESE"] = 53;
Module["UCDN_SCRIPT_COPTIC"] = 54;
Module["UCDN_SCRIPT_NEW_TAI_LUE"] = 55;
Module["UCDN_SCRIPT_GLAGOLITIC"] = 56;
Module["UCDN_SCRIPT_TIFINAGH"] = 57;
Module["UCDN_SCRIPT_SYLOTI_NAGRI"] = 58;
Module["UCDN_SCRIPT_OLD_PERSIAN"] = 59;
Module["UCDN_SCRIPT_KHAROSHTHI"] = 60;
Module["UCDN_SCRIPT_BALINESE"] = 61;
Module["UCDN_SCRIPT_CUNEIFORM"] = 62;
Module["UCDN_SCRIPT_PHOENICIAN"] = 63;
Module["UCDN_SCRIPT_PHAGS_PA"] = 64;
Module["UCDN_SCRIPT_NKO"] = 65;
Module["UCDN_SCRIPT_SUNDANESE"] = 66;
Module["UCDN_SCRIPT_LEPCHA"] = 67;
Module["UCDN_SCRIPT_OL_CHIKI"] = 68;
Module["UCDN_SCRIPT_VAI"] = 69;
Module["UCDN_SCRIPT_SAURASHTRA"] = 70;
Module["UCDN_SCRIPT_KAYAH_LI"] = 71;
Module["UCDN_SCRIPT_REJANG"] = 72;
Module["UCDN_SCRIPT_LYCIAN"] = 73;
Module["UCDN_SCRIPT_CARIAN"] = 74;
Module["UCDN_SCRIPT_LYDIAN"] = 75;
Module["UCDN_SCRIPT_CHAM"] = 76;
Module["UCDN_SCRIPT_TAI_THAM"] = 77;
Module["UCDN_SCRIPT_TAI_VIET"] = 78;
Module["UCDN_SCRIPT_AVESTAN"] = 79;
Module["UCDN_SCRIPT_EGYPTIAN_HIEROGLYPHS"] = 80;
Module["UCDN_SCRIPT_SAMARITAN"] = 81;
Module["UCDN_SCRIPT_LISU"] = 82;
Module["UCDN_SCRIPT_BAMUM"] = 83;
Module["UCDN_SCRIPT_JAVANESE"] = 84;
Module["UCDN_SCRIPT_MEETEI_MAYEK"] = 85;
Module["UCDN_SCRIPT_IMPERIAL_ARAMAIC"] = 86;
Module["UCDN_SCRIPT_OLD_SOUTH_ARABIAN"] = 87;
Module["UCDN_SCRIPT_INSCRIPTIONAL_PARTHIAN"] = 88;
Module["UCDN_SCRIPT_INSCRIPTIONAL_PAHLAVI"] = 89;
Module["UCDN_SCRIPT_OLD_TURKIC"] = 90;
Module["UCDN_SCRIPT_KAITHI"] = 91;
Module["UCDN_SCRIPT_BATAK"] = 92;
Module["UCDN_SCRIPT_BRAHMI"] = 93;
Module["UCDN_SCRIPT_MANDAIC"] = 94;
Module["UCDN_SCRIPT_CHAKMA"] = 95;
Module["UCDN_SCRIPT_MEROITIC_CURSIVE"] = 96;
Module["UCDN_SCRIPT_MEROITIC_HIEROGLYPHS"] = 97;
Module["UCDN_SCRIPT_MIAO"] = 98;
Module["UCDN_SCRIPT_SHARADA"] = 99;
Module["UCDN_SCRIPT_SORA_SOMPENG"] = 100;
Module["UCDN_SCRIPT_TAKRI"] = 101;
Module["UCDN_SCRIPT_UNKNOWN"] = 102;
Module["UCDN_SCRIPT_BASSA_VAH"] = 103;
Module["UCDN_SCRIPT_CAUCASIAN_ALBANIAN"] = 104;
Module["UCDN_SCRIPT_DUPLOYAN"] = 105;
Module["UCDN_SCRIPT_ELBASAN"] = 106;
Module["UCDN_SCRIPT_GRANTHA"] = 107;
Module["UCDN_SCRIPT_KHOJKI"] = 108;
Module["UCDN_SCRIPT_KHUDAWADI"] = 109;
Module["UCDN_SCRIPT_LINEAR_A"] = 110;
Module["UCDN_SCRIPT_MAHAJANI"] = 111;
Module["UCDN_SCRIPT_MANICHAEAN"] = 112;
Module["UCDN_SCRIPT_MENDE_KIKAKUI"] = 113;
Module["UCDN_SCRIPT_MODI"] = 114;
Module["UCDN_SCRIPT_MRO"] = 115;
Module["UCDN_SCRIPT_NABATAEAN"] = 116;
Module["UCDN_SCRIPT_OLD_NORTH_ARABIAN"] = 117;
Module["UCDN_SCRIPT_OLD_PERMIC"] = 118;
Module["UCDN_SCRIPT_PAHAWH_HMONG"] = 119;
Module["UCDN_SCRIPT_PALMYRENE"] = 120;
Module["UCDN_SCRIPT_PAU_CIN_HAU"] = 121;
Module["UCDN_SCRIPT_PSALTER_PAHLAVI"] = 122;
Module["UCDN_SCRIPT_SIDDHAM"] = 123;
Module["UCDN_SCRIPT_TIRHUTA"] = 124;
Module["UCDN_SCRIPT_WARANG_CITI"] = 125;
Module["UCDN_GENERAL_CATEGORY_CC"] = 0;
Module["UCDN_GENERAL_CATEGORY_CF"] = 1;
Module["UCDN_GENERAL_CATEGORY_CN"] = 2;
Module["UCDN_GENERAL_CATEGORY_CO"] = 3;
Module["UCDN_GENERAL_CATEGORY_CS"] = 4;
Module["UCDN_GENERAL_CATEGORY_LL"] = 5;
Module["UCDN_GENERAL_CATEGORY_LM"] = 6;
Module["UCDN_GENERAL_CATEGORY_LO"] = 7;
Module["UCDN_GENERAL_CATEGORY_LT"] = 8;
Module["UCDN_GENERAL_CATEGORY_LU"] = 9;
Module["UCDN_GENERAL_CATEGORY_MC"] = 10;
Module["UCDN_GENERAL_CATEGORY_ME"] = 11;
Module["UCDN_GENERAL_CATEGORY_MN"] = 12;
Module["UCDN_GENERAL_CATEGORY_ND"] = 13;
Module["UCDN_GENERAL_CATEGORY_NL"] = 14;
Module["UCDN_GENERAL_CATEGORY_NO"] = 15;
Module["UCDN_GENERAL_CATEGORY_PC"] = 16;
Module["UCDN_GENERAL_CATEGORY_PD"] = 17;
Module["UCDN_GENERAL_CATEGORY_PE"] = 18;
Module["UCDN_GENERAL_CATEGORY_PF"] = 19;
Module["UCDN_GENERAL_CATEGORY_PI"] = 20;
Module["UCDN_GENERAL_CATEGORY_PO"] = 21;
Module["UCDN_GENERAL_CATEGORY_PS"] = 22;
Module["UCDN_GENERAL_CATEGORY_SC"] = 23;
Module["UCDN_GENERAL_CATEGORY_SK"] = 24;
Module["UCDN_GENERAL_CATEGORY_SM"] = 25;
Module["UCDN_GENERAL_CATEGORY_SO"] = 26;
Module["UCDN_GENERAL_CATEGORY_ZL"] = 27;
Module["UCDN_GENERAL_CATEGORY_ZP"] = 28;
Module["UCDN_GENERAL_CATEGORY_ZS"] = 29;
Module["UCDN_BIDI_CLASS_L"] = 0;
Module["UCDN_BIDI_CLASS_LRE"] = 1;
Module["UCDN_BIDI_CLASS_LRO"] = 2;
Module["UCDN_BIDI_CLASS_R"] = 3;
Module["UCDN_BIDI_CLASS_AL"] = 4;
Module["UCDN_BIDI_CLASS_RLE"] = 5;
Module["UCDN_BIDI_CLASS_RLO"] = 6;
Module["UCDN_BIDI_CLASS_PDF"] = 7;
Module["UCDN_BIDI_CLASS_EN"] = 8;
Module["UCDN_BIDI_CLASS_ES"] = 9;
Module["UCDN_BIDI_CLASS_ET"] = 10;
Module["UCDN_BIDI_CLASS_AN"] = 11;
Module["UCDN_BIDI_CLASS_CS"] = 12;
Module["UCDN_BIDI_CLASS_NSM"] = 13;
Module["UCDN_BIDI_CLASS_BN"] = 14;
Module["UCDN_BIDI_CLASS_B"] = 15;
Module["UCDN_BIDI_CLASS_S"] = 16;
Module["UCDN_BIDI_CLASS_WS"] = 17;
Module["UCDN_BIDI_CLASS_ON"] = 18;
Module["UCDN_BIDI_CLASS_LRI"] = 19;
Module["UCDN_BIDI_CLASS_RLI"] = 20;
Module["UCDN_BIDI_CLASS_FSI"] = 21;
Module["UCDN_BIDI_CLASS_PDI"] = 22;
