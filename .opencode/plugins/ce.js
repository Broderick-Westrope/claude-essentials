import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, 'manifest.json'), 'utf-8'));
const ceSkillsDir = path.resolve(__dirname, '../../plugins/ce/skills');

/**
 * CE Plugin for OpenCode.
 *
 * Registers skills, commands, and agents from a pre-built manifest.
 * Run `node scripts/build-manifest.js` after changing commands or agents.
 */
export const ClaudeEssentialsPlugin = async () => ({
  config: async (config) => {
    config.skills = config.skills || {};
    config.skills.paths = config.skills.paths || [];
    if (!config.skills.paths.includes(ceSkillsDir)) {
      config.skills.paths.push(ceSkillsDir);
    }

    config.command = config.command || {};
    for (const [name, cmd] of Object.entries(manifest.commands)) {
      if (!config.command[name]) config.command[name] = cmd;
    }

    config.agent = config.agent || {};
    for (const [name, agent] of Object.entries(manifest.agents)) {
      if (!config.agent[name]) config.agent[name] = agent;
    }
  },
});

export default ClaudeEssentialsPlugin;
