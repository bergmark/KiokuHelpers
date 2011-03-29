var Collection = Cactus.Data.Collection;
var each = Collection.each;
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
        findByUuid : function (uuid) {
          if (typeof uuid !== "string" || uuid == "") {
            throw new Error("Repository:findByUuid: uuid must be non-empty string.");
          }
          this.scope.lookUp(uuid).now();
        },
        findByUuidMaybe : function (uuid) {
          if (uuid === null) {
            this.CONT.CONTINUE(null);
          } else {
            this.findByUuid(uuid).now();
          }
        }
      }
    }
  });
});
