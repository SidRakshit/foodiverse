(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/app/components/Player.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$swc$2b$helpers$40$0$2e$5$2e$15$2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@swc+helpers@0.5.15/node_modules/@swc/helpers/esm/_define_property.js [app-client] (ecmascript)");
;
class Player {
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
    render(ctx) {
        let cameraX = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0, cameraY = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : 0;
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
    constructor(x, y){
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$swc$2b$helpers$40$0$2e$5$2e$15$2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "x", void 0);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$swc$2b$helpers$40$0$2e$5$2e$15$2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "y", void 0);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$swc$2b$helpers$40$0$2e$5$2e$15$2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "width", 16);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$swc$2b$helpers$40$0$2e$5$2e$15$2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "height", 16);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$swc$2b$helpers$40$0$2e$5$2e$15$2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "speed", 120); // pixels per second
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$swc$2b$helpers$40$0$2e$5$2e$15$2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "direction", 'down');
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$swc$2b$helpers$40$0$2e$5$2e$15$2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "animationFrame", 0);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$swc$2b$helpers$40$0$2e$5$2e$15$2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "animationTimer", 0);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$swc$2b$helpers$40$0$2e$5$2e$15$2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "animationSpeed", 200); // ms per frame
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$swc$2b$helpers$40$0$2e$5$2e$15$2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "isMoving", false);
        this.x = x;
        this.y = y;
    }
}
const __TURBOPACK__default__export__ = Player;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/components/InputHandler.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$swc$2b$helpers$40$0$2e$5$2e$15$2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@swc+helpers@0.5.15/node_modules/@swc/helpers/esm/_define_property.js [app-client] (ecmascript)");
;
class InputHandler {
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
        if ("TURBOPACK compile-time truthy", 1) {
            window.removeEventListener('keydown', this.handleKeyDown);
            window.removeEventListener('keyup', this.handleKeyUp);
        }
        this.keys.clear();
        this.keyPressed.clear();
        this.keyReleased.clear();
    }
    constructor(){
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$swc$2b$helpers$40$0$2e$5$2e$15$2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "keys", new Set());
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$swc$2b$helpers$40$0$2e$5$2e$15$2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "keyPressed", new Set());
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$swc$2b$helpers$40$0$2e$5$2e$15$2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "keyReleased", new Set());
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
        // Add event listeners
        if ("TURBOPACK compile-time truthy", 1) {
            window.addEventListener('keydown', this.handleKeyDown);
            window.addEventListener('keyup', this.handleKeyUp);
        }
    }
}
const __TURBOPACK__default__export__ = InputHandler;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/components/BaseArea.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$swc$2b$helpers$40$0$2e$5$2e$15$2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@swc+helpers@0.5.15/node_modules/@swc/helpers/esm/_define_property.js [app-client] (ecmascript)");
;
class BaseArea {
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
    constructor(){
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$swc$2b$helpers$40$0$2e$5$2e$15$2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "tileSize", 32);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$swc$2b$helpers$40$0$2e$5$2e$15$2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "areaWidth", 25); // tiles
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$swc$2b$helpers$40$0$2e$5$2e$15$2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "areaHeight", 19); // tiles
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$swc$2b$helpers$40$0$2e$5$2e$15$2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "tiles", void 0);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$swc$2b$helpers$40$0$2e$5$2e$15$2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "cameraX", 0);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$swc$2b$helpers$40$0$2e$5$2e$15$2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "cameraY", 0);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$swc$2b$helpers$40$0$2e$5$2e$15$2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "exitX", 400); // Default exit position
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$swc$2b$helpers$40$0$2e$5$2e$15$2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "exitY", 450);
        this.tiles = this.generateArea();
    }
}
const __TURBOPACK__default__export__ = BaseArea;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/components/campus/CampusArea.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$swc$2b$helpers$40$0$2e$5$2e$15$2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@swc+helpers@0.5.15/node_modules/@swc/helpers/esm/_define_property.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$BaseArea$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/BaseArea.ts [app-client] (ecmascript)");
;
;
class CampusArea extends __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$BaseArea$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"] {
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
        // Torgersen Hall (Engineering)
        this.createBuilding(world, 16, 2, 6, 4, 'torgersen');
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
                baseColor = '#B8A082';
                accentColor = '#4A4A4A';
                break;
            default:
                baseColor = '#C4A484';
                accentColor = '#8B0000';
        }
        // Main building structure
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
    constructor(...args){
        super(...args), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$swc$2b$helpers$40$0$2e$5$2e$15$2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "type", 'campus');
    }
}
const __TURBOPACK__default__export__ = CampusArea;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/components/off-campus/OffCampusArea.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$swc$2b$helpers$40$0$2e$5$2e$15$2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@swc+helpers@0.5.15/node_modules/@swc/helpers/esm/_define_property.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$BaseArea$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/BaseArea.ts [app-client] (ecmascript)");
;
;
class OffCampusArea extends __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$BaseArea$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"] {
    getAreaName() {
        return 'Downtown Blacksburg';
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
        // Create off-campus layout - this represents the TOP HALF of the world
        this.generateDowntownArea(area);
        this.generateResidentialArea(area);
        this.generateCommercialStrip(area);
        return area;
    }
    generateDowntownArea(world) {
        // Main Street (horizontal road through downtown)
        for(let x = 0; x < this.areaWidth; x++){
            world[9][x] = {
                type: 'road',
                solid: false
            };
            // Sidewalks on both sides
            if (world[8]) world[8][x] = {
                type: 'sidewalk',
                solid: false
            };
            if (world[10]) world[10][x] = {
                type: 'sidewalk',
                solid: false
            };
        }
        // Downtown buildings along Main Street
        this.createCommercialBuilding(world, 2, 6, 3, 2, 'restaurant'); // Restaurant
        this.createCommercialBuilding(world, 6, 6, 2, 2, 'shop'); // Shop
        this.createCommercialBuilding(world, 9, 6, 3, 2, 'bank'); // Bank
        this.createCommercialBuilding(world, 13, 6, 2, 2, 'shop'); // Another shop
        this.createCommercialBuilding(world, 16, 6, 4, 2, 'hotel'); // Hotel
        // Buildings on south side of Main Street
        this.createCommercialBuilding(world, 3, 11, 2, 2, 'gas_station'); // Gas station
        this.createCommercialBuilding(world, 7, 11, 3, 2, 'restaurant'); // Another restaurant
        this.createCommercialBuilding(world, 12, 11, 4, 2, 'shop'); // Large shop
        this.createCommercialBuilding(world, 17, 11, 3, 2, 'restaurant'); // Restaurant
    }
    generateResidentialArea(world) {
        // Residential street
        for(let x = 5; x < 20; x++){
            world[4][x] = {
                type: 'road',
                solid: false
            };
            world[3][x] = {
                type: 'sidewalk',
                solid: false
            };
            world[5][x] = {
                type: 'sidewalk',
                solid: false
            };
        }
        // Student apartment complexes
        this.createApartmentBuilding(world, 1, 1, 3, 2); // Apartment complex 1
        this.createApartmentBuilding(world, 5, 1, 4, 2); // Apartment complex 2
        this.createApartmentBuilding(world, 11, 1, 3, 2); // Apartment complex 3
        this.createApartmentBuilding(world, 16, 1, 4, 2); // Apartment complex 4
        this.createApartmentBuilding(world, 21, 1, 3, 2); // Apartment complex 5
    }
    generateCommercialStrip(world) {
        // Add parking lots
        this.createParkingArea(world, 1, 14, 5, 3);
        this.createParkingArea(world, 15, 14, 6, 3);
        // Add some trees and landscaping
        this.addTrees(world, 8, 16, 3);
        this.addTrees(world, 18, 2, 2);
    }
    createCommercialBuilding(world, x, y, width, height, buildingType) {
        for(let by = y; by < y + height; by++){
            for(let bx = x; bx < x + width; bx++){
                if (bx < this.areaWidth && by < this.areaHeight) {
                    // Create doors on the front of buildings (facing the street)
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
    createApartmentBuilding(world, x, y, width, height) {
        for(let by = y; by < y + height; by++){
            for(let bx = x; bx < x + width; bx++){
                if (bx < this.areaWidth && by < this.areaHeight) {
                    if (by === y + height - 1 && bx === x + Math.floor(width / 2)) {
                        world[by][bx] = {
                            type: 'door',
                            solid: false,
                            buildingType: 'apartment'
                        };
                    } else {
                        world[by][bx] = {
                            type: 'building',
                            solid: true,
                            buildingType: 'apartment'
                        };
                    }
                }
            }
        }
    }
    createParkingArea(world, x, y, width, height) {
        for(let py = y; py < y + height; py++){
            for(let px = x; px < x + width; px++){
                if (px < this.areaWidth && py < this.areaHeight) {
                    world[py][px] = {
                        type: 'parking',
                        solid: false
                    };
                }
            }
        }
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
    renderBackground(ctx) {
        // Off-campus urban background
        ctx.fillStyle = '#4a5c6a'; // Urban bluish-gray background
        ctx.fillRect(0, 0, 800, 600);
    }
    renderAreaSpecificElements(ctx) {
        // Off-campus specific UI elements
        ctx.fillStyle = '#2F4F4F';
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('🏙️ DOWNTOWN BLACKSBURG', 10 - this.cameraX, 30 - this.cameraY);
        // Add downtown elements
        ctx.fillStyle = '#FF6B6B';
        ctx.font = '12px sans-serif';
        ctx.fillText('Shops • Restaurants • Apartments', 10 - this.cameraX, 50 - this.cameraY);
    }
    // Override tile rendering for off-campus styling
    renderBuildingTile(ctx, tile, x, y) {
        const buildingType = tile.buildingType;
        // Different styles for different building types
        let baseColor = '#8B7355'; // Default brown
        let accentColor = '#654321';
        switch(buildingType){
            case 'apartment':
                baseColor = '#A0522D'; // Brick color for apartments
                accentColor = '#8B4513';
                break;
            case 'restaurant':
                baseColor = '#CD853F'; // Warm color for restaurants
                accentColor = '#FF6B6B';
                break;
            case 'shop':
                baseColor = '#D2B48C'; // Light color for shops
                accentColor = '#4ECDC4';
                break;
            case 'bank':
                baseColor = '#778899'; // Professional gray for bank
                accentColor = '#2F4F4F';
                break;
            case 'gas_station':
                baseColor = '#FFFF00'; // Bright for gas station
                accentColor = '#FF0000';
                break;
            case 'hotel':
                baseColor = '#DDA0DD'; // Purple for hotel
                accentColor = '#8B008B';
                break;
            default:
                baseColor = '#8B7355';
                accentColor = '#654321';
        }
        // Main building structure
        ctx.fillStyle = baseColor;
        ctx.fillRect(x, y, this.tileSize, this.tileSize);
        // Building details
        ctx.fillStyle = accentColor;
        ctx.fillRect(x + 1, y + 1, this.tileSize - 2, 3); // Top accent
        // Windows
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(x + 4, y + 6, 6, 8);
        ctx.fillRect(x + 12, y + 6, 6, 8);
    }
    renderRoadTile(ctx, x, y) {
        // Urban road with better markings
        ctx.fillStyle = '#2F2F2F';
        ctx.fillRect(x, y, this.tileSize, this.tileSize);
        // Road markings
        ctx.fillStyle = '#FFFF00';
        ctx.fillRect(x, y + 14, this.tileSize, 2);
        // Road texture
        ctx.fillStyle = '#3F3F3F';
        for(let i = 0; i < 3; i++){
            const px = x + Math.floor(Math.random() * this.tileSize);
            const py = y + Math.floor(Math.random() * this.tileSize);
            ctx.fillRect(px, py, 1, 1);
        }
    }
    constructor(...args){
        super(...args), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$swc$2b$helpers$40$0$2e$5$2e$15$2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "type", 'campus') // Still part of the main campus scene but different area
        ;
    }
}
const __TURBOPACK__default__export__ = OffCampusArea;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/components/World.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$swc$2b$helpers$40$0$2e$5$2e$15$2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@swc+helpers@0.5.15/node_modules/@swc/helpers/esm/_define_property.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$campus$2f$CampusArea$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/campus/CampusArea.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$off$2d$campus$2f$OffCampusArea$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/off-campus/OffCampusArea.ts [app-client] (ecmascript)");
;
;
;
class World {
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
    constructor(){
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$swc$2b$helpers$40$0$2e$5$2e$15$2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "type", 'campus');
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$swc$2b$helpers$40$0$2e$5$2e$15$2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "tileSize", 32);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$swc$2b$helpers$40$0$2e$5$2e$15$2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "areaWidth", 25); // tiles (800px)
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$swc$2b$helpers$40$0$2e$5$2e$15$2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "areaHeight", 19); // tiles (608px)
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$swc$2b$helpers$40$0$2e$5$2e$15$2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "totalWorldHeight", 38); // 2 areas stacked (1216px total)
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$swc$2b$helpers$40$0$2e$5$2e$15$2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "campusArea", void 0);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$swc$2b$helpers$40$0$2e$5$2e$15$2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "offCampusArea", void 0);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$swc$2b$helpers$40$0$2e$5$2e$15$2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "cameraX", 0);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$swc$2b$helpers$40$0$2e$5$2e$15$2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "cameraY", 0);
        this.campusArea = new __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$campus$2f$CampusArea$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]();
        this.offCampusArea = new __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$off$2d$campus$2f$OffCampusArea$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]();
    }
}
const __TURBOPACK__default__export__ = World;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/components/campus/BaseBuildingInterior.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$swc$2b$helpers$40$0$2e$5$2e$15$2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@swc+helpers@0.5.15/node_modules/@swc/helpers/esm/_define_property.js [app-client] (ecmascript)");
;
class BaseBuildingInterior {
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
    constructor(){
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$swc$2b$helpers$40$0$2e$5$2e$15$2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "tileSize", 32);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$swc$2b$helpers$40$0$2e$5$2e$15$2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "roomWidth", 20); // tiles
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$swc$2b$helpers$40$0$2e$5$2e$15$2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "roomHeight", 15); // tiles
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$swc$2b$helpers$40$0$2e$5$2e$15$2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "tiles", void 0);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$swc$2b$helpers$40$0$2e$5$2e$15$2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "cameraX", 0);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$swc$2b$helpers$40$0$2e$5$2e$15$2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "cameraY", 0);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$swc$2b$helpers$40$0$2e$5$2e$15$2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "exitX", 320); // Default exit position
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$swc$2b$helpers$40$0$2e$5$2e$15$2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "exitY", 450);
        this.tiles = this.generateInterior();
    }
}
const __TURBOPACK__default__export__ = BaseBuildingInterior;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/components/campus/BurrussInterior.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$swc$2b$helpers$40$0$2e$5$2e$15$2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@swc+helpers@0.5.15/node_modules/@swc/helpers/esm/_define_property.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$campus$2f$BaseBuildingInterior$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/campus/BaseBuildingInterior.ts [app-client] (ecmascript)");
;
;
class BurrussInterior extends __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$campus$2f$BaseBuildingInterior$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"] {
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
    constructor(...args){
        super(...args), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$swc$2b$helpers$40$0$2e$5$2e$15$2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "type", 'burruss');
    }
}
const __TURBOPACK__default__export__ = BurrussInterior;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/components/campus/NewmanInterior.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$swc$2b$helpers$40$0$2e$5$2e$15$2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@swc+helpers@0.5.15/node_modules/@swc/helpers/esm/_define_property.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$campus$2f$BaseBuildingInterior$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/campus/BaseBuildingInterior.ts [app-client] (ecmascript)");
;
;
class NewmanInterior extends __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$campus$2f$BaseBuildingInterior$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"] {
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
    constructor(...args){
        super(...args), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$swc$2b$helpers$40$0$2e$5$2e$15$2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "type", 'newman');
    }
}
const __TURBOPACK__default__export__ = NewmanInterior;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/components/campus/TorgersenInterior.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$swc$2b$helpers$40$0$2e$5$2e$15$2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@swc+helpers@0.5.15/node_modules/@swc/helpers/esm/_define_property.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$campus$2f$BaseBuildingInterior$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/campus/BaseBuildingInterior.ts [app-client] (ecmascript)");
;
;
class TorgersenInterior extends __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$campus$2f$BaseBuildingInterior$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"] {
    getBuildingName() {
        return 'Torgersen Hall - Engineering';
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
        // Torgersen Hall Engineering specific elements
        // Engineering lab equipment
        ctx.fillStyle = '#4A4A4A'; // Gray metal
        ctx.fillRect(400 - this.cameraX, 250 - this.cameraY, 80, 40);
        ctx.fillRect(500 - this.cameraX, 250 - this.cameraY, 80, 40);
        // Oscilloscope screens
        ctx.fillStyle = '#00FF00'; // Green screen
        ctx.fillRect(410 - this.cameraX, 260 - this.cameraY, 25, 20);
        ctx.fillRect(510 - this.cameraX, 260 - this.cameraY, 25, 20);
        // Building name and department
        ctx.fillStyle = '#4A4A4A';
        ctx.font = 'bold 16px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('TORGERSEN HALL', 400 - this.cameraX, 30 - this.cameraY);
        ctx.fillStyle = '#FF8C00';
        ctx.font = 'bold 12px monospace';
        ctx.fillText('COLLEGE OF ENGINEERING', 400 - this.cameraX, 50 - this.cameraY);
        // Lab signs
        ctx.fillStyle = '#4A4A4A';
        ctx.font = '12px monospace';
        ctx.textAlign = 'left';
        ctx.fillText('Computer Lab', 80 - this.cameraX, 100 - this.cameraY);
        ctx.fillText('Electronics Lab', 400 - this.cameraX, 200 - this.cameraY);
        ctx.fillText('Design Studio', 400 - this.cameraX, 300 - this.cameraY);
        // Circuit diagrams on walls (decorative)
        ctx.strokeStyle = '#4A4A4A';
        ctx.lineWidth = 2;
        ctx.beginPath();
        // Simple circuit diagram
        ctx.moveTo(50 - this.cameraX, 150 - this.cameraY);
        ctx.lineTo(150 - this.cameraX, 150 - this.cameraY);
        ctx.moveTo(100 - this.cameraX, 130 - this.cameraY);
        ctx.lineTo(100 - this.cameraX, 170 - this.cameraY);
        ctx.stroke();
        // Resistor symbol
        ctx.beginPath();
        ctx.rect(90 - this.cameraX, 145 - this.cameraY, 20, 10);
        ctx.stroke();
        // VT Engineering logo area
        ctx.fillStyle = '#8B0000';
        ctx.fillRect(350 - this.cameraX, 80 - this.cameraY, 100, 40);
        ctx.fillStyle = '#FF8C00';
        ctx.font = 'bold 14px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('VT', 380 - this.cameraX, 95 - this.cameraY);
        ctx.fillText('ENGINEERING', 400 - this.cameraX, 110 - this.cameraY);
        // Floor cable management (engineering building detail)
        ctx.fillStyle = '#2F2F2F';
        ctx.fillRect(0 - this.cameraX, 200 - this.cameraY, 800, 4);
        ctx.fillRect(0 - this.cameraX, 300 - this.cameraY, 800, 4);
    }
    constructor(...args){
        super(...args), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$swc$2b$helpers$40$0$2e$5$2e$15$2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "type", 'torgersen');
    }
}
const __TURBOPACK__default__export__ = TorgersenInterior;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/components/campus/SquiresInterior.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$swc$2b$helpers$40$0$2e$5$2e$15$2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@swc+helpers@0.5.15/node_modules/@swc/helpers/esm/_define_property.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$campus$2f$BaseBuildingInterior$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/campus/BaseBuildingInterior.ts [app-client] (ecmascript)");
;
;
class SquiresInterior extends __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$campus$2f$BaseBuildingInterior$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"] {
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
    constructor(...args){
        super(...args), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$swc$2b$helpers$40$0$2e$5$2e$15$2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "type", 'squires');
    }
}
const __TURBOPACK__default__export__ = SquiresInterior;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/components/SceneManager.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$swc$2b$helpers$40$0$2e$5$2e$15$2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@swc+helpers@0.5.15/node_modules/@swc/helpers/esm/_define_property.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$World$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/World.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$campus$2f$BurrussInterior$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/campus/BurrussInterior.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$campus$2f$NewmanInterior$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/campus/NewmanInterior.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$campus$2f$TorgersenInterior$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/campus/TorgersenInterior.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$campus$2f$SquiresInterior$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/campus/SquiresInterior.ts [app-client] (ecmascript)");
;
;
;
;
;
;
class SceneManager {
    initializeScenes() {
        // Campus (outdoor world)
        this.scenes.set('campus', new __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$World$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]());
        // Building interiors
        this.scenes.set('burruss', new __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$campus$2f$BurrussInterior$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]());
        this.scenes.set('newman', new __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$campus$2f$NewmanInterior$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]());
        this.scenes.set('torgersen', new __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$campus$2f$TorgersenInterior$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]());
        this.scenes.set('squires', new __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$campus$2f$SquiresInterior$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]());
    // Add more building interiors as needed
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
            console.warn("Scene ".concat(newSceneType, " not found"));
            return;
        }
        const oldSceneType = this.currentScene.type;
        this.currentScene = newScene;
        // Position player at entrance or default position
        if (entranceX !== undefined && entranceY !== undefined) {
            this.player.x = entranceX;
            this.player.y = entranceY;
            console.log("Switched from ".concat(oldSceneType, " to ").concat(newSceneType, " scene with position (").concat(entranceX, ", ").concat(entranceY, ")"));
        } else if (newScene.getEntrancePosition) {
            const entrance = newScene.getEntrancePosition();
            this.player.x = entrance.x;
            this.player.y = entrance.y;
            console.log("Switched from ".concat(oldSceneType, " to ").concat(newSceneType, " scene with entrance position (").concat(entrance.x, ", ").concat(entrance.y, ")"));
        } else {
            console.log("Switched from ".concat(oldSceneType, " to ").concat(newSceneType, " scene - no position change"));
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
    checkBuildingExit() {
        var _this_currentScene_getExitPosition, _this_currentScene;
        const exitInfo = (_this_currentScene_getExitPosition = (_this_currentScene = this.currentScene).getExitPosition) === null || _this_currentScene_getExitPosition === void 0 ? void 0 : _this_currentScene_getExitPosition.call(_this_currentScene);
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
    constructor(player, inputHandler){
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$swc$2b$helpers$40$0$2e$5$2e$15$2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "currentScene", void 0);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$swc$2b$helpers$40$0$2e$5$2e$15$2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "scenes", new Map());
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$swc$2b$helpers$40$0$2e$5$2e$15$2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "player", void 0);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$swc$2b$helpers$40$0$2e$5$2e$15$2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "inputHandler", void 0);
        this.player = player;
        this.inputHandler = inputHandler;
        this.initializeScenes();
        this.currentScene = this.scenes.get('campus');
    }
}
const __TURBOPACK__default__export__ = SceneManager;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/components/GameEngine.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$swc$2b$helpers$40$0$2e$5$2e$15$2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@swc+helpers@0.5.15/node_modules/@swc/helpers/esm/_define_property.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$Player$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/Player.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$InputHandler$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/InputHandler.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$SceneManager$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/SceneManager.ts [app-client] (ecmascript)");
;
;
;
;
class GameEngine {
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
        this.ctx.fillText("Position: (".concat(Math.floor(this.player.x), ", ").concat(Math.floor(this.player.y), ")"), 10, 20);
        const cameraPos = this.sceneManager.getCameraPosition();
        this.ctx.fillText("Camera: (".concat(Math.floor(cameraPos.x), ", ").concat(Math.floor(cameraPos.y), ")"), 10, 40);
        this.ctx.fillText("Scene: ".concat(this.sceneManager.getCurrentSceneType()), 10, 60);
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
    constructor(canvas, ctx){
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$swc$2b$helpers$40$0$2e$5$2e$15$2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "canvas", void 0);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$swc$2b$helpers$40$0$2e$5$2e$15$2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "ctx", void 0);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$swc$2b$helpers$40$0$2e$5$2e$15$2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "player", void 0);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$swc$2b$helpers$40$0$2e$5$2e$15$2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "sceneManager", void 0);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$swc$2b$helpers$40$0$2e$5$2e$15$2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "inputHandler", void 0);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$swc$2b$helpers$40$0$2e$5$2e$15$2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "lastTime", 0);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$swc$2b$helpers$40$0$2e$5$2e$15$2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "animationFrameId", null);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$swc$2b$helpers$40$0$2e$5$2e$15$2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "isRunning", false);
        this.canvas = canvas;
        this.ctx = ctx;
        // Initialize game objects
        this.player = new __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$Player$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"](400, 912); // Starting position in campus area (608 + 304)
        this.inputHandler = new __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$InputHandler$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]();
        this.sceneManager = new __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$SceneManager$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"](this.player, this.inputHandler);
        // Bind the game loop
        this.gameLoop = this.gameLoop.bind(this);
    }
}
const __TURBOPACK__default__export__ = GameEngine;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/components/Game.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@15.5.4_react-dom@19.1.0_react@19.1.0__react@19.1.0/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@15.5.4_react-dom@19.1.0_react@19.1.0__react@19.1.0/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$GameEngine$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/GameEngine.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
const Game = ()=>{
    _s();
    const canvasRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const gameEngineRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [isLoaded, setIsLoaded] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Game.useEffect": ()=>{
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
                    gameEngineRef.current = new __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$GameEngine$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"](canvas, ctx);
                    gameEngineRef.current.start();
                    setIsLoaded(true);
                    // Focus canvas for keyboard input
                    canvas.focus();
                }
            }
            return ({
                "Game.useEffect": ()=>{
                    if (gameEngineRef.current) {
                        gameEngineRef.current.stop();
                    }
                }
            })["Game.useEffect"];
        }
    }["Game.useEffect"], []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "relative game-ui",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("canvas", {
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
            !isLoaded && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute inset-0 flex items-center justify-center loading-screen text-white",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "text-center",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "text-xl mb-2",
                            children: "LOADING..."
                        }, void 0, false, {
                            fileName: "[project]/app/components/Game.tsx",
                            lineNumber: 56,
                            columnNumber: 13
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-4 text-white text-center game-ui",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "bg-black bg-opacity-80 p-4 rounded border border-white inline-block",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-sm mb-1",
                            children: "🎮 VIRGINIA TECH CAMPUS"
                        }, void 0, false, {
                            fileName: "[project]/app/components/Game.tsx",
                            lineNumber: 63,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-xs",
                            children: "WASD or Arrow Keys to move around campus"
                        }, void 0, false, {
                            fileName: "[project]/app/components/Game.tsx",
                            lineNumber: 64,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-xs",
                            children: "Explore Burruss Hall, Newman Library & more!"
                        }, void 0, false, {
                            fileName: "[project]/app/components/Game.tsx",
                            lineNumber: 65,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
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
_s(Game, "phGGM2kI7U676cKcf59nnBxUTxY=");
_c = Game;
const __TURBOPACK__default__export__ = Game;
var _c;
__turbopack_context__.k.register(_c, "Game");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Home
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@15.5.4_react-dom@19.1.0_react@19.1.0__react@19.1.0/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$Game$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/Game.tsx [app-client] (ecmascript)");
'use client';
;
;
function Home() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex items-center justify-center min-h-screen bg-black",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$Game$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
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
_c = Home;
var _c;
__turbopack_context__.k.register(_c, "Home");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=app_d6c5c17f._.js.map