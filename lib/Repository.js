var Options = Cactus.Util.Options;
var Collection = Cactus.Data.Collection;
var each = Collection.each;
var toArray = Collection.toArray.bind(Collection);
var map = Collection.map;
var isCollection = Collection.isCollection;
Module("KiokuHelpers", function (m) {
  Class("Repository", {
    trait : JooseX.CPS,
    has: {
      scope : null
    },
    continued : {
      methods : {
        store : function () {
          each(arguments, function (model) {
            if (!model.createdAt) {
              model.createdAt = new Date();
            }
            model.updatedAt = new Date();
          });
          this.scope.store.apply(this.scope, arguments).now();
        },
        storeSeveral : function (models) {
          this.store.apply(this, models).now();
        },
        remove : function () {
          this.scope.remove.apply(this.scope, arguments).now();
        },
        removeSeveral : function (models) {
          this.remove.apply(this, models).now();
        },
        search : function () {
          var me = this;
          each(arguments, function (v) {
            me.CONT.AND(function () {
              me.scope.search({
                designDoc : "all",
                view : v
              }).now();
            });
          });
          this.CONT.NOW();
        },
        lookUp : function () {
          this.scope.lookUp.apply(this.scope, arguments).now();
        },
        lookUpSeveral : function (vs) {
          var me = this;
          each(vs, function (v) {
            me.CONT.and(function () {
              me.lookUp(v).now();
            });
          });
          this.CONT.then(function () {
            this.CONT.CONTINUE(map(arguments, function (v) {
              return v[0];
            }));
          }).now();
        },
        request : function (h) {
          var options = new Options({
            map : true,
            type : {
              // This is the name "type", not a type definition.
              type : {
                enumerable : ["lookUp", "lookUpSeveral", "search", "store", "remove"]
              },
              args : {
                // List of arguments to the repo method
                type : [{
                  type : "mixed"
                }]
              }
            }
          });
          h = options.parse(h);
          var cont = this.CONT;
          var keys = [];
          for (var p in h) {
            keys.push(p);
            cont.and(function (type, args) {
              this[type].apply(this, args).now();
            }.bind(this, h[p].type, h[p].args));
          }
          cont.then(function () {
            var res = {};
            if (keys.length !== arguments.length) {
              throw new Error("The impossible happened.");
            }
            for (var i = 0; i < keys.length; i++) {
              var v = arguments[i][0];
              res[keys[i]] = isCollection(v) ? toArray(v) : v;
            }
            this.CONT.CONTINUE(res);
          }).now();
        }
      }
    }
  });
});
