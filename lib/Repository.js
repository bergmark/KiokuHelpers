var Collection = CactusJuice.Data.Collection;
Module("NodeWebHelpers", function (m) {
  Class("Repository", {
    trait : JooseX.CPS,
    has: {
      scope : null
    },
    continued : {
      methods : {
        save : function (model) {
          if (!model.createdAt) {
            model.createdAt = new Date();
          }
          model.updatedAt = new Date();
          this.scope.store(model).now();
        },
        remove : function (model) {
          this.scope.remove(model.getUuid()).now();
        },
        find : function () {
          var me = this;
          Collection.each(arguments, function (v) {
            me.CONT.AND(function () {
              console.log("and", v);
              me.scope.search({
                designDoc : "all",
                view : v
              }).except(function (e) {
                console.log("boo", e);
                throw e;
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
