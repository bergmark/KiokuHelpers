var Options = Cactus.Util.Options;
var Collection = Cactus.Data.Collection;
var each = Collection.each;
var toArray = Collection.toArray;
Module("KiokuHelpers", function (m) {
  Class("Repository", {
    trait : JooseX.CPS,
    has: {
      scope : null
    },
    continued : {
      methods : {
        save : function () {
          each(arguments, function (model) {
            if (!model.createdAt) {
              model.createdAt = new Date();
            }
            model.updatedAt = new Date();
          });
          this.scope.store.apply(this.scope, arguments).now();
        },
        saveSeveral : function (models) {
          this.save.apply(this, models).now();
        },
        remove : function () {
          this.scope.remove.apply(this.scope, arguments).now();
        },
        removeSeveral : function (models) {
          this.remove.apply(this, models).now();
        },
        find : function () {
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
        findByUuid : function () {
          this.scope.lookUp.apply(this.scope, arguments).now();
        },
        findByUuidSeveral : function () {
          this.findByUuid.apply(this, arguments).now();
        },
        findByUuidMaybe : function (uuid) {
          if (uuid === null) {
            this.CONT.CONTINUE(null);
          } else {
            this.findByUuid(uuid).now();
          }
        },
        master : function (h) {
          var options = new Options({
            map : true,
            type : {
              // This is the name "type", not a type definition.
              type : {
                enumerable : ["findByUuid", "findByUuidMaybe", "find", "save", "remove" ]
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
              res[keys[i]] = arguments[i][0];
            }
            this.CONT.CONTINUE(res);
          }).now();
        }
      }
    }
  });
});
