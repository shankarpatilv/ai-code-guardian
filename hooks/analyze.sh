#!/bin/bash

# AI Code Guardian - Hook Analysis Script
# This script is called by Claude Code hooks to analyze AI-generated code in real-time

set -euo pipefail

# Default values
TOOL_NAME=""
FILE_PATH=""
TOOL_OUTPUT=""
DEBUG_MODE=${GUARDIAN_DEBUG:-false}
GUARDIAN_ROOT=${GUARDIAN_ROOT:-$(dirname "$(dirname "$(realpath "$0")")")}

# Color codes for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    local level="$1"
    local message="$2"
    
    if [[ "$DEBUG_MODE" == "true" ]]; then
        echo "[GUARDIAN-$level] $message" >&2
    fi
}

# Error handling
error_exit() {
    echo -e "${RED}[ERROR] $1${NC}" >&2
    exit 1
}

# Parse command line arguments with input validation
while [[ $# -gt 0 ]]; do
    case $1 in
        --tool)
            # Sanitize tool name - only allow alphanumeric and common punctuation
            TOOL_NAME=$(printf '%s' "$2" | sed 's/[^a-zA-Z0-9_-]//g')
            shift 2
            ;;
        --file)
            # Sanitize file path - remove dangerous characters but keep path separators
            FILE_PATH=$(printf '%s' "$2" | sed 's/[;<>&|`$]//g')
            shift 2
            ;;
        --content)
            # Content will be handled safely through printf later
            TOOL_OUTPUT="$2"
            shift 2
            ;;
        *)
            error_exit "Unknown parameter: $1"
            ;;
    esac
done

# Validate required parameters
[[ -z "$TOOL_NAME" ]] && error_exit "Tool name is required (--tool)"
[[ -z "$FILE_PATH" ]] && error_exit "File path is required (--file)"

log "INFO" "Processing hook: tool=$TOOL_NAME, file=$FILE_PATH"

# For debug mode, output processing info
if [[ "$DEBUG_MODE" == "true" ]]; then
    echo "[GUARDIAN-INFO] Processing hook: tool=$TOOL_NAME, file=$FILE_PATH" >&2
fi

# Determine language from file extension
detect_language() {
    local filepath="$1"
    case "${filepath##*.}" in
        js|jsx) echo "javascript" ;;
        ts|tsx) echo "typescript" ;;
        py) echo "python" ;;
        go) echo "go" ;;
        rs) echo "rust" ;;
        java) echo "java" ;;
        php) echo "php" ;;
        rb) echo "ruby" ;;
        cpp|cc|cxx) echo "cpp" ;;
        c|h) echo "c" ;;
        cs) echo "csharp" ;;
        sh|bash) echo "shell" ;;
        *) echo "unknown" ;;
    esac
}

# Extract code content based on tool type
extract_code_content() {
    local tool="$1"
    local output="$2"
    local filepath="$3"
    
    case "$tool" in
        "Write")
            # For Write operations, try to read the actual file content
            if [[ -f "$filepath" && -r "$filepath" ]]; then
                cat "$filepath"
            else
                log "WARN" "Cannot read file $filepath for Write operation"
                # If content was provided via --content, use that
                if [[ -n "$output" ]]; then
                    echo "$output"
                else
                    echo ""
                fi
            fi
            ;;
        "Edit"|"MultiEdit")
            # For Edit operations, we'd need to parse the tool output JSON
            # For now, just return the output as-is
            echo "$output"
            ;;
        *)
            echo "Unknown tool type: $tool" >&2
            log "WARN" "Unknown tool type: $tool"
            echo "$output"
            ;;
    esac
}

# Main analysis logic
analyze_code() {
    local language="$1"
    local content="$2"
    local filepath="$3"
    
    # Skip analysis for empty content
    if [[ -z "$content" || "$content" =~ ^[[:space:]]*$ ]]; then
        log "INFO" "Skipping analysis: empty content"
        return 0
    fi
    
    # Check if Node.js analyzer exists
    local analyzer_path="${GUARDIAN_ROOT}/dist/cli.js"
    
    if [[ -f "$analyzer_path" && -n "${GUARDIAN_ROOT}" ]]; then
        # Call the TypeScript analyzer with proper input sanitization
        log "INFO" "Calling TypeScript analyzer"
        # Use printf instead of echo and sanitize content to prevent command injection
        printf '%s' "$content" | node -- "$analyzer_path" analyze \
            --language "$language" \
            --file "$filepath" \
            --stdin \
            --format json 2>/dev/null || {
            log "ERROR" "TypeScript analyzer failed, falling back to shell analysis"
            basic_analysis "$content" "$language" "$filepath"
            return 0
        }
    else
        # Fallback: basic shell-based analysis
        log "INFO" "Using fallback shell analysis"
        basic_analysis "$content" "$language" "$filepath"
    fi
}

# Basic shell-based analysis (fallback)
basic_analysis() {
    local content="$1"
    local language="$2"
    local filepath="$3"
    
    local issues=0
    
    # Check for obvious security issues
    if echo "$content" | grep -qE "(eval\s*\(|exec\s*\(|document\.write|innerHTML.*=)"; then
        echo "⚠️  SECURITY: Potential XSS vulnerability detected" >&2
        issues=$((issues + 1))
    fi
    
    if echo "$content" | grep -qE "(SELECT.*FROM.*WHERE|INSERT.*INTO|UPDATE.*SET).*(\+|\$\{|\$\()"; then
        echo "⚠️  SECURITY: Potential SQL injection detected" >&2
        issues=$((issues + 1))
    fi
    
    if echo "$content" | grep -qE "(password|secret|key|token).*=.*['\"][a-zA-Z0-9]{8,}"; then
        echo "⚠️  SECURITY: Potential hardcoded secret detected" >&2
        issues=$((issues + 1))
    fi
    
    # Basic quality checks
    local line_count
    line_count=$(echo "$content" | wc -l)
    if [[ $line_count -gt 100 ]]; then
        echo "ℹ️  QUALITY: Large function detected ($line_count lines)" >&2
        issues=$((issues + 1))
    fi
    
    # Check for TODO/FIXME comments
    if echo "$content" | grep -qE "(TODO|FIXME|XXX|HACK)"; then
        echo "ℹ️  INFO: TODO/FIXME comments found" >&2
    fi
    
    if [[ $issues -eq 0 ]]; then
        echo "✅ No issues detected" >&2
    else
        echo "📊 Found $issues potential issues" >&2
    fi
    
    return 0
}

# Main execution
main() {
    local language
    local content
    
    language=$(detect_language "$FILE_PATH")
    content=$(extract_code_content "$TOOL_NAME" "$TOOL_OUTPUT" "$FILE_PATH")
    
    # Output language detection for tests
    if [[ "$DEBUG_MODE" == "true" ]]; then
        echo "[GUARDIAN-INFO] Detected language: $language" >&2
    fi
    
    log "INFO" "Detected language: $language"
    log "INFO" "Content length: ${#content} characters"
    
    # Perform analysis
    if ! analyze_code "$language" "$content" "$FILE_PATH"; then
        log "ERROR" "Analysis failed"
        return 1
    fi
    
    log "INFO" "Analysis completed successfully"
    return 0
}

# Run main function
main "$@"