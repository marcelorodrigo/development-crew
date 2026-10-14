import { fileURLToPath } from 'node:url';
import { loadSkills } from './skills.js';

const skillsDir = fileURLToPath(new URL('../skills/', import.meta.url));
const bootstrapMarker = '<!-- development-crew-bootstrap -->';

export const createDevelopmentCrewSetup = (
  load = () => loadSkills(skillsDir),
) => async (ctx) => {
  const skills = await load();
  const bootstrap = skills.find((skill) => skill.id === 'using-development-crew')?.content;
  const bootstrapText = bootstrap?.trim() ? `${bootstrap}\n\n${bootstrapMarker}` : undefined;

  await ctx.skill.transform((editor) => {
    for (const skill of skills) editor.add({ ...skill });
  });

  await ctx.session.hook('context', (event) => {
    if (!bootstrapText) return;
    if (event.system.some((part) => part.type === 'text' && part.text === bootstrapText)) return;

    event.system.push({ type: 'text', text: bootstrapText });
  });
};
