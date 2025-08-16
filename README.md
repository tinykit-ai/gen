# tinykit/gen

⚠️ **For experienced developers only** ⚠️

Generate bash commands from natural language using your existing AI tools. Commands are generated ready-to-execute - no training wheels.

## Features

- 🤖 **Uses tools you already have**: GitHub Copilot CLI, Gemini CLI
- ⚡ **Instant execution**: Commands appear in your terminal input line
- 🔄 **Provider switching**: Use different AI models per command  
- 🛡️ **For experts only**: Assumes you know what you're doing

## Installation

```bash
npm install -g @tinykit/gen
```

During installation, you'll be prompted to add a source line to your `~/.zshrc` that loads the gen functions from the global package.

## Prerequisites

You need at least one of these AI CLI tools installed and authenticated:

### GitHub Copilot CLI
```bash
# Install GitHub CLI with Copilot
gh extension install github/gh-copilot

# Authenticate
gh auth login
```

### Gemini CLI
```bash
# Install gemini-cli
npm install -g gemini-cli

# Authenticate with your API key
gemini config set apiKey YOUR_API_KEY
```

## Usage

### Basic Command Generation
```bash
gen -m "find all files larger than 100MB"
# → Command appears in terminal: find . -size +100M -type f -ls
# → Press Enter to execute
```

### Use Specific Provider
```bash
gen -m "compress old log files" -p gemini
gen -m "monitor CPU usage" -p gh
```

### Provider Management
```bash
# List available providers
gen provider -list

# Set default provider
gen provider -set gh
```

## Examples

```bash
# File operations
gen -m "delete all node_modules folders"
gen -m "find duplicate files in current directory"
gen -m "compress all files modified today"

# System monitoring
gen -m "show top 10 memory consuming processes"
gen -m "monitor network connections"
gen -m "check disk usage by directory"

# Development workflow
gen -m "kill all processes on port 3000"
gen -m "find all TODO comments in JavaScript files"
gen -m "count lines of code by file type"
```

## Safety Warning

This tool is **intentionally dangerous**:

- ❌ No confirmation prompts
- ❌ No command explanation
- ❌ No undo functionality
- ✅ Commands are ready to execute immediately

**Perfect for**: Senior developers, sysadmins, power users who value speed

**Terrible for**: Junior developers, learning environments, production servers

## How it Works

1. Uses your existing AI CLI tools (no new subscriptions)
2. Sends natural language prompt to AI
3. Parses generated command from AI response
4. Places command in your zsh input line using `print -z`
5. You review and press Enter to execute

## Supported Providers

- **GitHub Copilot CLI**: `gh copilot suggest`
- **Gemini CLI**: `gemini -p`
- **Extensible**: Easy to add new providers

## Configuration

Config file: `~/.tinykit/gen-config` (created in home directory)

```json
{
  "provider": "gh",  // or "gemini", null for auto-detect
  "providers": {}
}
```

## Troubleshooting

### Commands not appearing in terminal
- Ensure you restarted your terminal after installation
- Run `source ~/.zshrc` to reload functions

### Provider not working
```bash
# Check provider status
gen provider -list

# Test authentication
gh auth status        # for GitHub Copilot
gemini -p "test"      # for Gemini
```

### Remove from .zshrc
Remove the block starting with `# Gen - Auto-generated` in `~/.zshrc`.

## Contributing

Contributions welcome! This tool follows YAGNI principles - keep it simple.

### Adding New Providers

1. Create provider class extending `BaseProvider`
2. Implement `isInstalled()`, `isAuthenticated()`, `generateCommand()`
3. Add to provider list in `src/index.js`

## License

MIT

## Disclaimer

Use at your own risk. This tool can generate destructive commands. Always review commands before execution.
