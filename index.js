import { Plugin } from '@opencode/plugin';
import { createDevelopmentCrewSetup } from './lib/development-crew.js';

export default Plugin.define({
  id: 'development-crew',
  setup: createDevelopmentCrewSetup(),
});
