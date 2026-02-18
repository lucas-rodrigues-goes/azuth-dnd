

var DifficultTerrain = class extends Entity {

    //=====================================================================================================
    // Default Parameters
    //=====================================================================================================

    #name = ""
    #difficulty_class = 10
    #saving_throw_score = "dexterity"
    #conditions = {} // Condition:Duration
    #damage_dice = []
    #half_damage_on_fail = false
    #reroll_timers = {} // CreatureID:ExpireTime

    //=====================================================================================================
    // Basic Getters / Setters
    //=====================================================================================================

    get name () { return this.#name }
    set name (name) {
        this.#name = name
        this.save()
    }

    get difficulty_class () { return this.#difficulty_class }
    set difficulty_class (difficulty_class) {
        if (!isNaN(Number(difficulty_class))) this.#difficulty_class = Math.min(Math.max(difficulty_class, 1), 30)
        this.save()
    }

    get saving_throw_score () { return this.#saving_throw_score }
    set saving_throw_score (score) {
        if (["strength", "dexterity", "constitution", "wisdom", "intelligence", "charisma"].includes(score)) this.#saving_throw_score = score
        this.save()
    }

    get conditions () { return this.#conditions }
    set conditions (value) {
        if (value && typeof value === "object" && !Array.isArray(value)) {
            this.#conditions = value
            this.save()
        }
    }

    get damage_dice () { return this.#damage_dice }
    set damage_dice (value) {
        if (Array.isArray(value)) this.#damage_dice = value
        this.save()
    }

    get half_damage_on_fail () { return this.#half_damage_on_fail }
    set half_damage_on_fail (value) {
        this.#half_damage_on_fail = Boolean(value)
        this.save()
    }

    //=====================================================================================================
    // Reroll Timers
    //=====================================================================================================

    get_reroll_timer (creature) {
        if (!creature instanceof Creature) return

        return this.#reroll_timers[creature.id]
    }

    set_reroll_timer (creature) {
        if (!creature instanceof Creature) return

        const end_time = Time.current + TimeUnit.rounds(1)
        this.#reroll_timers[creature.id] = end_time

        this.save()
    }

    clear_reroll_timer (id) {
        delete this.#reroll_timers[id]
        this.save()
    }

    check_expired_rerolls () {
        for (const id of Object.keys(this.#reroll_timers)) {
            const creature = instance(id)
            if (!creature || !creature.occupiesSameSpace(this)) {
                this.clear_reroll_timer(id)
                continue
            }

            const expires_at = this.get_reroll_timer(creature)
            if (typeof expires_at !== "number") {
                this.clear_reroll_timer(id)
                continue
            }

            if (Time.current >= expires_at) {
                this.clear_reroll_timer(id)
                this.apply_effect(creature)
            }
        }
    }

    //=====================================================================================================
    // Apply Effect
    //=====================================================================================================

    play_sound () {
        for (const damage of this.damage_dice) {
            Sound.play(damage.damage_type.toLowerCase())
        }
    }

    apply_effect (creature) {
        try {
            if (!creature instanceof Creature) return
            if (this.get_reroll_timer(creature)) {
                console.log(`Attempted to apply effect to ${creature.name_color} but they are still on cooldown for rerolling.`)
                return
            }

            const applyEffects = Abilities.make_spell_save( {
                name: this.name,
                creature: creature,
                targets: [creature],
                spellcasting_modifier: this.difficulty_class - 10,
                level: "c",
                half_on_fail: this.half_damage_on_fail,
                range: 1000,
                damage_dice: this.damage_dice,
                saving_throw_score: this.saving_throw_score,
            } )
            if (!applyEffects.success) return
            let shouldPlaySound = this.half_damage_on_fail

            if (!applyEffects.targets[0].save_result.success) {
                for (const [condition, duration] of Object.entries(this.#conditions)) {
                    creature.set_condition(condition, duration)
                    shouldPlaySound = true
                }
            }
            this.set_reroll_timer(creature)
            if (shouldPlaySound) this.play_sound()
        } catch (error) {
            console.log(error)
        }
    }

    //=====================================================================================================
    // Instance
    //=====================================================================================================

    constructor(id) {
        super(id)
        this.load()
    }

    //=====================================================================================================
    // MapTool sync
    //=====================================================================================================

    load() {
        const object = JSON.parse(this.token.getProperty("object"));
        
        this.#name = object.name || this.token.getName() || this.#name
        this.#conditions = object.conditions ?? this.#conditions
        this.#difficulty_class = object.difficulty_class ?? this.#difficulty_class
        this.#saving_throw_score = object.saving_throw_score || this.#saving_throw_score
        this.#damage_dice = object.damage_dice || this.#damage_dice
        this.#half_damage_on_fail = object.half_damage_on_fail ?? this.#half_damage_on_fail
        this.#reroll_timers = object.reroll_timers ?? this.#reroll_timers

        MTScript.evalMacro(`
            [h: setTerrainModifier('{"terrainModifier":2.0,"terrainModifierOperation":"MULTIPLY","terrainModifiersIgnored":["NONE"]}', "${this.id}")]
        `)
    }
    
    save() {
        const object = {
            name: this.#name,
            conditions: this.#conditions,
            difficulty_class: this.#difficulty_class,
            saving_throw_score: this.#saving_throw_score,
            damage_dice: this.#damage_dice,
            half_damage_on_fail: this.#half_damage_on_fail,
            reroll_timers: this.#reroll_timers
        };
    
        this.token.setName(this.#name);
        this.token.setProperty("object", JSON.stringify(object));
        this.token.setProperty("class", JSON.stringify(["DifficultTerrain", "Entity"]));

        return object;
    }

    //=====================================================================================================
}