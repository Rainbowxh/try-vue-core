

let activeEffectScope;

export class EffectScope {
  private _active = true;
  private parent = true;
  effects: any []
  scopes: any []

  constructor(public detach = true) {
    this._active = true;
    if(!detach && activeEffectScope) {
      activeEffectScope.scopes.push(this)
    }
  }

  get active() {
    return this._active
  }

  set active(newValue) {
     this._active = newValue;
  }

  run(fn: () => any) {
    if(this._active) {
      try {
        this.parent = activeEffectScope
        activeEffectScope = this;
        return fn()
      }finally {
        activeEffectScope = this.parent;
        this.parent = null
      }
    }
  }

  stop() {
    if(this.active) {
      this.effects.forEach(effect => effect.stop());
    }
    this.active = false;

    if(this.scopes) {
      this.scopes.forEach(scope => {
        scope.stop();
      })
    }
  } 
}

export function recordEffectScope(effect) {
  if(activeEffectScope && activeEffectScope.active) {
    activeEffectScope.effects.push(effect);
  }
}


export function effectScope(detached: boolean){
  return new EffectScope(detached);
}
