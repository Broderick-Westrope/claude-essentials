#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const extractFrontmatter = (content) => {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { frontmatter: {}, content };
  const frontmatter = {};
  for (const line of match[1].split('\n')) {
    const colonIdx = line.indexOf(':');
    if (colonIdx > 0) {
      const key = line.slice(0, colonIdx).trim();
      const value = line.slice(colonIdx + 1).trim().replace(/^["']|["']$/g, '');
      frontmatter[key] = value;
    }
  }
  return { frontmatter, content: match[2] };
};

const scanCommands = (dir) => {
  const commands = {};
  if (!fs.existsSync(dir)) return commands;
  for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.md'))) {
    const content = fs.readFileSync(path.join(dir, file), 'utf-8');
    const { frontmatter, content: body } = extractFrontmatter(content);
    const name = file.replace(/\.md$/, '');
    const cmd = { template: body.trim() };
    if (frontmatter.description) cmd.description = frontmatter.description;
    if (frontmatter.agent) cmd.agent = frontmatter.agent;
    if (frontmatter.model) cmd.model = frontmatter.model;
    if (frontmatter.subtask === 'true') cmd.subtask = true;
    commands[name] = cmd;
  }
  return commands;
};

const scanAgents = (dir) => {
  const agents = {};
  if (!fs.existsSync(dir)) return agents;
  for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.md'))) {
    const content = fs.readFileSync(path.join(dir, file), 'utf-8');
    const { frontmatter, content: body } = extractFrontmatter(content);
    const name = frontmatter.name || file.replace(/\.md$/, '');
    const agent = { prompt: body.trim() };
    if (frontmatter.description) agent.description = frontmatter.description;
    if (frontmatter.mode) agent.mode = frontmatter.mode;
    if (frontmatter.model) agent.model = frontmatter.model;
    if (frontmatter.color) agent.color = frontmatter.color;
    agents[name] = agent;
  }
  return agents;
};

const commands = scanCommands(path.join(root, 'opencode/commands'));
const agents = scanAgents(path.join(root, 'opencode/agents'));

const manifest = { commands, agents };
const outPath = path.join(root, 'opencode/plugins/manifest.json');
fs.writeFileSync(outPath, JSON.stringify(manifest, null, 2) + '\n');

console.log(`Wrote ${Object.keys(commands).length} commands, ${Object.keys(agents).length} agents to ${outPath}`);
