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
                "rarity": getItemRarity(obj),
                "age": "futuristic"
            };
            ret.value = obj.cost ? parseInt(obj.cost) * 10 : undefined;
            ret.weight = obj.weight && parseFloat(obj.weight) > 0 ? ret.weight = parseFloat(obj.weight) : undefined;
            ret.entries = getItemEntries(obj);
            ret.property = getItemProperty(obj);
            ret.foundryType = getItemType(obj, true);
            ret.reqAttune = undefined;

            // TODO: ret.reqAttune // String like "by a cleric or paladin of good alignment"
            // TODO: ret.reqAttuneAlt // String OR Boolean. Used for filtering.
            // TODO: ret.reqAttuneTags // Array of objects (see D:\Development\5etools-mirror-1.github.io\test\schema\items.json)
            // TODO: ret.recharge // String like "dawn"
            // TODO: ret.charges // Integer

            // TODO: ret.baseItem // String, ID of an existing item?
            // TODO: ret.valueMult // Number
            // TODO: ret.weightMult // Number
            // TODO: ret.wondrous // Boolean
            // TODO: ret.tier // String like "major"
            // TODO: ret.ammunition // Boolean. An item that uses ammunition; not an item that is ammunition.
			// TODO: ret.poison // Boolean
			// TODO: ret.poisonTypes // Array of strings (enum: "contact","ingested","injury","inhaled")
			// TODO: ret.tatoo // Boolean
			// TODO: ret.curse // Boolean
			// TODO: ret.sentient // Boolean
			// TODO: ret.vulnerable // Array (see D:\Development\5etools-mirror-1.github.io\test\schema\items.json)
			// TODO: ret.immune // Array (see D:\Development\5etools-mirror-1.github.io\test\schema\items.json)
			// TODO: ret.conditionImmune // Array (see D:\Development\5etools-mirror-1.github.io\test\schema\items.json)
			// TODO: ret.bonusSpellAttack // String like "+2"
			// TODO: ret.bonusSpellSaveDc // String like "+2"
			// TODO: ret.bonusSpellDamage // String like "+2"
			// TODO: ret.bonusSavingThrow // String like "+1"
			// TODO: ret.bonusAbilityCheck // String like "+1"
			// TODO: ret.bonusProficiencyBonus // String like "+1"
			// TODO: ret.bonusAc // String like "+1"
			// TODO: ret.bonusWeapon // String like "+3"
			// TODO: ret.bonusWeaponAttack // String like "+3"
			// TODO: ret.bonusWeaponDamage // String like "+2"
			// TODO: ret.bonusWeaponCritDamage // String like "4d6"
			// TODO: ret.critThreshold // Integer. Ex: 19
			// TODO: ret.modifySpeed // Ex: {"equal":{"swim:"walk"}}, Ex2: "bonus":{"*":5}, Ex3: {"multiply":{"walk":2}}, Ex4: {"static":{"fly":150}}
            // TODO: ret.focus // Boolean, OR Array with class names. Ex: ["Druid","Warlock"]
            // TODO: ret.scfType // String enum "arcane","druid","holy"
            // TODO: ret.packContents // Array of item name strings, or objects (see D:\Development\5etools-mirror-1.github.io\data\items.json)
            // TODO: ret.containerCapacity // Complex object. Ex: {"weight":[6],"item":[{"sling bullet|phb":20,"blowgun needle|phb":50}],"weightless":true}
            // TODO: ret.atomicPackContents // Boolean. If the item's pack contents should be treated as one atomic unit, rather than handled as individual sub-items.
            // TODO: ret.carryingCapacity // Integer. Of a mount/beast, not a container.
            // TODO: ret.resist // Array of damage type strings Ex: ["lightning"]
            // TODO: ret.grantsProficiency // Boolean
            // TODO: ret.ability // Object with ability abbrevs. and int value, maybe wrapped with "static". Ex: {"str":2}, Ex 2: {"static": {"str": 21}}
            // TODO: ret.attachedSpells // Array of spell name strings. Ex: ["reincarnate"]
            // TODO: ret.spellScrollLevel // Integer
            // TODO: ret.additionalEntries // complex object (see D:\Development\5etools-mirror-1.github.io\data\items.json)
            // TODO: ret.detail1 // String. A descriptive field that can be used to complete entries in variants.
            // TODO: ret.dexterityMax // not sure if i need this?  Max dex for medium armor
            // TODO: ret.typeAlt // not sure if i need this?
            // MAYBE TODO: Vehicles as Items...
            // Veh TODO: "crew": 1
            // Veh TODO: "crewMax": 13
            // Veh TODO: "crewMin": 3
			// Veh TODO: "vehAc": 11
			// Veh TODO: "vehHp": 50
            // Veh TODO: "vehDmgThresh": 15
			// Veh TODO: "vehSpeed": 1.5
			// Veh TODO: "capPassenger": 3
			// Veh TODO: "capCargo": 100,
			// Veh TODO: "travelCost": 100, // in copper pieces per mi. per passenger
			// Veh TODO: "shippingCost": 10, // in copper pieces per 100 lbs. per mi.
			// Veh TODO: "seeAlsoVehicle": ["Sailing Ship"]

            // Weapons
            if (ret.type === "M" || ret.type === "R") {
                ret.weapon = true;
                ret.weaponCategory = obj.weaponClassification && obj.weaponClassification.indexOf("Martial") > -1 ? "Martial" : "Simple";
                // has damage
                if (obj.damageNumberOfDice && obj.damageDieType && obj.damageType) {
                    ret.dmg1 = obj.damageNumberOfDice + "d" + obj.damageDieType + (obj.damageDieModifier !== 0 ? " + " + damageDieModifier : "");
                    ret.dmgType = obj.damageType;
                }
                // is versatile
                if (obj.propertiesMap && "Versatile" in obj.propertiesMap) {
                    ret.dmg2 = obj.propertiesMap.Versatile.split(/[()]/)[1]; // get the value between parentheses, ex: 1d10
                }
                // Ranged Weapons
                if (ret.type === "R") {
                    ret.firearm = true;
                    ret.ammoType = getAmmo(obj);
                    if (obj.propertiesMap && "Reload" in obj.propertiesMa) {
                        ret.reload = parseInt(obj.propertiesMap.Reload.split(" ")[1]); // Ex: "reload 6" returns 6
                    }
                }
            }
            ret.range = getRange(obj);

            // Armor
            if (["HA", "MA", "LA", "S"].indexOf(ret.type) > -1) {
                ret.armor = true;
            }
            ret.ac = 'ac' in obj ? obj.ac.match(/\d+/g)[0] : undefined; // Get only the AC number. Ex: filters "12 + Dex modifier (Max: 2)" to just "12".
            ret.stealth = 'stealthDisadvantage' in obj ? obj.stealthDisadvantage : undefined;
            ret.strength = obj.propertiesMap && "Strength" in obj.propertiesMap ? parseInt(obj.propertiesMap.Strength.split(" ")[1]) : undefined; // Ex: "strength 11" returns 11
            return ret;
            
            function getItemEntries(o) {
                let description;
                if ('description' in o) {
                    description = [o.description]
                } else if ('text' in o) {
                    let txt = o.text;
                    txt = txt.replace('_**Requires attunement**_\r\n', '');
                    txt = txt.replace('\r\n', ' ');
                    txt = txt.replace('\r', ' ');
                    txt = txt.replace('\n', ' ');
                    const bold = /\*\*(.*?)\*\*/gm;
                    txt = txt.replace(bold, '\{@b $1\}');
                    const italic1 = /\*(.*?)\*/gm;
                    const italic2 = /_(.*?)_/gm;
                    txt = txt.replace(italic1, '\{@i $1\}');
                    txt = txt.replace(italic2, '\{@i $1\}');
                    description = [txt];
                }
                return description || undefined;
            }

            /**
             * @function
             * @param {Object} o entity object to parse 
             * @param {Boolean} foundry if true, return the 5etools "foundryType". default is False: return the 5etools "type"
             * @returns {String}
             */
            function getItemType(o, foundry) {
                // Mapping Notes

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

                // API equipment types:
                //	1: Ammunition 				=> AF|consumable
                //	2: Explosive				=> EXP|consumable
                //	3: Weapon					=> M or R |weapon
                //	4: Armor					=> HA, MA, LA, or S |armor
                //	5: Storage					=> G|backpack
                //	7: Communications			=> G|equipment
                //	8: DataRecordingAndStorage	=> G|equipment
                //	9: LifeSupport				=> G|equipment
                //	10: Medical					=> G|consumable
                //	11: WeaponOrArmorAccessory	=> G|equipment
                //	12: Tool					=> AT|tool
                //	16: Utility					=> G|equipment
                //	17: GamingSet				=> GS|equipment
                //	18: MusicalInstrument		=> INS|equipment
                //	20: Clothing				=> G|equipment
                //	21: Kit						=> T|consumable
                //	22: AlcoholicBeverage		=> FD|consumable
                //	23: Spice					=> OTH|consumable

                // API enhancedItem types:
                //	1: AdventuringGear			=> G|equipment
                //	2: Armor    				=> G|equipment // TODO: convert generic variants to "GV" (ex: general augments like +1 armor)
                //	3: Consumable				=> FD|consumable // TODO: in the future, consider using P (potion) for some consumables?
                //	4: CyberneticAugmentation   => G|equipment
                //	5: DroidCustomization       => G|equipment
                //	6: Focus					=> SCF|equipment
                //	7: ItemModification			=> G|equipment
                //	8: Shield					=> S|equipment
                //	9: Weapon   				=> M or R |weapon
                //	10: ??? 					=> 
                //	11: ShipArmor            	=> G|equipment
                //	12: ShipShield          	=> G|equipment
                //	13: ShipWeapon				=> G|equipment

                const itemTypeStr = o.equipmentCategoryEnum === 1 ? "AF|consumable" :
                    o.equipmentCategoryEnum === 2 ? "EXP|consumable" :
                    o.equipmentCategoryEnum === 3 ? (
                    o.weaponClassification.indexOf("Blaster") > -1 ? "R|weapon" :
                        o.weaponClassification.indexOf("Blaster") == -1 ? "M|weapon" : "") :
                    o.equipmentCategoryEnum === 4 ? (
                        o.armorClassification.indexOf("Heavy") > -1 ? "HA|armor" :
                        o.armorClassification.indexOf("Medium") > -1 ? "MA|armor" :
                        o.armorClassification.indexOf("Light") > -1 ? "LA|armor" :
                        o.armorClassification.indexOf("Shield") > -1 ? "S|armor" : "") :
                    o.equipmentCategoryEnum === 5 ? "G|backpack" :
                    o.equipmentCategoryEnum === 7 ? "G|equipment" :
                    o.equipmentCategoryEnum === 8 ? "G|equipment" :
                    o.equipmentCategoryEnum === 9 ? "G|equipment" :
                    o.equipmentCategoryEnum === 10 ? "G|consumable" :
                    o.equipmentCategoryEnum === 11 ? "G|equipment" :
                    o.equipmentCategoryEnum === 12 ? "AT|tool" :
                    o.equipmentCategoryEnum === 16 ? "G|equipment" :
                    o.equipmentCategoryEnum === 17 ? "GS|equipment" :
                    o.equipmentCategoryEnum === 18 ? "INS|equipment" :
                    o.equipmentCategoryEnum === 20 ? "G|equipment" :
                    o.equipmentCategoryEnum === 21 ? "T|consumable" :
                    o.equipmentCategoryEnum === 22 ? "FD|consumable" :
                    o.equipmentCategoryEnum === 23 ? "OTH|consumable" :
                    o.typeEnum === 1 ? "G|equipment" :
                    o.typeEnum === 2 ? "G|equipment" :
                    o.typeEnum === 3 ? "FD|equipment" :
                    o.typeEnum === 4 ? "G|equipment" :
                    o.typeEnum === 5 ? "G|equipment" :
                    o.typeEnum === 6 ? "SCF|equipment" :
                    o.typeEnum === 7 ? "G|equipment" :
                    o.typeEnum === 8 ? "S|equipment" :
                    o.typeEnum === 9 ? (
                        o.subtype.indexOf("blaster") > -1 ? "R|weapon" : "M|weapon") :
                    o.typeEnum === 10 ? "G|equipment" :
                    o.typeEnum === 11 ? "G|equipment" :
                    o.typeEnum === 12 ? "G|equipment" :
                    o.typeEnum === 13 ? "G|equipment" : "";
                if (itemTypeStr.length > 0) {
                    const itemType = itemTypeStr.split('|')[0];
                    const foundryType = itemTypeStr.split('|')[1];
                    return foundry ? foundryType : itemType;
                }
                return undefined;
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
                return property.length > 0 ? property : undefined;
            }

            function getItemRarity(o) {
                let rarity = "none";
                if (o.rarityOptionsEnum[0] === 1) rarity = "common" // Standard
                if (o.rarityOptionsEnum[0] === 2) rarity = "uncommon" // Premium
                if (o.rarityOptionsEnum[0] === 3) rarity = "rare" // Prototype
                if (o.rarityOptionsEnum[0] === 4) rarity = "very rare" // Advanced
                if (o.rarityOptionsEnum[0] === 5) rarity = "legendary" // Legendary
                if (o.rarityOptionsEnum[0] === 6) rarity = "artifact" // Artifact

                return rarity;
            }

            function getAmmo(o) {
                let ammoType = "energy cell"; // possible values: "energy cell", "modern bullet", "blowgun needle|phb", "crossbow bolt|phb", "arrow|phb", "renaissance bullet", "sling bullet|phb"
                const matchAlternativeAmmo = new RegExp(/[Rr]ather than traditional power cells.*?in the form of (.*?)\./);
                if (typeof obj.description === "string") {
                    var match = obj.description.match(matchAlternativeAmmo);
                    if (match && match.length > 0) {
                        ammoType = obj.description.match(matchAlternativeAmmo)[1];
                        ammoType = ammoType === "arrows" ? "arrow|phb" : ret.ammoType === "bolts" ? "crossbow bolts|phb" : ret.ammoType.indexOf("slug") > -1 ? 'modern bullet' : ret.ammoType;
                    }
                }
                return ammoType;
            }

            function getRange(o) {
                if (o.propertiesMap) {
                    Object.values(o.propertiesMap).forEach((v) => {
                        if (v.search(/\(range \d/g) > -1) {
                            return (v.match(/[\d/]+/g)).join(); // filter out everything but digits and "/". Ex: "Power Cell (range 20/40)"" becomes "20/40"
                        }
                    });
                }
                return undefined;
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