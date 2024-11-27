/**
 * createGetter - создает функцию-геттер, которая позволяет получать значение из объекта
 * @param {string} path - путь в виде строки, разделенной точками
 * @returns {function} - функция-геттер, которая позволяет получать значение из объекта по заданному пути
 */
export function createGetter(path) {
  const keys = path.split('.');
  return function(obj) {
    let currentPath = obj;
    for (const key of keys) {
      if (!currentPath?.hasOwnProperty(key)) {
        return undefined;
      }
      currentPath = currentPath[key];
    }
    return currentPath;
  };
}