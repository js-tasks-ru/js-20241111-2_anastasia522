/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size) {
  if (size) {
    const arr = string.split('');
    const newArr = [];
    let count = 1;

    for (let i = 0; i < arr.length; i++) {
      if (arr[i] === arr[i + 1]) {
        if (count < size) {
          count++;
          newArr.push(arr[i]);
        }
      } else {
        count = 1;
        newArr.push(arr[i]);
      }
    }

    return newArr.join('');
  } else if (size === 0) {
    return '';
  } else {
    return string;
  }
}
