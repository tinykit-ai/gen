#!/usr/bin/env node

/**
 * Simple Node.js Command Agent - MVP
 * Generates bash commands from natural language descriptions
 * No external dependencies required - uses only Node.js built-ins
 */

const https = require('https');
const http = require('http');
const url = require('url');
const process = require('process');

class CommandAgent {
    constructor() {
        this.baseUrl = process.env.AI_BASE_URL || 'https://ai-access.internal.cfapps.eu12.hana.ondemand.com';
        this.modelName = process.env.AI_MODEL_NAME || 'gpt-4o';
    }

    /**
     * Make HTTP request to AI service
     */
    async makeRequest(query, systemPrompt = '') {
        return new Promise((resolve, reject) => {
            const parsedUrl = url.parse(this.baseUrl);
            const isHttps = parsedUrl.protocol === 'https:';
            const client = isHttps ? https : http;
            
            const requestData = {
                query: query,
                model_name: this.modelName
            };
            
            if (systemPrompt) {
                requestData.system = systemPrompt;
            }
            
            const postData = JSON.stringify(requestData);
            
            const options = {
                hostname: parsedUrl.hostname,
                port: parsedUrl.port || (isHttps ? 443 : 80),
                path: '/api/simplepost',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(postData)
                }
            };
            
            const req = client.request(options, (res) => {
                let data = '';
                
                res.on('data', (chunk) => {
                    data += chunk;
                });
                
                res.on('end', () => {
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        resolve(data);
                    } else {
                        reject(new Error(`HTTP ${res.statusCode}: ${data}`));
                    }
                });
            });
            
            req.on('error', (err) => {
                reject(err);
            });
            
            req.write(postData);
            req.end();
        });
    }

    /**
     * Generate a bash command from natural language
     */
    async generateCommand(description, options = {}) {
        const {
            context = '',
            shell = 'zsh',
            osType = 'macOS'
        } = options;

        // Step 1: Generate the command
        const commandPrompt = `You are an expert bash command generator for ${shell} on ${osType}.

Generate a precise bash command that accomplishes the user's request. Follow these guidelines:
1. Use ${shell}-specific syntax when relevant
2. Optimize for ${osType} compatibility  
3. Prefer commonly available tools and commands
4. Include necessary error handling where appropriate
5. Make commands readable and maintainable

IMPORTANT: Return ONLY the command, no explanations or formatting. Just the raw command.`;

        const query = `Generate a command for: ${description}`;
        const command = await this.makeRequest(query, commandPrompt);
        const cleanCommand = this.cleanCommand(command);

        return {
            command: cleanCommand
        };
    }

    /**
     * Clean up generated command (remove markdown formatting)
     */
    cleanCommand(command) {
        let cleaned = command.trim();
        
        // Remove markdown code blocks
        if (cleaned.startsWith('```')) {
            const lines = cleaned.split('\n');
            cleaned = lines.filter(line => !line.startsWith('```')).join('\n');
        }
        
        return cleaned.trim();
    }
}

/**
 * Parse command line arguments
 */
function parseArgs() {
    const args = process.argv.slice(2);
    const options = {
        message: '',
        help: false
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
            case '-h':
            case '--help':
                options.help = true;
                break;
        }
    }

    return options;
}

/**
 * Show help message
 */
function showHelp() {
    console.log(`
Simple Command Agent - Generate bash commands from natural language

Usage: node command-agent.js -m "your message here"

Options:
  -m, --message <text>    Natural language description (required)
  -h, --help             Show this help message

Environment Variables:
  AI_BASE_URL            AI service base URL
  AI_MODEL_NAME          AI model name (default: gpt-4o)

Examples:
  node command-agent.js -m "List all directories in current folder"
  node command-agent.js -m "Find files larger than 100MB"
  node command-agent.js -m "Create backup of my project"
`);
}

/**
 * Main function
 */
async function main() {
    const options = parseArgs();

    if (options.help || !options.message) {
        showHelp();
        process.exit(options.help ? 0 : 1);
    }

    try {
        const agent = new CommandAgent();
        const response = await agent.generateCommand(options.message);
        
        // Output the command in a format that can be easily used
        console.log(response.command);

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

// Run the main function if this file is executed directly
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { CommandAgent };
