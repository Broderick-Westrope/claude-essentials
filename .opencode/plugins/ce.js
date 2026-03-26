import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Extract YAML frontmatter from a markdown file's content.
 * Returns { frontmatter: { key: value, ... }, content: string }
 */
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

/**
 * Truncate a string to maxLen characters at a word boundary, appending "..."
 */
const truncateDescription = (desc, maxLen = 200) => {
  if (desc.length <= maxLen) return desc;
  const truncated = desc.slice(0, maxLen);
  const lastSpace = truncated.lastIndexOf(' ');
  return (lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated) + '...';
};

/**
 * Scan skills directory and return array of { name, description } objects.
 */
const scanSkills = (skillsDir) => {
  const skills = [];
  if (!fs.existsSync(skillsDir)) return skills;

  const entries = fs.readdirSync(skillsDir, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const skillFile = path.join(skillsDir, entry.name, 'SKILL.md');
    if (!fs.existsSync(skillFile)) continue;

    try {
      const content = fs.readFileSync(skillFile, 'utf-8');
      const { frontmatter } = extractFrontmatter(content);
      if (frontmatter.name && frontmatter.description) {
        skills.push({
          name: `ce:${frontmatter.name}`,
          description: truncateDescription(frontmatter.description),
        });
      }
    } catch {
      // Skip unreadable skill files
    }
  }

  return skills.sort((a, b) => a.name.localeCompare(b.name));
};

/**
 * Detect project tooling by checking for config files in the given directory.
 */
const detectProjectTools = (dir) => {
  const tools = [];

  const check = (file, tool) => {
    if (fs.existsSync(path.join(dir, file))) tools.push(tool);
  };

  // Package managers and runtimes
  check('package.json', 'node');
  check('go.mod', 'go');
  check('pyproject.toml', 'python');
  check('Cargo.toml', 'rust');

  // TypeScript
  check('tsconfig.json', 'tsc');

  // JavaScript linters/formatters
  const eslintConfigs = [
    '.eslintrc', '.eslintrc.js', '.eslintrc.json', '.eslintrc.yml',
    'eslint.config.js', 'eslint.config.mjs', 'eslint.config.ts',
  ];
  if (eslintConfigs.some((f) => fs.existsSync(path.join(dir, f)))) {
    tools.push('eslint');
  }

  const prettierConfigs = [
    '.prettierrc', '.prettierrc.json', '.prettierrc.js', '.prettierrc.yml',
  ];
  if (prettierConfigs.some((f) => fs.existsSync(path.join(dir, f)))) {
    tools.push('prettier');
  }

  // Python tools (check pyproject.toml sections)
  const pyprojectPath = path.join(dir, 'pyproject.toml');
  if (fs.existsSync(pyprojectPath)) {
    try {
      const pyContent = fs.readFileSync(pyprojectPath, 'utf-8');
      if (pyContent.includes('[tool.ruff]')) tools.push('ruff');
      if (pyContent.includes('[tool.mypy]')) tools.push('mypy');
      if (pyContent.includes('[tool.black]')) tools.push('black');
      if (pyContent.includes('[tool.pytest')) tools.push('pytest');
    } catch {
      // Skip unreadable
    }
  }
  if (!tools.includes('mypy') && fs.existsSync(path.join(dir, 'mypy.ini'))) {
    tools.push('mypy');
  }
  check('.flake8', 'flake8');

  // Pre-commit
  check('.pre-commit-config.yaml', 'pre-commit');

  return tools;
};

/**
 * Build the example evaluation block using actual skill names.
 */
const buildExample = (skills) => {
  if (skills.length === 0) return '- No skills available';

  const lines = [];
  const max = Math.min(skills.length, 3);
  for (let i = 0; i < max; i++) {
    if (i === 0) {
      lines.push(`- ${skills[i].name}: YES - matches current task`);
    } else {
      lines.push(`- ${skills[i].name}: NO - not relevant`);
    }
  }

  lines.push('');
  lines.push('[Then IMMEDIATELY use Skill() tool:]');
  lines.push(`> Skill(${skills[0].name})`);
  if (skills.length > 1) {
    lines.push(`> Skill(${skills[1].name})  // if also relevant`);
  }
  lines.push('');
  lines.push('[THEN and ONLY THEN start implementation]');

  return lines.join('\n');
};

/**
 * Build the skills awareness system prompt injection.
 */
