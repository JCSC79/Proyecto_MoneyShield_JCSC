// src/utils/result.mjs

// This module defines a Result class to encapsulate the outcome of operations, providing a way to handle success and failure cases uniformly.
// Este módulo define una clase Result para encapsular el resultado de las operaciones, proporcionando una forma de manejar los casos de éxito y error de manera uniforme.

export class Result {
  constructor(success, data, error) {
    this.success = success;
    this.data = data;
    this.error = error || {};
  }
  static Success(data) {
    return new Result(true, data);
  }
  static Fail(message,code = 400) {
    return new Result(false, null,{
      message: message,
      code: code
    });
  }
}
