var hasPromiseMethods = function (v) {
    if (v &&
        v.always &&
        v.done &&
        v.fail &&
        v.pipe &&
        v.progress &&
        v.promise &&
        v.state &&
        v.then) {
      return true;
    }
    return false;
  },
  hasDeferredMethods = function (v) {
    if (v &&
        v.notify &&
        v.notifyWith &&
        v.reject &&
        v.resolve &&
        v.resolveWith) {
      return true;
    }
    return false;
  },
  isPromise = function (v) {
    if (hasPromiseMethods(v) && !hasDeferredMethods(v)) {
      return true;
    }
    return false;
  };
  isDeferred = function (v) {
    if (hasPromiseMethods(v) && hasDeferredMethods(v)) {
      return true;
    }
    return false;
  };

test( "hello test", function() {
  ok(true, "Passed!" );
});

test('cacheSet', function () {
  var cache = daCache();
  cache.set('foo', 'bar');
  strictEqual(cache.get('foo'), 'bar', 'foo was set to bar');
});
//test('cache.has', function () {
//  var cache = daCache();
//  cache.set('bar', 'foo');
//  ok(cache.has('bar'), 'cache has bar');
//  ok(!cache.has('baz'), 'cache does not have baz');
//});
test('cache.get length = true', function () {
  var cache = daCache();
  cache.set('bar', 'foo');
  strictEqual(cache.get('bar', true), 'foo', 'used cached value');
});
test('cache.get length === false', function () {
  var cache = daCache();
  cache.set('bar', 'foo');
  strictEqual(cache.get('bar', false), undefined, 'did not use cached value');
});
test('cache.get length === 60000', function () {
  var cache = daCache();
  cache.set('bar', 'foo');
  strictEqual(cache.get('bar', 60000), 'foo', 'value did not expire yet, returned foo');
});
asyncTest('cache.get test expiring', function () {
  var cache = daCache();
  expect(2);
  cache.set('foo', 'bar');
  var after,
    before = cache.get('foo', 500);

  strictEqual(before, 'bar', 'imediatly querying returned the cached value');
  setTimeout(function () {
    after = cache.get('foo', 500);
    strictEqual(after, undefined, 'cached value expired');
    start();
  }, 750);
});
test('cache.get store $.Deferred', function () {
  var cache = daCache()
    dfd = $.Deferred();

  cache.set('foo', dfd);
  var v = cache.get('foo');

  strictEqual(v.state(), 'pending', 'value is a pending Deferred');
});
test('cache.clear()', function () {
  var cache = daCache();

  cache.set('foo', 'bar');

  var out = cache.get('foo');

  strictEqual(out, 'bar', 'cache contained bar');

  cache.clear();

  out = cache.get('foo');
  strictEqual(out, undefined, 'cache no longer contains bar');
});
test('Collision test', function () {
  var cache1 = daCache(),
    cache2 = daCache();

  cache1.set('foo', 'bar');
  cache2.set('foo', 'baz');

  var out1 = cache1.get('foo');
    out2 = cache2.get('foo');

  strictEqual(out1, 'bar', 'cache1 contained bar');
  strictEqual(out2, 'baz', 'cache2 contained baz');

  cache1.clear();

  out1 = cache1.get('foo');
  out2 = cache2.get('foo');

  strictEqual(out1, undefined, 'cache1 no longer contains bar');
  strictEqual(out2, 'baz', 'cache2 still contains baz');
});
test('cache.get store non-Deferred, return Deferred', function () {
  var cache = daCache();
  cache.set('foo', 'bar');
  var v = cache.get('foo', true, true);

  strictEqual(v.state(), 'resolved', 'value is a resolved Deferred');
  v.done(function (ret) {
    strictEqual(ret, 'bar', 'value bar retrived from Deferred object');
  }).fail(function () {
    ok(false, 'Deferred failed');
  });

});
test('cache.get non-existing with returnDeferred', function () {
  var cache = daCache();

  var v = cache.get('foo', true, true);

  strictEqual(v, undefined, 'value is undefined');
});
asyncTest('Store undefined in cache with returnDeferred', function () {
  expect(2);
  var cache = daCache();

  cache.set('foo', undefined);

  var v = cache.get('foo', true, true);

  ok(isDeferred(v), 'is Deferred');
  if (v) {
    v.done(function (val) {
      strictEqual(val, undefined, 'undefined is the value of the Deferred');
      start();
    });
  } else {
    ok(false, 'undefined is the value of the promise');
    start();
  }

});
test('Store undefined in cache without returnDeferred', function () {
  expect(2);
  var cache = daCache();

  cache.set('foo', undefined);

  var v = cache.get('foo', true);

  ok(!isDeferred(v), 'is not a Deferred');
  strictEqual(v, undefined, 'is undefined'); // this would also have been undefined if we had not set foo
});

asyncTest('Store resolved Deferred with returnDeferred', function () {
  expect(2);
  var cache = daCache(),
    dfd = $.Deferred();

  dfd.resolve('bar');
  cache.set('foo', dfd);

  var v = cache.get('foo', true, true);

  ok(isDeferred(v), 'is Deferred');
  if (v) {
    v.done(function (val) {
      strictEqual(val, 'bar', '"bar" is the value of the Deferred');
      start();
    });
  } else {
    ok(false, '"bar" is the value of the promise');
    start();
  }

});
