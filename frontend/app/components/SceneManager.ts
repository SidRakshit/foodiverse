import Player from './Player';
import World from './World';
import InputHandler from './InputHandler';
import BurrussInterior from './campus/BurrussInterior';
import TurnerInterior from './campus/TurnerInterior';
import TorgersenInterior from './campus/TorgersenInterior';
import SquiresInterior from './campus/SquiresInterior';
import TotsDownstairs from './off-campus/TotsDownstairs';
import TotsUpstairs from './off-campus/TotsUpstairs';
import HokieHouseInterior from './off-campus/HokieHouseInterior';
import CentrosInterior from './off-campus/CentrosInterior';
import EdgeInterior from './off-campus/EdgeInterior';
import FoodLionInterior from './off-campus/FoodLionInterior';
import FridgeManager from './FridgeManager';
import { Scene, SceneType } from './types';

class SceneManager {
  private currentScene: Scene;
  private scenes: Map<SceneType, Scene> = new Map();
  private player: Player;
  private inputHandler: InputHandler;

  constructor(player: Player, inputHandler: InputHandler) {
    this.player = player;
    this.inputHandler = inputHandler;
    this.initializeScenes();
    this.currentScene = this.scenes.get('campus')!;
  }

  private initializeScenes(): void {
    // Campus (outdoor world)
    this.scenes.set('campus', new World());
    
    // Campus building interiors
    this.scenes.set('burruss', new BurrussInterior());
    this.scenes.set('turner', new TurnerInterior());
    this.scenes.set('torgersen', new TorgersenInterior());
    this.scenes.set('squires', new SquiresInterior());
    
    // Off-campus restaurant interiors
    this.scenes.set('tots', new TotsDownstairs());
    this.scenes.set('tots_upstairs', new TotsUpstairs());
    this.scenes.set('hokiehouse', new HokieHouseInterior());
    this.scenes.set('centros', new CentrosInterior());
    
    // Off-campus apartment interiors
    this.scenes.set('edge', new EdgeInterior());
    
    // Off-campus commercial interiors
    this.scenes.set('foodlion', new FoodLionInterior());
  }

  public getCurrentScene(): Scene {
    return this.currentScene;
  }

  public getCurrentSceneType(): SceneType {
    return this.currentScene.type;
  }

  public switchScene(newSceneType: SceneType, entranceX?: number, entranceY?: number): void {
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

  public checkForSceneTransition(): void {
    // Check for ESC key to exit buildings - but only if fridge UI is not open
    const fridgeManager = FridgeManager.getInstance();
    const escPressed = this.inputHandler.wasKeyJustPressed('Escape');
    
    if (escPressed && !fridgeManager.isFridgeUIOpen()) {
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

  private checkBuildingEntrance(): void {
    const world = this.currentScene as World;
    const playerTileX = Math.floor(this.player.x / 32);
    const playerTileY = Math.floor(this.player.y / 32);

    // Only check the exact tile the player is standing on for doors
    const tile = world.getTileAt && world.getTileAt(playerTileX, playerTileY);
    if (tile && tile.type === 'door') {
      const buildingType = tile.buildingType;
      console.log('🚪 Found door! Building type:', buildingType, 'at tile:', {playerTileX, playerTileY});
      
      if (buildingType && this.scenes.has(buildingType as SceneType)) {
        console.log('✅ Entering building:', buildingType);
        this.switchScene(buildingType as SceneType);
        return;
      } else {
        console.log('❌ Building type not recognized:', buildingType, 'Available scenes:', Array.from(this.scenes.keys()));
      }
    }
  }

  private checkStairTransition(): void {
    // Check if player is on stairs in any building
    const currentScene = this.currentScene as any;
    if (currentScene.tiles) {
      const playerTileX = Math.floor(this.player.x / 32);
      const playerTileY = Math.floor(this.player.y / 32);
      
      // Check bounds
      if (playerTileX >= 0 && playerTileX < (currentScene.buildingWidth || currentScene.areaWidth) &&
          playerTileY >= 0 && playerTileY < (currentScene.buildingHeight || currentScene.areaHeight)) {
        
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

  private checkBuildingExit(): void {
    const exitInfo = this.currentScene.getExitPosition?.();
    if (exitInfo) {
      const distance = Math.sqrt(
        Math.pow(this.player.x - exitInfo.x, 2) + 
        Math.pow(this.player.y - exitInfo.y, 2)
      );
      
      // If player is close to exit
      if (distance < 30) {
        // Switch back to campus and position player outside the building
        this.switchScene(exitInfo.scene, exitInfo.x, exitInfo.y);
      }
    }
  }

  private exitToOutside(): void {
    // Exit building and return to campus
    // Position player at a default campus location
    this.switchScene('campus', 400, 912); // Campus center
    console.log('Exited building with ESC key');
  }

  public render(ctx: CanvasRenderingContext2D): void {
    this.currentScene.render(ctx, this.player);
  }

  public update(deltaTime: number): void {
    this.currentScene.update(deltaTime);
    this.checkForSceneTransition();
  }

  public canMoveTo(x: number, y: number, width: number, height: number): boolean {
    return this.currentScene.canMoveTo(x, y, width, height);
  }

  public getCameraPosition(): { x: number, y: number } {
    return {
      x: this.currentScene.cameraX || 0,
      y: this.currentScene.cameraY || 0
    };
  }
}

export default SceneManager;
