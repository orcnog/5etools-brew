/* Utility Functions */
/* This file should contain only stand-alone functions, which do not depend on data or functions from any other files. */

/**
 * @function
 * @description perform a JSON.parse() and catch and log errors if unsuccessful
 * @param {String} str JSON string to attempt to parse 
 * @returns {Object} successfully parsed object
 */
function parse(str) {
    let obj = {};
    try {
        obj = JSON.parse(str);
    } catch (e) {
        console.error(e);
    }
    return obj;
}

/**
 * @function
 * @description perform a JSON.stringify() and catch and log errors if unsuccessful
 * @param {Object} obj JSON object to attempt to stringify 
 * @returns {String} successfully stringified, formatted object
 */
 function stringify(obj) {
    let str = '';
    try {
        str = JSON.stringify(obj, null, "\t");
    } catch (e) {
        console.error(e);
    }
    return str;
}

/**
 * @function
 * @description take a collection of similar objects and find & dedupe those with the same key, by
 *  merging the dupes together into one.
 * @example Given the following object:
 *  [
 *      {"name": "john", "age": 32, "hair": "brown"},
 *      {"name": "john", "age": 40, "eyes": "hazel"},
 *      {"name": "ben", "age": 23}
 *  ]
 *  the two "john" objs get merged. the result should be:
 *  [
 *      {"name": "john", "age": 40, "hair": "brown", "eyes": "hazel"},
 *      {"name": "ben", "age": 23}
 *  ]
 * @param {Array} arr A collection of similar objects.
 * @param {String} byKey The property key to use as the key by which items should be deduplicated. Ex: "name" 
 * @returns Array
 */
function mergeDupes (arr, byKey) {
    var groupedByItem = _.groupBy(arr, i => i[byKey]);
    var itemDupes = _.pickBy(groupedByItem, x => x.length > 1);
    var itemNonDupes = _.pickBy(groupedByItem, x => x.length === 1);
    var consolidatedItemsArray = [];
    _.values(itemDupes).forEach((arrayOfDupeItems) => {
        var consolidatedItem = _.mergeWith(...arrayOfDupeItems, (o,s,k) => {
            if (k === 'type' && (o === 'R' || s === 'R')) return 'R' // prefer "R" (Ranged) designation if dupes contain different ones. ex: Bo-rifle
        });
        consolidatedItemsArray.push(consolidatedItem);
    });
    var allMerged = (_.flatMap(itemNonDupes)).concat(consolidatedItemsArray);
    return allMerged;
}

/**
 * @function
 * @description Given a collection and a key, creates an object composed of all collection item grouped by lowercase key.
 * @param {Array} obj The collection possibly containing multiple items with the same key (ex: "name")
 * @param {String} key The key by which to compare items in the collection.
 * @returns Object The composed aggregate object.
 */
function keyByLowercase (obj, key) {
    const keyedObj = _.keyBy(obj, key);
    const lowerCaseKeyedObj = _.transform(keyedObj, function (result, val, key) {
        result[key.toLowerCase()] = val;
    });
    return lowerCaseKeyedObj;
}

/**
 * @function
 * @description Take two 5eTools-valid objects and merge them together, giving preference to the incoming source object for most value overrides.
 * @param {Object} destination The 5eTools object to merge the incoming object into.
 * @param {Object} incoming The incoming 5eTools object to merge into the destination object.
 * @param {Object} config the config object, based on the conversion type
 * @returns 
 */
function merge5eToolsObjects(destination, incoming, config) {
    if (typeof destination !== "object" || typeof incoming !== "object" || typeof config !== "object") {
        console.error("Objects cannot be merged.");
        return;
    }

    const prop2D = config.entityName5eTools; // property name identifying a collection of items to dedupe in the merge process. Ex: "monster". If no twoDProp is defined, it's assumed the merged objs do not need to respect a 2-dimensional array or keyed objects.
    const keyby = config.entityKeyByID; // key to use when deduping collection items. Ex: "name".
    const orderByAsc = config.alphabetizeByKey; // if a twoDKey is defined, should the returned object be ordered alphabetically by this key? Default: false.
    const customizeFunc = config.mergeCustomizerFunc; // A customizer function to use in lodash _.mergeWith methods for case-by-case value merge handling.

    // define the customizer function from the config, or null
    var customizer = prop2D && _.isArray(incoming[prop2D]) ? twoDimensionalArrayHandler : typeof customizeFunc === "function" ? customizeFunc : null;

    // top level lodash merge. customizer function will handle lower level custom rules.
    let finalMergedObject = _.mergeWith(destination, incoming, customizer);

    // alphabetize, if desired
    if (prop2D && orderByAsc && keyby) {
        finalMergedObject[prop2D] = _.orderBy(finalMergedObject[prop2D], keyby, 'asc');
    }

    return finalMergedObject;

    function twoDimensionalArrayHandler (obj, src) {
        if (_.isArray(obj)) {
            var merged = _.mergeWith(keyByLowercase(obj, keyby), keyByLowercase(src, keyby), customizeFunc);
            return _.values(merged);
        }
    }
}