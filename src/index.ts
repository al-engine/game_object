import {
  OrgbValue,
  UpdateParams,
  CameraResult,
  Sprite,
  Vector,
  Space,
  Position,
} from '@al-engine/core';

export interface GameObjectParams extends UpdateParams {
  camera: CameraResult;
}

export default abstract class GameObject<ParamsType extends GameObjectParams>
  implements Space {
  position = {
    x: 0,
    y: 0,
  };
  size = {
    width: 1,
    height: 1,
  };
  speed: Vector = {
    x: 0,
    y: 0,
  };
  children = Array<GameObject<ParamsType>>();
  parent?: GameObject<ParamsType>;
  sprite?: Sprite;
  zIndex = 0;
  needUpdate = (params: ParamsType) => {
    return this.inBound(params);
  };
  inBound = (params: ParamsType) => {
    return params.camera.inBound(this.position, this.size);
  };
  addChild = (child: GameObject<ParamsType>) => {
    child.parent = this;
    this.children.push(child);
    child.init();
  };
  removeChild = (child: GameObject<ParamsType>) => {
    const index = this.children.indexOf(child);
    if (index !== -1) {
      child.parent = undefined;
      this.children.splice(index, 1);
      child.teardown();
    }
  };
  getAncestorByType: <T extends GameObject<ParamsType>>(
    type: any
  ) => T | null = <T extends GameObject<ParamsType>>(type: any): T | null => {
    let target = this.parent;

    while (target) {
      if (target instanceof type) {
        return target as T;
      }
      target = target.parent;
    }
    return null;
  };
  destroy() {
    this.parent?.removeChild(this);
  }
  init() {}
  tick = (params: ParamsType) => {
    if (!this.needUpdate(params)) {
      return;
    }
    this.update(params);

    this.children.forEach(child => child.tick(params));
  };
  update = (_: ParamsType) => {};
  render = (params: ParamsType) => {
    if (!this.inBound(params)) {
      return;
    }

    const setPixel = (x: number, y: number, color: OrgbValue) => {
      params.pixels.setPixel(
        Math.round(this.position.x + x),
        Math.round(this.position.y + y),
        color
      );
    };

    const p = {
      ...params,
      pixels: {
        ...params.pixels,
        setPixel,
      },
    };

    this.draw(p);

    this.sortChildren();

    this.children.forEach(child => child.render(p));
  };
  draw = (params: ParamsType) => {
    if (this.sprite) {
      for (let i = 0; i < this.sprite.pixels.length; i++) {
        const row = Math.floor(i / this.sprite.width);
        const col = i - row * this.sprite.width;
        params.pixels.setPixel(col, row, this.sprite.pixels[i]);
      }
      return;
    }
  };
  sortChildren = () => {
    this.children.sort((f, s) => f.zIndex - s.zIndex);
  };
  move = (params: ParamsType) => {
    this.position = {
      x: this.position.x + (this.speed.x * params.delta) / 1000,
      y: this.position.y + (this.speed.y * params.delta) / 1000,
    };
  };
  getAbsolutePosition() {
    if (this.parent) {
      return {
        x: this.parent.position.x + this.position.x,
        y: this.parent.position.y + this.position.y,
      };
    }
    return this.position;
  }
  setAbsolute(position: Partial<Position>) {
    if (position.x !== undefined) {
      if (this.parent) {
        this.position.x = position.x - this.parent.position.x;
      } else {
        this.position.x = position.x;
      }
    }
    if (position.y !== undefined) {
      if (this.parent) {
        this.position.y = position.y - this.parent.position.y;
      } else {
        this.position.y = position.y;
      }
    }
  }

  teardown() {
    this.children.forEach(c => c.teardown());
  }
}
