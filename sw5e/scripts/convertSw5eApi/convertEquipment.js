const equipmentConfig = {
    // The ID of the property that houses this entity data. Ex: "item".
    entityName5eTools: 'item',

    // The ID of the main nested property by which entities should be uniquely keyed (no duplicates). Ex: "name".
    entityKeyByID: 'name',

    /**
     * @function
     * @description Convert a sw5eapi object into a valid 5eTools obj, providing flexibility to customize the structure of the returned object.
     * @param {Object} apiobj incoming sw5eapi object (parsed from JSON)
     * @returns {Object} converted 5eTools-formatted object
     */
    convertTo5eToolsObj: function (apiobj) {
        if (_.isArray(apiobj) === false) {
            // actually not sure what to do if the incoming sw5eapi object isn't an array. bail!!
            return null;
        }
        let items = [];
        for (i = 0; i < apiobj.length; i++) {
            const newItem = convertEquipmentItem(apiobj[i]);
            items.push(newItem);
        }
        items = mergeDupes(items, 'name');

        const converted5eTools = {
            "item": items
        };

        return converted5eTools;

        /**
         * @function
         * @description Convert a single sw5eapi object entity into a valid 5eTools entity, translating custom properties and substructures
         *  from the sw5eapi object into appropriately mapped properties and subsctructures in the returned 5eTools object.
         * @param {*} obj incoming sw5eapi object entity. Example: a single item from the "equipment" api Array, such as a weapon.
         * @returns {Object} converted 5eTools-formatted object
         */
        function convertEquipmentItem(obj) {
            let ret = {
                "name": obj.name,
                "source": sourceString,
                "page": 0,
                "type": getItemType(obj),
                "rarity": "none",
                "age": "futuristic"
            };
            if (obj.cost) {
                ret.value = parseInt(obj.cost) * 10;
            }
            if (obj.weight && parseFloat(obj.weight) > 0) {
                ret.weight = parseFloat(obj.weight);
            }
            if (obj.description) {
                ret.entries = [
                    obj.description || ""
                ]
            }
            const props = getItemProperty(obj);
            if (props && props.length > 0) {
                ret.property = props;
            }
            // Weapons
            if (ret.type === "M" || ret.type === "R") {
                ret.weapon = true;
                ret.weaponCategory = obj.weaponClassification.indexOf("Martial") > -1 ? "Martial" : "Simple";
                if (obj.damageNumberOfDice && obj.damageDieType && obj.damageType) {
                    ret.dmg1 = obj.damageNumberOfDice + "d" + obj.damageDieType + (obj.damageDieModifier !== 0 ? " + " + damageDieModifier : "");
                    ret.dmgType = obj.damageType;
                }
                if ("Versatile" in obj.propertiesMap) {
                    ret.dmg2 = obj.propertiesMap.Versatile.split(/[()]/)[1]; // get the value between parentheses, ex: 1d10
                }
                // Ranged Weapons
                if (ret.type === "R") {
                    ret.firearm = true;
                    ret.ammoType = "energy cell"; // possible values: "energy cell", "modern bullet", "blowgun needle|phb", "crossbow bolt|phb", "arrow|phb", "renaissance bullet", "sling bullet|phb"
                    var matchAlternativeAmmo = new RegExp(/[Rr]ather than traditional power cells.*?in the form of (.*?)\./);
                    if (typeof obj.description === "string") {
                        var match = obj.description.match(matchAlternativeAmmo);
                        if (match && match.length > 0) {
                            ret.ammoType = obj.description.match(matchAlternativeAmmo)[1];
                            ret.ammoType = ret.ammoType === "arrows" ? "arrow|phb" : ret.ammoType === "bolts" ? "crossbow bolts|phb" : ret.ammoType.indexOf("slug") > -1 ? 'modern bullet' : ret.ammoType;
                        }
                    }
                    if (obj.propertiesMap) {
                        Object.values(obj.propertiesMap).forEach((v) => {
                            if (v.search(/\(range \d/g) > -1) {
                                ret.range = (v.match(/[\d/]+/g)).join(); // filter out everything but digits and "/". Ex: "Power Cell (range 20/40)"" becomes "20/40"
                            }
                        });
                    }
                    if (obj.propertiesMap["Reload"]) {
                        ret.reload = parseInt(obj.propertiesMap.Reload.split(" ")[1]); // Ex: "reload 6" returns 6
                    }
                }
            }
            // Armor
            if (["HA", "MA", "LA", "S"].indexOf(ret.type) > -1) {
                ret.armor = true;
                ret.ac = obj.ac.match(/\d+/g)[0]; // Get only the AC number. Ex: filters "12 + Dex modifier (Max: 2)" to just "12".
                ret.stealth = obj.stealthDisadvantage;
                ret.strength = "Strength" in obj.propertiesMap ? parseInt(obj.propertiesMap.Strength.split(" ")[1]) : null; // Ex: "strength 11" returns 11
            }
            return ret;

            function getItemType(o) {
                // API item types:
                //	1: Ammunition 				=> AF
                //	2: Explosive				=> EXP
                //	3: Weapon					=> M or R
                //	4: Armor					=> HA, MA, LA, or S
                //	5: Storage					=> G
                //	7: Communications			=> G
                //	8: DataRecordingAndStorage	=> G
                //	9: LifeSupport				=> G
                //	10: Medical					=> G
                //	11: WeaponOrArmorAccessory	=> G
                //	12: Tool					=> AT
                //	16: Utility					=> G
                //	17: GamingSet				=> GS
                //	18: MusicalInstrument		=> INS
                //	20: Clothing				=> G
                //	21: Kit						=> T
                //	22: AlcoholicBeverage		=> FD
                //	23: Spice					=> OTH

                // 5eTools item types:
                // $: Treasure
                // A: Ammunition
                // AF: Ammunition (futuristic)
                // AIR: Vehicle (air)
                // AT: Artisan Tool
                // EM: Eldritch Machine
                // EXP: Explosive
                // FD: Food and Drink
                // G: Adventuring Gear
                // GS: Gaming Set
                // GV: Generic Variant
                // HA: Heavy Armor
                // INS: Instrument
                // LA: Light Armor
                // M: Melee Weapon
                // MA: Medium Armor
                // MNT: Mount
                // MR: Master Rune 
                // OTH: Other
                // P: Potion
                // R: Ranged Weapon
                // RD: Rod
                // RG: Ring
                // S: Shield
                // SC: Scroll
                // SCF: Spellcasting Focus
                // SHP: Vehicle (water)
                // T: Tool
                // TAH: Tack and Harness
                // TG: Trade Good
                // VEH: Vehicle (land)
                // WD: Wand
                const itemtype = o.equipmentCategoryEnum === 1 ? "AF" :
                    o.equipmentCategoryEnum === 2 ? "EXP" :
                    o.equipmentCategoryEnum === 3 ? (
                    o.weaponClassification.indexOf("Blaster") > -1 ? "R" :
                        o.weaponClassification.indexOf("Blaster") == -1 ? "M" : "") :
                    o.equipmentCategoryEnum === 4 ? (
                        o.armorClassification.indexOf("Heavy") > -1 ? "HA" :
                        o.armorClassification.indexOf("Medium") > -1 ? "MA" :
                        o.armorClassification.indexOf("Light") > -1 ? "LA" :
                        o.armorClassification.indexOf("Shield") > -1 ? "S" : "") :
                    o.equipmentCategoryEnum === 5 ? "G" :
                    o.equipmentCategoryEnum === 7 ? "G" :
                    o.equipmentCategoryEnum === 8 ? "G" :
                    o.equipmentCategoryEnum === 9 ? "G" :
                    o.equipmentCategoryEnum === 10 ? "G" :
                    o.equipmentCategoryEnum === 11 ? "G" :
                    o.equipmentCategoryEnum === 12 ? "AT" :
                    o.equipmentCategoryEnum === 16 ? "G" :
                    o.equipmentCategoryEnum === 17 ? "GS" :
                    o.equipmentCategoryEnum === 18 ? "INS" :
                    o.equipmentCategoryEnum === 20 ? "G" :
                    o.equipmentCategoryEnum === 21 ? "T" :
                    o.equipmentCategoryEnum === 22 ? "FD" :
                    o.equipmentCategoryEnum === 23 ? "OTH" : "";
                return itemtype;
            }

            function getItemProperty(o) {
                // API item properties:
                // variable string values

                // 5eTools item properties:
                // 2H: Two-Handed
                // A: Ammunition
                // AF: Ammunition (futuristic)
                // BF: Burst Fire
                // EM: Eldritch Machine
                // F: Finesse
                // H: Heavy
                // L: Light
                // LD: Loading
                // OTH: Other
                // R: Reach
                // RLD: Reload
                // S: Special
                // T: Thrown
                // V: Versatile
                let property = [];
                if (o.equipmentCategoryEnum === 1) {
                    property.push("AF");
                }
                if (!!o.propertiesMap) {
                    if (o.propertiesMap["Two-Handed"]) {
                        property.push("2H");
                    }
                    if (o.propertiesMap["Burst"]) {
                        property.push("BF");
                    }
                    if (o.propertiesMap["Finesse"]) {
                        property.push("F");
                    }
                    if (o.propertiesMap["Heavy"]) {
                        property.push("H");
                    }
                    if (o.propertiesMap["Light"]) {
                        property.push("L");
                    }
                    if (o.propertiesMap["Reach"]) {
                        property.push("R");
                    }
                    if (o.propertiesMap["Reload"]) {
                        property.push("RLD");
                    }
                    if (o.propertiesMap["Special"]) {
                        property.push("S");
                    }
                    if (o.propertiesMap["Range"] && o.propertiesMap["Range"].indexOf('thrown') > -1) {
                        property.push("T");
                    }
                    if (o.propertiesMap["Versatile"]) {
                        property.push("V");
                    }
                }
                return property;
            }
        }
    },

    /**
     * @function
     * @description  A customizer function to use in lodash _.mergeWith methods for case-by-case value merge handling.
     * @example {"weight": 0} merged into {"weight": 3} becomes {"weight": 3}
     * @param {*} o "object" - value to compare from destination (ex: 0)
     * @param {*} s "source" - value to compare from source (ex: 3)
     * @param {String} k "key" - this value's property ID, matching in both the destination and source objects (ex: "weight"). Read-Only.
     * @returns {*} value you want to assign as the "merged" value (ex: 3), or undefined to fallback to using the OOTB _mergeWith logic
     */
    mergeCustomizerFunc:  function (o, s, k) {
        if (o !== undefined && (s === undefined || s === null || s === "" || s === [])) return o;
        // for weight and value (cost) specifically, if a value already exists in destination, but incoming value is 0, defer to existing.
        if ((k === "weight" || k === "value") && o !== null && s === 0) return o;
        return undefined;
    },

    // Whether the merged entities be reordered in alphabetical order in the returned merged object
    alphabetizeByKey: true
}