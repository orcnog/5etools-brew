function convertFeatureItem(obj) {
    let ret = {
        "name": obj.name,
        "source": sourceString,
        "page": 0,
        "type": getItemType(obj),
        "rarity": "none",
        "age": "futuristic"
    };
}

function convertFeature (apiobj) {
    alert('Feature conversion is under construction.');
    return null;

    let ret = {
        "item": []
    };

    for (i = 0; i < apiobj.item.length; i++) {
        const newItem = convertArchetypeItem(apiobj.item[i]);
        ret.item.push(newItem);
    }

    ret = mergeDupes(ret, 'item');
    return ret;
}