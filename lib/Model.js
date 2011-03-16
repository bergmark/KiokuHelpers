console.log(1);
use('KiokuJS.Feature.Class.OwnUUID', function () {
  console.log(2);
  Module("NodeWebHelpers", function (m) {
    console.log(3);
    Role("Model", {
      does : KiokuJS.Feature.Class.OwnUUID,
      has : {
        createdAt : { is : "ro" },
        updatedAt : { is : "ro" }
      }
    });
  });
});
