use('KiokuJS.Feature.Class.OwnUUID', function () {
  Module("KiokuHelpers", function (m) {
    Role("Model", {
      does : KiokuJS.Feature.Class.OwnUUID,
      has : {
        createdAt : { is : "ro" },
        updatedAt : { is : "ro" }
      }
    });
  });
});
