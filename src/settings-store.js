export class SettingsStore extends EventTarget {
  constructor(initialSettings, presets) {
    super();
    this.settings = initialSettings;
    this.presets = presets;
  }

  get values() {
    return this.settings;
  }

  set(key, value) {
    this.settings[key] = value;
    this.emitChange(key);
  }

  applyPreset(name) {
    const preset = this.presets[name];
    if (!preset) return;
    Object.assign(this.settings, preset);
    this.emitChange("preset", name);
  }

  emitChange(key, detail = this.settings[key]) {
    this.dispatchEvent(
      new CustomEvent("settingschange", {
        detail: { key, value: detail, settings: this.settings },
      }),
    );
  }
}
