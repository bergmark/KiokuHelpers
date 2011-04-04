process.on('uncaughtException', function (err) {
  console.log("uncaughtException");
  console.log(require('sys').inspect(err));
  throw err;
});

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
    /*
    exports["find"] = function () {
      var u = new User({ name : "u" });
      repository.save(u).then(function () {
        repository.find("User").now();
      }).then(function (users) {
        console.log(users);
      }).now();
    };
    */
    exports["single arg"] = function () {
      var u1 = new User({ name : "u1" });
      repository.save(u1).then(function () {
        repository.findByUuid(u1.acquireID()).now();
      }).then(function (u) {
        assert.strictEqual(u, u1);
        repository.remove(u).now();
      }).then(function () {
        repository.find("User").now();
      }).then(function (users) {
        assert.strictEqual(0, users.length);
        this.CONT.CONTINUE();
      }).now();
    };
    exports["multiple args"] = function () {
      var u2 = new User({ name : "u2" });
      var u3 = new User({ name : "u3" });

      repository.save(u2, u3).then(function () {
        repository.findByUuid(u2.acquireID(), u3.acquireID()).then(function (_u2, _u3) {
          assert.strictEqual(_u2, u2);
          assert.strictEqual(_u3, u3);
          repository.remove(u2, u3).now();
        }).then(function () {
          repository.find("User").now();
        }).then(function (users) {
          assert.strictEqual(0, users.length);
        }).now();
      }).now();
    };
    exports["array args"] = function () {
      var u4 = new User({ name : "u4" });
      var u5 = new User({ name : "u5" });
      repository.saveSeveral([u4, u5]).then(function () {
        repository.findByUuidSeveral(u4.acquireID(), u5.acquireID()).now();
      }).then(function (arr) {
        assert.strictEqual(arr[0], u4);
        assert.strictEqual(arr[1], u5);
        repository.removeSeveral([u4, u5]).now();
      }).then(function () {
        repository.find("User").now();
      }).then(function (users) {
        assert.strictEqual(0, users.length);
      }).now();
    };
  }).now();
});
