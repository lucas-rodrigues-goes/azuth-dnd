

var Settings = class {

    //=====================================================================================================
    // Data
    //=====================================================================================================

    static #data = MapTool.tokens.getTokenByID(
        getTokenID("lib:settings", "Framework")
    );

    static #get_object() {
        return JSON.parse(this.#data.getProperty("object")) || {};
    }

    static #set_object(obj) {
        this.#data.setProperty("object", JSON.stringify(obj || {}));
    }

    static #get_obj_key(key, default_value) {
        const obj = this.#get_object();
        return obj[key] ?? default_value;
    }

    static #set_obj_key(key, value) {
        const obj = this.#get_object();
        obj[key] = value;
        this.#set_object(obj);
    }

    //=====================================================================================================
    // Properties
    //=====================================================================================================

    // Show Debug
    static #DEFAULT_SHOW_DEBUG = false
    static get showDebug() { return this.#get_obj_key("showDebug", this.#DEFAULT_SHOW_DEBUG) }
    static set showDebug(value) {
        if (![true, false].includes(value)) return
        this.#set_obj_key("showDebug", value) 
    }

    // Grid Movement
    static #DEFAULT_GRID_MOVEMENT = true
    static get gridMovement() { return this.#get_obj_key("gridMovement", this.#DEFAULT_GRID_MOVEMENT) }
    static set gridMovement(value) {
        if (![true, false].includes(value)) return
        this.#set_obj_key("gridMovement", value) 
    }

    // Camera Move on Character Movement
    static #DEFAULT_CAMERA_AUTO_MOVE = true
    static get cameraAutoMove() { return this.#get_obj_key("cameraAutoMove", this.#DEFAULT_CAMERA_AUTO_MOVE) }
    static set cameraAutoMove(value) {
        if (![true, false].includes(value)) return
        this.#set_obj_key("cameraAutoMove", value) 
    }

    // Camera Move on Character Movement
    static #DEFAULT_AUTO_IMPERSONATE_PLAYERS = true
    static get autoImpersonatePlayers() { return this.#get_obj_key("autoImpersonatePlayers", this.#DEFAULT_AUTO_IMPERSONATE_PLAYERS) }
    static set autoImpersonatePlayers(value) {
        if (![true, false].includes(value)) return
        this.#set_obj_key("autoImpersonatePlayers", value) 
    }

    // Camera Move on Character Movement
    static #DEFAULT_VISION_MEMORY = true
    static get visionMemory() { return this.#get_obj_key("visionMemory", this.#DEFAULT_VISION_MEMORY) }
    static set visionMemory(value) {
        if (![true, false].includes(value)) return
        this.#set_obj_key("visionMemory", value) 
    }

    // Cell Size
    static #DEFAULT_CELL_SIZE = 150
    static get cellSize() {
        // When using grid movement, cellSize should be multiplied by 1
        if (this.gridMovement) return 1
        else return this.#get_obj_key("cellSize", this.#DEFAULT_CELL_SIZE)
    }
    static set cellSize(value) {
        value = Number(value)
        if (isNaN(value)) return
        if (value < 1) return

        value = Math.round(value)
        this.#set_obj_key("cellSize", value)
    }

    //=====================================================================================================

}

const settings = Settings