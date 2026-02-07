

var Monk = class extends PlayerClass {

    //---------------------------------------------------------------------------------------------------
    // Class Information
    //---------------------------------------------------------------------------------------------------

    static get lore() { 
        return `
            Monks are disciplined warriors, shaped by rigorous training, inner balance, and unyielding focus.
            Through mastery of body and spirit, monks channel supernatural speed, precision, and resilience.
            They flow across the battlefield like a living weapon, striking with perfect control, turning
            every movement into purpose, and overwhelming foes through harmony rather than brute force.`
    }
    static get description() {
        return `
            Monks are agile martial combatants who rely on discipline, speed, and mastery of technique instead
            of armor or heavy weapons. Trained to perfect both body and mind, they weave through combat with
            fluid motions, delivering rapid strikes, deflecting blows, and controlling the pace of battle.
            <br><br>
            Monks thrive on Dexterity and Wisdom, using heightened awareness and precise movements to strike
            where it matters most. Unburdened by heavy equipment, they harness inner energy to enhance their
            attacks, mobility, and defenses, becoming a seamless fusion of martial skill and spiritual power.`
    }

    static get healthPerLevel () { return 6 }
    static get image () { return "asset://8047e1c0694233eb11d5a0f669e61a54" }

    static get starting_proficiencies () { return ["Strength Saves", "Dexterity Saves"]}
    static get starting_proficiencies_multiclass () { return [] }
    static get weapon_proficiency_level () { return 1 }
    static get skill_options () { return "Acrobatics, Athletics, History, Insight, Religion, Stealth".split(", ")}

    //---------------------------------------------------------------------------------------------------
    // Leveling
    //---------------------------------------------------------------------------------------------------

    static level_up(humanoid, choices) {
        super.level_up(humanoid, choices, "Monk")
        const current_level = humanoid.classes.Monk.level

        // Update Sneak Attack
        if (current_level == 2) humanoid.set_new_resource("Ki", 2, "short rest") //--> Creates resource
        else if (current_level > 2) humanoid.set_resource_max("Ki", current_level)

        // Level based specific changes
        switch(current_level) {
            case 1: {
                const multi_class = humanoid.level != 1           

                // Add starting proficiencies
                const starting_proficiencies = !multi_class ? this.starting_proficiencies : this.starting_proficiencies_multiclass
                for (const proficiency of starting_proficiencies) humanoid.set_proficiency(proficiency, 0, true)
                humanoid.set_proficiency("Weapon", this.weapon_proficiency_level, true)
                break
            }

            case 5: {
                // Add extra attack feature
                if (!humanoid.has_feature("Extra Attack")) { humanoid.add_feature("Extra Attack") }
                break
            }

            case 14: {
                // Add all save proficiencies
                for (const score of ["Strength", "Dexterity", "Constitution", "Wisdom", "Charisma", "Intelligence"]) {
                    humanoid.set_proficiency(`${score} Saves`, 0, true)
                }
            }
        }

        humanoid.save()
    }

    static level_up_info(humanoid) {
        const current_level = humanoid ? (humanoid.classes.Monk?.level + 1) || 1 : 1
        const multi_class = humanoid ? humanoid.level != 0 : false
        const current_proficiencies = humanoid ? humanoid.proficiencies : {}

        // Return structures
        const choices = { proficiencies: [], features: [], spells: [], subclass: [] }
        const proficiencies = []
        const features = [...database.get_features_list({subtype: "Monk"})].sort(
            (a, b) => database.features.data[a].level - database.features.data[b].level
        )

        // Choices based on level
        switch (current_level) {
            // Level 1
            case 1: {
                // Starting proficiencies
                const starting_proficiencies = !multi_class ? this.starting_proficiencies : this.starting_proficiencies_multiclass
                for (const item of starting_proficiencies) {
                    proficiencies.push({name: item, level: 0})
                }

                // Weapon Mastery
                proficiencies.push({name: "Weapon", level: this.weapon_proficiency_level})

                // Choose 1 - 2 skills
                const options = this.skill_options
                const amount = 2
                choices.proficiencies.push(super.skill_choice(options, amount))

                break
            }
        }
        
        return {proficiencies, choices, features}
    }

    //---------------------------------------------------------------------------------------------------

}

// Add to PlayerClass
PlayerClass.add("Monk", Monk)