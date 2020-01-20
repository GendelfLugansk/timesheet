import objectPath from "object-path";

/**
 * Colors generated with http://tools.medialab.sciences-po.fr/iwanthue/
 *
 * @type {string[]}
 */
const colors = [
  "#30c74d",
  "#94009a",
  "#75c730",
  "#7b37bd",
  "#d0c200",
  "#847fff",
  "#528c00",
  "#d662e8",
  "#008c32",
  "#b6059d",
  "#66dd83",
  "#d9008c",
  "#01c290",
  "#ce004d",
  "#56d8dd",
  "#f35230",
  "#0081f4",
  "#ba9300",
  "#0163ca",
  "#818e00",
  "#ff71d9",
  "#00824b",
  "#ff4771",
  "#01a09d",
  "#cc6200",
  "#5ab7ff",
  "#ff8a39",
  "#0075b0",
  "#ff7453",
  "#3c4f91",
  "#ffa562",
  "#773591",
  "#a3d484",
  "#981f63",
  "#375c0f",
  "#c7a9ff",
  "#805500",
  "#e2b7f0",
  "#9f2212",
  "#085f3f",
  "#ff6f9e",
  "#ae8a5d",
  "#7d3973",
  "#ffb28b",
  "#833c51",
  "#ff9fdb",
  "#7d4329",
  "#ff9b8f",
  "#9c2529",
  "#a46788"
];

const colorsCache = {},
  categoriesCache = {};

const chartColors = {
  getColor(category, key) {
    const cat = this._escapePathPart(category);
    const k = this._escapePathPart(key);
    if (objectPath.get(colorsCache, `${cat}.${k}`)) {
      return objectPath.get(colorsCache, `${cat}.${k}`);
    }

    if (!colorsCache[cat]) {
      colorsCache[cat] = {};
    }

    if (!categoriesCache[cat]) {
      categoriesCache[cat] = [];
    }

    const color = this._colorByIndex(categoriesCache[cat].length);

    categoriesCache[cat].push(k);
    if (color) {
      objectPath.set(colorsCache, `${cat}.${k}`, color);
    }

    return color;
  },

  _colorByIndex(index) {
    return index < colors.length
      ? colors[index]
      : this._colorByIndex(index - colors.length);
  },

  _escapePathPart(category) {
    return String(category).replace(/\./gi, "__dot__");
  }
};

export { colors };

export default chartColors;
