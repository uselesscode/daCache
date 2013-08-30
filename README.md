#daCache: Deferred Aware Cache
daCache.js is a [jQuery Deferred](http://api.jquery.com/category/deferred-object/) aware
caching library.

#Usage

###daCache()
Returns an instance of daCache.

    var cache = daCache();

##Methods
###cache.set(key, value)
* Stores something in the cache.

####Example
    var cache = daCache();
    cache.set('item-price-715', 5000);

###cache.get(key, cacheLength, returnDeffered)
* Allows you to retrieve things from a cache. `undefined` is returned if the requested
  item does not exist in the cache.
* `cacheLength` determines how old an item must be before it is considered expired. 
  If you specify an integer, it will be used as the number of milliseconds old a
  cached item must be before it expires.  If `true`, if a cached copy exists it will
  always be returned regardless of how old it is. If `false`, the cached copy will
  not be used and `undefined` will be returned.
* If `returnDeffered` is true, if the item is not a [Deferred object](http://api.jquery.com/category/deferred-object/)
  it will be wrapped in a resolved deferred object before being returned.
  Note that if an item does not exist in the cache, `undefined` is always
  returned regardless of the `returnDeffered` option.
* If a pending Deferred object is stored in the cache, it will not expire until after it has resolved.

####Getting normally
    var cache = daCache(),
      value;

      cache.set('item-price-715', 5000);
      value = cache.get('item-price-715', 1000); // 5000
      value = cache.get('non-existent key', 1000); // undefined

####Getting as Deferred
    var cache = daCache();
      value;

    // This function will always return a Deferred object,
    // using returnDeffered set to true will either return
    // a Deferred object or undefined if the value does not
    // exist. If the value was not in the cache we fall back
    // to jQuery.get(), jQuery's ajax system returns a Deferred object
    function getPrice(itemId) {
      var value = cache.get('item-price-' + itemId, 1000, true);

      // If a deferred object was retrieved
      if (value) {
        // return the deferred
        return value;
      }

      // undefined was retrieved,
      // get the value from original source
      return $.get('http://www.example.com/api/1/get_price?itemid=' + itemId).done(function (value) {
        // store the value the AJAX call retrieved
        cache.set('item-price-' + itemId, value);
      });
    }

    getPrice(715).done(function (price) {
      // do something with price
    });

###cache.clear()
* Removes everything stored in the cache.

####Example
    var cache = daCache();

    cache.set('foo', 'bar');
    cache.clear();
    cache.get('foo'); // undefined

#Requirements
jQuery 1.7 or higher. To build you need Grunt 0.4.1 or higher.

#Thanks
* John Resig and the jQuery team.
