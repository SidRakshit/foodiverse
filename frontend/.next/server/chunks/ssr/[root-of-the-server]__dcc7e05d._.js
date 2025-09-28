module.exports = [
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[project]/app/components/Player.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
class Player {
    x;
    y;
    width = 16;
    height = 16;
    speed = 120;
    direction = 'down';
    animationFrame = 0;
    animationTimer = 0;
    animationSpeed = 200;
    isMoving = false;
    constructor(x, y){
        this.x = x;
        this.y = y;
    }
    update(deltaTime, inputHandler, scene) {
        let newX = this.x;
        let newY = this.y;
        this.isMoving = false;
        // Handle movement input
        if (inputHandler.isKeyPressed('ArrowUp') || inputHandler.isKeyPressed('KeyW')) {
            newY -= this.speed * deltaTime / 1000;
            this.direction = 'up';
            this.isMoving = true;
        }
        if (inputHandler.isKeyPressed('ArrowDown') || inputHandler.isKeyPressed('KeyS')) {
            newY += this.speed * deltaTime / 1000;
            this.direction = 'down';
            this.isMoving = true;
        }
        if (inputHandler.isKeyPressed('ArrowLeft') || inputHandler.isKeyPressed('KeyA')) {
            newX -= this.speed * deltaTime / 1000;
            this.direction = 'left';
            this.isMoving = true;
        }
        if (inputHandler.isKeyPressed('ArrowRight') || inputHandler.isKeyPressed('KeyD')) {
            newX += this.speed * deltaTime / 1000;
            this.direction = 'right';
            this.isMoving = true;
        }
        // Check collision with scene boundaries and obstacles
        if (this.canMoveTo(newX, newY, scene)) {
            this.x = newX;
            this.y = newY;
        }
        // Movement is blocked if canMoveTo returns false - don't update position
        // Update animation
        if (this.isMoving) {
            this.animationTimer += deltaTime;
            if (this.animationTimer >= this.animationSpeed) {
                this.animationFrame = (this.animationFrame + 1) % 2; // 2 frame walk cycle
                this.animationTimer = 0;
            }
        } else {
            this.animationFrame = 0; // Reset to idle frame
        }
    }
    canMoveTo(x, y, scene) {
        // Check scene boundaries (world is now 800x1216 pixels - two full screens stacked)
        if (x < 0 || y < 0 || x + this.width > 800 || y + this.height > 1216) {
            console.log('Movement blocked by world boundaries:', {
                x,
                y,
                worldBounds: [
                    800,
                    1216
                ]
            });
            return false;
        }
        return true;
    // Temporarily disable scene collision to test
    // try {
    //   const canMove = scene.canMoveTo(x, y, this.width, this.height);
    //   if (!canMove) {
    //     console.log('Movement blocked by scene collision:', { x, y, sceneType: scene.type });
    //   }
    //   return canMove;
    // } catch (error) {
    //   console.error('Error in scene collision detection:', error);
    //   // If there's an error, allow movement to avoid getting stuck
    //   return true;
    // }
    }
    render(ctx, cameraX = 0, cameraY = 0) {
        // Create a simple pixel-art character
        const scale = 2; // Scale up for visibility
        // Calculate screen position relative to camera
        const screenX = this.x - cameraX;
        const screenY = this.y - cameraY;
        ctx.save();
        ctx.scale(scale, scale);
        const drawX = Math.floor(screenX / scale);
        const drawY = Math.floor(screenY / scale);
        // Draw character body (simple 8x8 sprite)
        this.drawPixelArtCharacter(ctx, drawX, drawY, this.direction, this.animationFrame);
        ctx.restore();
    }
    drawPixelArtCharacter(ctx, x, y, direction, frame) {
        const pixelSize = 1;
        // Define character colors
        const skinColor = '#FFDBAC';
        const shirtColor = '#FF6B6B';
        const pantsColor = '#4ECDC4';
        const hairColor = '#8B4513';
        const shadowColor = 'rgba(0,0,0,0.3)';
        // Draw shadow
        ctx.fillStyle = shadowColor;
        ctx.fillRect(x, y + 7, 8, 1);
        // Character sprite data (8x8 pixels)
        const spriteData = this.getCharacterSprite(direction, frame);
        // Draw the character pixel by pixel
        for(let row = 0; row < 8; row++){
            for(let col = 0; col < 8; col++){
                const pixel = spriteData[row][col];
                if (pixel !== 0) {
                    ctx.fillStyle = this.getPixelColor(pixel);
                    ctx.fillRect(x + col, y + row, pixelSize, pixelSize);
                }
            }
        }
    }
    getCharacterSprite(direction, frame) {
        // Simplified sprite data where:
        // 0 = transparent, 1 = hair, 2 = skin, 3 = shirt, 4 = pants
        const baseSprite = [
            [
                0,
                1,
                1,
                1,
                1,
                1,
                1,
                0
            ],
            [
                1,
                2,
                2,
                2,
                2,
                2,
                2,
                1
            ],
            [
                0,
                2,
                2,
                2,
                2,
                2,
                2,
                0
            ],
            [
                0,
                3,
                3,
                3,
                3,
                3,
                3,
                0
            ],
            [
                0,
                3,
                3,
                3,
                3,
                3,
                3,
                0
            ],
            [
                0,
                4,
                4,
                4,
                4,
                4,
                4,
                0
            ],
            [
                0,
                4,
                4,
                0,
                0,
                4,
                4,
                0
            ],
            [
                0,
                2,
                2,
                0,
                0,
                2,
                2,
                0
            ]
        ];
        // Add simple animation for walking
        if (frame === 1 && direction !== 'up') {
            // Slightly offset legs for walking animation
            baseSprite[6] = [
                0,
                4,
                0,
                4,
                4,
                0,
                4,
                0
            ];
            baseSprite[7] = [
                0,
                2,
                0,
                2,
                2,
                0,
                2,
                0
            ];
        }
        return baseSprite;
    }
    getPixelColor(pixelType) {
        switch(pixelType){
            case 1:
                return '#8B4513'; // Hair (brown)
            case 2:
                return '#FFDBAC'; // Skin
            case 3:
                return '#FF6B6B'; // Shirt (red)
            case 4:
                return '#4ECDC4'; // Pants (teal)
            default:
                return 'transparent';
        }
    }
    // Getter methods for collision detection
    getLeft() {
        return this.x;
    }
    getRight() {
        return this.x + this.width;
    }
    getTop() {
        return this.y;
    }
    getBottom() {
        return this.y + this.height;
    }
}
const __TURBOPACK__default__export__ = Player;
}),
"[project]/app/components/InputHandler.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
class InputHandler {
    keys = new Set();
    keyPressed = new Set();
    keyReleased = new Set();
    constructor(){
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
        // Add event listeners
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
    }
    handleKeyDown(event) {
        const key = event.code;
        // Debug ESC key presses
        if (key === 'Escape') {
            console.log('🔑 ESC key detected in InputHandler');
        }
        // Prevent default behavior for game keys
        if (this.isGameKey(key)) {
            event.preventDefault();
        }
        if (!this.keys.has(key)) {
            this.keys.add(key);
            this.keyPressed.add(key);
        }
    }
    handleKeyUp(event) {
        const key = event.code;
        if (this.keys.has(key)) {
            this.keys.delete(key);
            this.keyReleased.add(key);
        }
    }
    isGameKey(key) {
        const gameKeys = [
            'ArrowUp',
            'ArrowDown',
            'ArrowLeft',
            'ArrowRight',
            'KeyW',
            'KeyA',
            'KeyS',
            'KeyD',
            'Space',
            'Enter',
            'Escape'
        ];
        return gameKeys.includes(key);
    }
    isKeyPressed(key) {
        return this.keys.has(key);
    }
    wasKeyJustPressed(key) {
        return this.keyPressed.has(key);
    }
    wasKeyJustReleased(key) {
        return this.keyReleased.has(key);
    }
    update() {
        // Clear frame-specific key states
        this.keyPressed.clear();
        this.keyReleased.clear();
    }
    destroy() {
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
        this.keys.clear();
        this.keyPressed.clear();
        this.keyReleased.clear();
    }
}
const __TURBOPACK__default__export__ = InputHandler;
}),
"[project]/app/components/BaseArea.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
class BaseArea {
    tileSize = 32;
    areaWidth = 25;
    areaHeight = 19;
    tiles;
    cameraX = 0;
    cameraY = 0;
    exitX = 400;
    exitY = 450;
    constructor(){
        this.tiles = this.generateArea();
    }
    canMoveTo(x, y, width, height) {
        // Convert pixel coordinates to tile coordinates
        const leftTile = Math.floor(x / this.tileSize);
        const rightTile = Math.floor((x + width - 1) / this.tileSize);
        const topTile = Math.floor(y / this.tileSize);
        const bottomTile = Math.floor((y + height - 1) / this.tileSize);
        // Check all tiles that the entity overlaps
        for(let tileY = topTile; tileY <= bottomTile; tileY++){
            for(let tileX = leftTile; tileX <= rightTile; tileX++){
                if (this.isTileSolid(tileX, tileY)) {
                    return false;
                }
            }
        }
        return true;
    }
    isTileSolid(tileX, tileY) {
        // Check bounds
        if (tileX < 0 || tileX >= this.areaWidth || tileY < 0 || tileY >= this.areaHeight) {
            return true; // Treat out-of-bounds as solid
        }
        return this.tiles[tileY][tileX].solid;
    }
    update(deltaTime) {
    // Base update logic - can be overridden
    }
    render(ctx, player) {
        // Update camera
        this.updateCamera(player);
        // Clear with appropriate background
        this.renderBackground(ctx);
        // Render visible tiles
        const startTileX = Math.max(0, Math.floor(this.cameraX / this.tileSize));
        const endTileX = Math.min(this.areaWidth - 1, Math.floor((this.cameraX + 800) / this.tileSize));
        const startTileY = Math.max(0, Math.floor(this.cameraY / this.tileSize));
        const endTileY = Math.min(this.areaHeight - 1, Math.floor((this.cameraY + 600) / this.tileSize));
        for(let tileY = startTileY; tileY <= endTileY; tileY++){
            for(let tileX = startTileX; tileX <= endTileX; tileX++){
                const tile = this.tiles[tileY][tileX];
                const x = tileX * this.tileSize - this.cameraX;
                const y = tileY * this.tileSize - this.cameraY;
                this.renderTile(ctx, tile, x, y);
            }
        }
        // Render area-specific elements
        this.renderAreaSpecificElements(ctx);
    }
    updateCamera(player) {
        // Keep camera centered on player, but don't go outside area bounds
        const targetCameraX = player.x - 400 + player.width / 2;
        const targetCameraY = player.y - 300 + player.height / 2;
        const maxCameraX = this.areaWidth * this.tileSize - 800;
        const maxCameraY = this.areaHeight * this.tileSize - 600;
        this.cameraX = Math.max(0, Math.min(maxCameraX, targetCameraX));
        this.cameraY = Math.max(0, Math.min(maxCameraY, targetCameraY));
    }
    renderTile(ctx, tile, x, y) {
        switch(tile.type){
            case 'grass':
                this.renderGrassTile(ctx, x, y);
                break;
            case 'road':
                this.renderRoadTile(ctx, x, y);
                break;
            case 'sidewalk':
                this.renderSidewalkTile(ctx, x, y);
                break;
            case 'building':
                this.renderBuildingTile(ctx, tile, x, y);
                break;
            case 'door':
                this.renderDoorTile(ctx, tile, x, y);
                break;
            case 'parking':
                this.renderParkingTile(ctx, x, y);
                break;
            case 'floor':
                this.renderFloorTile(ctx, x, y);
                break;
            case 'wall':
                this.renderWallTile(ctx, x, y);
                break;
            case 'furniture':
                this.renderFurnitureTile(ctx, tile, x, y);
                break;
            case 'tree':
                this.renderTreeTile(ctx, x, y);
                break;
            case 'path':
                this.renderPathTile(ctx, x, y);
                break;
            case 'bench':
                this.renderBenchTile(ctx, x, y);
                break;
            case 'fountain':
                this.renderFountainTile(ctx, x, y);
                break;
            case 'flower':
                this.renderFlowerTile(ctx, x, y);
                break;
            case 'stone':
                this.renderStoneTile(ctx, x, y);
                break;
            case 'water':
                this.renderWaterTile(ctx, x, y);
                break;
            case 'sand':
                this.renderSandTile(ctx, x, y);
                break;
            case 'house':
                this.renderHouseTile(ctx, tile, x, y);
                break;
            case 'apartment':
                this.renderApartmentTile(ctx, tile, x, y);
                break;
            case 'restaurant':
                this.renderRestaurantTile(ctx, tile, x, y);
                break;
            case 'shop':
                this.renderShopTile(ctx, tile, x, y);
                break;
        }
    }
    // Base tile rendering methods that can be overridden
    renderGrassTile(ctx, x, y) {
        ctx.fillStyle = '#4a7c59';
        ctx.fillRect(x, y, this.tileSize, this.tileSize);
        ctx.fillStyle = '#5a8c69';
        for(let i = 0; i < 8; i++){
            const px = x + Math.floor(Math.random() * this.tileSize);
            const py = y + Math.floor(Math.random() * this.tileSize);
            ctx.fillRect(px, py, 2, 2);
        }
    }
    renderRoadTile(ctx, x, y) {
        ctx.fillStyle = '#2F2F2F';
        ctx.fillRect(x, y, this.tileSize, this.tileSize);
        // Road markings
        ctx.fillStyle = '#FFFF00';
        ctx.fillRect(x, y + 14, this.tileSize, 2);
    }
    renderSidewalkTile(ctx, x, y) {
        ctx.fillStyle = '#D3D3D3';
        ctx.fillRect(x, y, this.tileSize, this.tileSize);
        // Sidewalk pattern
        ctx.fillStyle = '#C0C0C0';
        ctx.fillRect(x + 2, y + 2, this.tileSize - 4, this.tileSize - 4);
    }
    renderBuildingTile(ctx, tile, x, y) {
        // Default building appearance
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(x, y, this.tileSize, this.tileSize);
    }
    renderDoorTile(ctx, tile, x, y) {
        // Default door appearance
        ctx.fillStyle = '#654321';
        ctx.fillRect(x, y, this.tileSize, this.tileSize);
    }
    renderParkingTile(ctx, x, y) {
        ctx.fillStyle = '#2F2F2F';
        ctx.fillRect(x, y, this.tileSize, this.tileSize);
        ctx.fillStyle = '#FFFF00';
        ctx.fillRect(x, y + 14, this.tileSize, 2);
        ctx.fillRect(x + 14, y, 2, this.tileSize);
    }
    renderFloorTile(ctx, x, y) {
        ctx.fillStyle = '#DEB887';
        ctx.fillRect(x, y, this.tileSize, this.tileSize);
    }
    renderWallTile(ctx, x, y) {
        ctx.fillStyle = '#F5F5DC';
        ctx.fillRect(x, y, this.tileSize, this.tileSize);
    }
    renderFurnitureTile(ctx, tile, x, y) {
        // Base furniture rendering
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(x + 4, y + 4, this.tileSize - 8, this.tileSize - 8);
    }
    renderTreeTile(ctx, x, y) {
        // Tree trunk
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(x + 12, y + 20, 8, 12);
        // Tree foliage
        ctx.fillStyle = '#228B22';
        ctx.beginPath();
        ctx.arc(x + 16, y + 16, 12, 0, 2 * Math.PI);
        ctx.fill();
    }
    renderPathTile(ctx, x, y) {
        ctx.fillStyle = '#D2B48C';
        ctx.fillRect(x, y, this.tileSize, this.tileSize);
        // Path texture
        ctx.fillStyle = '#DEB887';
        ctx.fillRect(x + 2, y + 2, this.tileSize - 4, this.tileSize - 4);
    }
    renderBenchTile(ctx, x, y) {
        // Bench base
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(x + 4, y + 16, 24, 8);
        // Bench back
        ctx.fillRect(x + 4, y + 8, 4, 16);
        ctx.fillRect(x + 24, y + 8, 4, 16);
    }
    renderFountainTile(ctx, x, y) {
        // Fountain base
        ctx.fillStyle = '#D3D3D3';
        ctx.beginPath();
        ctx.arc(x + 16, y + 16, 14, 0, 2 * Math.PI);
        ctx.fill();
        // Water
        ctx.fillStyle = '#4169E1';
        ctx.beginPath();
        ctx.arc(x + 16, y + 16, 10, 0, 2 * Math.PI);
        ctx.fill();
    }
    renderFlowerTile(ctx, x, y) {
        // Grass base
        this.renderGrassTile(ctx, x, y);
        // Flowers
        ctx.fillStyle = '#FF69B4';
        ctx.beginPath();
        ctx.arc(x + 8, y + 8, 3, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(x + 20, y + 20, 3, 0, 2 * Math.PI);
        ctx.fill();
    }
    renderStoneTile(ctx, x, y) {
        ctx.fillStyle = '#708090';
        ctx.fillRect(x, y, this.tileSize, this.tileSize);
        // Stone texture
        ctx.fillStyle = '#778899';
        ctx.fillRect(x + 2, y + 2, this.tileSize - 4, this.tileSize - 4);
    }
    renderWaterTile(ctx, x, y) {
        ctx.fillStyle = '#4169E1';
        ctx.fillRect(x, y, this.tileSize, this.tileSize);
        // Water ripples
        ctx.fillStyle = '#6495ED';
        ctx.fillRect(x + 4, y + 4, this.tileSize - 8, this.tileSize - 8);
    }
    renderSandTile(ctx, x, y) {
        ctx.fillStyle = '#F4A460';
        ctx.fillRect(x, y, this.tileSize, this.tileSize);
        // Sand texture
        ctx.fillStyle = '#DEB887';
        for(let i = 0; i < 6; i++){
            const px = x + Math.floor(Math.random() * this.tileSize);
            const py = y + Math.floor(Math.random() * this.tileSize);
            ctx.fillRect(px, py, 1, 1);
        }
    }
    renderHouseTile(ctx, tile, x, y) {
        // House building
        ctx.fillStyle = '#D2691E';
        ctx.fillRect(x, y, this.tileSize, this.tileSize);
        // Roof
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(x, y, this.tileSize, 8);
    }
    renderApartmentTile(ctx, tile, x, y) {
        // Apartment building
        ctx.fillStyle = '#708090';
        ctx.fillRect(x, y, this.tileSize, this.tileSize);
        // Windows
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(x + 4, y + 4, 6, 6);
        ctx.fillRect(x + 22, y + 4, 6, 6);
        ctx.fillRect(x + 4, y + 22, 6, 6);
        ctx.fillRect(x + 22, y + 22, 6, 6);
    }
    renderRestaurantTile(ctx, tile, x, y) {
        // Restaurant building
        ctx.fillStyle = '#CD853F';
        ctx.fillRect(x, y, this.tileSize, this.tileSize);
        // Sign
        ctx.fillStyle = '#FF6347';
        ctx.fillRect(x + 8, y + 4, 16, 8);
    }
    renderShopTile(ctx, tile, x, y) {
        // Shop building
        ctx.fillStyle = '#DDA0DD';
        ctx.fillRect(x, y, this.tileSize, this.tileSize);
        // Store front
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(x + 4, y + 16, 24, 12);
    }
    getEntrancePosition() {
        return {
            x: this.exitX,
            y: this.exitY
        };
    }
    // Method to get tile information for scene transitions
    getTileAt(tileX, tileY) {
        if (tileX < 0 || tileX >= this.areaWidth || tileY < 0 || tileY >= this.areaHeight) {
            return null;
        }
        return this.tiles[tileY][tileX];
    }
}
const __TURBOPACK__default__export__ = BaseArea;
}),
"[project]/app/components/campus/CampusArea.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$BaseArea$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/BaseArea.ts [app-ssr] (ecmascript)");
;
class CampusArea extends __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$BaseArea$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"] {
    type = 'campus';
    getAreaName() {
        return 'Virginia Tech Campus';
    }
    generateArea() {
        const area = [];
        // Initialize with grass
        for(let y = 0; y < this.areaHeight; y++){
            area[y] = [];
            for(let x = 0; x < this.areaWidth; x++){
                area[y][x] = {
                    type: 'grass',
                    solid: false
                };
            }
        }
        // Create campus layout - this represents the BOTTOM HALF of the world
        this.generateCampusBuildings(area);
        this.generateCampusPaths(area);
        this.generateCampusFeatures(area);
        return area;
    }
    generateCampusBuildings(world) {
        // Burruss Hall (iconic admin building with clock tower)
        this.createBuilding(world, 10, 2, 5, 4, 'burruss');
        // Newman Library
        this.createBuilding(world, 3, 2, 5, 4, 'newman');
        // Torgersen Hall (Engineering) - Large Gothic Revival building with bridge
        this.createTorgersenHall(world, 16, 1, 8, 5);
        // War Memorial Chapel
        this.createBuilding(world, 5, 8, 3, 3, 'war_memorial');
        // Squires Student Center
        this.createBuilding(world, 12, 8, 5, 4, 'squires');
        // Owens Hall (Dining)
        this.createBuilding(world, 1, 13, 6, 4, 'owens');
        // Cassell Coliseum
        this.createBuilding(world, 18, 12, 6, 5, 'cassell');
        // Create the Drillfield (large open grass area)
        this.createDrillfield(world, 8, 14, 8, 4);
    }
    createBuilding(world, x, y, width, height, buildingType) {
        for(let by = y; by < y + height; by++){
            for(let bx = x; bx < x + width; bx++){
                if (bx < this.areaWidth && by < this.areaHeight) {
                    // Create doors on the front of buildings
                    if (by === y + height - 1 && bx === x + Math.floor(width / 2)) {
                        world[by][bx] = {
                            type: 'door',
                            solid: false,
                            buildingType
                        };
                    } else {
                        world[by][bx] = {
                            type: 'building',
                            solid: true,
                            buildingType
                        };
                    }
                }
            }
        }
    }
    createTorgersenHall(world, x, y, width, height) {
        // Create the main Gothic Revival structure with distinctive features
        // Left wing: 3 tiles wide, 5 tiles tall
        // Right wing: 3 tiles wide, 5 tiles tall
        // Bridge: connects the wings at the top
        for(let by = y; by < y + height; by++){
            for(let bx = x; bx < x + width; bx++){
                if (bx < this.areaWidth && by < this.areaHeight) {
                    // Left wing of the building (3x5)
                    if (bx >= x && bx <= x + 2 && by >= y && by <= y + height - 1) {
                        if (by === y + height - 1 && bx === x + 1) {
                            world[by][bx] = {
                                type: 'door',
                                solid: false,
                                buildingType: 'torgersen'
                            };
                        } else {
                            world[by][bx] = {
                                type: 'building',
                                solid: true,
                                buildingType: 'torgersen'
                            };
                        }
                    } else if (bx >= x + width - 3 && bx <= x + width - 1 && by >= y && by <= y + height - 1) {
                        if (by === y + height - 1 && bx === x + width - 2) {
                            world[by][bx] = {
                                type: 'door',
                                solid: false,
                                buildingType: 'torgersen'
                            };
                        } else {
                            world[by][bx] = {
                                type: 'building',
                                solid: true,
                                buildingType: 'torgersen'
                            };
                        }
                    } else if (by >= y + 1 && by <= y + 2 && bx >= x + 1 && bx <= x + 6) {
                        world[by][bx] = {
                            type: 'building',
                            solid: true,
                            buildingType: 'torgersen'
                        };
                    } else if (by >= y + 3 && by <= y + height - 1 && bx >= x + 3 && bx <= x + width - 4) {
                        world[by][bx] = {
                            type: 'grass',
                            solid: false
                        };
                    } else if (by === y && bx >= x + 3 && bx <= x + width - 4) {
                        world[by][bx] = {
                            type: 'grass',
                            solid: false
                        };
                    } else if (by === y + height - 1 && bx === x + Math.floor(width / 2)) {
                        world[by][bx] = {
                            type: 'door',
                            solid: false,
                            buildingType: 'torgersen'
                        };
                    }
                }
            }
        }
    }
    createDrillfield(world, x, y, width, height) {
        for(let dy = y; dy < y + height && dy < this.areaHeight; dy++){
            for(let dx = x; dx < x + width && dx < this.areaWidth; dx++){
                world[dy][dx] = {
                    type: 'grass',
                    solid: false,
                    buildingType: 'drillfield'
                };
            }
        }
    }
    generateCampusPaths(world) {
        // Main campus walkway (horizontal)
        for(let x = 0; x < this.areaWidth; x++){
            if (world[9][x].type === 'grass') {
                world[9][x] = {
                    type: 'path',
                    solid: false
                };
            }
        }
        // Vertical paths connecting buildings
        for(let y = 0; y < this.areaHeight; y++){
            // Path near library
            if (world[y][5] && world[y][5].type === 'grass') {
                world[y][5] = {
                    type: 'path',
                    solid: false
                };
            }
            // Path in center
            if (world[y][12] && world[y][12].type === 'grass') {
                world[y][12] = {
                    type: 'path',
                    solid: false
                };
            }
            // Path on right side
            if (world[y][19] && world[y][19].type === 'grass') {
                world[y][19] = {
                    type: 'path',
                    solid: false
                };
            }
        }
        // Connecting paths to buildings
        this.createPathToDoor(world, 5, 6, 'horizontal'); // To library
        this.createPathToDoor(world, 11, 5, 'horizontal'); // To admin
        this.createPathToDoor(world, 14, 9, 'vertical'); // To classroom
        this.createPathToDoor(world, 19, 9, 'vertical'); // To classroom
    }
    createPathToDoor(world, startX, startY, direction) {
        if (direction === 'horizontal') {
            for(let x = startX; x < startX + 3; x++){
                if (x < this.areaWidth && world[startY][x].type === 'grass') {
                    world[startY][x] = {
                        type: 'path',
                        solid: false
                    };
                }
            }
        } else {
            for(let y = startY; y < startY + 3; y++){
                if (y < this.areaHeight && world[y][startX].type === 'grass') {
                    world[y][startX] = {
                        type: 'path',
                        solid: false
                    };
                }
            }
        }
    }
    generateCampusFeatures(world) {
        // Add trees around campus
        this.addTrees(world, 10, 12, 2); // Near center
        this.addTrees(world, 1, 15, 3); // Near cafeteria
        this.addTrees(world, 22, 8, 2); // Right side
        // Add benches along paths
        this.addBench(world, 6, 9);
        this.addBench(world, 13, 9);
        this.addBench(world, 18, 9);
        // Add campus fountain
        if (world[11][10].type === 'grass') {
            world[11][10] = {
                type: 'fountain',
                solid: true
            };
        }
        // Add parking area
        this.createParkingLot(world, 1, 1, 3, 2);
        // Add flowers around buildings
        this.addFlowersAroundBuilding(world, 3, 2, 5, 4); // Around library
        this.addFlowersAroundBuilding(world, 9, 2, 4, 3); // Around admin
    }
    addTrees(world, centerX, centerY, count) {
        for(let i = 0; i < count; i++){
            const x = centerX + (Math.random() - 0.5) * 4;
            const y = centerY + (Math.random() - 0.5) * 4;
            const tileX = Math.floor(x);
            const tileY = Math.floor(y);
            if (tileX >= 0 && tileX < this.areaWidth && tileY >= 0 && tileY < this.areaHeight && world[tileY][tileX].type === 'grass') {
                world[tileY][tileX] = {
                    type: 'tree',
                    solid: true
                };
            }
        }
    }
    addBench(world, x, y) {
        if (x >= 0 && x < this.areaWidth && y >= 0 && y < this.areaHeight && world[y][x].type === 'grass') {
            world[y][x] = {
                type: 'bench',
                solid: true
            };
        }
    }
    createParkingLot(world, x, y, width, height) {
        for(let py = y; py < y + height; py++){
            for(let px = x; px < x + width; px++){
                if (px < this.areaWidth && py < this.areaHeight && world[py][px].type === 'grass') {
                    world[py][px] = {
                        type: 'parking',
                        solid: false
                    };
                }
            }
        }
    }
    addFlowersAroundBuilding(world, x, y, width, height) {
        // Add flowers around the perimeter of buildings
        for(let fx = x - 1; fx <= x + width; fx++){
            for(let fy = y - 1; fy <= y + height; fy++){
                if (fx >= 0 && fx < this.areaWidth && fy >= 0 && fy < this.areaHeight && world[fy][fx].type === 'grass' && Math.random() < 0.3) {
                    world[fy][fx] = {
                        type: 'flower',
                        solid: false
                    };
                }
            }
        }
    }
    renderBackground(ctx) {
        // Campus outdoor background
        ctx.fillStyle = '#2a4d3a'; // Dark green campus background
        ctx.fillRect(0, 0, 800, 600);
    }
    renderAreaSpecificElements(ctx) {
        // Campus-specific UI elements
        ctx.fillStyle = '#8B0000';
        ctx.font = 'bold 14px serif';
        ctx.textAlign = 'left';
        ctx.fillText('🏛️ VIRGINIA TECH CAMPUS', 10 - this.cameraX, 30 - this.cameraY);
        // Add VT spirit elements
        ctx.fillStyle = '#FF8C00';
        ctx.font = '12px serif';
        ctx.fillText('HOKIES!', 10 - this.cameraX, 50 - this.cameraY);
    }
    // Override tile rendering for campus-specific styling
    renderBuildingTile(ctx, tile, x, y) {
        // Virginia Tech's signature Hokie Stone buildings
        const buildingType = tile.buildingType;
        // Base Hokie Stone color
        let baseColor = '#C4A484';
        let accentColor = '#8B0000';
        // Different building types
        switch(buildingType){
            case 'burruss':
                baseColor = '#D4B896';
                accentColor = '#8B0000';
                break;
            case 'newman':
                baseColor = '#C4A484';
                accentColor = '#FF8C00';
                break;
            case 'torgersen':
                baseColor = '#E8DCC6'; // Light limestone color matching the image
                accentColor = '#D4C4A8';
                break;
            default:
                baseColor = '#C4A484';
                accentColor = '#8B0000';
        }
        // Specialized rendering for Torgersen Hall
        if (buildingType === 'torgersen') {
            this.renderTorgersenTile(ctx, x, y, baseColor, accentColor);
        } else {
            // Main building structure for other buildings
            ctx.fillStyle = baseColor;
            ctx.fillRect(x, y, this.tileSize, this.tileSize);
            // Stone texture
            ctx.fillStyle = '#9A8870';
            ctx.fillRect(x, y + 8, this.tileSize, 2);
            ctx.fillRect(x + 8, y, 2, this.tileSize);
            // VT color accents
            ctx.fillStyle = accentColor;
            ctx.fillRect(x + 1, y + 1, this.tileSize - 2, 3);
        }
    }
    renderTorgersenTile(ctx, x, y, baseColor, accentColor) {
        // Main limestone structure
        ctx.fillStyle = baseColor;
        ctx.fillRect(x, y, this.tileSize, this.tileSize);
        // Gothic stone block pattern
        ctx.fillStyle = '#F5F0E8'; // Lighter limestone highlight
        ctx.fillRect(x + 2, y + 2, this.tileSize - 4, this.tileSize - 4);
        // Stone block outlines (creating the ashlar masonry pattern)
        ctx.strokeStyle = '#C8B99C'; // Darker mortar lines
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, this.tileSize, this.tileSize);
        // Horizontal mortar lines to simulate stone courses
        ctx.beginPath();
        ctx.moveTo(x, y + this.tileSize / 2);
        ctx.lineTo(x + this.tileSize, y + this.tileSize / 2);
        ctx.stroke();
        // Vertical joints (offset pattern)
        const offset = Math.floor((x + y) / this.tileSize) % 2;
        ctx.beginPath();
        ctx.moveTo(x + this.tileSize / 2 + offset * this.tileSize / 4, y);
        ctx.lineTo(x + this.tileSize / 2 + offset * this.tileSize / 4, y + this.tileSize);
        ctx.stroke();
        // Gothic architectural details - arched window patterns for some tiles
        if ((x + y) % (this.tileSize * 3) === 0) {
            // Create Gothic arch pattern
            ctx.fillStyle = '#4A4A4A';
            ctx.beginPath();
            ctx.arc(x + this.tileSize / 2, y + this.tileSize - 4, 6, Math.PI, 0);
            ctx.fill();
            // Window glass
            ctx.fillStyle = '#87CEEB';
            ctx.beginPath();
            ctx.arc(x + this.tileSize / 2, y + this.tileSize - 4, 4, Math.PI, 0);
            ctx.fill();
        }
        // Stone weathering and texture details
        ctx.fillStyle = '#DDD4C0';
        ctx.fillRect(x + 1, y + 1, 2, this.tileSize - 2);
        ctx.fillRect(x + this.tileSize - 3, y + 1, 2, this.tileSize - 2);
        // Subtle shadow to give depth
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fillRect(x + this.tileSize - 2, y, 2, this.tileSize);
        ctx.fillRect(x, y + this.tileSize - 2, this.tileSize, 2);
    }
}
const __TURBOPACK__default__export__ = CampusArea;
}),
"[project]/app/components/World.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$campus$2f$CampusArea$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/campus/CampusArea.ts [app-ssr] (ecmascript)");
;
class World {
    type = 'campus';
    tileSize = 32;
    areaWidth = 25;
    areaHeight = 19;
    totalWorldHeight = 38;
    campusArea;
    offCampusArea;
    cameraX = 0;
    cameraY = 0;
    constructor(){
        this.campusArea = new __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$campus$2f$CampusArea$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]();
        this.offCampusArea = new OffCampusArea();
    }
    canMoveTo(x, y, width, height) {
        // Calculate which area the player is in based on Y position
        const areaHeightPixels = this.areaHeight * this.tileSize; // 608px
        if (y < areaHeightPixels) {
            // Top area - off-campus
            return this.offCampusArea.canMoveTo(x, y, width, height);
        } else {
            // Bottom area - campus (adjust Y coordinate to be relative to campus area)
            const campusY = y - areaHeightPixels;
            return this.campusArea.canMoveTo(x, campusY, width, height);
        }
    }
    update(deltaTime) {
        this.campusArea.update(deltaTime);
        this.offCampusArea.update(deltaTime);
    }
    render(ctx, player) {
        // Update camera to follow player
        this.updateCamera(player);
        // Clear canvas
        ctx.fillStyle = '#2a4d3a';
        ctx.fillRect(0, 0, 800, 600);
        // Calculate which areas are visible based on camera position
        const areaHeightPixels = this.areaHeight * this.tileSize; // 608px
        const cameraTop = this.cameraY;
        const cameraBottom = this.cameraY + 600;
        // Render off-campus area (top) if visible
        if (cameraTop < areaHeightPixels) {
            ctx.save();
            // Translate to show off-campus area
            ctx.translate(-this.cameraX, -cameraTop);
            // Create a temporary player position for off-campus rendering
            const tempPlayer = {
                ...player
            };
            this.offCampusArea.render(ctx, tempPlayer);
            ctx.restore();
        }
        // Render campus area (bottom) if visible
        if (cameraBottom > areaHeightPixels) {
            ctx.save();
            // Translate to show campus area
            ctx.translate(-this.cameraX, areaHeightPixels - cameraTop);
            // Create a temporary player position for campus rendering (adjust Y)
            const tempPlayer = {
                ...player,
                y: player.y - areaHeightPixels
            };
            this.campusArea.render(ctx, tempPlayer);
            ctx.restore();
        }
        // Render boundary line between areas
        if (cameraTop < areaHeightPixels && cameraBottom > areaHeightPixels) {
            const boundaryY = areaHeightPixels - cameraTop;
            // Golden transition line
            ctx.fillStyle = '#FFD700';
            ctx.fillRect(0, boundaryY - 2, 800, 4);
            // Area labels
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 16px sans-serif';
            ctx.textAlign = 'center';
            ctx.shadowColor = 'rgba(0,0,0,0.8)';
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;
            if (boundaryY > 30) {
                ctx.fillText('🏙️ DOWNTOWN BLACKSBURG', 400, boundaryY - 15);
            }
            if (boundaryY < 570) {
                ctx.fillText('🏛️ VIRGINIA TECH CAMPUS', 400, boundaryY + 25);
            }
            ctx.shadowColor = 'transparent';
        }
    }
    updateCamera(player) {
        // Camera follows player through the entire world
        const targetCameraX = player.x - 400 + player.width / 2;
        const targetCameraY = player.y - 300 + player.height / 2;
        // World bounds
        const maxCameraX = this.areaWidth * this.tileSize - 800; // 800 - 800 = 0 (no horizontal scrolling for single screen width)
        const maxCameraY = this.totalWorldHeight * this.tileSize - 600; // Total world height minus screen height
        this.cameraX = Math.max(0, Math.min(maxCameraX, targetCameraX));
        this.cameraY = Math.max(0, Math.min(maxCameraY, targetCameraY));
    }
    // Method to get tile information for scene transitions
    getTileAt(tileX, tileY) {
        const areaHeightTiles = this.areaHeight; // 19 tiles
        if (tileY < areaHeightTiles) {
            // Off-campus area
            return this.offCampusArea.getTileAt(tileX, tileY);
        } else {
            // Campus area (adjust tile Y)
            const campusTileY = tileY - areaHeightTiles;
            return this.campusArea.getTileAt(tileX, campusTileY);
        }
    }
    getEntrancePosition() {
        // Start in campus area (bottom half)
        const areaHeightPixels = this.areaHeight * this.tileSize;
        return {
            x: 400,
            y: areaHeightPixels + 300
        }; // Middle of campus area
    }
}
const __TURBOPACK__default__export__ = World;
}),
"[project]/app/components/campus/BaseBuildingInterior.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
class BaseBuildingInterior {
    tileSize = 32;
    roomWidth = 20;
    roomHeight = 15;
    tiles;
    cameraX = 0;
    cameraY = 0;
    exitX = 320;
    exitY = 450;
    constructor(){
        this.tiles = this.generateInterior();
    }
    canMoveTo(x, y, width, height) {
        // Convert pixel coordinates to tile coordinates
        const leftTile = Math.floor(x / this.tileSize);
        const rightTile = Math.floor((x + width - 1) / this.tileSize);
        const topTile = Math.floor(y / this.tileSize);
        const bottomTile = Math.floor((y + height - 1) / this.tileSize);
        // Check all tiles that the entity overlaps
        for(let tileY = topTile; tileY <= bottomTile; tileY++){
            for(let tileX = leftTile; tileX <= rightTile; tileX++){
                if (this.isTileSolid(tileX, tileY)) {
                    return false;
                }
            }
        }
        return true;
    }
    isTileSolid(tileX, tileY) {
        // Check bounds
        if (tileX < 0 || tileX >= this.roomWidth || tileY < 0 || tileY >= this.roomHeight) {
            return true; // Treat out-of-bounds as solid
        }
        return this.tiles[tileY][tileX].solid;
    }
    update(deltaTime) {
    // Base update logic - can be overridden
    }
    render(ctx, player) {
        // Simple camera that centers on the room
        this.updateCamera(player);
        // Clear with indoor background
        ctx.fillStyle = '#F5F5DC'; // Beige indoor background
        ctx.fillRect(0, 0, 800, 600);
        // Render visible tiles
        const startTileX = Math.max(0, Math.floor(this.cameraX / this.tileSize));
        const endTileX = Math.min(this.roomWidth - 1, Math.floor((this.cameraX + 800) / this.tileSize));
        const startTileY = Math.max(0, Math.floor(this.cameraY / this.tileSize));
        const endTileY = Math.min(this.roomHeight - 1, Math.floor((this.cameraY + 600) / this.tileSize));
        for(let tileY = startTileY; tileY <= endTileY; tileY++){
            for(let tileX = startTileX; tileX <= endTileX; tileX++){
                const tile = this.tiles[tileY][tileX];
                const x = tileX * this.tileSize - this.cameraX;
                const y = tileY * this.tileSize - this.cameraY;
                this.renderTile(ctx, tile, x, y);
            }
        }
        // Render building-specific elements
        this.renderBuildingSpecificElements(ctx);
    }
    updateCamera(player) {
        // Keep camera centered on room, don't follow player too closely
        const targetCameraX = Math.max(0, Math.min(this.roomWidth * this.tileSize - 800, 0));
        const targetCameraY = Math.max(0, Math.min(this.roomHeight * this.tileSize - 600, 0));
        this.cameraX = targetCameraX;
        this.cameraY = targetCameraY;
    }
    renderTile(ctx, tile, x, y) {
        switch(tile.type){
            case 'floor':
                this.renderFloorTile(ctx, x, y);
                break;
            case 'wall':
                this.renderWallTile(ctx, x, y);
                break;
            case 'door':
                this.renderDoorTile(ctx, x, y);
                break;
            case 'furniture':
                this.renderFurnitureTile(ctx, tile, x, y);
                break;
            case 'window':
                this.renderWindowTile(ctx, x, y);
                break;
        }
    }
    renderFloorTile(ctx, x, y) {
        // Polished interior floor
        ctx.fillStyle = '#DEB887'; // Burlywood
        ctx.fillRect(x, y, this.tileSize, this.tileSize);
        // Floor pattern
        ctx.fillStyle = '#D2B48C';
        ctx.fillRect(x + 1, y + 1, this.tileSize - 2, this.tileSize - 2);
        // Tile lines
        ctx.fillStyle = '#CD853F';
        ctx.fillRect(x, y + 15, this.tileSize, 1);
        ctx.fillRect(x + 15, y, 1, this.tileSize);
    }
    renderWallTile(ctx, x, y) {
        // Interior wall with VT colors
        ctx.fillStyle = '#F5F5DC'; // Beige base
        ctx.fillRect(x, y, this.tileSize, this.tileSize);
        // Wall trim
        ctx.fillStyle = '#8B0000'; // VT Maroon
        ctx.fillRect(x, y, this.tileSize, 4);
        ctx.fillRect(x, y + this.tileSize - 4, this.tileSize, 4);
        // Wall texture
        ctx.fillStyle = '#DDBEA9';
        ctx.fillRect(x + 2, y + 4, this.tileSize - 4, this.tileSize - 8);
    }
    renderDoorTile(ctx, x, y) {
        // Floor base
        this.renderFloorTile(ctx, x, y);
        // Exit indicator
        ctx.fillStyle = '#32CD32'; // Lime green
        ctx.fillRect(x + 8, y + 8, 16, 16);
        // Exit text
        ctx.fillStyle = 'white';
        ctx.font = '8px monospace';
        ctx.fillText('EXIT', x + 10, y + 18);
    }
    renderFurnitureTile(ctx, tile, x, y) {
        // Floor base
        this.renderFloorTile(ctx, x, y);
        // Furniture based on type
        switch(tile.furniture){
            case 'desk':
                ctx.fillStyle = '#8B4513'; // Brown wood
                ctx.fillRect(x + 4, y + 8, 24, 16);
                break;
            case 'chair':
                ctx.fillStyle = '#8B0000'; // VT Maroon
                ctx.fillRect(x + 8, y + 8, 16, 16);
                ctx.fillRect(x + 10, y + 6, 12, 4); // Back
                break;
            case 'bookshelf':
                ctx.fillStyle = '#8B4513'; // Brown wood
                ctx.fillRect(x + 2, y + 2, 28, 28);
                // Books
                ctx.fillStyle = '#FF8C00'; // VT Orange
                ctx.fillRect(x + 4, y + 6, 4, 20);
                ctx.fillStyle = '#8B0000'; // VT Maroon
                ctx.fillRect(x + 10, y + 6, 4, 20);
                ctx.fillStyle = '#FF8C00';
                ctx.fillRect(x + 16, y + 6, 4, 20);
                break;
            case 'computer':
                ctx.fillStyle = '#2F2F2F'; // Dark gray
                ctx.fillRect(x + 8, y + 12, 16, 12);
                ctx.fillStyle = '#4169E1'; // Blue screen
                ctx.fillRect(x + 10, y + 14, 12, 8);
                break;
            case 'table':
                ctx.fillStyle = '#8B4513'; // Brown wood
                ctx.fillRect(x + 2, y + 10, 28, 12);
                break;
        }
    }
    renderWindowTile(ctx, x, y) {
        // Wall base
        this.renderWallTile(ctx, x, y);
        // Window
        ctx.fillStyle = '#87CEEB'; // Sky blue
        ctx.fillRect(x + 4, y + 4, 24, 24);
        // Window frame
        ctx.fillStyle = '#8B4513'; // Brown
        ctx.fillRect(x + 2, y + 2, 28, 4);
        ctx.fillRect(x + 2, y + 26, 28, 4);
        ctx.fillRect(x + 2, y + 2, 4, 28);
        ctx.fillRect(x + 26, y + 2, 4, 28);
        // Cross pattern
        ctx.fillRect(x + 14, y + 4, 4, 24);
        ctx.fillRect(x + 4, y + 14, 24, 4);
    }
    getExitPosition() {
        return {
            x: this.exitX,
            y: this.exitY,
            scene: 'campus'
        };
    }
    getEntrancePosition() {
        return {
            x: this.exitX,
            y: this.exitY - 50
        }; // Enter slightly above exit
    }
}
const __TURBOPACK__default__export__ = BaseBuildingInterior;
}),
"[project]/app/components/campus/BurrussInterior.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$campus$2f$BaseBuildingInterior$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/campus/BaseBuildingInterior.ts [app-ssr] (ecmascript)");
;
class BurrussInterior extends __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$campus$2f$BaseBuildingInterior$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"] {
    type = 'burruss';
    getBuildingName() {
        return 'Burruss Hall - Administration';
    }
    generateInterior() {
        const interior = [];
        for(let y = 0; y < this.roomHeight; y++){
            interior[y] = [];
            for(let x = 0; x < this.roomWidth; x++){
                // Create the layout for Burruss Hall administrative building
                // Outer walls
                if (x === 0 || x === this.roomWidth - 1 || y === 0 || y === this.roomHeight - 1) {
                    interior[y][x] = {
                        type: 'wall',
                        solid: true
                    };
                } else if (y === this.roomHeight - 1 && x === Math.floor(this.roomWidth / 2)) {
                    interior[y][x] = {
                        type: 'door',
                        solid: false
                    };
                } else if (x >= 8 && x <= 11 && y >= 6 && y <= 8) {
                    interior[y][x] = {
                        type: 'furniture',
                        solid: true,
                        furniture: 'desk'
                    };
                } else if ((x === 6 || x === 13) && (y === 9 || y === 10)) {
                    interior[y][x] = {
                        type: 'furniture',
                        solid: true,
                        furniture: 'chair'
                    };
                } else if (x >= 2 && x <= 4 && y >= 2 && y <= 4 || x >= 15 && x <= 17 && y >= 2 && y <= 4 || x >= 2 && x <= 4 && y >= 10 && y <= 12 || x >= 15 && x <= 17 && y >= 10 && y <= 12) {
                    interior[y][x] = {
                        type: 'furniture',
                        solid: true,
                        furniture: 'desk'
                    };
                } else if (y === 0 && (x === 5 || x === 10 || x === 14)) {
                    interior[y][x] = {
                        type: 'window',
                        solid: true
                    };
                } else if (x === 7 && y === 3 || x === 12 && y === 3) {
                    interior[y][x] = {
                        type: 'furniture',
                        solid: true,
                        furniture: 'computer'
                    };
                } else {
                    interior[y][x] = {
                        type: 'floor',
                        solid: false
                    };
                }
            }
        }
        return interior;
    }
    renderBuildingSpecificElements(ctx) {
        // Burruss Hall specific elements
        // VT seal/logo in center
        ctx.fillStyle = '#8B0000'; // Maroon
        ctx.fillCircle = function(x, y, radius) {
            this.beginPath();
            this.arc(x, y, radius, 0, 2 * Math.PI);
            this.fill();
        };
        const centerX = 400 - this.cameraX;
        const centerY = 200 - this.cameraY;
        ctx.fillStyle = '#8B0000';
        ctx.beginPath();
        ctx.arc(centerX, centerY, 30, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = '#FF8C00';
        ctx.beginPath();
        ctx.arc(centerX, centerY, 25, 0, 2 * Math.PI);
        ctx.fill();
        // VT text
        ctx.fillStyle = '#8B0000';
        ctx.font = 'bold 16px serif';
        ctx.textAlign = 'center';
        ctx.fillText('VT', centerX, centerY + 5);
        // Building name
        ctx.fillStyle = '#8B0000';
        ctx.font = 'bold 14px serif';
        ctx.textAlign = 'center';
        ctx.fillText('BURRUSS HALL', 400 - this.cameraX, 50 - this.cameraY);
        ctx.fillText('ADMINISTRATION', 400 - this.cameraX, 70 - this.cameraY);
        // Marble columns effect
        ctx.fillStyle = '#F5F5DC';
        ctx.fillRect(150 - this.cameraX, 0, 20, 200);
        ctx.fillRect(300 - this.cameraX, 0, 20, 200);
        ctx.fillRect(450 - this.cameraX, 0, 20, 200);
        ctx.fillRect(600 - this.cameraX, 0, 20, 200);
    }
}
const __TURBOPACK__default__export__ = BurrussInterior;
}),
"[project]/app/components/campus/NewmanInterior.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$campus$2f$BaseBuildingInterior$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/campus/BaseBuildingInterior.ts [app-ssr] (ecmascript)");
;
class NewmanInterior extends __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$campus$2f$BaseBuildingInterior$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"] {
    type = 'newman';
    getBuildingName() {
        return 'Newman Library';
    }
    generateInterior() {
        const interior = [];
        for(let y = 0; y < this.roomHeight; y++){
            interior[y] = [];
            for(let x = 0; x < this.roomWidth; x++){
                // Create the layout for Newman Library
                // Outer walls
                if (x === 0 || x === this.roomWidth - 1 || y === 0 || y === this.roomHeight - 1) {
                    interior[y][x] = {
                        type: 'wall',
                        solid: true
                    };
                } else if (y === this.roomHeight - 1 && x === Math.floor(this.roomWidth / 2)) {
                    interior[y][x] = {
                        type: 'door',
                        solid: false
                    };
                } else if (x === 1 && y >= 2 && y <= 12 || x === this.roomWidth - 2 && y >= 2 && y <= 12 || y === 1 && x >= 3 && x <= 16 && x % 3 === 0) {
                    interior[y][x] = {
                        type: 'furniture',
                        solid: true,
                        furniture: 'bookshelf'
                    };
                } else if (x >= 6 && x <= 8 && y >= 5 && y <= 6 || x >= 11 && x <= 13 && y >= 5 && y <= 6 || x >= 6 && x <= 8 && y >= 9 && y <= 10 || x >= 11 && x <= 13 && y >= 9 && y <= 10) {
                    interior[y][x] = {
                        type: 'furniture',
                        solid: true,
                        furniture: 'table'
                    };
                } else if (x === 5 && (y === 5 || y === 9) || x === 9 && (y === 5 || y === 9) || x === 10 && (y === 5 || y === 9) || x === 14 && (y === 5 || y === 9)) {
                    interior[y][x] = {
                        type: 'furniture',
                        solid: true,
                        furniture: 'chair'
                    };
                } else if (x >= 3 && x <= 5 && y === 3 || x >= 14 && x <= 16 && y === 3) {
                    interior[y][x] = {
                        type: 'furniture',
                        solid: true,
                        furniture: 'computer'
                    };
                } else if (y === 0 && (x === 4 || x === 8 || x === 12 || x === 16)) {
                    interior[y][x] = {
                        type: 'window',
                        solid: true
                    };
                } else {
                    interior[y][x] = {
                        type: 'floor',
                        solid: false
                    };
                }
            }
        }
        return interior;
    }
    renderBuildingSpecificElements(ctx) {
        // Newman Library specific elements
        // Library circulation desk
        ctx.fillStyle = '#8B4513'; // Brown wood
        ctx.fillRect(320 - this.cameraX, 100 - this.cameraY, 160, 40);
        // Information desk sign
        ctx.fillStyle = '#8B0000';
        ctx.fillRect(380 - this.cameraX, 80 - this.cameraY, 40, 20);
        ctx.fillStyle = 'white';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('INFO', 400 - this.cameraX, 93 - this.cameraY);
        // Building name
        ctx.fillStyle = '#FF8C00';
        ctx.font = 'bold 16px serif';
        ctx.textAlign = 'center';
        ctx.fillText('NEWMAN LIBRARY', 400 - this.cameraX, 30 - this.cameraY);
        // Reading area signs
        ctx.fillStyle = '#8B0000';
        ctx.font = '12px serif';
        ctx.textAlign = 'left';
        ctx.fillText('Quiet Study', 100 - this.cameraX, 150 - this.cameraY);
        ctx.fillText('Computer Lab', 100 - this.cameraX, 110 - this.cameraY);
        ctx.fillText('Research Collection', 500 - this.cameraX, 150 - this.cameraY);
        // Library carpet pattern
        ctx.fillStyle = '#8B0000';
        ctx.globalAlpha = 0.1;
        for(let x = 0; x < 800; x += 40){
            for(let y = 0; y < 600; y += 40){
                ctx.fillRect(x - this.cameraX, y - this.cameraY, 20, 20);
            }
        }
        ctx.globalAlpha = 1.0;
        // Book return slot
        ctx.fillStyle = '#2F2F2F';
        ctx.fillRect(50 - this.cameraX, 200 - this.cameraY, 30, 20);
        ctx.fillStyle = 'white';
        ctx.font = '8px monospace';
        ctx.fillText('RETURNS', 55 - this.cameraX, 213 - this.cameraY);
    }
}
const __TURBOPACK__default__export__ = NewmanInterior;
}),
"[project]/app/components/campus/TorgersenInterior.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$campus$2f$BaseBuildingInterior$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/campus/BaseBuildingInterior.ts [app-ssr] (ecmascript)");
;
class TorgersenInterior extends __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$campus$2f$BaseBuildingInterior$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"] {
    type = 'torgersen';
    getBuildingName() {
        return 'Torgersen Hall - College of Engineering';
    }
    generateInterior() {
        const interior = [];
        for(let y = 0; y < this.roomHeight; y++){
            interior[y] = [];
            for(let x = 0; x < this.roomWidth; x++){
                // Create the layout for Torgersen Engineering Hall
                // Outer walls
                if (x === 0 || x === this.roomWidth - 1 || y === 0 || y === this.roomHeight - 1) {
                    interior[y][x] = {
                        type: 'wall',
                        solid: true
                    };
                } else if (y === this.roomHeight - 1 && x === Math.floor(this.roomWidth / 2)) {
                    interior[y][x] = {
                        type: 'door',
                        solid: false
                    };
                } else if (x >= 2 && x <= 7 && y >= 2 && y <= 8 && (x + y) % 2 === 0) {
                    interior[y][x] = {
                        type: 'furniture',
                        solid: true,
                        furniture: 'computer'
                    };
                } else if (x >= 12 && x <= 17 && y >= 3 && y <= 6) {
                    interior[y][x] = {
                        type: 'furniture',
                        solid: true,
                        furniture: 'desk'
                    };
                } else if (x >= 12 && x <= 17 && y >= 8 && y <= 11) {
                    interior[y][x] = {
                        type: 'furniture',
                        solid: true,
                        furniture: 'table'
                    };
                } else if (x >= 2 && x <= 7 && y >= 2 && y <= 8 && (x + y) % 2 === 1 || x >= 11 && x <= 18 && (y === 2 || y === 7 || y === 12)) {
                    interior[y][x] = {
                        type: 'furniture',
                        solid: true,
                        furniture: 'chair'
                    };
                } else if (y === 0 && (x === 3 || x === 7 || x === 13 || x === 17)) {
                    interior[y][x] = {
                        type: 'window',
                        solid: true
                    };
                } else {
                    interior[y][x] = {
                        type: 'floor',
                        solid: false
                    };
                }
            }
        }
        return interior;
    }
    renderBuildingSpecificElements(ctx) {
        // Torgersen Hall Gothic Revival Architecture and Engineering Elements
        // Gothic architectural details on walls
        this.renderGothicArchDetails(ctx);
        // Engineering lab equipment with more modern appearance
        ctx.fillStyle = '#4A4A4A'; // Gray metal
        ctx.fillRect(400 - this.cameraX, 250 - this.cameraY, 80, 40);
        ctx.fillRect(500 - this.cameraX, 250 - this.cameraY, 80, 40);
        // Modern LCD screens
        ctx.fillStyle = '#1E1E1E'; // Dark screen bezel
        ctx.fillRect(405 - this.cameraX, 255 - this.cameraY, 30, 20);
        ctx.fillRect(505 - this.cameraX, 255 - this.cameraY, 30, 20);
        ctx.fillStyle = '#0066FF'; // Blue LCD screen
        ctx.fillRect(407 - this.cameraX, 257 - this.cameraY, 26, 16);
        ctx.fillRect(507 - this.cameraX, 257 - this.cameraY, 26, 16);
        // Building name with Gothic-inspired font styling
        ctx.fillStyle = '#8B0000'; // VT Maroon
        ctx.font = 'bold 18px serif';
        ctx.textAlign = 'center';
        ctx.fillText('TORGERSEN HALL', 400 - this.cameraX, 30 - this.cameraY);
        ctx.fillStyle = '#FF8C00'; // VT Orange
        ctx.font = 'bold 14px serif';
        ctx.fillText('COLLEGE OF ENGINEERING', 400 - this.cameraX, 50 - this.cameraY);
        ctx.fillStyle = '#C8B99C';
        ctx.font = '10px serif';
        ctx.fillText('EST. 1872 • VIRGINIA TECH', 400 - this.cameraX, 65 - this.cameraY);
        // Elegant departmental signs with Gothic styling
        ctx.fillStyle = '#2F2F2F';
        ctx.font = '14px serif';
        ctx.textAlign = 'left';
        ctx.fillText('⚡ Electrical & Computer Engineering', 80 - this.cameraX, 100 - this.cameraY);
        ctx.fillText('🔧 Mechanical Engineering Lab', 400 - this.cameraX, 200 - this.cameraY);
        ctx.fillText('💻 Engineering Design Studio', 400 - this.cameraX, 320 - this.cameraY);
        // Gothic stone columns (decorative)
        this.renderGothicColumns(ctx);
        // Advanced engineering elements
        ctx.strokeStyle = '#4A4A4A';
        ctx.lineWidth = 1;
        ctx.beginPath();
        // CAD workstation diagrams
        ctx.moveTo(50 - this.cameraX, 140 - this.cameraY);
        ctx.lineTo(150 - this.cameraX, 140 - this.cameraY);
        ctx.lineTo(150 - this.cameraX, 180 - this.cameraY);
        ctx.lineTo(50 - this.cameraX, 180 - this.cameraY);
        ctx.closePath();
        ctx.stroke();
        // VT Engineering logo with Gothic styling
        ctx.fillStyle = '#8B0000';
        ctx.fillRect(350 - this.cameraX, 75 - this.cameraY, 120, 50);
        ctx.fillStyle = '#E8DCC6'; // Limestone color
        ctx.fillRect(352 - this.cameraX, 77 - this.cameraY, 116, 46);
        ctx.fillStyle = '#8B0000';
        ctx.font = 'bold 16px serif';
        ctx.textAlign = 'center';
        ctx.fillText('VT', 410 - this.cameraX, 95 - this.cameraY);
        ctx.font = 'bold 10px serif';
        ctx.fillText('ENGINEERING', 410 - this.cameraX, 110 - this.cameraY);
        ctx.fillText('EXCELLENCE', 410 - this.cameraX, 120 - this.cameraY);
        // Modern cable management with Gothic aesthetic
        ctx.fillStyle = '#2F2F2F';
        ctx.fillRect(0 - this.cameraX, 200 - this.cameraY, 800, 3);
        ctx.fillRect(0 - this.cameraX, 300 - this.cameraY, 800, 3);
        // Stone floor pattern details
        ctx.strokeStyle = '#C8B99C';
        ctx.lineWidth = 1;
        for(let x = 0; x < 800; x += 64){
            ctx.beginPath();
            ctx.moveTo(x - this.cameraX, 0 - this.cameraY);
            ctx.lineTo(x - this.cameraX, 600 - this.cameraY);
            ctx.stroke();
        }
    }
    renderGothicArchDetails(ctx) {
        // Gothic arch patterns on walls
        ctx.strokeStyle = '#C8B99C';
        ctx.lineWidth = 2;
        // Left wall arches
        for(let i = 0; i < 3; i++){
            const x = 20 + i * 60;
            const y = 120;
            ctx.beginPath();
            ctx.arc(x - this.cameraX, y - this.cameraY, 25, Math.PI, 0);
            ctx.stroke();
        }
        // Right wall arches
        for(let i = 0; i < 3; i++){
            const x = 600 + i * 60;
            const y = 120;
            ctx.beginPath();
            ctx.arc(x - this.cameraX, y - this.cameraY, 25, Math.PI, 0);
            ctx.stroke();
        }
    }
    renderGothicColumns(ctx) {
        // Gothic stone columns
        ctx.fillStyle = '#E8DCC6'; // Limestone
        // Left columns
        ctx.fillRect(30 - this.cameraX, 50 - this.cameraY, 12, 400);
        ctx.fillRect(120 - this.cameraX, 50 - this.cameraY, 12, 400);
        // Right columns  
        ctx.fillRect(650 - this.cameraX, 50 - this.cameraY, 12, 400);
        ctx.fillRect(740 - this.cameraX, 50 - this.cameraY, 12, 400);
        // Column capitals (decorative tops)
        ctx.fillStyle = '#D4C4A8';
        ctx.fillRect(25 - this.cameraX, 45 - this.cameraY, 22, 10);
        ctx.fillRect(115 - this.cameraX, 45 - this.cameraY, 22, 10);
        ctx.fillRect(645 - this.cameraX, 45 - this.cameraY, 22, 10);
        ctx.fillRect(735 - this.cameraX, 45 - this.cameraY, 22, 10);
    }
}
const __TURBOPACK__default__export__ = TorgersenInterior;
}),
"[project]/app/components/campus/SquiresInterior.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$campus$2f$BaseBuildingInterior$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/campus/BaseBuildingInterior.ts [app-ssr] (ecmascript)");
;
class SquiresInterior extends __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$campus$2f$BaseBuildingInterior$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"] {
    type = 'squires';
    getBuildingName() {
        return 'Squires Student Center';
    }
    generateInterior() {
        const interior = [];
        for(let y = 0; y < this.roomHeight; y++){
            interior[y] = [];
            for(let x = 0; x < this.roomWidth; x++){
                // Create the layout for Squires Student Center
                // Outer walls
                if (x === 0 || x === this.roomWidth - 1 || y === 0 || y === this.roomHeight - 1) {
                    interior[y][x] = {
                        type: 'wall',
                        solid: true
                    };
                } else if (y === this.roomHeight - 1 && x === Math.floor(this.roomWidth / 2)) {
                    interior[y][x] = {
                        type: 'door',
                        solid: false
                    };
                } else if (x >= 6 && x <= 7 && y >= 5 && y <= 6 || x >= 9 && x <= 10 && y >= 5 && y <= 6 || x >= 12 && x <= 13 && y >= 5 && y <= 6 || x >= 6 && x <= 7 && y >= 8 && y <= 9 || x >= 9 && x <= 10 && y >= 8 && y <= 9 || x >= 12 && x <= 13 && y >= 8 && y <= 9) {
                    interior[y][x] = {
                        type: 'furniture',
                        solid: true,
                        furniture: 'table'
                    };
                } else if (x === 5 && (y === 5 || y === 8) || x === 8 && (y === 5 || y === 8) || x === 11 && (y === 5 || y === 8) || x === 14 && (y === 5 || y === 8) || x === 5 && (y === 6 || y === 9) || x === 8 && (y === 6 || y === 9) || x === 11 && (y === 6 || y === 9) || x === 14 && (y === 6 || y === 9)) {
                    interior[y][x] = {
                        type: 'furniture',
                        solid: true,
                        furniture: 'chair'
                    };
                } else if (x >= 2 && x <= 4 && y >= 3 && y <= 4 || x >= 2 && x <= 4 && y >= 10 && y <= 11) {
                    interior[y][x] = {
                        type: 'furniture',
                        solid: true,
                        furniture: 'couch'
                    };
                } else if (x >= 15 && x <= 17 && y >= 2 && y <= 3) {
                    interior[y][x] = {
                        type: 'furniture',
                        solid: true,
                        furniture: 'desk'
                    };
                } else if (x === 3 && y === 7 || x === 16 && y === 7) {
                    interior[y][x] = {
                        type: 'furniture',
                        solid: true,
                        furniture: 'computer'
                    };
                } else if (y === 0 && (x === 4 || x === 8 || x === 12 || x === 16)) {
                    interior[y][x] = {
                        type: 'window',
                        solid: true
                    };
                } else {
                    interior[y][x] = {
                        type: 'floor',
                        solid: false
                    };
                }
            }
        }
        return interior;
    }
    renderBuildingSpecificElements(ctx) {
        // Squires Student Center specific elements
        // Building name
        ctx.fillStyle = '#FF8C00';
        ctx.font = 'bold 16px serif';
        ctx.textAlign = 'center';
        ctx.fillText('SQUIRES STUDENT CENTER', 400 - this.cameraX, 30 - this.cameraY);
        // Food court area
        ctx.fillStyle = '#8B0000';
        ctx.font = '14px serif';
        ctx.textAlign = 'center';
        ctx.fillText('FOOD COURT', 400 - this.cameraX, 55 - this.cameraY);
        // Student services signs
        ctx.fillStyle = '#8B0000';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('Student Services', 500 - this.cameraX, 100 - this.cameraY);
        ctx.fillText('Information Desk', 500 - this.cameraX, 120 - this.cameraY);
        ctx.fillText('Student Lounge', 100 - this.cameraX, 150 - this.cameraY);
        // VT spirit decorations
        ctx.fillStyle = '#8B0000';
        ctx.fillRect(50 - this.cameraX, 50 - this.cameraY, 60, 40);
        ctx.fillStyle = '#FF8C00';
        ctx.fillRect(55 - this.cameraX, 55 - this.cameraY, 50, 30);
        ctx.fillStyle = '#8B0000';
        ctx.font = 'bold 16px serif';
        ctx.textAlign = 'center';
        ctx.fillText('GO', 70 - this.cameraX, 75 - this.cameraY);
        ctx.fillText('HOKIES!', 85 - this.cameraX, 85 - this.cameraY);
        // Student announcements board
        ctx.fillStyle = '#4A4A4A';
        ctx.fillRect(600 - this.cameraX, 100 - this.cameraY, 120, 80);
        ctx.fillStyle = 'white';
        ctx.fillRect(610 - this.cameraX, 110 - this.cameraY, 100, 60);
        ctx.fillStyle = '#8B0000';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('Student Events', 615 - this.cameraX, 125 - this.cameraY);
        ctx.fillText('• Basketball Game', 615 - this.cameraX, 140 - this.cameraY);
        ctx.fillText('• Club Fair', 615 - this.cameraX, 155 - this.cameraY);
        ctx.fillText('• Study Groups', 615 - this.cameraX, 170 - this.cameraY);
        // Stylized floor pattern for student center
        ctx.fillStyle = '#FF8C00';
        ctx.globalAlpha = 0.1;
        for(let x = 200; x < 600; x += 50){
            for(let y = 200; y < 400; y += 50){
                ctx.fillRect(x - this.cameraX, y - this.cameraY, 25, 25);
            }
        }
        ctx.globalAlpha = 1.0;
        // Student center amenities
        ctx.fillStyle = '#2F2F2F';
        ctx.fillRect(150 - this.cameraX, 320 - this.cameraY, 40, 20);
        ctx.fillStyle = 'white';
        ctx.font = '8px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('ATM', 170 - this.cameraX, 333 - this.cameraY);
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(250 - this.cameraX, 320 - this.cameraY, 40, 20);
        ctx.fillStyle = 'white';
        ctx.fillText('MAIL', 270 - this.cameraX, 333 - this.cameraY);
    }
}
const __TURBOPACK__default__export__ = SquiresInterior;
}),
"[project]/app/components/off-campus/BaseOffCampusBuilding.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
class BaseOffCampusBuilding {
    tileSize = 32;
    buildingWidth = 20;
    buildingHeight = 15;
    tiles;
    cameraX = 0;
    cameraY = 0;
    exitX = 320;
    exitY = 450;
    constructor(){
        this.tiles = this.generateBuilding();
    }
    canMoveTo(x, y, width, height) {
        // Convert pixel coordinates to tile coordinates
        const leftTile = Math.floor(x / this.tileSize);
        const rightTile = Math.floor((x + width - 1) / this.tileSize);
        const topTile = Math.floor(y / this.tileSize);
        const bottomTile = Math.floor((y + height - 1) / this.tileSize);
        // Check all tiles that the entity overlaps
        for(let tileY = topTile; tileY <= bottomTile; tileY++){
            for(let tileX = leftTile; tileX <= rightTile; tileX++){
                if (this.isTileSolid(tileX, tileY)) {
                    return false;
                }
            }
        }
        return true;
    }
    isTileSolid(tileX, tileY) {
        // Check bounds
        if (tileX < 0 || tileX >= this.buildingWidth || tileY < 0 || tileY >= this.buildingHeight) {
            return true; // Treat out-of-bounds as solid
        }
        return this.tiles[tileY][tileX].solid;
    }
    update(deltaTime) {
    // Base update logic - can be overridden
    }
    render(ctx, player) {
        // Simple camera that centers on the building
        this.updateCamera(player);
        // Clear with indoor background
        ctx.fillStyle = '#F0F0F0'; // Light gray indoor background
        ctx.fillRect(0, 0, 800, 600);
        // Render visible tiles
        const startTileX = Math.max(0, Math.floor(this.cameraX / this.tileSize));
        const endTileX = Math.min(this.buildingWidth - 1, Math.floor((this.cameraX + 800) / this.tileSize));
        const startTileY = Math.max(0, Math.floor(this.cameraY / this.tileSize));
        const endTileY = Math.min(this.buildingHeight - 1, Math.floor((this.cameraY + 600) / this.tileSize));
        for(let tileY = startTileY; tileY <= endTileY; tileY++){
            for(let tileX = startTileX; tileX <= endTileX; tileX++){
                const tile = this.tiles[tileY][tileX];
                const x = tileX * this.tileSize - this.cameraX;
                const y = tileY * this.tileSize - this.cameraY;
                this.renderTile(ctx, tile, x, y);
            }
        }
        // Render building-specific elements
        this.renderBuildingSpecificElements(ctx);
    }
    updateCamera(player) {
        // Keep camera centered on building
        const targetCameraX = Math.max(0, Math.min(this.buildingWidth * this.tileSize - 800, 0));
        const targetCameraY = Math.max(0, Math.min(this.buildingHeight * this.tileSize - 600, 0));
        this.cameraX = targetCameraX;
        this.cameraY = targetCameraY;
    }
    renderTile(ctx, tile, x, y) {
        switch(tile.type){
            case 'floor':
                this.renderFloorTile(ctx, x, y);
                break;
            case 'wall':
                this.renderWallTile(ctx, x, y);
                break;
            case 'door':
                this.renderDoorTile(ctx, x, y);
                break;
            case 'furniture':
                this.renderFurnitureTile(ctx, tile, x, y);
                break;
            case 'window':
                this.renderWindowTile(ctx, x, y);
                break;
            case 'lobby':
                this.renderLobbyTile(ctx, x, y);
                break;
            case 'mailroom':
                this.renderMailroomTile(ctx, x, y);
                break;
            case 'elevator':
                this.renderElevatorTile(ctx, x, y);
                break;
            case 'stairs':
                this.renderStairsTile(ctx, x, y);
                break;
        }
    }
    renderFloorTile(ctx, x, y) {
        // Modern apartment flooring
        ctx.fillStyle = '#E8E8E8'; // Light gray
        ctx.fillRect(x, y, this.tileSize, this.tileSize);
        // Floor pattern
        ctx.fillStyle = '#DCDCDC';
        ctx.fillRect(x + 1, y + 1, this.tileSize - 2, this.tileSize - 2);
    }
    renderWallTile(ctx, x, y) {
        // Modern apartment walls
        ctx.fillStyle = '#FFFFFF'; // White walls
        ctx.fillRect(x, y, this.tileSize, this.tileSize);
        // Wall trim
        ctx.fillStyle = '#D3D3D3';
        ctx.fillRect(x, y, this.tileSize, 2);
        ctx.fillRect(x, y + this.tileSize - 2, this.tileSize, 2);
    }
    renderDoorTile(ctx, x, y) {
        // Floor base
        this.renderFloorTile(ctx, x, y);
        // Exit indicator
        ctx.fillStyle = '#32CD32'; // Lime green
        ctx.fillRect(x + 8, y + 8, 16, 16);
        // Exit text
        ctx.fillStyle = 'white';
        ctx.font = '8px monospace';
        ctx.fillText('EXIT', x + 10, y + 18);
    }
    renderFurnitureTile(ctx, tile, x, y) {
        // Floor base
        this.renderFloorTile(ctx, x, y);
        // Furniture based on type
        switch(tile.furniture){
            case 'couch':
                ctx.fillStyle = '#8B4513'; // Brown
                ctx.fillRect(x + 2, y + 8, 28, 16);
                ctx.fillStyle = '#A0522D'; // Lighter brown for cushions
                ctx.fillRect(x + 4, y + 10, 6, 12);
                ctx.fillRect(x + 12, y + 10, 6, 12);
                ctx.fillRect(x + 20, y + 10, 6, 12);
                break;
            case 'bed':
                ctx.fillStyle = '#8B4513'; // Brown bed frame
                ctx.fillRect(x + 2, y + 4, 28, 24);
                ctx.fillStyle = '#FFFFFF'; // White sheets
                ctx.fillRect(x + 4, y + 6, 24, 20);
                ctx.fillStyle = '#FFB6C1'; // Pink pillow
                ctx.fillRect(x + 6, y + 8, 8, 6);
                break;
            case 'kitchen':
                ctx.fillStyle = '#2F4F4F'; // Dark slate gray
                ctx.fillRect(x + 2, y + 2, 28, 14);
                ctx.fillStyle = '#4169E1'; // Blue for appliances
                ctx.fillRect(x + 4, y + 4, 8, 10);
                ctx.fillStyle = '#C0C0C0'; // Silver for sink
                ctx.fillRect(x + 14, y + 4, 8, 10);
                break;
            case 'mailbox':
                ctx.fillStyle = '#4682B4'; // Steel blue
                ctx.fillRect(x + 8, y + 8, 16, 16);
                ctx.fillStyle = '#FFD700'; // Gold for handles
                ctx.fillRect(x + 12, y + 14, 8, 2);
                break;
            case 'vending':
                ctx.fillStyle = '#FF4500'; // Orange red
                ctx.fillRect(x + 4, y + 2, 24, 28);
                ctx.fillStyle = '#000000'; // Black for display
                ctx.fillRect(x + 6, y + 4, 20, 12);
                ctx.fillStyle = '#FFFFFF'; // White for buttons
                ctx.fillRect(x + 8, y + 18, 4, 4);
                ctx.fillRect(x + 14, y + 18, 4, 4);
                ctx.fillRect(x + 20, y + 18, 4, 4);
                break;
            case 'laundry':
                ctx.fillStyle = '#FFFFFF'; // White washers/dryers
                ctx.fillRect(x + 2, y + 4, 12, 24);
                ctx.fillRect(x + 18, y + 4, 12, 24);
                ctx.fillStyle = '#000000'; // Black for doors
                ctx.fillRect(x + 4, y + 6, 8, 8);
                ctx.fillRect(x + 20, y + 6, 8, 8);
                break;
            default:
                ctx.fillStyle = '#8B4513'; // Default brown furniture
                ctx.fillRect(x + 4, y + 4, 24, 24);
        }
    }
    renderWindowTile(ctx, x, y) {
        // Wall base
        this.renderWallTile(ctx, x, y);
        // Window
        ctx.fillStyle = '#87CEEB'; // Sky blue
        ctx.fillRect(x + 4, y + 4, 24, 24);
        // Window frame
        ctx.fillStyle = '#A0522D'; // Brown frame
        ctx.fillRect(x + 2, y + 2, 28, 4);
        ctx.fillRect(x + 2, y + 26, 28, 4);
        ctx.fillRect(x + 2, y + 2, 4, 28);
        ctx.fillRect(x + 26, y + 2, 4, 28);
        // Window cross
        ctx.fillRect(x + 14, y + 4, 4, 24);
        ctx.fillRect(x + 4, y + 14, 24, 4);
    }
    renderLobbyTile(ctx, x, y) {
        // Fancy lobby flooring
        ctx.fillStyle = '#F5F5DC'; // Beige
        ctx.fillRect(x, y, this.tileSize, this.tileSize);
        // Marble pattern
        ctx.fillStyle = '#DDBEA9';
        ctx.fillRect(x + 2, y + 2, this.tileSize - 4, this.tileSize - 4);
        // Decorative border
        ctx.fillStyle = '#CD853F';
        ctx.fillRect(x, y, this.tileSize, 2);
        ctx.fillRect(x, y + this.tileSize - 2, this.tileSize, 2);
        ctx.fillRect(x, y, 2, this.tileSize);
        ctx.fillRect(x + this.tileSize - 2, y, 2, this.tileSize);
    }
    renderMailroomTile(ctx, x, y) {
        // Floor base
        this.renderFloorTile(ctx, x, y);
        // Mailroom equipment
        ctx.fillStyle = '#4682B4'; // Steel blue
        ctx.fillRect(x + 4, y + 4, 24, 24);
        // Mail slots
        ctx.fillStyle = '#000000';
        for(let i = 0; i < 3; i++){
            for(let j = 0; j < 3; j++){
                ctx.fillRect(x + 6 + j * 6, y + 6 + i * 6, 4, 4);
            }
        }
    }
    renderElevatorTile(ctx, x, y) {
        // Floor base
        this.renderFloorTile(ctx, x, y);
        // Elevator doors
        ctx.fillStyle = '#C0C0C0'; // Silver
        ctx.fillRect(x + 6, y + 4, 10, 24);
        ctx.fillRect(x + 16, y + 4, 10, 24);
        // Elevator buttons
        ctx.fillStyle = '#FFD700'; // Gold
        ctx.fillRect(x + 28, y + 12, 2, 2);
        ctx.fillRect(x + 28, y + 16, 2, 2);
    }
    renderStairsTile(ctx, x, y) {
        // Floor base
        this.renderFloorTile(ctx, x, y);
        // Stairs
        ctx.fillStyle = '#808080'; // Gray
        for(let i = 0; i < 4; i++){
            ctx.fillRect(x + 2, y + 4 + i * 6, 28 - i * 6, 4);
        }
        // Handrail
        ctx.fillStyle = '#8B4513'; // Brown
        ctx.fillRect(x + 2, y + 4, 2, 24);
    }
    getExitPosition() {
        return {
            x: this.exitX,
            y: this.exitY,
            scene: 'campus'
        };
    }
    getEntrancePosition() {
        return {
            x: this.exitX,
            y: this.exitY - 50
        }; // Enter slightly above exit
    }
}
const __TURBOPACK__default__export__ = BaseOffCampusBuilding;
}),
"[project]/app/components/off-campus/TotsInterior.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$off$2d$campus$2f$BaseOffCampusBuilding$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/off-campus/BaseOffCampusBuilding.ts [app-ssr] (ecmascript)");
;
class TotsInterior extends __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$off$2d$campus$2f$BaseOffCampusBuilding$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"] {
    type = 'tots';
    getBuildingName() {
        return 'Tots - Outdoor Bar (Ground Floor)';
    }
    getBuildingType() {
        return 'commercial';
    }
    generateBuilding() {
        const interior = [];
        for(let y = 0; y < this.buildingHeight; y++){
            interior[y] = [];
            for(let x = 0; x < this.buildingWidth; x++){
                // Create the layout for Tots restaurant
                // Outer walls
                if (x === 0 || x === this.buildingWidth - 1 || y === 0 || y === this.buildingHeight - 1) {
                    interior[y][x] = {
                        type: 'wall',
                        solid: true
                    };
                } else if (y === this.buildingHeight - 1 && x === Math.floor(this.buildingWidth / 2)) {
                    interior[y][x] = {
                        type: 'door',
                        solid: false
                    };
                } else if (x >= 2 && x <= 6 && y >= 2 && y <= 3) {
                    interior[y][x] = {
                        type: 'furniture',
                        solid: true,
                        furniture: 'desk'
                    };
                } else if (x >= 2 && x <= 6 && y === 4) {
                    interior[y][x] = {
                        type: 'furniture',
                        solid: true,
                        furniture: 'chair'
                    };
                } else if (x >= 16 && x <= 18 && y >= 2 && y <= 5) {
                    interior[y][x] = {
                        type: 'stairs',
                        solid: false
                    };
                } else if (x >= 4 && x <= 5 && y >= 8 && y <= 9 || x >= 8 && x <= 9 && y >= 8 && y <= 9 || x >= 12 && x <= 13 && y >= 8 && y <= 9 || x >= 16 && x <= 17 && y >= 8 && y <= 9 || x >= 4 && x <= 5 && y >= 11 && y <= 12 || x >= 8 && x <= 9 && y >= 11 && y <= 12 || x >= 12 && x <= 13 && y >= 11 && y <= 12) {
                    interior[y][x] = {
                        type: 'furniture',
                        solid: true,
                        furniture: 'table'
                    };
                } else if (x === 3 && (y === 8 || y === 11) || x === 6 && (y === 8 || y === 11) || x === 7 && (y === 8 || y === 11) || x === 10 && (y === 8 || y === 11) || x === 11 && (y === 8 || y === 11) || x === 14 && (y === 8 || y === 11) || x === 15 && y === 8 || x === 18 && y === 8 || x === 3 && (y === 9 || y === 12) || x === 6 && (y === 9 || y === 12) || x === 7 && (y === 9 || y === 12) || x === 10 && (y === 9 || y === 12) || x === 11 && (y === 9 || y === 12) || x === 14 && (y === 9 || y === 12)) {
                    interior[y][x] = {
                        type: 'furniture',
                        solid: true,
                        furniture: 'chair'
                    };
                } else if (y === 0 && (x === 4 || x === 8 || x === 12 || x === 16) || x === 0 && (y === 6 || y === 10)) {
                    interior[y][x] = {
                        type: 'window',
                        solid: true
                    };
                } else {
                    interior[y][x] = {
                        type: 'floor',
                        solid: false
                    };
                }
            }
        }
        return interior;
    }
    renderBuildingSpecificElements(ctx) {
        // Tots outdoor bar specific elements
        // Bar name and branding
        ctx.fillStyle = '#FF6B35'; // Orange branding
        ctx.font = 'bold 18px serif';
        ctx.textAlign = 'center';
        ctx.fillText('TOTS', 400 - this.cameraX, 35 - this.cameraY);
        ctx.fillStyle = '#2E86AB';
        ctx.font = 'bold 12px serif';
        ctx.fillText('Outdoor Bar & Grill', 400 - this.cameraX, 55 - this.cameraY);
        // Outdoor bar back with bottles
        ctx.fillStyle = '#8B4513'; // Wood bar back
        ctx.fillRect(80 - this.cameraX, 60 - this.cameraY, 150, 40);
        // Beer taps
        ctx.fillStyle = '#C0C0C0'; // Silver taps
        ctx.fillRect(90 - this.cameraX, 50 - this.cameraY, 4, 15);
        ctx.fillRect(110 - this.cameraX, 50 - this.cameraY, 4, 15);
        ctx.fillRect(130 - this.cameraX, 50 - this.cameraY, 4, 15);
        ctx.fillRect(150 - this.cameraX, 50 - this.cameraY, 4, 15);
        // Tap handles
        ctx.fillStyle = '#FF6B35';
        ctx.fillRect(88 - this.cameraX, 45 - this.cameraY, 8, 6);
        ctx.fillRect(108 - this.cameraX, 45 - this.cameraY, 8, 6);
        ctx.fillRect(128 - this.cameraX, 45 - this.cameraY, 8, 6);
        ctx.fillRect(148 - this.cameraX, 45 - this.cameraY, 8, 6);
        // Outdoor umbrellas above tables
        ctx.fillStyle = '#FF6B35';
        ctx.beginPath();
        ctx.arc(140 - this.cameraX, 250 - this.cameraY, 25, 0, Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(290 - this.cameraX, 250 - this.cameraY, 25, 0, Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(440 - this.cameraX, 250 - this.cameraY, 25, 0, Math.PI);
        ctx.fill();
        // Umbrella poles
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(138 - this.cameraX, 250 - this.cameraY, 4, 40);
        ctx.fillRect(288 - this.cameraX, 250 - this.cameraY, 4, 40);
        ctx.fillRect(438 - this.cameraX, 250 - this.cameraY, 4, 40);
        // Stairs visualization
        ctx.fillStyle = '#8B4513'; // Brown wood stairs
        ctx.fillRect(520 - this.cameraX, 80 - this.cameraY, 80, 120);
        // Individual stair steps
        for(let i = 0; i < 6; i++){
            ctx.fillStyle = '#A0522D';
            ctx.fillRect(525 - this.cameraX, 85 + i * 18 - this.cameraY, 70 - i * 8, 15);
        }
        // Stair railing
        ctx.fillStyle = '#654321';
        ctx.fillRect(522 - this.cameraX, 80 - this.cameraY, 3, 120);
        ctx.fillRect(597 - this.cameraX, 80 - this.cameraY, 3, 60);
        // "UPSTAIRS" sign
        ctx.fillStyle = '#FF6B35';
        ctx.fillRect(530 - this.cameraX, 60 - this.cameraY, 60, 15);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('UPSTAIRS', 560 - this.cameraX, 70 - this.cameraY);
        // Outdoor patio string lights
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(50 - this.cameraX, 120 - this.cameraY);
        ctx.lineTo(750 - this.cameraX, 120 - this.cameraY);
        ctx.stroke();
        // Light bulbs on string
        ctx.fillStyle = '#FFD700';
        for(let x = 100; x < 700; x += 80){
            ctx.beginPath();
            ctx.arc(x - this.cameraX, 120 - this.cameraY, 4, 0, 2 * Math.PI);
            ctx.fill();
        }
        // Outdoor heaters
        ctx.fillStyle = '#2F2F2F';
        ctx.fillRect(200 - this.cameraX, 350 - this.cameraY, 12, 40);
        ctx.fillRect(500 - this.cameraX, 350 - this.cameraY, 12, 40);
        // Heater tops
        ctx.fillStyle = '#FF4500';
        ctx.fillRect(195 - this.cameraX, 345 - this.cameraY, 22, 8);
        ctx.fillRect(495 - this.cameraX, 345 - this.cameraY, 22, 8);
        // Table numbers
        ctx.fillStyle = '#2E86AB';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('1', 140 - this.cameraX, 270 - this.cameraY);
        ctx.fillText('2', 290 - this.cameraX, 270 - this.cameraY);
        ctx.fillText('3', 440 - this.cameraX, 270 - this.cameraY);
        ctx.fillText('4', 590 - this.cameraX, 270 - this.cameraY);
        ctx.fillText('5', 140 - this.cameraX, 370 - this.cameraY);
        ctx.fillText('6', 290 - this.cameraX, 370 - this.cameraY);
        ctx.fillText('7', 440 - this.cameraX, 370 - this.cameraY);
        // Outdoor wooden deck pattern
        ctx.fillStyle = '#D2B48C';
        ctx.globalAlpha = 0.3;
        for(let x = 0; x < 800; x += 40){
            ctx.fillRect(x - this.cameraX, 0 - this.cameraY, 2, 600);
        }
        ctx.globalAlpha = 1.0;
        // Bar menu board
        ctx.fillStyle = '#2F2F2F';
        ctx.fillRect(250 - this.cameraX, 80 - this.cameraY, 120, 60);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('BAR MENU', 310 - this.cameraX, 95 - this.cameraY);
        ctx.font = '9px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('• Craft Beer ....... $5', 260 - this.cameraX, 110 - this.cameraY);
        ctx.fillText('• Cocktails ........ $8', 260 - this.cameraX, 122 - this.cameraY);
        ctx.fillText('• Tot Nachos ..... $12', 260 - this.cameraX, 134 - this.cameraY);
    }
}
const __TURBOPACK__default__export__ = TotsInterior;
}),
"[project]/app/components/off-campus/TotsUpstairs.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$off$2d$campus$2f$BaseOffCampusBuilding$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/off-campus/BaseOffCampusBuilding.ts [app-ssr] (ecmascript)");
;
class TotsUpstairs extends __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$off$2d$campus$2f$BaseOffCampusBuilding$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"] {
    type = 'tots_upstairs';
    getBuildingName() {
        return 'Tots - Dance Floor & Photo Spot (Upstairs)';
    }
    getBuildingType() {
        return 'commercial';
    }
    generateBuilding() {
        const interior = [];
        for(let y = 0; y < this.buildingHeight; y++){
            interior[y] = [];
            for(let x = 0; x < this.buildingWidth; x++){
                // Create the layout for Tots upstairs
                // Outer walls
                if (x === 0 || x === this.buildingWidth - 1 || y === 0 || y === this.buildingHeight - 1) {
                    interior[y][x] = {
                        type: 'wall',
                        solid: true
                    };
                } else if (x >= 16 && x <= 18 && y >= 2 && y <= 5) {
                    interior[y][x] = {
                        type: 'stairs',
                        solid: false
                    };
                } else if (x >= 2 && x <= 3 && y >= 6 && y <= 7) {
                    interior[y][x] = {
                        type: 'furniture',
                        solid: true,
                        furniture: 'couch'
                    };
                } else if (x >= 2 && x <= 3 && y >= 10 && y <= 11) {
                    interior[y][x] = {
                        type: 'furniture',
                        solid: true,
                        furniture: 'couch'
                    };
                } else if (x === 5 && y === 8 || x === 5 && y === 12) {
                    interior[y][x] = {
                        type: 'furniture',
                        solid: true,
                        furniture: 'table'
                    };
                } else if (x === 12 && y === 8 || x === 12 && y === 11) {
                    interior[y][x] = {
                        type: 'furniture',
                        solid: true,
                        furniture: 'table'
                    };
                } else if (x >= 14 && x <= 15 && y >= 12 && y <= 13) {
                    interior[y][x] = {
                        type: 'furniture',
                        solid: true,
                        furniture: 'desk'
                    };
                } else if (y === 0 && (x === 5 || x === 9 || x === 13)) {
                    interior[y][x] = {
                        type: 'window',
                        solid: true
                    };
                } else {
                    interior[y][x] = {
                        type: 'floor',
                        solid: false
                    };
                }
            }
        }
        return interior;
    }
    renderBuildingSpecificElements(ctx) {
        // Tots upstairs specific elements
        // Venue name
        ctx.fillStyle = '#FF6B35'; // Orange branding
        ctx.font = 'bold 18px serif';
        ctx.textAlign = 'center';
        ctx.fillText('TOTS UPSTAIRS', 400 - this.cameraX, 35 - this.cameraY);
        ctx.fillStyle = '#2E86AB';
        ctx.font = 'bold 12px serif';
        ctx.fillText('Dance Floor & VT Photo Spot', 400 - this.cameraX, 55 - this.cameraY);
        // Massive VT sign (photo spot area - left half)
        const vtSignX = 200;
        const vtSignY = 200;
        const signWidth = 180;
        const signHeight = 120;
        // VT sign background
        ctx.fillStyle = '#8B0000'; // VT Maroon background
        ctx.fillRect(vtSignX - this.cameraX, vtSignY - this.cameraY, signWidth, signHeight);
        // Orange neon border effect
        ctx.strokeStyle = '#FF8C00'; // VT Orange neon
        ctx.lineWidth = 8;
        ctx.strokeRect(vtSignX - 4 - this.cameraX, vtSignY - 4 - this.cameraY, signWidth + 8, signHeight + 8);
        // Inner orange glow
        ctx.strokeStyle = '#FFB347'; // Lighter orange
        ctx.lineWidth = 4;
        ctx.strokeRect(vtSignX - 2 - this.cameraX, vtSignY - 2 - this.cameraY, signWidth + 4, signHeight + 4);
        // VT Letters
        ctx.fillStyle = '#FF8C00'; // VT Orange
        ctx.font = 'bold 72px serif';
        ctx.textAlign = 'center';
        ctx.fillText('VT', vtSignX + signWidth / 2 - this.cameraX, vtSignY + signHeight / 2 + 25 - this.cameraY);
        // Orange neon glow effect around letters
        ctx.shadowColor = '#FF8C00';
        ctx.shadowBlur = 20;
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 72px serif';
        ctx.fillText('VT', vtSignX + signWidth / 2 - this.cameraX, vtSignY + signHeight / 2 + 25 - this.cameraY);
        ctx.shadowBlur = 0;
        // "PHOTO SPOT" text below VT sign
        ctx.fillStyle = '#FFD700'; // Gold
        ctx.font = 'bold 16px serif';
        ctx.textAlign = 'center';
        ctx.fillText('📸 PHOTO SPOT 📸', vtSignX + signWidth / 2 - this.cameraX, vtSignY + signHeight + 25 - this.cameraY);
        // Photo area decorations
        ctx.fillStyle = '#8B0000';
        ctx.fillRect(50 - this.cameraX, 150 - this.cameraY, 30, 30);
        ctx.fillStyle = '#FF8C00';
        ctx.fillRect(55 - this.cameraX, 155 - this.cameraY, 20, 20);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 12px serif';
        ctx.textAlign = 'center';
        ctx.fillText('VT', 65 - this.cameraX, 168 - this.cameraY);
        // Dance floor area (right half)
        ctx.fillStyle = '#2E86AB';
        ctx.font = 'bold 16px serif';
        ctx.textAlign = 'center';
        ctx.fillText('🕺 DANCE FLOOR 💃', 550 - this.cameraX, 150 - this.cameraY);
        // Dance floor lighting
        const time = Date.now() * 0.003;
        const danceColors = [
            '#FF6B35',
            '#2E86AB',
            '#FF8C00',
            '#8B0000'
        ];
        // Animated dance floor spots
        for(let i = 0; i < 4; i++){
            const x = 450 + i % 2 * 80;
            const y = 200 + Math.floor(i / 2) * 80;
            const colorIndex = Math.floor(time + i) % danceColors.length;
            ctx.fillStyle = danceColors[colorIndex];
            ctx.globalAlpha = 0.4 + 0.3 * Math.sin(time * 3 + i);
            ctx.beginPath();
            ctx.arc(x - this.cameraX, y - this.cameraY, 35, 0, 2 * Math.PI);
            ctx.fill();
        }
        ctx.globalAlpha = 1.0;
        // DJ booth equipment
        ctx.fillStyle = '#2F2F2F';
        ctx.fillRect(460 - this.cameraX, 380 - this.cameraY, 80, 40);
        // DJ turntables
        ctx.fillStyle = '#C0C0C0';
        ctx.beginPath();
        ctx.arc(480 - this.cameraX, 400 - this.cameraY, 12, 0, 2 * Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(520 - this.cameraX, 400 - this.cameraY, 12, 0, 2 * Math.PI);
        ctx.fill();
        // DJ mixer
        ctx.fillStyle = '#000000';
        ctx.fillRect(485 - this.cameraX, 395 - this.cameraY, 30, 10);
        // Stairs visualization (going down)
        ctx.fillStyle = '#8B4513'; // Brown wood stairs
        ctx.fillRect(520 - this.cameraX, 80 - this.cameraY, 80, 120);
        // Individual stair steps (going down)
        for(let i = 0; i < 6; i++){
            ctx.fillStyle = '#A0522D';
            ctx.fillRect(525 - this.cameraX, 190 - i * 18 - this.cameraY, 70 - (5 - i) * 8, 15);
        }
        // Stair railing
        ctx.fillStyle = '#654321';
        ctx.fillRect(522 - this.cameraX, 80 - this.cameraY, 3, 120);
        ctx.fillRect(597 - this.cameraX, 140 - this.cameraY, 3, 60);
        // "DOWNSTAIRS" sign
        ctx.fillStyle = '#FF6B35';
        ctx.fillRect(530 - this.cameraX, 210 - this.cameraY, 60, 15);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('DOWNSTAIRS', 560 - this.cameraX, 220 - this.cameraY);
        // Overhead party lighting
        ctx.fillStyle = '#FFD700';
        for(let x = 100; x < 700; x += 100){
            ctx.beginPath();
            ctx.arc(x - this.cameraX, 100 - this.cameraY, 6, 0, 2 * Math.PI);
            ctx.fill();
            // Light beams
            ctx.fillStyle = '#FFFF00';
            ctx.globalAlpha = 0.1;
            ctx.beginPath();
            ctx.moveTo(x - this.cameraX, 100 - this.cameraY);
            ctx.lineTo(x - 20 - this.cameraX, 300 - this.cameraY);
            ctx.lineTo(x + 20 - this.cameraX, 300 - this.cameraY);
            ctx.closePath();
            ctx.fill();
            ctx.globalAlpha = 1.0;
            ctx.fillStyle = '#FFD700';
        }
        // VT spirit decorations around the room
        ctx.fillStyle = '#8B0000';
        ctx.font = '20px serif';
        ctx.textAlign = 'left';
        ctx.fillText('🏈', 50 - this.cameraX, 400 - this.cameraY);
        ctx.fillText('🏈', 650 - this.cameraX, 350 - this.cameraY);
        ctx.fillStyle = '#FF8C00';
        ctx.fillText('🦃', 680 - this.cameraX, 200 - this.cameraY);
        ctx.fillText('🦃', 80 - this.cameraX, 350 - this.cameraY);
        // Floor boundary between photo area and dance floor
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(400 - this.cameraX, 150 - this.cameraY);
        ctx.lineTo(400 - this.cameraX, 450 - this.cameraY);
        ctx.stroke();
        // "Go Hokies!" text
        ctx.fillStyle = '#8B0000';
        ctx.font = 'bold 14px serif';
        ctx.textAlign = 'center';
        ctx.fillText('GO HOKIES!', 600 - this.cameraX, 450 - this.cameraY);
    }
    // Override exit position to go back downstairs
    getExitPosition() {
        return {
            x: this.exitX,
            y: this.exitY,
            scene: 'tots'
        };
    }
}
const __TURBOPACK__default__export__ = TotsUpstairs;
}),
"[project]/app/components/off-campus/HokieHouseInterior.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$off$2d$campus$2f$BaseOffCampusBuilding$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/off-campus/BaseOffCampusBuilding.ts [app-ssr] (ecmascript)");
;
class HokieHouseInterior extends __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$off$2d$campus$2f$BaseOffCampusBuilding$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"] {
    type = 'hokiehouse';
    getBuildingName() {
        return 'Hokie House - VT Sports Bar & Grill';
    }
    getBuildingType() {
        return 'commercial';
    }
    generateBuilding() {
        const interior = [];
        for(let y = 0; y < this.buildingHeight; y++){
            interior[y] = [];
            for(let x = 0; x < this.buildingWidth; x++){
                // Create the layout for Hokie House sports bar
                // Outer walls
                if (x === 0 || x === this.buildingWidth - 1 || y === 0 || y === this.buildingHeight - 1) {
                    interior[y][x] = {
                        type: 'wall',
                        solid: true
                    };
                } else if (y === this.buildingHeight - 1 && x === Math.floor(this.buildingWidth / 2)) {
                    interior[y][x] = {
                        type: 'door',
                        solid: false
                    };
                } else if (x >= 2 && x <= 4 && y >= 3 && y <= 10) {
                    interior[y][x] = {
                        type: 'furniture',
                        solid: true,
                        furniture: 'desk'
                    };
                } else if (x === 5 && y >= 3 && y <= 10 && y % 2 === 1) {
                    interior[y][x] = {
                        type: 'furniture',
                        solid: true,
                        furniture: 'chair'
                    };
                } else if (x >= 14 && x <= 17 && y >= 2 && y <= 6) {
                    interior[y][x] = {
                        type: 'furniture',
                        solid: true,
                        furniture: 'kitchen'
                    };
                } else if (x >= 12 && x <= 13 && y >= 8 && y <= 9 || x >= 12 && x <= 13 && y >= 11 && y <= 12) {
                    interior[y][x] = {
                        type: 'furniture',
                        solid: true,
                        furniture: 'couch'
                    };
                } else if (x === 14 && (y === 8 || y === 11)) {
                    interior[y][x] = {
                        type: 'furniture',
                        solid: true,
                        furniture: 'table'
                    };
                } else if (x >= 7 && x <= 8 && y >= 6 && y <= 7 || x >= 7 && x <= 8 && y >= 9 && y <= 10 || x >= 9 && x <= 10 && y >= 6 && y <= 7 || x >= 9 && x <= 10 && y >= 9 && y <= 10) {
                    interior[y][x] = {
                        type: 'furniture',
                        solid: true,
                        furniture: 'table'
                    };
                } else if (x === 6 && (y === 6 || y === 9) || x === 11 && (y === 6 || y === 9)) {
                    interior[y][x] = {
                        type: 'furniture',
                        solid: true,
                        furniture: 'chair'
                    };
                } else if (y === 0 && (x === 6 || x === 10 || x === 14)) {
                    interior[y][x] = {
                        type: 'window',
                        solid: true
                    };
                } else {
                    interior[y][x] = {
                        type: 'floor',
                        solid: false
                    };
                }
            }
        }
        return interior;
    }
    renderBuildingSpecificElements(ctx) {
        // Hokie House sports bar specific elements
        // Restaurant name and VT branding
        ctx.fillStyle = '#8B0000'; // VT Maroon
        ctx.font = 'bold 20px serif';
        ctx.textAlign = 'center';
        ctx.fillText('HOKIE HOUSE', 400 - this.cameraX, 35 - this.cameraY);
        ctx.fillStyle = '#FF8C00'; // VT Orange
        ctx.font = 'bold 14px serif';
        ctx.fillText('Sports Bar & Grill', 400 - this.cameraX, 55 - this.cameraY);
        // TV screens for sports viewing
        ctx.fillStyle = '#000000'; // Black TV frames
        ctx.fillRect(50 - this.cameraX, 100 - this.cameraY, 80, 60);
        ctx.fillRect(300 - this.cameraX, 80 - this.cameraY, 100, 75);
        ctx.fillRect(550 - this.cameraX, 100 - this.cameraY, 80, 60);
        // TV screens
        ctx.fillStyle = '#00FF00'; // Green for football field
        ctx.fillRect(55 - this.cameraX, 105 - this.cameraY, 70, 50);
        ctx.fillRect(305 - this.cameraX, 85 - this.cameraY, 90, 65);
        ctx.fillRect(555 - this.cameraX, 105 - this.cameraY, 70, 50);
        // VT on TV screens
        ctx.fillStyle = '#8B0000';
        ctx.font = 'bold 12px serif';
        ctx.textAlign = 'center';
        ctx.fillText('VT', 90 - this.cameraX, 135 - this.cameraY);
        ctx.fillText('HOKIES', 350 - this.cameraX, 125 - this.cameraY);
        ctx.fillText('VT', 590 - this.cameraX, 135 - this.cameraY);
        // Bar back with bottles
        ctx.fillStyle = '#8B4513'; // Brown bar back
        ctx.fillRect(50 - this.cameraX, 180 - this.cameraY, 80, 40);
        // Liquor bottles
        ctx.fillStyle = '#228B22'; // Green bottles
        ctx.fillRect(55 - this.cameraX, 185 - this.cameraY, 4, 15);
        ctx.fillRect(65 - this.cameraX, 185 - this.cameraY, 4, 15);
        ctx.fillRect(75 - this.cameraX, 185 - this.cameraY, 4, 15);
        ctx.fillStyle = '#8B4513'; // Brown bottles
        ctx.fillRect(85 - this.cameraX, 185 - this.cameraY, 4, 15);
        ctx.fillRect(95 - this.cameraX, 185 - this.cameraY, 4, 15);
        ctx.fillRect(105 - this.cameraX, 185 - this.cameraY, 4, 15);
        // VT memorabilia and decorations
        ctx.fillStyle = '#8B0000';
        ctx.fillRect(200 - this.cameraX, 120 - this.cameraY, 60, 40);
        ctx.fillStyle = '#FF8C00';
        ctx.fillRect(205 - this.cameraX, 125 - this.cameraY, 50, 30);
        ctx.fillStyle = '#8B0000';
        ctx.font = 'bold 16px serif';
        ctx.textAlign = 'center';
        ctx.fillText('VT', 230 - this.cameraX, 145 - this.cameraY);
        // VT pennant
        ctx.fillStyle = '#8B0000';
        ctx.beginPath();
        ctx.moveTo(500 - this.cameraX, 180 - this.cameraY);
        ctx.lineTo(580 - this.cameraX, 190 - this.cameraY);
        ctx.lineTo(500 - this.cameraX, 200 - this.cameraY);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#FF8C00';
        ctx.font = 'bold 10px serif';
        ctx.textAlign = 'left';
        ctx.fillText('HOKIES', 510 - this.cameraX, 195 - this.cameraY);
        // Menu specials board
        ctx.fillStyle = '#2F2F2F';
        ctx.fillRect(450 - this.cameraX, 250 - this.cameraY, 120, 100);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('GAME DAY SPECIALS', 510 - this.cameraX, 270 - this.cameraY);
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('• Hokie Wings ....... $12', 460 - this.cameraX, 290 - this.cameraY);
        ctx.fillText('• Turkey Legs ...... $15', 460 - this.cameraX, 305 - this.cameraY);
        ctx.fillText('• Hokie Burger ..... $14', 460 - this.cameraX, 320 - this.cameraY);
        ctx.fillText('• Maroon & Orange', 460 - this.cameraX, 335 - this.cameraY);
        ctx.fillText('  Nachos ........... $10', 460 - this.cameraX, 345 - this.cameraY);
        // Hokie Bird logo on floor
        ctx.fillStyle = '#8B0000';
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.arc(400 - this.cameraX, 350 - this.cameraY, 40, 0, 2 * Math.PI);
        ctx.fill();
        ctx.globalAlpha = 1.0;
        ctx.fillStyle = '#FF8C00';
        ctx.font = 'bold 20px serif';
        ctx.textAlign = 'center';
        ctx.fillText('🦃', 400 - this.cameraX, 360 - this.cameraY);
        // Beer taps
        ctx.fillStyle = '#C0C0C0'; // Silver taps
        ctx.fillRect(70 - this.cameraX, 160 - this.cameraY, 4, 15);
        ctx.fillRect(80 - this.cameraX, 160 - this.cameraY, 4, 15);
        ctx.fillRect(90 - this.cameraX, 160 - this.cameraY, 4, 15);
        ctx.fillRect(100 - this.cameraX, 160 - this.cameraY, 4, 15);
        // Tap handles
        ctx.fillStyle = '#8B0000';
        ctx.fillRect(68 - this.cameraX, 155 - this.cameraY, 8, 6);
        ctx.fillStyle = '#FF8C00';
        ctx.fillRect(78 - this.cameraX, 155 - this.cameraY, 8, 6);
        ctx.fillStyle = '#000000';
        ctx.fillRect(88 - this.cameraX, 155 - this.cameraY, 8, 6);
        ctx.fillRect(98 - this.cameraX, 155 - this.cameraY, 8, 6);
    }
}
const __TURBOPACK__default__export__ = HokieHouseInterior;
}),
"[project]/app/components/off-campus/CentrosInterior.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$off$2d$campus$2f$BaseOffCampusBuilding$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/off-campus/BaseOffCampusBuilding.ts [app-ssr] (ecmascript)");
;
class CentrosInterior extends __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$off$2d$campus$2f$BaseOffCampusBuilding$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"] {
    type = 'centros';
    getBuildingName() {
        return 'Centros - Dance Club';
    }
    getBuildingType() {
        return 'commercial';
    }
    generateBuilding() {
        const interior = [];
        for(let y = 0; y < this.buildingHeight; y++){
            interior[y] = [];
            for(let x = 0; x < this.buildingWidth; x++){
                // Create the layout for Centros Dance Club
                // Outer walls
                if (x === 0 || x === this.buildingWidth - 1 || y === 0 || y === this.buildingHeight - 1) {
                    interior[y][x] = {
                        type: 'wall',
                        solid: true
                    };
                } else if (y === this.buildingHeight - 1 && x === Math.floor(this.buildingWidth / 2)) {
                    interior[y][x] = {
                        type: 'door',
                        solid: false
                    };
                } else if (x >= 8 && x <= 11 && y >= 2 && y <= 4) {
                    interior[y][x] = {
                        type: 'furniture',
                        solid: true,
                        furniture: 'desk'
                    };
                } else if (x >= 2 && x <= 6 && y >= 2 && y <= 3) {
                    interior[y][x] = {
                        type: 'furniture',
                        solid: true,
                        furniture: 'desk'
                    };
                } else if (x >= 2 && x <= 6 && y === 4) {
                    interior[y][x] = {
                        type: 'furniture',
                        solid: true,
                        furniture: 'chair'
                    };
                } else if (x === 1 && y >= 11 && y <= 12) {
                    interior[y][x] = {
                        type: 'furniture',
                        solid: true,
                        furniture: 'desk'
                    };
                } else if (x === 4 && y === 10 || x === 16 && y === 10 || x === 4 && y === 7 || x === 16 && y === 7) {
                    interior[y][x] = {
                        type: 'furniture',
                        solid: true,
                        furniture: 'table'
                    };
                } else if (x >= 17 && x <= 18 && y >= 12 && y <= 13) {
                    interior[y][x] = {
                        type: 'furniture',
                        solid: true,
                        furniture: 'desk'
                    };
                } else if (y === 0 && (x === 5 || x === 9 || x === 13 || x === 17)) {
                    interior[y][x] = {
                        type: 'window',
                        solid: true
                    };
                } else {
                    interior[y][x] = {
                        type: 'floor',
                        solid: false
                    };
                }
            }
        }
        return interior;
    }
    renderBuildingSpecificElements(ctx) {
        // Centros Dance Club specific elements
        // Club name with neon styling
        ctx.fillStyle = '#FF1493'; // Deep pink neon
        ctx.font = 'bold 24px serif';
        ctx.textAlign = 'center';
        ctx.fillText('CENTROS', 400 - this.cameraX, 35 - this.cameraY);
        ctx.fillStyle = '#00FFFF'; // Cyan neon
        ctx.font = 'bold 14px serif';
        ctx.fillText('DANCE CLUB', 400 - this.cameraX, 55 - this.cameraY);
        // DJ booth with equipment
        ctx.fillStyle = '#2F2F2F'; // Dark DJ booth
        ctx.fillRect(280 - this.cameraX, 75 - this.cameraY, 130, 80);
        // DJ turntables
        ctx.fillStyle = '#C0C0C0'; // Silver turntables
        ctx.beginPath();
        ctx.arc(310 - this.cameraX, 110 - this.cameraY, 15, 0, 2 * Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(380 - this.cameraX, 110 - this.cameraY, 15, 0, 2 * Math.PI);
        ctx.fill();
        // DJ mixer
        ctx.fillStyle = '#000000';
        ctx.fillRect(330 - this.cameraX, 100 - this.cameraY, 40, 20);
        // DJ controls/sliders
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(335 - this.cameraX, 105 - this.cameraY, 2, 10);
        ctx.fillRect(345 - this.cameraX, 105 - this.cameraY, 2, 10);
        ctx.fillRect(355 - this.cameraX, 105 - this.cameraY, 2, 10);
        ctx.fillRect(365 - this.cameraX, 105 - this.cameraY, 2, 10);
        // Speakers (large ones)
        ctx.fillStyle = '#000000';
        ctx.fillRect(50 - this.cameraX, 80 - this.cameraY, 30, 60);
        ctx.fillRect(720 - this.cameraX, 80 - this.cameraY, 30, 60);
        // Speaker cones
        ctx.fillStyle = '#444444';
        ctx.beginPath();
        ctx.arc(65 - this.cameraX, 100 - this.cameraY, 12, 0, 2 * Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(65 - this.cameraX, 120 - this.cameraY, 8, 0, 2 * Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(735 - this.cameraX, 100 - this.cameraY, 12, 0, 2 * Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(735 - this.cameraX, 120 - this.cameraY, 8, 0, 2 * Math.PI);
        ctx.fill();
        // Bar area with bottles
        ctx.fillStyle = '#8B4513'; // Wood bar
        ctx.fillRect(80 - this.cameraX, 80 - this.cameraY, 150, 30);
        // Liquor bottles on bar
        ctx.fillStyle = '#228B22'; // Green bottles
        ctx.fillRect(90 - this.cameraX, 70 - this.cameraY, 4, 15);
        ctx.fillRect(100 - this.cameraX, 70 - this.cameraY, 4, 15);
        ctx.fillRect(110 - this.cameraX, 70 - this.cameraY, 4, 15);
        ctx.fillStyle = '#8B4513'; // Brown bottles
        ctx.fillRect(120 - this.cameraX, 70 - this.cameraY, 4, 15);
        ctx.fillRect(130 - this.cameraX, 70 - this.cameraY, 4, 15);
        ctx.fillStyle = '#FF6347'; // Red bottles
        ctx.fillRect(140 - this.cameraX, 70 - this.cameraY, 4, 15);
        ctx.fillRect(150 - this.cameraX, 70 - this.cameraY, 4, 15);
        // Disco ball
        ctx.fillStyle = '#C0C0C0'; // Silver disco ball
        ctx.beginPath();
        ctx.arc(400 - this.cameraX, 180 - this.cameraY, 20, 0, 2 * Math.PI);
        ctx.fill();
        // Disco ball reflection squares
        ctx.fillStyle = '#FFFFFF';
        for(let i = 0; i < 8; i++){
            const angle = i * Math.PI / 4;
            const x = 400 + Math.cos(angle) * 15 - this.cameraX;
            const y = 180 + Math.sin(angle) * 15 - this.cameraY;
            ctx.fillRect(x - 2, y - 2, 4, 4);
        }
        // Dance floor lighting effects
        const time = Date.now() * 0.003;
        const colors = [
            '#FF1493',
            '#00FFFF',
            '#FF4500',
            '#32CD32',
            '#9400D3',
            '#FFD700'
        ];
        // Animated floor spots
        for(let i = 0; i < 6; i++){
            const x = 200 + i % 3 * 150;
            const y = 250 + Math.floor(i / 3) * 100;
            const colorIndex = Math.floor(time + i) % colors.length;
            ctx.fillStyle = colors[colorIndex];
            ctx.globalAlpha = 0.3 + 0.3 * Math.sin(time * 2 + i);
            ctx.beginPath();
            ctx.arc(x - this.cameraX, y - this.cameraY, 30, 0, 2 * Math.PI);
            ctx.fill();
        }
        ctx.globalAlpha = 1.0;
        // Strobe light effects
        ctx.fillStyle = '#FFFFFF';
        ctx.globalAlpha = 0.1 + 0.1 * Math.sin(time * 10);
        ctx.fillRect(0 - this.cameraX, 0 - this.cameraY, 800, 600);
        ctx.globalAlpha = 1.0;
        // Neon wall decorations
        ctx.strokeStyle = '#FF1493';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(100 - this.cameraX, 200 - this.cameraY);
        ctx.lineTo(200 - this.cameraX, 180 - this.cameraY);
        ctx.lineTo(300 - this.cameraX, 200 - this.cameraY);
        ctx.stroke();
        ctx.strokeStyle = '#00FFFF';
        ctx.beginPath();
        ctx.moveTo(500 - this.cameraX, 200 - this.cameraY);
        ctx.lineTo(600 - this.cameraX, 180 - this.cameraY);
        ctx.lineTo(700 - this.cameraX, 200 - this.cameraY);
        ctx.stroke();
        // Dance floor boundary/stage edge
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(150 - this.cameraX, 240 - this.cameraY, 500, 4);
        // Sound equalizer visualization
        ctx.fillStyle = '#00FF00';
        for(let i = 0; i < 20; i++){
            const height = 20 + 40 * Math.sin(time * 5 + i * 0.5);
            ctx.fillRect(300 + i * 10 - this.cameraX, 140 - height - this.cameraY, 8, height);
        }
        // Entry rope/queue area
        ctx.strokeStyle = '#8B0000';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(550 - this.cameraX, 380 - this.cameraY);
        ctx.lineTo(600 - this.cameraX, 400 - this.cameraY);
        ctx.lineTo(650 - this.cameraX, 380 - this.cameraY);
        ctx.stroke();
    }
}
const __TURBOPACK__default__export__ = CentrosInterior;
}),
"[project]/app/components/SceneManager.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$World$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/World.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$campus$2f$BurrussInterior$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/campus/BurrussInterior.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$campus$2f$NewmanInterior$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/campus/NewmanInterior.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$campus$2f$TorgersenInterior$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/campus/TorgersenInterior.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$campus$2f$SquiresInterior$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/campus/SquiresInterior.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$off$2d$campus$2f$TotsInterior$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/off-campus/TotsInterior.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$off$2d$campus$2f$TotsUpstairs$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/off-campus/TotsUpstairs.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$off$2d$campus$2f$HokieHouseInterior$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/off-campus/HokieHouseInterior.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$off$2d$campus$2f$CentrosInterior$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/off-campus/CentrosInterior.ts [app-ssr] (ecmascript)");
;
;
;
;
;
;
;
;
;
class SceneManager {
    currentScene;
    scenes = new Map();
    player;
    inputHandler;
    constructor(player, inputHandler){
        this.player = player;
        this.inputHandler = inputHandler;
        this.initializeScenes();
        this.currentScene = this.scenes.get('campus');
    }
    initializeScenes() {
        // Campus (outdoor world)
        this.scenes.set('campus', new __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$World$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]());
        // Campus building interiors
        this.scenes.set('burruss', new __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$campus$2f$BurrussInterior$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]());
        this.scenes.set('newman', new __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$campus$2f$NewmanInterior$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]());
        this.scenes.set('torgersen', new __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$campus$2f$TorgersenInterior$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]());
        this.scenes.set('squires', new __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$campus$2f$SquiresInterior$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]());
        // Off-campus restaurant interiors
        this.scenes.set('tots', new __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$off$2d$campus$2f$TotsInterior$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]());
        this.scenes.set('tots_upstairs', new __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$off$2d$campus$2f$TotsUpstairs$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]());
        this.scenes.set('hokiehouse', new __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$off$2d$campus$2f$HokieHouseInterior$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]());
        this.scenes.set('centros', new __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$off$2d$campus$2f$CentrosInterior$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]());
    }
    getCurrentScene() {
        return this.currentScene;
    }
    getCurrentSceneType() {
        return this.currentScene.type;
    }
    switchScene(newSceneType, entranceX, entranceY) {
        const newScene = this.scenes.get(newSceneType);
        if (!newScene) {
            console.warn(`Scene ${newSceneType} not found`);
            return;
        }
        const oldSceneType = this.currentScene.type;
        this.currentScene = newScene;
        // Position player at entrance or default position
        if (entranceX !== undefined && entranceY !== undefined) {
            this.player.x = entranceX;
            this.player.y = entranceY;
            console.log(`Switched from ${oldSceneType} to ${newSceneType} scene with position (${entranceX}, ${entranceY})`);
        } else if (newScene.getEntrancePosition) {
            const entrance = newScene.getEntrancePosition();
            this.player.x = entrance.x;
            this.player.y = entrance.y;
            console.log(`Switched from ${oldSceneType} to ${newSceneType} scene with entrance position (${entrance.x}, ${entrance.y})`);
        } else {
            console.log(`Switched from ${oldSceneType} to ${newSceneType} scene - no position change`);
        }
    }
    checkForSceneTransition() {
        // Check for ESC key to exit buildings
        const escPressed = this.inputHandler.wasKeyJustPressed('Escape');
        if (escPressed) {
            const currentSceneType = this.currentScene.type;
            console.log('ESC pressed! Current scene:', currentSceneType);
            if (currentSceneType !== 'campus') {
                console.log('Exiting building to campus');
                this.exitToOutside();
                return;
            } else {
                console.log('Already on campus - ESC has no effect');
            }
        }
        // Check if player is near a door on campus
        if (this.currentScene.type === 'campus') {
            this.checkBuildingEntrance();
        } else {
            // Check if player is near exit in building
            this.checkBuildingExit();
            // Check for stair transitions in buildings
            this.checkStairTransition();
        }
    }
    checkBuildingEntrance() {
        const world = this.currentScene;
        const playerTileX = Math.floor(this.player.x / 32);
        const playerTileY = Math.floor(this.player.y / 32);
        // Only check the exact tile the player is standing on for doors
        const tile = world.getTileAt && world.getTileAt(playerTileX, playerTileY);
        if (tile && tile.type === 'door') {
            const buildingType = tile.buildingType;
            console.log('🚪 Found door! Building type:', buildingType, 'at tile:', {
                playerTileX,
                playerTileY
            });
            if (buildingType && this.scenes.has(buildingType)) {
                console.log('✅ Entering building:', buildingType);
                this.switchScene(buildingType);
                return;
            } else {
                console.log('❌ Building type not recognized:', buildingType, 'Available scenes:', Array.from(this.scenes.keys()));
            }
        }
    }
    checkStairTransition() {
        // Check if player is on stairs in any building
        const currentScene = this.currentScene;
        if (currentScene.tiles) {
            const playerTileX = Math.floor(this.player.x / 32);
            const playerTileY = Math.floor(this.player.y / 32);
            // Check bounds
            if (playerTileX >= 0 && playerTileX < (currentScene.buildingWidth || currentScene.areaWidth) && playerTileY >= 0 && playerTileY < (currentScene.buildingHeight || currentScene.areaHeight)) {
                const tile = currentScene.tiles[playerTileY] && currentScene.tiles[playerTileY][playerTileX];
                if (tile && tile.type === 'stairs') {
                    console.log('🪜 Found stairs! Current scene:', this.currentScene.type);
                    // Handle specific stair transitions
                    if (this.currentScene.type === 'tots') {
                        console.log('✅ Going upstairs to tots_upstairs');
                        this.switchScene('tots_upstairs');
                    } else if (this.currentScene.type === 'tots_upstairs') {
                        console.log('✅ Going downstairs to tots');
                        this.switchScene('tots');
                    }
                }
            }
        }
    }
    checkBuildingExit() {
        const exitInfo = this.currentScene.getExitPosition?.();
        if (exitInfo) {
            const distance = Math.sqrt(Math.pow(this.player.x - exitInfo.x, 2) + Math.pow(this.player.y - exitInfo.y, 2));
            // If player is close to exit
            if (distance < 30) {
                // Switch back to campus and position player outside the building
                this.switchScene(exitInfo.scene, exitInfo.x, exitInfo.y);
            }
        }
    }
    exitToOutside() {
        // Exit building and return to campus
        // Position player at a default campus location
        this.switchScene('campus', 400, 912); // Campus center
        console.log('Exited building with ESC key');
    }
    render(ctx) {
        this.currentScene.render(ctx, this.player);
    }
    update(deltaTime) {
        this.currentScene.update(deltaTime);
        this.checkForSceneTransition();
    }
    canMoveTo(x, y, width, height) {
        return this.currentScene.canMoveTo(x, y, width, height);
    }
    getCameraPosition() {
        return {
            x: this.currentScene.cameraX || 0,
            y: this.currentScene.cameraY || 0
        };
    }
}
const __TURBOPACK__default__export__ = SceneManager;
}),
"[project]/app/components/GameEngine.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$Player$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/Player.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$InputHandler$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/InputHandler.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$SceneManager$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/SceneManager.ts [app-ssr] (ecmascript)");
;
;
;
class GameEngine {
    canvas;
    ctx;
    player;
    sceneManager;
    inputHandler;
    lastTime = 0;
    animationFrameId = null;
    isRunning = false;
    constructor(canvas, ctx){
        this.canvas = canvas;
        this.ctx = ctx;
        // Initialize game objects
        this.player = new __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$Player$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](400, 912); // Starting position in campus area (608 + 304)
        this.inputHandler = new __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$InputHandler$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]();
        this.sceneManager = new __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$SceneManager$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](this.player, this.inputHandler);
        // Bind the game loop
        this.gameLoop = this.gameLoop.bind(this);
    }
    start() {
        this.isRunning = true;
        this.lastTime = performance.now();
        this.gameLoop(this.lastTime);
    }
    stop() {
        this.isRunning = false;
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
        // Clean up input handler
        this.inputHandler.destroy();
    }
    gameLoop(currentTime) {
        if (!this.isRunning) return;
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        // Update
        this.update(deltaTime);
        // Render
        this.render();
        // Continue loop
        this.animationFrameId = requestAnimationFrame(this.gameLoop);
    }
    update(deltaTime) {
        // Check scene transitions BEFORE clearing input state
        this.sceneManager.update(deltaTime);
        // Update input (this clears keyPressed state)
        this.inputHandler.update();
        // Update player
        this.player.update(deltaTime, this.inputHandler, this.sceneManager.getCurrentScene());
    }
    render() {
        // Clear canvas
        this.ctx.fillStyle = '#2a4d3a'; // Dark green background
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        // Render current scene
        this.sceneManager.render(this.ctx);
        // Render player
        const cameraPos = this.sceneManager.getCameraPosition();
        this.player.render(this.ctx, cameraPos.x, cameraPos.y);
        // Render UI
        this.renderUI();
    }
    renderUI() {
        // Render simple UI elements
        this.ctx.fillStyle = 'white';
        this.ctx.font = '12px monospace';
        this.ctx.fillText(`Position: (${Math.floor(this.player.x)}, ${Math.floor(this.player.y)})`, 10, 20);
        const cameraPos = this.sceneManager.getCameraPosition();
        this.ctx.fillText(`Camera: (${Math.floor(cameraPos.x)}, ${Math.floor(cameraPos.y)})`, 10, 40);
        this.ctx.fillText(`Scene: ${this.sceneManager.getCurrentSceneType()}`, 10, 60);
        // Show entrance instructions when near door
        if (this.sceneManager.getCurrentSceneType() === 'campus') {
            this.ctx.fillStyle = '#FF8C00';
            this.ctx.font = '10px monospace';
            this.ctx.fillText('Stand directly on building doors to enter!', 10, 580);
        } else {
            this.ctx.fillStyle = '#32CD32';
            this.ctx.font = '10px monospace';
            this.ctx.fillText('Walk to green EXIT area to leave building', 10, 580);
        }
    }
}
const __TURBOPACK__default__export__ = GameEngine;
}),
"[project]/app/components/Game.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@15.5.4_react-dom@19.1.0_react@19.1.0__react@19.1.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@15.5.4_react-dom@19.1.0_react@19.1.0__react@19.1.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$GameEngine$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/GameEngine.ts [app-ssr] (ecmascript)");
'use client';
;
;
;
const Game = ()=>{
    const canvasRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const gameEngineRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [isLoaded, setIsLoaded] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (canvasRef.current && !gameEngineRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                // Set canvas size
                canvas.width = 800;
                canvas.height = 600;
                // Enable pixel-perfect rendering
                ctx.imageSmoothingEnabled = false;
                // Initialize game engine
                gameEngineRef.current = new __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$GameEngine$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](canvas, ctx);
                gameEngineRef.current.start();
                setIsLoaded(true);
                // Focus canvas for keyboard input
                canvas.focus();
            }
        }
        return ()=>{
            if (gameEngineRef.current) {
                gameEngineRef.current.stop();
            }
        };
    }, []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "relative game-ui",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("canvas", {
                ref: canvasRef,
                className: "pixel-border pixelated",
                tabIndex: 0,
                style: {
                    imageRendering: 'pixelated',
                    outline: 'none'
                },
                onFocus: ()=>console.log('Canvas focused - keyboard controls active')
            }, void 0, false, {
                fileName: "[project]/app/components/Game.tsx",
                lineNumber: 43,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            !isLoaded && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute inset-0 flex items-center justify-center loading-screen text-white",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "text-center",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "text-xl mb-2",
                            children: "LOADING..."
                        }, void 0, false, {
                            fileName: "[project]/app/components/Game.tsx",
                            lineNumber: 56,
                            columnNumber: 13
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "text-sm",
                            children: "Initializing pixel world..."
                        }, void 0, false, {
                            fileName: "[project]/app/components/Game.tsx",
                            lineNumber: 57,
                            columnNumber: 13
                        }, ("TURBOPACK compile-time value", void 0))
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/components/Game.tsx",
                    lineNumber: 55,
                    columnNumber: 11
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/app/components/Game.tsx",
                lineNumber: 54,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-4 text-white text-center game-ui",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "bg-black bg-opacity-80 p-4 rounded border border-white inline-block",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-sm mb-1",
                            children: "🎮 VIRGINIA TECH CAMPUS"
                        }, void 0, false, {
                            fileName: "[project]/app/components/Game.tsx",
                            lineNumber: 63,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-xs",
                            children: "WASD or Arrow Keys to move around campus"
                        }, void 0, false, {
                            fileName: "[project]/app/components/Game.tsx",
                            lineNumber: 64,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-xs",
                            children: "Explore Burruss Hall, Newman Library & more!"
                        }, void 0, false, {
                            fileName: "[project]/app/components/Game.tsx",
                            lineNumber: 65,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-xs mt-2",
                            children: "Click canvas first, then use keyboard"
                        }, void 0, false, {
                            fileName: "[project]/app/components/Game.tsx",
                            lineNumber: 66,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0))
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/components/Game.tsx",
                    lineNumber: 62,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/app/components/Game.tsx",
                lineNumber: 61,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/app/components/Game.tsx",
        lineNumber: 42,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
const __TURBOPACK__default__export__ = Game;
}),
"[project]/app/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Home
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@15.5.4_react-dom@19.1.0_react@19.1.0__react@19.1.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$Game$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/Game.tsx [app-ssr] (ecmascript)");
'use client';
;
;
function Home() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex items-center justify-center min-h-screen bg-black",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$Game$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
            fileName: "[project]/app/page.tsx",
            lineNumber: 8,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/app/page.tsx",
        lineNumber: 7,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__dcc7e05d._.js.map