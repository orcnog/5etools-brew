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
            let isWeapon = false;
            let isRangedWeapon = false;
            let isArmor = false;
            let ret = {
                "name": obj.name,
                "source": sourceString,
                "page": 0,
                "type": getItemType(obj), // also sets value for isWeapon, isRangedWeapon, and isArmor
                "rarity": getItemRarity(obj),
                "age": "futuristic",
                "value": getItemValue(obj),
                "weight": getItemWeight(obj),
                "entries": getItemEntries(obj),
                "property": getItemProperty(obj),
                "foundryType": getItemType(obj, true),
                "reqAttune": getItemReqAttune(obj),
                "recharge": getItemRecharge(obj),
                "charges": getItemCharges(obj),
                // weapon
                "weapon": getItemWeapon(obj),
                "weaponCategory": getItemWeaponCategory(obj),
                "dmg1": getItemDmg1(obj),
                "dmgType": getItemDmgType(obj),
                "dmg2": getItemDmg2(obj),
                // ranged weapon
                "firearm": getItemFirearm(obj),
                "ammunition": getItemAmmunition(obj),
                "ammoType": getItemAmmoType(obj),
                "reload": getItemReload(obj),
                "range": getItemRange(obj),
                // armor
                "armor": getItemArmor(obj),
                "ac": getItemAc(obj),
                "stealth": getItemStealth(obj),
                "strength": getItemStrength(obj)
            };

            // TODO: ret.tier // String like "major"
            // TODO: ret.ammunition // Boolean. An item that uses ammunition; not an item that is ammunition.
            // TODO: ret.poison // Boolean
            // TODO: ret.poisonTypes // Array of strings (enum: "contact","ingested","injury","inhaled")
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

            // MAYBE TODO: Vehicles as Items...
            // Possible Veh TODO: "crew": 1
            // Possible Veh TODO: "crewMax": 13
            // Possible Veh TODO: "crewMin": 3
            // Possible Veh TODO: "vehAc": 11
            // Possible Veh TODO: "vehHp": 50
            // Possible Veh TODO: "vehDmgThresh": 15
            // Possible Veh TODO: "vehSpeed": 1.5
            // Possible Veh TODO: "capPassenger": 3
            // Possible Veh TODO: "capCargo": 100,
            // Possible Veh TODO: "travelCost": 100, // in copper pieces per mi. per passenger
            // Possible Veh TODO: "shippingCost": 10, // in copper pieces per 100 lbs. per mi.
            // Possible Veh TODO: "seeAlsoVehicle": ["Sailing Ship"]

            // Possible TODO: ret.reqAttuneAlt // String OR Boolean. Used for filtering.  // there's only one item in core that uses this so, probably not needed for sw5e.
            // Possible TODO: ret.reqAttuneTags // Array of objects (see D:\Development\5etools-mirror-1.github.io\test\schema\items.json). // Nothing in sw5e seems to have any attunement conditions though
            // Possible TODO: ret.baseItem // String, ID of an existing item?
            // Possible TODO: ret.valueMult // Number
            // Possible TODO: ret.weightMult // Number
            // Possible TODO: ret.wondrous // Boolean
            // Possible TODO: ret.tatoo // Boolean
            // Possible TODO: ret.curse // Boolean
            // Possible TODO: ret.sentient // Boolean
            // Possible TODO: ret.typeAlt // not sure if i need this?

            return ret;

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
                        o.typeEnum === 3 ? (
                            o.subtype === "adrenal" ? "FD|consumable" :
                            o.subtype === "substance" ? "FD|consumable" :
                            o.subtype === "medpac" ? "FD|consumable" :
                            o.subtype === "poison" ? "FD|consumable" : 
                            o.subtype === "stimpac" ? "FD|consumable" : 
                            o.subtype === "explosive" ? "EXP|consumable" :
                            o.subtype === "ammunition" ? "AF|consumable" :
                            o.subtype === "technology" ? "G|consumable" :
                            o.subtype === "barrier" ? "G|consumable" : "G|consumable") :
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

                    // set some global helpers: isWeapon, isRanged and isArmor flags
                    if (itemType === "M" || itemType === "R") isWeapon = true;
                    if (itemType === "R") isRangedWeapon = true;
                    if (["HA", "MA", "LA", "S"].indexOf(itemType) > -1) isArmor = true;

                    return foundry ? foundryType : itemType;
                }
                return undefined;
            }

            function getItemRarity(o) {
                let rarity = "none";
                if ('rarityOptionsEnum' in o && o.rarityOptionsEnum[0] === 1) rarity = "common" // Standard
                if ('rarityOptionsEnum' in o && o.rarityOptionsEnum[0] === 2) rarity = "uncommon" // Premium
                if ('rarityOptionsEnum' in o && o.rarityOptionsEnum[0] === 3) rarity = "rare" // Prototype
                if ('rarityOptionsEnum' in o && o.rarityOptionsEnum[0] === 4) rarity = "very rare" // Advanced
                if ('rarityOptionsEnum' in o && o.rarityOptionsEnum[0] === 5) rarity = "legendary" // Legendary
                if ('rarityOptionsEnum' in o && o.rarityOptionsEnum[0] === 6) rarity = "artifact" // Artifact

                return rarity;
            }

            function getItemValue(o) {
                return o.cost ? parseInt(o.cost) * 10 : undefined;
            }

            function getItemWeight(o) {
                return o.weight && parseFloat(o.weight) > 0 ? o.weight = parseFloat(o.weight) : undefined;
            }

            function getItemEntries(o) {
                let description;
                if ('description' in o) {
                    description = [o.description]
                } else if ('text' in o) {
                    let txt = o.text;
                    txt = txt.replaceAll('_**Requires attunement**_\r\n', '');
                    txt = txt.replaceAll('\r\n', ' ');
                    txt = txt.replaceAll('\r', ' ');
                    txt = txt.replaceAll('\n', ' ');
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

            function getItemReqAttune(o) {
                // String like "by a cleric or paladin of good alignment"
                return "requiresAttunement" in o && o.requiresAttunement ? true : undefined;
            }

            function getItemRecharge(o) {
                // String like "dawn"
                if ("text" in o && o.text.length > 0) {
                    const mDawn = /(?:charges?|uses?) at dawn|(?:charges?|uses?) daily at dawn|(?:charges?|uses?) each day at dawn|(?:charges|uses) and regains all of them at dawn|(?:charges|uses) and regains[^.]+each dawn|recharging them all each dawn|(?:charges|uses) that are replenished each dawn/gi.exec(o.text);
                    if (mDawn) return o.recharge = "dawn";

                    const mDusk = /(?:charges?|uses?) daily at dusk|(?:charges?|uses?) each day at dusk/gi.exec(o.text);
                    if (mDusk) return o.recharge = "dusk";

                    const mMidnight = /(?:charges?|uses?) daily at midnight|Each night at midnight[^.]+(?:charges?|uses?)/gi.exec(o.text);
                    if (mMidnight) return o.recharge = "midnight";

                    const mLong = /(?:charges?|uses?) [^\.]+ long rest|long rest [^\.]+ (?:charges?|uses?)/gi.exec(o.text);
                    if (mLong) return o.recharge = "long rest";

                    const mShort = /(?:charges?|uses?) [^\.]+ short rest|short rest [^\.]+ (?:charges?|uses?)/gi.exec(o.text);
                    if (mShort) return o.recharge = "short rest";
                }
                return undefined;
            }

            function getItemCharges(o) {
                // return an Integer or undefined
                let txt = "text" in o && o.text.length > 0 ? o.text : "";
                const mInteger = /(?:have|has|with) (\d+) charge.*?/gi.exec(txt); // Array w/ 1 int value, ex: [3] for 3 charges
                const mDiceRoll = /(?:have|has|with) (\d+)d(\d+) charges.*?/gi.exec(txt); // Array w/ 2 int values from dice roll, ex: [2,6] for 2d6
                const mNumberOfCharges = /number of charges equals? (to )?half your .*? level \(rounded up\)/gi.exec(txt); // Array or null
                if (mInteger) {
                    return mInteger[1];
                }
                if (mDiceRoll) {
                    return mDiceRoll[1] * mDiceRoll[2]; // return the max possible roll. ex: 2d6 returns 12
                }
                if (mNumberOfCharges) {
                    return 10; // assuming 20 is the PC's max class level, 10 is this item's max number of possible charges
                }
                return undefined;
            }

            function getItemWeapon() {
                // return a Boolean or undefined
                return isWeapon || undefined;
            }

            function getItemWeaponCategory(o) {
                // return String, either "Martial" or "Simple", or undefined
                if (!isWeapon) {
                    return undefined;
                }
                return o.weaponClassification && o.weaponClassification.indexOf("Martial") > -1 ? "Martial" : "Simple";
            }

            function getItemDmg1(o) {
                // return a String like "1d10" or undefined
                if (isWeapon && o.damageNumberOfDice && o.damageDieType) {
                    return o.damageNumberOfDice + "d" + o.damageDieType + (o.damageDieModifier !== 0 ? " + " + o.damageDieModifier : "");
                }
                return undefined;
            }

            function getItemDmgType(o) {
                // return a String like "1d10" or undefined
                if (isWeapon && o.damageType) {
                    return o.damageType;
                }
                return undefined;
            }

            function getItemDmg2(o) {
                // return a String like "2d6" or undefined
                if (isWeapon && o.propertiesMap && "Versatile" in o.propertiesMap) {
                    return o.propertiesMap.Versatile.split(/[()]/)[1]; // get the value between parentheses, ex: 1d10
                }
                return undefined;
            }

            function getItemFirearm() {
                // return a Boolean or undefined
                if (!isRangedWeapon) {
                    return undefined;
                }
                return true; // assume all ranged weapons in SW5e are blasters and therefore firearms
            }

            function getItemAmmunition() {
                // return a Boolean or undefined
                if (!isRangedWeapon) {
                    return undefined;
                }
                return true; // assume all ranged weapons in SW5e are blasters and therefore take ammunition
            }

            function getItemAmmoType(o) {
                // String like "crossbow bolts|phb" or undefined
                if (!isRangedWeapon) {
                    return undefined;
                }
                let ammoType = "energy cell"; // possible values: "energy cell", "modern bullet", "blowgun needle|phb", "crossbow bolt|phb", "arrow|phb", "renaissance bullet", "sling bullet|phb"
                const matchAlternativeAmmo = /[Rr]ather than traditional power cells.*?in the form of (.*?)\./;
                if (typeof o.description === "string") {
                    var match = matchAlternativeAmmo.exec(o.description);
                    if (match) {
                        ammoType = match[1] === "arrows" ? "arrow|phb" :
                            match[1] === "bolts" ? "crossbow bolts|phb" :
                                match[1].indexOf("slug") > -1 ? 'modern bullet' :
                                    match[1];
                    }
                }
                return ammoType;
            }

            function getItemReload(o) {
                // return a Integer or undefined
                if (!isRangedWeapon) {
                    return undefined;
                }
                let reload = undefined;
                if ("propertiesMap" in o && "Reload" in o.propertiesMap) {
                    reload = parseInt(o.propertiesMap.Reload.split(" ")[1]); // Ex: "reload 6" returns 6
                }
                return reload;
            }

            function getItemRange(o) {
                // String like "60/120" or undefined
                if (!isRangedWeapon) {
                    return undefined;
                }
                if (o.propertiesMap) {
                    Object.values(o.propertiesMap).forEach((v) => {
                        if (v.search(/\(range \d/g) > -1) {
                            return (v.match(/[\d/]+/g)).join(); // filter out everything but digits and "/". Ex: "Power Cell (range 20/40)"" becomes "20/40"
                        }
                    });
                }
                return undefined;
            }

            function getItemArmor(o) {
                // return a Boolean or undefined
                return isArmor || undefined;
            }

            function getItemAc(o) {
                // return an Integer or undefined
                if (isArmor && 'ac' in o) {
                    return o.ac.match(/\d+/g)[0]; // Get only the AC number. Ex: filters "12 + Dex modifier (Max: 2)" to just "12".
                }
                return undefined;
            }

            function getItemStealth(o) {
                // return a Boolean or undefined
                if (isArmor && 'stealthDisadvantage' in o) {
                    return o.stealthDisadvantage;
                }
                return undefined;
            }

            function getItemStrength(o) {
                // return an Integer or undefined
                if (isArmor && 'propertiesMap' in o && 'Strength' in o.propertiesMap) {
                    return parseInt(o.propertiesMap.Strength.split(" ")[1]); // Ex: "strength 11" returns 11
                }
                return undefined;
            }
            
            function getItemtier(o) {
                // return a String like "major"

            }

            function getItemtier(o) {
                // return a String like "major"

            }

            function getItemammunition(o) {
                // return a Boolean. An item that uses ammunition; not an item that is ammunition.
            }

            function getItemammunition(o) {
                // return a Boolean. An item that uses ammunition; not an item that is ammunition.
            }
            function getItempoison(o) {
                // return a Boolean
            }

            function getItempoisonTypes(o) {
                // return a Array of strings (enum: "contact","ingested","injury","inhaled")
            }

            function getItemvulnerable(o) {
                // return a Array (see D:\Development\5etools-mirror-1.github.io\test\schema\items.json)
            }

            function getItemimmune(o) {
                // return a Array (see D:\Development\5etools-mirror-1.github.io\test\schema\items.json)
            }

            function getItemconditionImmune(o) {
                // return a Array (see D:\Development\5etools-mirror-1.github.io\test\schema\items.json)
            }

            function getItembonusSpellAttack(o) {
                // return a String like "+2"
            }

            function getItembonusSpellSaveDc(o) {
                // return a String like "+2"
            }

            function getItembonusSpellDamage(o) {
                // return a String like "+2"
            }

            function getItembonusSavingThrow(o) {
                // return a String like "+1"
            }

            function getItembonusAbilityCheck(o) {
                // return a String like "+1"
            }

            function getItembonusProficiencyBonus(o) {
                // return a String like "+1"
            }

            function getItembonusAc(o) {
                // return a String like "+1"
            }

            function getItembonusWeapon(o) {
                // return a String like "+3"
            }

            function getItembonusWeaponAttack(o) {
                // return a String like "+3"
            }

            function getItembonusWeaponDamage(o) {
                // return a String like "+2"
            }

            function getItembonusWeaponCritDamage(o) {
                // return a String like "4d6"
            }

            function getItemcritThreshold(o) {
                // return a Integer. Ex: 19
            }

            function getItemmodifySpeed(o) {
                // return a Ex: {"equal":{"swim:"walk"}}, Ex2: "bonus":{"*":5}, Ex3: {"multiply":{"walk":2}}, Ex4: {"static":{"fly":150}}
            }

            function getItemfocus(o) {
                // return a Boolean, OR Array with class names. Ex: ["Druid","Warlock"]
            }

            function getItemscfType(o) {
                // return a String enum "arcane","druid","holy"
            }

            function getItempackContents(o) {
                // return a Array of item name strings, or objects (see D:\Development\5etools-mirror-1.github.io\data\items.json)
            }

            function getItemcontainerCapacity(o) {
                // return a Complex object. Ex: {"weight":[6],"item":[{"sling bullet|phb":20,"blowgun needle|phb":50}],"weightless":true}
            }

            function getItematomicPackContents(o) {
                // return a Boolean. If the item's pack contents should be treated as one atomic unit, rather than handled as individual sub-items.
            }

            function getItemcarryingCapacity(o) {
                // return a Integer. Of a mount/beast, not a container.
            }

            function getItemresist(o) {
                // return a Array of damage type strings Ex: ["lightning"]
            }

            function getItemgrantsProficiency(o) {
                // return a Boolean
            }

            function getItemability(o) {
                // return a Object with ability abbrevs. and int value, maybe wrapped with "static". Ex: {"str":2}, Ex 2: {"static": {"str": 21}}
            }

            function getItemattachedSpells(o) {
                // return a Array of spell name strings. Ex: ["reincarnate"]
            }

            function getItemspellScrollLevel(o) {
                // return a Integer
            }

            function getItemadditionalEntries(o) {
                // return a complex object (see D:\Development\5etools-mirror-1.github.io\data\items.json)
            }

            function getItemdetail1(o) {
                // return a String. A descriptive field that can be used to complete entries in variants.
            }

            function getItemdexterityMax(o) {
                // return a not sure if i need this?  Max dex for medium armor
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
    mergeCustomizerFunc: function (o, s, k) {
        if (o !== undefined && (s === undefined || s === null || s === "" || s === [])) return o;
        // for weight and value (cost) specifically, if a value already exists in destination, but incoming value is 0, defer to existing.
        if ((k === "weight" || k === "value") && o !== null && s === 0) return o;
        return undefined;
    },

    // Whether the merged entities be reordered in alphabetical order in the returned merged object
    alphabetizeByKey: true
}