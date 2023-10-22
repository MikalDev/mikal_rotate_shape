function getInstanceJs(parentClass, scriptInterface, addonTriggers, C3) {
  return class extends parentClass {
    constructor(inst, properties) {
      super(inst);
      this._xAngle = 0
      this._yAngle = 0
      this._zAngle = 0
      this._xOffset = 0;
      this._yOffset = 0;
      this._zOffset = 0;
      this._xScale = 1;
      this._yScale = 1;
      this._zScale = 1;

      // Monkey patch draw
      this._inst._oldDraw = this._inst.Draw;
      this._inst.Draw = function (renderer) {
        const behInst = this.GetBehaviorInstanceFromCtor(C3.Behaviors.mikal_rotate_shape)
        const glMatrix = globalThis.glMatrix;
        const mat4 = glMatrix.mat4;
        const quat = glMatrix.quat;
        const tmpModelView = mat4.create();
        const modelRotate = mat4.create();
        mat4.copy(tmpModelView, renderer._matMV);
        // Get behavior instance data
        const xAngle = behInst._sdkInst._xAngle;
        const yAngle = behInst._sdkInst._yAngle;
        const zAngle = behInst._sdkInst._zAngle;
        const xOff = behInst._sdkInst._xOffset;
        const yOff = behInst._sdkInst._yOffset;
        const zOff = behInst._sdkInst._zOffset;
        const xScale = behInst._sdkInst._xScale;
        const yScale = behInst._sdkInst._yScale;
        const zScale = behInst._sdkInst._zScale;

        const rotate = quat.create();
        quat.fromEuler(rotate, xAngle, yAngle, zAngle);
        const x = this.GetWorldInfo().GetX()+xOff;
        const y = this.GetWorldInfo().GetY()+yOff;
        const z = this.GetWorldInfo().GetZElevation()+zOff;
        const width = this.GetWorldInfo().GetWidth();
        const height = this.GetWorldInfo().GetHeight();
        let zHeight = this._sdkInst._zHeight;
        if (!zHeight) {
          zHeight = 0;
        }
        // mat4.fromRotationTranslationScale(modelRotate, rotate, [0,0,0], [1,1,1]);
        mat4.fromRotationTranslationScaleOrigin(modelRotate, rotate, [0,0,0], [xScale, yScale, zScale], [x,y,z+zHeight/2]);
       // mat4.copy(modelRotate, modelRotate);
        mat4.multiply(modelRotate, tmpModelView, modelRotate);
        renderer.SetModelViewMatrix(modelRotate);
        this._oldDraw(renderer);
        renderer.SetModelViewMatrix(tmpModelView);
      }

      if (properties) {
      }
    }

    Release() {
      super.Release();
      this._xAngle = null
      this._yAngle = null
      this._zAngle = null
      this._xOffset = null;
      this._yOffset = null;
      this._zOffset = null;
      this._xScale = null;
      this._yScale = null;
      this._zScale = null;
    }

    SaveToJson() {
      return {
        // data to be saved for savegames
      };
    }

    DrawRotate(renderer) {
      // draw rotated
      const behInst = this.GetBehaviorInstanceFromCtor(C3.Behaviors.mikal_rotate_shape)
    }

    LoadFromJson(o) {
      // load state for savegames
    }

    Trigger(method) {
      super.Trigger(method);
      const addonTrigger = addonTriggers.find((x) => x.method === method);
      if (addonTrigger) {
        this.GetScriptInterface().dispatchEvent(new C3.Event(addonTrigger.id));
      }
    }

    _SetRotationAngles(xAngle, yAngle, zAngle) {
      this._xAngle = xAngle;
      this._yAngle = yAngle;
      this._zAngle = zAngle;
    }

    _SetCenterOffset(x, y, z) {
      this._xOffset = x;
      this._yOffset = y;
      this._zOffset = z;
    }

    _SetScale(x, y, z) {
      this._xScale = x;
      this._yScale = y;
      this._zScale = z;
    }

    _xOffset() {
      return this._xOffset;
    }

    _yOffset() {
      return this._yOffset;
    }

    _zOffset() {
      return this._zOffset;
    }

    _xAngle() {
      return this._xAngle;
    }

    _yAngle() {
      return this._yAngle;
    }

    _zAngle() {
      return this._zAngle;
    }

    // expression x,y,z scale
    _xScale() {
      return this._xScale;
    }
    _yScale() {
      return this._yScale;
    }
    _zScale() {
      return this._zScale;
    }

    GetScriptInterfaceClass() {
      return scriptInterface;
    }
  };
}
