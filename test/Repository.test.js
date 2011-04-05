var assert = require("assert");
require("../KiokuHelpers");
var JSON = Cactus.Util.JSON;
var fs = require("fs");
var config = JSON.parse(fs.readFileSync('./config.json', 'utf-8'));
var Repository = KiokuHelpers.Repository;
var Model = KiokuHelpers.Repository;

use(['KiokuJS.Backend.CouchDB', 'KiokuJS.Linker', 'KiokuHelpers.Model'], function () {
  Class("User", {
    does : KiokuJS.Feature.Class.OwnUUID,
    has : {
      name : null
    }
  });
  var handle = new KiokuJS.Backend.CouchDB({
    dbURL : config.couch.host + '/' + config.couch.db
  });

  var scope = handle.newScope();
  var repository = new Repository({
    scope : scope
  });
  scope.backend.__deleteDB().then(function () {
    scope.backend.__createDB().now();
  }).then(function () {
    scope.backend.__createView("all", "User", function (doc) {
      if (doc.className == 'User') {
        emit(null, doc);
      }
    }).now();
  }).then(function () {
    exports.teardown = function (done) {
      repository.search("User").then(function (users) {
        repository.removeSeveral(users).now();
      }).then(function () {
        done();
      }).now();
    };
    exports["search"] = function (done) {
      var u = new User({ name : "u" });
      repository.store(u).then(function () {
        repository.search("User").now();
      }).then(function (users) {
        assert.strictEqual(1, users.length);
        done();
      }).now();
    };
    exports["single arg"] = function (done) {
      var u1 = new User({ name : "u1" });
      repository.store(u1).then(function () {
        repository.lookUp(u1.acquireID()).now();
      }).then(function (u) {
        assert.strictEqual(u, u1);
        done();
      }).now();
    };
    exports["multiple args"] = function (done) {
      var u2 = new User({ name : "u2" });
      var u3 = new User({ name : "u3" });

      repository.store(u2, u3).then(function () {
        repository.lookUp(u2.acquireID(), u3.acquireID()).now();
      }).then(function (_u2, _u3) {
        assert.strictEqual(_u2, u2);
        assert.strictEqual(_u3, u3);
        done();
      }).now();
    };
    exports["array args"] = function (done) {
      var u4 = new User({ name : "u4" });
      var u5 = new User({ name : "u5" });
      repository.storeSeveral([u4, u5]).then(function () {
        repository.lookUpSeveral([u4.acquireID(), u5.acquireID()]).now();
      }).then(function (arr) {
        assert.strictEqual(arr[0], u4);
        assert.strictEqual(arr[1], u5);
        done();
      }).now();
    };
  }).now();
});
