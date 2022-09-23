// // Object creation

// var company = new Object();
// company.name = "Facebook";
// company.ceo = new Object();
// company.ceo.firstName = "Mark";
// company.ceo.favColor = "blue";

// console.log(company);
// console.log("Company  CEO name is: " + company.ceo.firstName);

// console.log(company["name"]);

// var stockPropName = "stock of company";
// company [stockPropName] = 110;
// console.log("stock spice is:" + company[stockPropName]);

// // or

// company.$stock = 110;

// console.log("Stock price is: " + company.$stock);

// ****** Better way: OBJECT LITERAL ******

var Facebook = {
    name: "Facebook",
    ceo: {
        FirstName: "Mark",
        vafColor: "blue"
    },
    "stock of the company": 110
};

console.log(Facebook);
console.log(Facebook.ceo.FirstName);


// ***** functions *******

function multiply(x, y) {
    return x * y;
}

// console.log (multiply(5, 3));
multiply.version = "v.1.0.0";
console.log (multiply.version);

// ****** function factory ********

function makeMultiplier(multiplier) {
    var myFunc = function (x) {
        return multiplier * x;
    };

    return myFunc;
}

var multiplyBy3 = makeMultiplier(3);
console.log(multiplyBy3(10));
var doubleAll = makeMultiplier(2);
console.log(doubleAll(40))


// **** passing functions as arguments ***
function doOperationOn(x, operation) {
    return operation(x);
}

var result = doOperationOn(5, multiplyBy3);
console.log(result);
result = doOperationOn(100, doubleAll);
console.log(result);