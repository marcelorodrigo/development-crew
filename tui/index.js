const tui = async () => {
  // No UI surface is needed; this module exists so OpenCode registers
  // the package as a TUI plugin and surfaces it in the /plugins manager.
};

const plugin = {
  id: '@marcelorodrigo/opencode-development-crew',
  tui,
};

export default plugin;
