use('KiokuJS.Feature.Class.OwnUUID', function () {
  Module("NodeWebHelpers", function (m) {
    Role("Model", {
      does : KiokuJS.Feature.Class.OwnUUID,
      has : {
        createdAt : { is : "ro" },
        updatedAt : { is : "ro" }
      }
    });
  });
});
