class MMath {
  static Add(matrix1, matrix2) {
    if(matrix1.array.length !== matrix2.array.length || matrix1.array[0].length !== matrix2.array[0].length) {
      console.log("Cannot Add");
      return;
    }
    var addedMatrix = [];
    for(let row = 0; row < matrix1.array.length;row++) {
      addedMatrix.push([]);
      for(let column = 0; column < matrix1.array[0].length;column++) {
        addedMatrix[addedMatrix.length-1].push(matrix1.array[row][column] + matrix2.array[row][column]);
      }
    }
    var newMatrix = new WeightMatrix(2, 3);
    newMatrix.set(addedMatrix);
    return newMatrix;
  }
  static Multiply(matrix1, matrix2) {
    if(matrix2.array.length !== matrix1.array[0].length) {
      console.log("Cannot Multiply"); 
      return;
    } 
    var multipliedMatrix = [];
    for(let row = 0; row < matrix1.array.length; row++) {
    multipliedMatrix[row] = [];
      for(let column = 0; column < matrix2.array[0].length; column++) {
        multipliedMatrix[row][column] = 0;
        for(let iteration = 0; iteration < matrix1.array[0].length; iteration++) {
          multipliedMatrix[row][column] += matrix1.array[row][iteration] * matrix2.array[iteration][column];
        }
      }
    }
    var newMatrix = new WeightMatrix(2, 3);
    newMatrix.set(multipliedMatrix);
    return newMatrix;
  }
  static Sigmoid(matrix) {
    var simplifiedMatrix = [];
    for(let row = 0; row < matrix.array.length;row++) {
      simplifiedMatrix.push([]);
      for(let column = 0; column < matrix.array[0].length;column++) {
        simplifiedMatrix[simplifiedMatrix.length - 1].push(Activation(matrix.array[row][column]));
      }
    }
    var newMatrix = new WeightMatrix(2, 3);
    newMatrix.set(simplifiedMatrix);
    return newMatrix;
  }
}

class WeightMatrix {
  constructor(rows, columns) {
    this.array = [];
    for(let x = 0; x < rows; x++) {
      this.array.push([]);
      for(let y = 0; y < columns; y++) {
        this.array[this.array.length-1].push(this.Random());
      }
    }
  }
  Random() {
    return (Math.random() * 20)-10;
  }
  set(matrix) {
    this.array = matrix;
  }
}

class BiasVector {
  constructor(length) {
    this.array = [];
    for(let x = 0; x < length; x++) {
      this.array.push([]);
      this.array[this.array.length-1].push(this.Random());
    }
  }
  Random() {
    return (Math.random() * 20)-10;
  }
  set(matrix) {
    this.array = matrix;
  }
}

class InputVector {
  constructor(matrix) {
    this.array = matrix;
  }
  set(matrix) {
    this.array = matrix;
  }
}
