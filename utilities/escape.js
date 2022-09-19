function escape(str) {
  return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
}

module.exports = escape;
