var TypeChecker = Cactus.Util.TypeChecker;
var Collection = Cactus.Data.Collection;
var each = Collection.each;
var toArray = Collection.toArray.bind(Collection);
var map = Collection.map;
var isCollection = Collection.isCollection;
Module("KiokuHelpers", function (m) {
  Class("Repository", {
    trait : JooseX.CPS,
    has: {
      scope : { required : true }
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
        search : function (viewName, args) {
          args = args || {};
          var me = this;
          args.designDoc = "all",
          args.view = viewName;
          me.scope.search(args).then(function () {
            this.CONTINUE(toArray(arguments));
          }).now();
        },
        searchFirst : function (view, key) {
          var options = {};
          if (key) {
            options.key = key;
          }
          this.search(view, options).then(function (objs) {
            this.CONTINUE(objs[0] || null);
          }, this).now();
        },
        searchPaged : function (view, options) {
          options.descending = !!options.descending;
          var skip = (options.page - 1) * options.itemsPerPage;
          this.search(view, { skip : skip, limit : options.itemsPerPage, descending : options.descending }).now();
        },
        lookUp : function () {
          var cont = this.CONT;
          for (var i = 0; i < arguments.length; i++) {
            var uuid = arguments[i];
            if (!/[0-9A-Z]{8}-[0-9A-Z]{4}-[0-9A-Z]{4}-[0-9A-Z]{4}-[0-9A-Z]{8}/i.test(uuid)) {
              this.THROW(new Error("Invalid UUID specified: " + uuid));
              return;
            }
          }
          this.scope.lookUp.apply(this.scope, arguments).now();
        },
        lookUpSeveral : function (vs) {
          this.scope.lookUp.apply(this.scope, vs).then(function () {
            this.CONTINUE(Collection.toArray(arguments));
          }).now();
        },
        request : function (h) {
          var options = new TypeChecker({
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
              if (type === "lookUpSeveral") {
                this[type](args).now();
              } else {
                this[type].apply(this, args).now();
              }
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
            this.CONTINUE(res);
          }).now();
        }
      }
    }
  });
});
