// ******* string concatination******
var string = "Hello";
string += " World";
// string=string + "world";
console.log(string + "!");


// ***** Regural math operators: +, -, *, /
console.log((5+4)*3);
console.log (undefined/5);
function test1 (a){
    console.log(a/5);
    console.log(20/5)
}
test1();

// **** Equality******

var x=4, y=4
if (x==y) {
    console.log("x=4 is eaqual to y=4")
}

x="4"
if (x==y) {
    console.log("x='4' is eaqual to y=4")
}

// ***** strict equality ****
if(x===y) {
    console.log("strict: x='4' is equal to y=4");
}
else {
    console.log("strict: x='4' is NOT equal to y=4");
}


// ***** if statement (ALL FALSE)*******
if(false||null||undefined||""||0||NaN){
    console.log("This line will never execute");
}
else{
    console.log("All false");
}

if(true&&"hello"&&1&&-1&&"false"){
    console.log("All true");
}


// ***** global message****
var message = "in global";
console.log("global: message = " + message);

var a = function () {
  var message = "inside a";
  console.log("a: message = " + message);

//   function b () {
//     console.log("b: message = " + message); 
//   }

//   b();
}

a();

// ***** Best practice for {} style
// WRONG
// function a() 
// {
//   return
//   { 
//     name: "Yaakov"
//   };
// }

// // RIGHT
// function b() {
//     return { 
//         name: "Yaakov"
//     };
//   }
//   console.log(a());
//   console.log(b());

//   **** LOOP ****
// i++  same as i=i+1

var sum = 0;
for (var i = 0; i < 10; i++) {
  console.log(i);
  sum = sum + i;
}
console.log("sum of 0 through 9 is: " + sum);

// ******* Default values

function orderChickenWith(sideDish) {
    sideDish=sideDish||"belekas"
    // or
    // if(sideDish === undefined){
    //     sideDish="belekas";
    // }
    console.log("Chicken with " + sideDish);
  }
  orderChickenWith("noodles");
  orderChickenWith();

//   ******** OBJECT CREATION *******

var company = new Object();
company.name = "Facebook";
company.ceo = new Object();
company.ceo.firstName = "Mark";
company.ceo.favColor = "Blue";
