// // Copy by Reference vs by Value
// var a = 7;
// var b = a;
// console.log("a: " + a);
// console.log("b: " + b);

// b = 5;
// console.log("after b update:");
// console.log("a: " + a);
// console.log("b: " + b);



// var a = { x: 7 };
// var b = a;
// console.log(a);
// console.log(b);

// b.x = 5;
// console.log("after b.x update:");
// console.log(a);
// console.log(b);






// // Pass by reference vs by value
// function changePrimitive(primValue) {
//   console.log("in changePrimitive...");
//   console.log("before:");
//   console.log(primValue);
  
//   primValue = 5;
//   console.log("after:");
//   console.log(primValue);
// }

// var value = 7;
// changePrimitive(value); // primValue = value
// console.log("after changePrimitive, orig value:");
// console.log(value);



// function changeObject(objValue) {
//   console.log("in changeObject...");
//   console.log("before:");
//   console.log(objValue);
  
//   objValue.x = 5;
//   console.log("after:");
//   console.log(objValue);
// }

// value = { x: 7 };
// changeObject(value); // objValue = value
// console.log("after changeObject, orig value:");
// console.log(value);


// Function constructors
function Circle (radius) {
    this.radius = radius;
  }
  
  Circle.prototype.getArea = 
    function () {
      return Math.PI * Math.pow(this.radius, 2);
    };
  
  
  var myCircle = new Circle(10); //new object();
  console.log(myCircle);
  console.log(myCircle.getArea());
  
  var myOtherCircle = new Circle(20);
  console.log(myOtherCircle);


  // Object literals and "this"

var literalCircle = {
    radius: 10,
  
    getArea: function () {
      var self = this;
      console.log(this);
  
      var increaseRadius = function () {
        self.radius = 20;
      };
      increaseRadius();
      console.log(this.radius);
  
      return Math.PI * Math.pow(this.radius, 2);
    }
  };
  
  console.log(literalCircle.getArea());



  function Dog(name) {
    this.name = name;
  }
  
  Dog.prototype.bark = function () {
    console.log(this.name + " likes barking! Bark!");
  }
  
  var max = new Dog("S", "B");
  max.bark();