# Contributing to Vibe Coding Academy Tools

Thank you for your interest in contributing! 🎉

## How to Contribute

### 1. Report Issues

Found a bug or have a feature request?

- Check if it's already reported in [Issues](https://github.com/mralbertzwolle/vibe-coding-academy-tools/issues)
- Create a new issue with:
  - Clear description
  - Steps to reproduce (for bugs)
  - Expected vs actual behavior
  - Your environment (OS, Claude Code version)

### 2. Submit Pull Requests

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Test locally: `claude --plugin-dir ./plugins/your-plugin`
5. Commit: `git commit -m "Add amazing feature"`
6. Push: `git push origin feature/amazing-feature`
7. Open a Pull Request

### 3. Add New Plugins

Want to add a new plugin? Here's the structure:

```
plugins/
└── your-plugin/
    ├── .claude-plugin/
    │   └── plugin.json
    ├── commands/
    │   └── run.md
    └── skills/
        └── your-skill/
            └── SKILL.md
```

**Required files:**

`plugin.json`:
```json
{
  "name": "your-plugin",
  "version": "1.0.0",
  "description": "What your plugin does",
  "author": {
    "name": "Your Name"
  },
  "license": "CC-BY-NC-4.0",
  "commands": ["./commands/"],
  "skills": ["./skills/"]
}
```

Don't forget to add your plugin to the root `marketplace.json`!

## Code Guidelines

### For Commands (.md files)

- Use clear, descriptive names
- Include `---` frontmatter with description
- Document all arguments
- Provide examples
- Use English for code, comments welcome in Dutch

### For Skills

- Keep SKILL.md concise
- Use progressive disclosure (link to supporting docs)
- Include usage examples

## Testing

Before submitting:

```bash
# Test your plugin locally
claude --plugin-dir ./plugins/your-plugin

# Run the command
/your-plugin:run
```

## Questions?

- Open an issue with the `question` label
- Contact us at [vibecodingacademy.nl](https://vibecodingacademy.nl)

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn

---

Thank you for making these tools better! 🚀