const buildSkillsPrompt = (skills, projectTools, ceSkillsDir) => {
  const skillsList = skills
    .map((s) => `- ${s.name}: ${s.description}`)
    .join('\n');

  const example = buildExample(skills);

  let toolingSection = '';
  if (projectTools.length > 0) {
    toolingSection = `

## Project Tooling (Auto-Detected)

Available tools in this project: ${projectTools.join(' ')}

When committing or verifying work, use the preflight-checks skill to run these tools.`;
  }

  return `<CRITICAL_USER_INSTRUCTIONS>
### Available Skills (Auto-Generated)

<INSTRUCTION>
MANDATORY SKILL ACTIVATION SEQUENCE

Step 1 - EVALUATE (do this in your response):
For each skill below, state: [skill-name] - YES/NO - [reason]

Available skills:
${skillsList}

Step 2 - ACTIVATE (do this immediately after Step 1):
IF any skills are YES: Use skill({ name: "ce:skill-name" }) for EACH relevant skill NOW
IF no skills are YES: State "No skills needed" and proceed

Step 3 - IMPLEMENT:
Only after Step 2 is complete, proceed with implementation.

CRITICAL: You MUST call skill() tool in Step 2. Do NOT skip to implementation.
The evaluation (Step 1) is WORTHLESS unless you ACTIVATE (Step 2) the skills.

Example of correct sequence:
${example}
${toolingSection}
</INSTRUCTION>

**Tool Mapping for OpenCode:**
- \`TodoWrite\` → \`todowrite\`
- \`Task\` tool with subagents → Use OpenCode's subagent system (@mention)
- \`Skill\` tool → OpenCode's native \`skill\` tool
- \`Read\`, \`Write\`, \`Edit\`, \`Bash\` → Your native tools
- \`AskUserQuestion\` → Ask the user directly
- \`mcp__ide__getDiagnostics\` → Check IDE diagnostics if available

**Skills location:**
CE skills are in \`${ceSkillsDir}\`
</CRITICAL_USER_INSTRUCTIONS>`;
};

/**
 * Symlink files from a source directory into a target directory.
 * Only creates symlinks for files matching the pattern; skips if target exists.
 */
const symlinkDir = (sourceDir, targetDir, label) => {
  if (!fs.existsSync(sourceDir)) return;

  const entries = fs.readdirSync(sourceDir).filter((f) => f.endsWith('.md'));
  if (entries.length === 0) return;

  fs.mkdirSync(targetDir, { recursive: true });

  for (const file of entries) {
    const srcPath = path.join(sourceDir, file);
    const destPath = path.join(targetDir, file);

    // Skip if target already exists (symlink or real file)
    if (fs.existsSync(destPath)) continue;

    try {
      fs.symlinkSync(srcPath, destPath, 'file');
      console.log(`[ce] Symlinked ${label}: ${file}`);
    } catch (err) {
      console.warn(`[ce] Failed to symlink ${file}: ${err.message}`);
    }
  }
};

/**
 * CE Plugin for OpenCode.
 *
 * Provides:
 * - Config hook: registers skills path for OpenCode skill discovery
 * - Bootstrap hook: injects skills awareness into system prompt
 * - Session hook: auto-symlinks commands and agents into user's project
 */
export const CEPlugin = async ({ client, directory }) => {
  const pluginRoot = path.resolve(__dirname, '../..');
  const ceRoot = path.join(pluginRoot, 'plugins/ce');
  const ceSkillsDir = path.join(ceRoot, 'skills');

  // Source directories for commands and agents (OpenCode-formatted, in repo root)
  const pluginCommandsDir = path.join(pluginRoot, '.opencode/commands');
  const pluginAgentsDir = path.join(pluginRoot, '.opencode/agents');

  // Scan skills once at plugin load time
  const skills = scanSkills(ceSkillsDir);

  return {
    // (a) Config hook: register skills path
    config: async (config) => {
      config.skills = config.skills || {};
      config.skills.paths = config.skills.paths || [];
      if (!config.skills.paths.includes(ceSkillsDir)) {
        config.skills.paths.push(ceSkillsDir);
      }
    },

    // (b) System prompt transform: inject skills awareness
    'experimental.chat.system.transform': async (_input, output) => {
      if (skills.length > 0) {
        const projectTools = detectProjectTools(directory);
        const prompt = buildSkillsPrompt(skills, projectTools, ceSkillsDir);
        (output.system ||= []).push(prompt);
      }
    },

    // (c) Auto-symlink: symlink commands and agents on session start
    'session.created': async () => {
      const projectCommandsDir = path.join(directory, '.opencode/commands');
      const projectAgentsDir = path.join(directory, '.opencode/agents');

      symlinkDir(pluginCommandsDir, projectCommandsDir, 'command');
      symlinkDir(pluginAgentsDir, projectAgentsDir, 'agent');
    },
  };
};

export default CEPlugin;
