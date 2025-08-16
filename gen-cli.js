#!/usr/bin/env node

const GHProvider = require('./providers/gh-provider');
const GeminiProvider = require('./providers/gemini-provider');
const Config = require('./config');

class GenCLI {
    constructor() {
        this.config = new Config();
        this.providers = [
            new GHProvider(),
            new GeminiProvider()
        ];
    }

    async findAvailableProvider() {
        const preferredProvider = this.config.getProvider();

        // If user has set a preference, try that first
        if (preferredProvider) {
            const provider = this.providers.find(p => p.name === preferredProvider);
            if (provider) {
                const status = await provider.getStatus();
                if (status.status === 'ready') {
                    return provider;
                } else {
                    throw new Error(`Preferred provider '${preferredProvider}' is ${status.status}`);
                }
            }
        }

        // Auto-detect first available provider
        for (const provider of this.providers) {
            const status = await provider.getStatus();
            if (status.status === 'ready') {
                return provider;
            }
        }

        throw new Error(`No available providers found. Please install and authenticate any of the following:\n- ${this.providers.map(p => p.name).join('\n- ')}`);
    }

    async findSpecificProvider(providerName) {
        const provider = this.providers.find(p => p.name === providerName);
        if (!provider) {
            throw new Error(`Provider '${providerName}' not found. Available: ${this.providers.map(p => p.name).join(', ')}`);
        }

        const status = await provider.getStatus();
        if (status.status !== 'ready') {
            throw new Error(`Provider '${providerName}' is ${status.status}${status.message ? ': ' + status.message : ''}`);
        }

        return provider;
    }

    async generateCommand(query, context = '', oneTimeProvider = null) {
        const provider = oneTimeProvider ? 
            await this.findSpecificProvider(oneTimeProvider) : 
            await this.findAvailableProvider();
        return await provider.generateCommand(query, context);
    }

    async listProviders() {
        console.log('Available providers:');

        for (const provider of this.providers) {
            const status = await provider.getStatus();
            const current = this.config.getProvider() === provider.name ? ' (current)' : '';
            const statusIcon = status.status === 'ready' ? '✅' :
                status.status === 'not_authenticated' ? '⚠️' : '❌';

            const statusText = status.status === 'error' && status.message ? 
                `${status.status} (${status.message})` : status.status;
            
            console.log(`  ${statusIcon} ${provider.name}${current} - ${statusText}`);
        }

        if (!this.config.getProvider()) {
            console.log('\nNo provider set (auto-detect mode)');
        }
    }

    setProvider(providerName) {
        const validProviders = this.providers.map(p => p.name);

        if (providerName === 'auto') {
            this.config.setProvider(null);
            console.log('Provider set to auto-detect');
            return;
        }

        if (!validProviders.includes(providerName)) {
            throw new Error(`Invalid provider '${providerName}'. Available: ${validProviders.join(', ')}, auto`);
        }

        this.config.setProvider(providerName);
        console.log(`Provider set to: ${providerName}`);
    }
}

function parseArgs() {
    const args = process.argv.slice(2);
    const options = {
        message: '',
        context: '', // For future context implementation
        help: false,
        provider: null,
        oneTimeProvider: null, // For -p option
        listProviders: false,
        setProvider: null
    };

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        const next = args[i + 1];

        switch (arg) {
            case '-m':
            case '--message':
                options.message = next;
                i++;
                break;
            case '-c':
            case '--context':
                // Placeholder for future context implementation
                options.context = next;
                i++;
                break;
            case '-p':
            case '--provider':
                options.oneTimeProvider = next;
                i++;
                break;
            case '-h':
            case '--help':
                options.help = true;
                break;
            case 'provider':
                if (next === '-list' || next === '--list') {
                    options.listProviders = true;
                    i++;
                } else if (next === '-set' || next === '--set') {
                    options.setProvider = args[i + 2];
                    i += 2;
                }
                break;
        }
    }

    return options;
}

function showHelp() {
    console.log(`
Gen CLI - Generate bash commands from natural language using AI

Usage: 
  gen -m "your message here"
  gen -m "your message here" -p <provider>
  gen provider -list
  gen provider -set <provider>

Options:
  -m, --message <text>    Natural language description (required)
  -p, --provider <name>   Use specific provider for this command (gh, gemini)
  -c, --context <num>     Context from previous commands (future feature)
  -h, --help              Show this help message

Provider Commands:
  provider -list          List all available providers and their status
  provider -set <name>    Set preferred provider (gh, gemini, auto)

Examples:
  gen -m "List all directories in current folder"
  gen -m "Find files larger than 100MB" -p gemini
  gen provider -list
  gen provider -set gh
`);
}

async function main() {
    const options = parseArgs();

    if (options.help) {
        showHelp();
        return;
    }

    const cli = new GenCLI();

    try {
        if (options.listProviders) {
            await cli.listProviders();
            return;
        }

        if (options.setProvider) {
            cli.setProvider(options.setProvider);
            return;
        }

        if (!options.message) {
            showHelp();
            process.exit(1);
        }

        const command = await cli.generateCommand(options.message, options.context, options.oneTimeProvider);
        console.log(command);

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = GenCLI;
