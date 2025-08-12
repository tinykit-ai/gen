# Add this to your ~/.zshrc file for the best experience

# Function that generates command and puts it in your input line
gen() {
    # Check if --help was requested or provider commands
    if [[ "$1" == "--help" || "$1" == "-h" || "$1" == "provider" ]]; then
        # For help and provider commands, just print the output directly
        node /Users/i524143/dimchev/lab/gen/gen-cli.js "$@"
        return
    fi

    local cmd_output
    cmd_output=$(node /Users/i524143/dimchev/lab/gen/gen-cli.js "$@")

    if [[ $? -eq 0 && -n "$cmd_output" && "$cmd_output" != *"Error"* && "$cmd_output" != *"❌"* ]]; then
        # Use print -z to put the command in the zsh input line
        print -z "$cmd_output"
    else
        # If there was an error or verbose output, just print it
        echo "$cmd_output"
    fi
}

# Alternative function for when you want to see the command first
gen_show() {
    node /Users/i524143/dimchev/lab/gen/gen-cli.js "$@"
}

# Function that generates and immediately copies to clipboard
gen_copy() {
    local cmd_output
    cmd_output=$(node /Users/i524143/dimchev/lab/gen/gen-cli.js "$@")
    
    if [[ $? -eq 0 && -n "$cmd_output" && "$cmd_output" != *"Error"* && "$cmd_output" != *"❌"* ]]; then
        echo "$cmd_output" | pbcopy
        echo "Command copied to clipboard: $cmd_output"
    else
        echo "$cmd_output"
    fi
}
