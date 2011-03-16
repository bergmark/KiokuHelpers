Module("NodeWebHelpers", function (m) {
  Joose.Role("Model", {
    does : KiokuJS.Feature.Class.OwnUUID,
    has : {
      createdAt : { is : "ro" },
      updatedAt : { is : "ro" }
    }
  });
});
