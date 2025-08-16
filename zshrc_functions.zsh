# GEN_CONFIG_START
# Function that generates command and puts it in your input line
gen() {
    # Check if --help was requested or provider commands
    if [[ "$1" == "--help" || "$1" == "-h" || "$1" == "provider" ]]; then
        # For help and provider commands, just print the output directly
        command gen "$@"
        return
    fi

    local cmd_output
    cmd_output=$(command gen "$@")

    if [[ $? -eq 0 && -n "$cmd_output" && "$cmd_output" != *"Error"* && "$cmd_output" != *"❌"* ]]; then
        # Use print -z to put the command in the zsh input line
        print -z "$cmd_output"
    else
        # If there was an error or verbose output, just print it
        echo "$cmd_output"
    fi
}
# GEN_CONFIG_END