import { fileURLToPath } from 'node:url';
import { loadSkills } from './skills.js';

const skillsDir = fileURLToPath(new URL('../skills/', import.meta.url));
const bootstrapMarker = '<!-- development-crew-bootstrap -->';

export const createDevelopmentCrewSetup = (
  load = () => loadSkills(skillsDir),
) => async (ctx) => {
  const skills = await load();
  const bootstrap = skills.find((skill) => skill.id === 'using-development-crew')?.content;

  await ctx.skill.transform((editor) => {
    for (const skill of skills) editor.add({ ...skill });
  });

  await ctx.session.hook('context', (event) => {
    if (!bootstrap?.trim()) return;
    if (event.system.some((part) => part.type === 'text' && part.text.includes(bootstrapMarker))) return;

    event.system.push({ type: 'text', text: `${bootstrap}\n\n${bootstrapMarker}` });
  });
};
