

var Teleporter = class extends Entity {

    //=====================================================================================================
    // Methods
    //=====================================================================================================

    teleport(creature) {
        try {
            const teleporterName = this.token.getName().split(":");
            const destinationMap = teleporterName[0];
            const destinationTeleporter = teleporterName.length > 1 ? teleporterName[1] : undefined
            if (creature) Initiative.turn_order.includes(creature.id);

            const oldMap = macro(`getCurrentMapName()`)
            const oldZoom = macro(`getZoom()`)
            const allMaps = macro(`getAllMapNames()`).split(",")
            if (!allMaps.includes(destinationMap)) return

            macro(`setCurrentMap("${destinationMap}")`)
            macro(`setZoom(${oldZoom})`)
            macro(`deselectTokens()`)

            let x = 0, y = 0;
            if (destinationTeleporter) {
                const teleporterName = `${oldMap}:${destinationTeleporter}`
                for (const teleporter of mapTeleporters()) {
                    if (teleporter.token.getName() == teleporterName) {
                        teleporter.go_to();
                        x = teleporter.x;
                        y = teleporter.y;
                        break
                    }   
                }
            }
            if (creature) {
                macro(`moveTokenFromMap("${creature.id}", "${oldMap}", ${x}, ${y})`)
                macro(`exposeFOW(getCurrentMapName(), getImpersonated())`)
            }
        } catch (error) {console.log(error, "all")}
    }

    //=====================================================================================================
    // Instance
    //=====================================================================================================

    constructor(id) {
        super(id)
    }

    //=====================================================================================================
    // MapTool sync
    //=====================================================================================================

    load() {
        const object = JSON.parse(this.token.getProperty("object"));
    }
    
    save() {
        const object = {};

        this.token.setProperty("object", JSON.stringify(object));
        this.token.setProperty("class", JSON.stringify(["Creature", "Entity"]));

        return object;
    }

    //=====================================================================================================
}