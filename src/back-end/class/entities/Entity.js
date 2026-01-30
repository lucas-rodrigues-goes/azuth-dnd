var Entity = class {

    //=====================================================================================================
    // Entity Default Parameters
    //=====================================================================================================

    #id;
    #token;

    constructor(id) {
        this.#id = id
        this.#token = MapTool.tokens.getTokenByID(id)
    }

    //=====================================================================================================
    // Getter / Setter methods
    //=====================================================================================================

    // Instance
    get id() { return this.#id }
    get token() { return this.#token;}
    get owners() {return MTScript.evalMacro(`[r:getOwners(",", "${this.id}")]`).split(",")}

    // Images
    get portrait() { return MTScript.evalMacro(`[r:getTokenPortrait("","${this.id}")]`)}
    get image() { return MTScript.evalMacro(`[r:getTokenImage("","${this.id}")]`)}

    // Opacity
    get opacity() {return MTScript.evalMacro(`[r:getTokenOpacity("${this.id}")]`)}
    set opacity(value) { MTScript.evalMacro(`[r:setTokenOpacity(${value}, "${this.id}")]`) }

    // Sight
    get sight() {return MTScript.evalMacro(`[r:getSightType("${this.id}")]`)}
    set sight(value) { 
        MTScript.evalMacro(`[r:setHasSight(1, "${this.id}")]`)
        MTScript.evalMacro(`[r:setSightType("${value}", "${this.id}")]`)
    }

    // Invisible
    get invisible() {return MTScript.evalMacro(`[r:getOwnerOnlyVisible("${this.id}")]`) == "true"}
    set invisible(value) {
        const bool = value ? 1 : 0
        MTScript.evalMacro(`[r:setOwnerOnlyVisible(${bool}, "${this.id}")]`)
    }

    // Is player
    get player() {return this.token.isPC()}
    set player(player) {
        if (player) this.token.setPC()
        else this.token.setNPC()
    }

    // Size
    get size() {return MTScript.evalMacro(`[r:getSize("${this.id}")]`)}
    set size(size) {
        if (!["Fine", "Diminutive", "Tiny", "Small", "Medium", "Large", "Huge", "Gargantuan", "Colossal"].includes(size)) return
        MTScript.evalMacro(`[r:setSize("${size}", "${this.id}")]`)
    }
    get size_value() {
        const SIZE_VALUE = {
            Fine: 0,
            Diminutive: 1,
            Tiny: 2,
            Small: 3,
            Medium: 4,
            Large: 5,
            Huge: 6,
            Gargantuan: 7,
            Colossal: 8
        }

        return SIZE_VALUE[this.size] ?? null
    }

    // Position X
    get x() {
        const size = this.size;
        const baseX = Number(MTScript.evalMacro(`[r:getTokenX(${!settings.gridMovement},"${this.id}")]`));
        return baseX + (sizeToCells[size] || 0) * settings.cellSize;
    }
    set x(x) {
        x = Math.round(x)
        const size = this.size;
        const offset = (sizeToCells[size] || 0) * settings.cellSize;
        const adjustedX = Math.round(x - offset);
        const adjustedY = Math.round(this.y - offset);
        MTScript.evalMacro(`[r:moveToken(${adjustedX}, ${adjustedY}, ${!settings.gridMovement}, "${this.id}")]`);
    }

    // Position Y
    get y() {
        const size = this.size;
        const baseY = Number(MTScript.evalMacro(`[r:getTokenY(${!settings.gridMovement},"${this.id}")]`));
        return baseY + (sizeToCells[size] || 0) * settings.cellSize;
    }
    set y(y) {
        y = Math.round(y)
        const size = this.size;
        const offset = (sizeToCells[size] || 0) * settings.cellSize;
        const adjustedY = Math.round(y - offset);
        const adjustedX = Math.round(this.x - offset);
        MTScript.evalMacro(`[r:moveToken(${adjustedX}, ${adjustedY}, ${!settings.gridMovement}, "${this.id}")]`);
    }

    // Facing
    get facing() {
        const directions = {
            "90": "up",
            "0": "right",
            "-90": "down",
            "180": "left",
            "45": "right-up",
            "-45": "right-down",
            "135": "left-up",
            "-135": "left-down"
        };

        return directions[MTScript.evalMacro(`[r:getTokenFacing("${this.id}")]`)];
    }
    set facing(direction) {
        const angles = {
            "up": "90",
            "right": "0",
            "down": "-90",
            "left": "180",
            "right-up": "45",
            "right-down": "-45",
            "left-up": "135",
            "left-down": "-135"
        }

        MTScript.evalMacro(`[r:setTokenFacing(${angles[direction]}, "${this.id}")]`)
    }


    //=====================================================================================================
    // Functions
    //=====================================================================================================

    // State management
    set_state(state, value=true) {
        const bool = value ? 1 : 0

        MTScript.evalMacro(`[r: setState("${state}", ${bool},"${this.id}") ]`)
        return value
    }
    get_state(state) { return MTScript.evalMacro(`[r, if(getState("${state}","${this.id}")):"true";"false"]`) == "true" }
    toggle_state(state) { MTScript.evalMacro(`[r: setState("${state}", !getState("${state}", "${this.id}"),"${this.id}") ]`) }

    // Light management
    set_light(light, value=true) {
        const bool = value ? 1 : 0

        MTScript.evalMacro(`[r: setLight("D20","${light}", ${bool},"${this.id}") ]`)
        return value
    }

    // Center camera on token
    go_to() { MTScript.evalMacro(`[r:goTo("${this.id}")]`) }
   
    // Select token
    select() { MTScript.evalMacro(`[r:selectTokens("${this.id}")]`) }

    // Impersonate token
    impersonate() { MTScript.evalMacro(`[r:impersonate("${this.id}")]`) }
    
    // Get a percent of how visible the target is from 0 to 1
    target_visibility(target=selected()) {
        if (!target) return false
        const visible_points = JSON.parse(MTScript.evalMacro(`[r:canSeeToken("${target.id}","${this.id}")]`))
        return visible_points.length / 5
    }

    // Move entity in a direction by a number of cells
    move(direction, units) {        
        if (isNaN(units)) return

        // Non grid movement uses pixels
        units = Number(units * settings.cellSize)

        switch (direction) {
            // Cardinal directions
            case "up":
                this.y -= units
                break
            case "down":
                this.y += units
                break
            case "left":
                this.x -= units
                break
            case "right":
                this.x += units
                break
                
            // Diagonal directions
            case "right-up":
                this.x += units
                this.y -= units
                break
            case "right-down":
                this.x += units
                this.y += units
                break
            case "left-up":
                this.x -= units
                this.y -= units
                break
            case "left-down":
                this.x -= units
                this.y += units
                break
        }
    }

    move_angle(angle, units) {
        if (isNaN(units) || isNaN(angle)) return

        // Convert grid units to pixels
        units = Number(units * settings.cellSize)

        // Convert degrees → radians
        const rad = angle * (Math.PI / 180)

        // Calculate deltas
        const dx = Math.cos(rad) * units
        const dy = -Math.sin(rad) * units // minus because screen Y grows downward

        // Apply movement
        this.x += dx
        this.y += dy
    }

    // Rotate to face another entity
    face_target(target=selected()) {
        this.facing = calculate_direction(this, target)
    }
    
    get boundaries() {
        const offset = (sizeToCells[this.size] || 0) * settings.cellSize;
        const cellBorder = 0.5 * settings.cellSize;
        
        return {
            topLeft: {
                x: this.x - offset - cellBorder, 
                y: this.y - offset - cellBorder
            },
            topRight: {
                x: this.x + offset + cellBorder, 
                y: this.y - offset - cellBorder
            },
            bottomRight: {
                x: this.x + offset + cellBorder,
                y: this.y + offset + cellBorder
            },
            bottomLeft: {
                x: this.x - offset - cellBorder, 
                y: this.y + offset + cellBorder
            },
            center: {
                x: this.x, 
                y: this.y
            }
        };
    }

    occupiesSameSpace(otherEntity) {
        if (!otherEntity || otherEntity.id === this.id) return false;
        
        // Get boundaries of both entities
        const bounds1 = this.boundaries;
        const bounds2 = otherEntity.boundaries;
        
        // Check if this entity's CENTER is inside the other entity's boundaries
        const thisInOther = (
            this.x >= bounds2.topLeft.x &&
            this.x <= bounds2.bottomRight.x &&
            this.y >= bounds2.topLeft.y &&
            this.y <= bounds2.bottomRight.y
        );
        
        // Check if the other entity's CENTER is inside this entity's boundaries
        const otherInThis = (
            otherEntity.x >= bounds1.topLeft.x &&
            otherEntity.x <= bounds1.bottomRight.x &&
            otherEntity.y >= bounds1.topLeft.y &&
            otherEntity.y <= bounds1.bottomRight.y
        );
        
        // They occupy the same space if either center is inside the other's boundaries
        return thisInOther || otherInThis;
    }

    //=====================================================================================================
    // MapTool sync management
    //=====================================================================================================

    load() {return}
    save() {return}


    //=====================================================================================================

}