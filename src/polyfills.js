//@see https://github.com/hapijs/joi/issues/2021
if (RegExp.prototype.flags === undefined) {
  //eslint-disable-next-line no-extend-native
  Object.defineProperty(RegExp.prototype, "flags", {
    configurable: true,
    get: function() {
      return this.toString().match(/[gimsuy]*$/)[0];
    }
  });
}
