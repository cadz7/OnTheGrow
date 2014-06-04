/**
 * Created by justin on 2014-05-26.
 */


'use strict';
var expect = chai.expect;
describe('streamItems service', function() {
  var streamItemsCache;

  // Load the module
  beforeEach(module('sproutApp.data.stream-items-cache'));

  function addDays(date, days) {
    return new Date (
        date.getFullYear(),
        date.getMonth(),
        (date.getDate()+days)
    );
  }

  beforeEach(inject(function(_cache_) {
    // These mock stream items are going to be pulled in by the streamItemsCache service when it initializes
    // and it should then delete ones that are older than 15 days.
    var thirtyDaysAgo = addDays(new Date(), -30);
    var mockStreamItems = createMockStreamItems(0, 30, thirtyDaysAgo);
    var filterId = 1;
    _cache_.set('filter'+filterId, mockStreamItems);
    _cache_.push('filters', filterId);
  }));

  beforeEach(inject(function(_streamItemsCache_) {
    streamItemsCache = _streamItemsCache_;
  }));

  function getIds(items) {
    return _.map(items, function(item) {
      return item.streamItemId;
    });
  }

  function verifyOrderOfIds(items) {
    var ids = getIds(items);

    var sortedIds = _.sortBy(ids, function(id) {
      return -id; // reverse
    });

    expect(sortedIds).to.deep.equal(ids);
  }

  function createMockStreamItems(startId, endId, startDate) {
    startDate = startDate || new Date();

    var streamItems = [];
    var count = 0;
    while (startId <= endId) {
      streamItems.push(
          {
            streamItemId: startId,
            content: 'test ' + count,
            dateTimeCreated: addDays(startDate, count)
          });
      count++;
      startId++;
    }
    return streamItems;
  }

  it('updating the cache should store stream items ordered by id descending', function () {
    var filterId = 6;
    var mockStreamItems = [ {streamItemId: 1, content: 'test content'}, {streamItemId: 2, content: 'test content'}, {streamItemId: 3, content: 'test content'} ];

    var mockStreamItems2 = [ {streamItemId: 7, content: 'test content'}, {streamItemId: 8, content: 'test content'}, {streamItemId: 9, content: 'test content'} ];

    streamItemsCache.update(filterId, mockStreamItems);
    streamItemsCache.update(filterId, mockStreamItems2);
    var items = streamItemsCache.getItems(filterId, 10, 6);
    expect(items.length).to.equal(6);
    verifyOrderOfIds(items);
  });

  it('when the stream cache initializes it should delete stream items older than 15 days', function () {
    var filterId = 1;  // must use filter 1 since that is the filter that is loaded with stuff that was from > 15 days ago.
    var items = streamItemsCache.getItems(filterId, 31, 30);
    expect(items.length).to.equal(15);
    var fifteenDaysAgo = new Date(new Date()- new Date(0,0,15));
    items.forEach(function(item) {
      expect(item.dateTimeCreated >= fifteenDaysAgo);
    });
  });

  it('when the stream cache is updated, deleted items on the server should get deleted locally', function () {
    var filterId = 1;
    var fifteenDaysAgo = addDays(new Date(), -15);
    var streamItemsReturnedFromAPI = createMockStreamItems(16, 30, fifteenDaysAgo);
    expect(streamItemsReturnedFromAPI.length).to.equal(15);

    var items = streamItemsCache.getItems(filterId, 31, 30);
    expect(items.length).to.equal(15);

    // delete 3 stream items...  20 .. 22
    streamItemsReturnedFromAPI.splice(4, 3);
    streamItemsCache.update(filterId, streamItemsReturnedFromAPI, 16);


    var items = streamItemsCache.getItems(filterId, 31, 10);
    expect(items.length).to.equal(10); // ensure 3 were removed.
    var ids = _.map(items, function(item) { return item.streamItemId; });
    expect(ids).to.deep.equal([30,29,28,27,26,25,24,23,19,18]);


    // delete 3 stream items...  19 to 21 should now be deleted.
    streamItemsReturnedFromAPI.splice(4, 2);
    streamItemsCache.update(filterId, streamItemsReturnedFromAPI, null);

    var items = streamItemsCache.getItems(filterId, 31, 9);
    expect(items.length).to.equal(9);
    var ids = _.map(items, function(item) { return item.streamItemId; });
    expect(ids).to.deep.equal([30,29,28,27,26,25,19,18,17]);
  });
});
