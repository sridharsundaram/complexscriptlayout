var CObject, CString, INVALID_SIZE, NON_HEAP, SelfPtr, Void, __originalEnlargeMemory, addressof, array, callback, define, dumpData, dumpType, enlargeMemory, free, fromNative, j, len, nativeTypeOf, ptr, ref, registerMemoryRemapCallback, remapCallbacks, simplePointerTypes, simpleType, sizeof, sizeofType, string, struct, toNative, type, typedef, unregisterCallback, unregisterMemoryRemapCallback, writeTo,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  slice = [].slice;

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
  var j, len, remapCallback, results;
  __originalEnlargeMemory();
  results = [];
  for (j = 0, len = remapCallbacks.length; j < len; j++) {
    remapCallback = remapCallbacks[j];
    results.push(remapCallback["callback"](Module["HEAPU8"], remapCallback["userData"]));
  }
  return results;
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
  return CStruct = (function(superClass) {
    var getters, resolved, setters;

    extend(CStruct, superClass);

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
        var results;
        results = [];
        for (field in fields) {
          if (!hasProp.call(fields, field)) continue;
          type = fields[field];
          results.push(" " + field + ": " + (dumpData(this['get'](field), type, stack)));
        }
        return results;
      }).call(this)).join(",") + " }";
    };

    CStruct["toString"] = function(stack) {
      var field, type;
      if (stack == null) {
        stack = [];
      }
      return "{" + ((function() {
        var results;
        results = [];
        for (field in fields) {
          if (!hasProp.call(fields, field)) continue;
          type = fields[field];
          results.push(" " + field + ": " + (dumpType(type, stack)));
        }
        return results;
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
      var field, fieldsNotToResolve, fn, offset, type;
      if (resolved) {
        return;
      }
      fieldsNotToResolve = [];
      for (field in fields) {
        if (!hasProp.call(fields, field)) continue;
        type = fields[field];
        if (type === SelfPtr) {
          fields[field] = ptr(this);
          fieldsNotToResolve.push(field);
        }
      }
      offset = 0;
      fn = function(offset, field, type) {
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
        if (!hasProp.call(fields, field)) continue;
        type = fields[field];
        fn(offset, field, type);
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
  return CArray = (function(superClass) {
    var checkIndex, resolved;

    extend(CArray, superClass);

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
      var i, j, ref, results;
      results = [];
      for (i = j = 0, ref = count; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
        results.push(this["get"](i));
      }
      return results;
    };

    CArray.prototype["toString"] = function(stack) {
      var index;
      if (stack == null) {
        stack = [];
      }
      return "[" + ((function() {
        var j, ref, results;
        results = [];
        for (index = j = 0, ref = count; 0 <= ref ? j < ref : j > ref; index = 0 <= ref ? ++j : --j) {
          results.push(" " + (dumpData(this.get(index), elemType, stack)));
        }
        return results;
      }).call(this)).join(",") + " ]";
    };

    CArray["toString"] = function(stack) {
      if (stack == null) {
        stack = [];
      }
      return (dumpType(elemType, stack)) + "[" + count + "]";
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
  return CPointer = (function(superClass) {
    var _address, resolved, size;

    extend(CPointer, superClass);

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

Module["string"] = string = CString = (function(superClass) {
  extend(CString, superClass);

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
    var results;
    results = [];
    for (argument in argumentsDef) {
      if (!hasProp.call(argumentsDef, argument)) continue;
      type = argumentsDef[argument];
      results.push(type);
    }
    return results;
  })();
  argumentNativeTypes = (function() {
    var j, len, results;
    results = [];
    for (j = 0, len = argumentTypes.length; j < len; j++) {
      type = argumentTypes[j];
      results.push(nativeTypeOf(type));
    }
    return results;
  })();
  cFunc = cwrap(name, returnNative, argumentNativeTypes);
  return Module[name] = function() {
    var args, i, j, nativeArgs, ref, result, resultNative;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    nativeArgs = new Array(argumentTypes.length);
    for (i = j = 0, ref = argumentTypes.length; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
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
    var results;
    results = [];
    for (argument in argumentsDef) {
      if (!hasProp.call(argumentsDef, argument)) continue;
      type = argumentsDef[argument];
      results.push(type);
    }
    return results;
  })();
  callbackFunc = function() {
    var args, i, j, nativeArgs, ref, result, resultNative;
    nativeArgs = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    args = new Array(argumentTypes.length);
    for (i = j = 0, ref = argumentTypes.length; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
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

ref = ["i1", "i8", "i16", "i32", "i64", "float", "double"];
for (j = 0, len = ref.length; j < len; j++) {
  type = ref[j];
  simplePointerTypes[type] = ptr(type);
}

// ---
// generated by coffee-script 1.9.2