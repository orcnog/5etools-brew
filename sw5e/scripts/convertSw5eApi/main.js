const initialSw5eApiUrl = "https://sw5eapi.azurewebsites.net/api/equipment";
const initial5eToolsJsonURL = "https://raw.githubusercontent.com/orcnog/5etools-brew/main/sw5e/source/orcnogSW5e.json";
const sourceString = "orcnogSW5e";

$(document).ready(function () {
    $('[name=sourceURL]').val(initialSw5eApiUrl);
    $('[name=destinationURL]').val(initial5eToolsJsonURL);
    $('[name=sourceURL]').on('change', handle_custom_sourceURL);
    $('[name=sw5eapi]').on('change', handle_sw5eapiURL_change);
    $('[name=conversiontype]').on('change', handle_conversiontype_change);
    $('#convert_from_urls').on('click', handle_convert_JSON_from_URLs);
    $('#import_from_urls').on('click', handle_import_JSON_from_URLs);
    $('#convert_textareas').on('click', handle_convert_textareas_JSON);
});

/**
 * @function
 * @description when the sw5eapi dropdown changes, copy the selected sw5eapi dropdown value
 * 	into the sourceURL input field and update and hide conversiontype dropdown.
 */
function handle_sw5eapiURL_change() {
    let sw5eapi = $('[name=sw5eapi]').val();
    let conversionType = $('[name=sw5eapi]').find(':selected').attr('data-conversiontype');
    if (sw5eapi !== 'none') {
        $('[name=sourceURL]').val(sw5eapi);
        $('.conversion-type-selection').removeClass('expanded');
        $('[name=conversiontype]').val(conversionType);
    }
}

/**
 * @function
 * @description if the input field's value is customized, clear out the sw5eapi dropdown
 * 	and unhide conversiontype selection dropdown.
 */
function handle_custom_sourceURL() {
    $('[name=sw5eapi]').val('none');
    $('.conversion-type-selection').addClass('expanded');
}

/**
 * @function
 * @description if the conversion type dropdown selection changes, make sure to update both dropdowns
 */
    function handle_conversiontype_change() {
    let conversionType = $('[name=conversiontype]').val();
    $('[name=conversiontype]').val(conversionType);
}

/**
 * @function
 * @description grab the JSON from the two provided URLs and copy it inot the "paste" textareas
 */
function handle_import_JSON_from_URLs() {
    const sourceURL = $('[name=sourceURL]').val();
    const destinationURL = $('[name=destinationURL]').val();
    get_JSON_from_URLs(sourceURL, destinationURL).then((srcAndDestArr) => {
        $('#panel_left').val(stringify(srcAndDestArr[0]));
        $('#panel_right').val(stringify(srcAndDestArr[1]));
    });
}

/**
 * @function
 * @description grab the JSON from the two provided URLs and pass it thru the convertJSON function.
 */
function handle_convert_JSON_from_URLs() {
    const sourceURL = $('[name=sourceURL]').val();
    const destinationURL = $('[name=destinationURL]').val();
    const conversionType = $('[name=conversiontype]').val();
    get_JSON_from_URLs(sourceURL, destinationURL).then((srcAndDestArr) => {
        const leftObj = srcAndDestArr[0];
        const rightObj = srcAndDestArr[1];
        // Main function
        const convertedAndMerged = convertAndMerge(leftObj, rightObj, conversionType);
        $('#panel_output').val(stringify(convertedAndMerged));
        $('#panel_output').focus();
    });
}

/**
 * @function
 * @description grab the JSON from the two static textareas and pass it thru the convertJSON function.
 */
function handle_convert_textareas_JSON() {
    const leftString = $('#panel_left').val();
    const rightString = $('#panel_right').val();
    const conversionType = $('[name=conversiontype]').val();
    const leftObj = parse(leftString);
    const rightObj = parse(rightString);
    // Main function
    const convertedAndMerged = convertAndMerge(leftObj, rightObj, conversionType);
    $('#panel_output').val(stringify(convertedAndMerged));
    $('#panel_output').focus();
}

/**
 * @function
 * @description grab the JSON from the two provided URLs and return it as a .then()
 */
function get_JSON_from_URLs(sourceURL, destinationURL) {
    const getSrcJSON = $.getJSON(sourceURL).then((data) => {
        return data;
    });
    const getDestJSON = $.getJSON(destinationURL).then((data) => {
        return data;
    });
    return Promise.all([getSrcJSON, getDestJSON]).then((values) => {
        return values; // the final returned value of the get_JSON_from_URLS function, an array containing a src URL obj and a dest URL obj.
    });
}

/**
 * @function
 * @description Convert a parsed SW5e API object into a valid 5eTools Object, and then merge with existing 5eTools Object
 * @param {Object} srcObj source object in valid sw5eapi structure
 * @param {Object} destObj destination object in valid 5etools structure
 * @param {String} conversionType sw5eapi database name, ex: "enhancedItem"
 * @return {Object} converted and merged object in valid 5etools structure
 */
function convertAndMerge(srcObj, destObj, conversionType) {
    const config = getConfig(conversionType);
    if (typeof config !== 'object' || typeof config.convertTo5eToolsObj !== 'function') {
        return null;
    }

    // Convert sw5eapi object into a 5etools object
    const convertedSrcObj = config.convertTo5eToolsObj(srcObj);

    // Merge the converted source object into the existing (provided) destination object
    const mergedObj = merge5eToolsObjects(destObj, convertedSrcObj, config);

    return mergedObj;
}

function getConfig(conversionType) {
    if (conversionType === 'archetype') {
        return archetypeConfig;
    } else if (conversionType === 'class') {
        return classConfig;
    } else if (conversionType === 'enhancedItem') {
        return enhancedItemConfig;
    } else if (conversionType === 'equipment') {
        return equipmentConfig;
    } else if (conversionType === 'feat') {
        return featConfig;
    } else if (conversionType === 'feature') {
        return featureConfig;
    } else if (conversionType === 'monster') {
        return monsterConfig;
    } else if (conversionType === 'power') {
        return powerConfig;
    } else if (conversionType === 'species') {
        return speciesConfig;
    } else {
        alert('Unknown conversion type');
    }
}
