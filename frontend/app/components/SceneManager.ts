import Player from './Player';
import World from './World';
import BurrussInterior from './campus/BurrussInterior';
import NewmanInterior from './campus/NewmanInterior';
import TorgersenInterior from './campus/TorgersenInterior';
import SquiresInterior from './campus/SquiresInterior';
import { Scene, SceneType } from './types';

class SceneManager {
  private currentScene: Scene;
  private scenes: Map<SceneType, Scene> = new Map();
  private player: Player;

  constructor(player: Player) {
    this.player = player;
    this.initializeScenes();
    this.currentScene = this.scenes.get('campus')!;
  }

  private initializeScenes(): void {
    // Campus (outdoor world)
    this.scenes.set('campus', new World());
    
    // Building interiors
    this.scenes.set('burruss', new BurrussInterior());
    this.scenes.set('newman', new NewmanInterior());
    this.scenes.set('torgersen', new TorgersenInterior());
    this.scenes.set('squires', new SquiresInterior());
    // Add more building interiors as needed
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

    this.currentScene = newScene;

    // Position player at entrance or default position
    if (entranceX !== undefined && entranceY !== undefined) {
      this.player.x = entranceX;
      this.player.y = entranceY;
    } else if (newScene.getEntrancePosition) {
      const entrance = newScene.getEntrancePosition();
      this.player.x = entrance.x;
      this.player.y = entrance.y;
    }

    console.log(`Switched to ${newSceneType} scene`);
  }

  public checkForSceneTransition(): void {
    // Check if player is near a door on campus
    if (this.currentScene.type === 'campus') {
      this.checkBuildingEntrance();
    } else {
      // Check if player is near exit in building
      this.checkBuildingExit();
    }
  }

  private checkBuildingEntrance(): void {
    const world = this.currentScene as World;
    const playerTileX = Math.floor(this.player.x / 32);
    const playerTileY = Math.floor(this.player.y / 32);

    // Check surrounding tiles for doors
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const tileX = playerTileX + dx;
        const tileY = playerTileY + dy;
        
        if (world.getTileAt && world.getTileAt(tileX, tileY)?.type === 'door') {
          const buildingType = world.getTileAt(tileX, tileY)?.buildingType;
          if (buildingType && this.scenes.has(buildingType as SceneType)) {
            this.switchScene(buildingType as SceneType);
            return;
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
