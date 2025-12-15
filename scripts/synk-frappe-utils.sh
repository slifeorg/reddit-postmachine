#!/bin/bash

# Script: sync-reddit-postmachine.sh
# Usage: ./sync-reddit-postmachine.sh [LOCAL_DIRECTORY] [MINUTES] [--full] [--migrate]
# Example: ./sync-reddit-postmachine.sh ../reddit_postmachine 10
# Example: ./sync-reddit-postmachine.sh ../reddit_postmachine --full
# Example: ./sync-reddit-postmachine.sh --full --migrate
# If no directory is provided, defaults to ".."
# If no minutes is provided, defaults to 30
# Use --full flag to sync all files (ignores time filter)
# Use --migrate flag to run bench migrate after sync

# Parse arguments
FULL_SYNC=false
RUN_MIGRATE=false
LOCAL_POSTMACHINE_DIR=""
MINUTES_BACK=""

# Process arguments
for arg in "$@"; do
    case $arg in
        --full)
            FULL_SYNC=true
            shift
            ;;
        --migrate)
            RUN_MIGRATE=true
            shift
            ;;
        *)
            if [ -z "$LOCAL_POSTMACHINE_DIR" ]; then
                LOCAL_POSTMACHINE_DIR="$arg"
            elif [ -z "$MINUTES_BACK" ]; then
                MINUTES_BACK="$arg"
            fi
            shift
            ;;
    esac
done

# Configuration
REMOTE_SERVER="root@32016-51127.bacloud.info"
CONTAINER_NAME="reddit-postmachine-backend-1"  # Using container name
CONTAINER_BASE_PATH="/home/frappe/frappe-bench/apps/reddit_postmachine"
LOCAL_POSTMACHINE_DIR="${LOCAL_POSTMACHINE_DIR:-..}"  # Use argument or default to ".."
MINUTES_BACK="${MINUTES_BACK:-30}"  # Use argument or default to 30 minutes
SITE_NAME="32016-51127.bacloud.info"  # Your site name

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

# Track sync errors
FAILED_FILES=()
SYNC_ERROR_COUNT=0

# Normalize the local directory path to avoid path issues
LOCAL_POSTMACHINE_DIR=$(realpath "$LOCAL_POSTMACHINE_DIR")
LOCAL_POSTMACHINE_DIR_WITH_SLASH="${LOCAL_POSTMACHINE_DIR}/"

# Validate that the local directory exists
if [ ! -d "$LOCAL_POSTMACHINE_DIR" ]; then
    echo -e "${RED}❌ Error: Local directory '$LOCAL_POSTMACHINE_DIR' does not exist!${NC}"
    echo "Usage: $0 [LOCAL_DIRECTORY] [MINUTES] [--full] [--migrate]"
    echo "Example: $0 ../reddit_postmachine 10"
    echo "Example: $0 ../reddit_postmachine --full"
    echo "Example: $0 --full --migrate"
    echo "If no directory is provided, defaults to '..' (parent directory)"
    echo "If no minutes is provided, defaults to 30 minutes"
    echo "Use --full flag to sync all files (ignores time filter)"
    echo "Use --migrate flag to run bench migrate after sync"
    exit 1
fi

# Validate minutes parameter (only if not doing full sync)
if [ "$FULL_SYNC" = false ] && (! [[ "$MINUTES_BACK" =~ ^[0-9]+$ ]] || [ "$MINUTES_BACK" -le 0 ]); then
    echo -e "${RED}❌ Error: Minutes must be a positive integer!${NC}"
    echo "Usage: $0 [LOCAL_DIRECTORY] [MINUTES] [--full] [--migrate]"
    echo "Example: $0 ../reddit_postmachine 10"
    echo "Example: $0 --full"
    exit 1
fi

echo -e "${CYAN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║              REDDIT POSTMACHINE SYNC SCRIPT                  ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}📁 Local directory: ${GREEN}$LOCAL_POSTMACHINE_DIR${NC}"
echo -e "${BLUE}🌐 Remote server: ${GREEN}$REMOTE_SERVER${NC}"
echo -e "${BLUE}🐳 Container name: ${GREEN}$CONTAINER_NAME${NC}"
echo -e "${BLUE}📦 Container path: ${GREEN}$CONTAINER_BASE_PATH${NC}"
echo -e "${BLUE}🌐 Site name: ${GREEN}$SITE_NAME${NC}"
if [ "$FULL_SYNC" = true ]; then
    echo -e "${MAGENTA}🔄 Mode: FULL SYNC (all files)${NC}"
else
    echo -e "${MAGENTA}⏰ Mode: INCREMENTAL SYNC (files modified in the last $MINUTES_BACK minutes)${NC}"
fi
if [ "$RUN_MIGRATE" = true ]; then
    echo -e "${YELLOW}🚀 Will run bench migrate after sync${NC}"
fi
echo ""

# Verify SSH connection
echo -e "${BLUE}🔌 Checking SSH connection to $REMOTE_SERVER...${NC}"
if ! ssh -o ConnectTimeout=5 "$REMOTE_SERVER" "echo 'SSH connection successful'" &> /dev/null; then
    echo -e "${RED}❌ Error: Cannot connect to $REMOTE_SERVER via SSH${NC}"
    echo "Please check your SSH configuration and credentials"
    exit 1
fi
echo -e "${GREEN}✅ SSH connection successful${NC}"

# Verify container exists on remote server
echo -e "${BLUE}🔍 Checking if container exists on remote server...${NC}"
if ! ssh "$REMOTE_SERVER" "docker ps -q --filter 'name=$CONTAINER_NAME'" | grep -q .; then
    echo -e "${RED}❌ Error: Container $CONTAINER_NAME not found on $REMOTE_SERVER${NC}"
    echo -e "${YELLOW}Available containers on remote server:${NC}"
    ssh "$REMOTE_SERVER" "docker ps --format 'table {{.Names}}\t{{.Status}}'"
    exit 1
fi
echo -e "${GREEN}✅ Container $CONTAINER_NAME found${NC}"

# Function to get relative path safely
get_relative_path() {
    local file="$1"
    local relative_path=""

    # Check if file starts with our directory path
    if [[ "$file" == "$LOCAL_POSTMACHINE_DIR_WITH_SLASH"* ]]; then
        relative_path="${file#$LOCAL_POSTMACHINE_DIR_WITH_SLASH}"
    elif [[ "$file" == "$LOCAL_POSTMACHINE_DIR" ]]; then
        relative_path=""
    else
        # Fallback: use basename if path doesn't match expected pattern
        relative_path=$(basename "$file")
    fi

    echo "$relative_path"
}

# Function to check if a file should be excluded
should_exclude_file() {
    local file="$1"
    local relative_path=$(get_relative_path "$file")

    # Skip if file starts with dot (hidden files)
    if [[ "$relative_path" == .* ]]; then
        return 0
    fi

    # Common directories and files to exclude
    local exclude_patterns=(
        "*.md"
        "*.txt"
        ".git/*"
        ".idea/*"
        ".vscode/*"
        ".vs/*"
        "node_modules/*"
        "__pycache__/*"
        ".pytest_cache/*"
        ".mypy_cache/*"
        ".tox/*"
        "venv/*"
        "env/*"
        ".env/*"
        "dist/*"
        "build/*"
        "*.egg-info/*"
        ".DS_Store"
        "Thumbs.db"
        "*.pyc"
        "*.pyo"
        "*.pyd"
        "*.so"
        "*.dylib"
        "*.dll"
        "*.log"
        "*.tmp"
        "*.temp"
        "*.swp"
        "*.swo"
        "*~"
        "*.bak"
        "*.orig"
        ".coverage"
        "coverage.xml"
        "*.lcov"
        ".nyc_output/*"
        "*.min.js"
        "*.min.css"
        "*.map"
    )

    # Check against exclude patterns
    for pattern in "${exclude_patterns[@]}"; do
        if [[ "$relative_path" == $pattern ]]; then
            return 0
        fi
    done

    return 1
}

# Function to check gitignore
is_gitignored() {
    local file="$1"
    local git_dir="$LOCAL_POSTMACHINE_DIR"

    # Check if we're in a git repository
    if [ -d "$git_dir/.git" ] || git -C "$git_dir" rev-parse --git-dir >/dev/null 2>&1; then
        # Use git check-ignore to see if file should be ignored
        if git -C "$git_dir" check-ignore "$file" >/dev/null 2>&1; then
            return 0
        fi
    fi

    return 1
}

# Find files based on sync mode
if [ "$FULL_SYNC" = true ]; then
    echo -e "${BLUE}🔍 Finding all files in: $LOCAL_POSTMACHINE_DIR${NC}"
    ALL_MODIFIED_FILES=$(find "$LOCAL_POSTMACHINE_DIR" -type f 2>/dev/null)
else
    echo -e "${BLUE}🔍 Finding files modified in the last $MINUTES_BACK minutes in: $LOCAL_POSTMACHINE_DIR${NC}"
    ALL_MODIFIED_FILES=$(find "$LOCAL_POSTMACHINE_DIR" -type f -mmin -"$MINUTES_BACK" 2>/dev/null)
fi

# Filter out excluded files
MODIFIED_FILES=""
while IFS= read -r file; do
    if [ -n "$file" ] && [ -f "$file" ]; then
        if should_exclude_file "$file"; then
            echo -e "${YELLOW}🚫 Excluding: $(get_relative_path "$file") (common exclude pattern)${NC}"
            continue
        fi

        if is_gitignored "$file"; then
            echo -e "${YELLOW}🚫 Excluding: $(get_relative_path "$file") (gitignored)${NC}"
            continue
        fi

        if [ -z "$MODIFIED_FILES" ]; then
            MODIFIED_FILES="$file"
        else
            MODIFIED_FILES="$MODIFIED_FILES"$'\n'"$file"
        fi
    fi
done <<< "$ALL_MODIFIED_FILES"

if [ -z "$MODIFIED_FILES" ]; then
    if [ "$FULL_SYNC" = true ]; then
        echo -e "${YELLOW}ℹ️  No syncable files found in $LOCAL_POSTMACHINE_DIR${NC}"
    else
        echo -e "${YELLOW}ℹ️  No syncable files modified in the last $MINUTES_BACK minutes found in $LOCAL_POSTMACHINE_DIR${NC}"
    fi
    echo -e "${YELLOW}    (excluded common development files, cache, and gitignored files)${NC}"
    exit 0
fi

# Analyze changes before syncing
echo -e "${CYAN}📊 Analyzing changes before sync...${NC}"
HAS_DOCTYPE_CHANGES=false
HAS_PYTHON_CHANGES=false
HAS_JS_CSS_CHANGES=false
HAS_REQUIREMENTS_CHANGES=false
HAS_HOOKS_CHANGES=false
HAS_TEMPLATE_CHANGES=false
HAS_CONFIG_CHANGES=false

while IFS= read -r file; do
    relative_path=$(get_relative_path "$file")
    
    if [[ "$relative_path" == *"doctype/"* && ("$relative_path" == *.json || "$relative_path" == *.py) ]]; then
        HAS_DOCTYPE_CHANGES=true
    fi
    
    if [[ "$relative_path" == *.py && ! "$relative_path" == *"__pycache__"* ]]; then
        HAS_PYTHON_CHANGES=true
    fi
    
    if [[ "$relative_path" == *".js" || "$relative_path" == *".css" || "$relative_path" == *".scss" ]]; then
        HAS_JS_CSS_CHANGES=true
    fi
    
    if [[ "$relative_path" == *"requirements.txt" || "$relative_path" == *"pyproject.toml" ]]; then
        HAS_REQUIREMENTS_CHANGES=true
    fi
    
    if [[ "$relative_path" == *"hooks.py" ]]; then
        HAS_HOOKS_CHANGES=true
    fi
    
    if [[ "$relative_path" == *".html" || "$relative_path" == *".jinja" ]]; then
        HAS_TEMPLATE_CHANGES=true
    fi
    
    if [[ "$relative_path" == *"config/"* || "$relative_path" == *"common_site_config.json" ]]; then
        HAS_CONFIG_CHANGES=true
    fi
done <<< "$MODIFIED_FILES"

echo -e "${GREEN}📝 Found $(echo "$MODIFIED_FILES" | wc -l) syncable modified files${NC}"
echo ""

# Display analysis results
echo -e "${CYAN}📋 Change analysis:${NC}"
if [ "$HAS_DOCTYPE_CHANGES" = true ]; then
    echo -e "  • ${MAGENTA}📊 Doctype changes (JSON/PY files in doctype/)${NC}"
fi
if [ "$HAS_PYTHON_CHANGES" = true ]; then
    echo -e "  • ${GREEN}🐍 Python code changes${NC}"
fi
if [ "$HAS_JS_CSS_CHANGES" = true ]; then
    echo -e "  • ${BLUE}🎨 JS/CSS/SCSS changes${NC}"
fi
if [ "$HAS_TEMPLATE_CHANGES" = true ]; then
    echo -e "  • ${CYAN}📄 HTML/Jinja template changes${NC}"
fi
if [ "$HAS_HOOKS_CHANGES" = true ]; then
    echo -e "  • ${YELLOW}⚓ Hooks.py changes${NC}"
fi
if [ "$HAS_CONFIG_CHANGES" = true ]; then
    echo -e "  • ${RED}⚙️  Configuration changes${NC}"
fi
if [ "$HAS_REQUIREMENTS_CHANGES" = true ]; then
    echo -e "  • ${RED}📦 Dependency changes (requires container rebuild)${NC}"
fi

# Warn about special cases
if [ "$HAS_REQUIREMENTS_CHANGES" = true ]; then
    echo ""
    echo -e "${RED}⚠️  WARNING: Dependency changes detected!${NC}"
    echo -e "${YELLOW}Files modified: requirements.txt or pyproject.toml${NC}"
    echo -e "${YELLOW}These changes require Docker container rebuild, not just sync.${NC}"
    echo ""
    read -p "Continue with sync anyway? (y/n): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}Sync cancelled. Please rebuild container manually.${NC}"
        exit 0
    fi
fi

if [ "$HAS_CONFIG_CHANGES" = true ]; then
    echo ""
    echo -e "${YELLOW}⚠️  Configuration changes detected.${NC}"
    echo -e "${YELLOW}Some config changes may require container restart.${NC}"
fi

# Ask about migrations if not specified and doctype changes detected
if [ "$HAS_DOCTYPE_CHANGES" = true ] && [ "$RUN_MIGRATE" = false ]; then
    echo ""
    echo -e "${MAGENTA}📊 Doctype changes detected!${NC}"
    read -p "Do you want to run bench migrate? (y/n): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        RUN_MIGRATE=true
        echo -e "${GREEN}✅ Migrations will be executed after sync${NC}"
    else
        echo -e "${YELLOW}⚠️  Skipping migrations. Database schema may be outdated.${NC}"
    fi
fi

# Create base directory in container if it doesn't exist
echo -e "${BLUE}📁 Ensuring base directory exists in container...${NC}"
ssh "$REMOTE_SERVER" "docker exec '$CONTAINER_NAME' mkdir -p '$CONTAINER_BASE_PATH'"

# Sync each modified file
echo -e "${BLUE}🚀 Syncing modified files to container...${NC}"
SYNCED_COUNT=0
TOTAL_FILES=$(echo "$MODIFIED_FILES" | wc -l)
CURRENT_FILE=0

while IFS= read -r file; do
    if [ -f "$file" ]; then
        CURRENT_FILE=$((CURRENT_FILE + 1))
        
        # Get relative path from the specified directory using our safe function
        RELATIVE_PATH=$(get_relative_path "$file")
        CONTAINER_FILE_PATH="$CONTAINER_BASE_PATH/$RELATIVE_PATH"
        CONTAINER_DIR_PATH=$(dirname "$CONTAINER_FILE_PATH")

        echo -e "${CYAN}[$CURRENT_FILE/$TOTAL_FILES] 📤 Syncing: $RELATIVE_PATH${NC}"

        # Create directory structure in container
        ssh "$REMOTE_SERVER" "docker exec '$CONTAINER_NAME' mkdir -p '$CONTAINER_DIR_PATH'" 2>/dev/null
        if [ $? -ne 0 ]; then
            echo -e "${RED}  ❌ Failed to create directory structure for $RELATIVE_PATH${NC}"
            FAILED_FILES+=("$RELATIVE_PATH (directory creation failed)")
            ((SYNC_ERROR_COUNT++))
            continue
        fi

        # Copy file to container using SSH and docker cp
        if cat "$file" | ssh "$REMOTE_SERVER" "docker exec -i '$CONTAINER_NAME' sh -c 'cat > \"$CONTAINER_FILE_PATH\"'" 2>/dev/null; then
            echo -e "${GREEN}  ✅ Successfully synced${NC}"
            ((SYNCED_COUNT++))
        else
            echo -e "${RED}  ❌ Failed to sync $RELATIVE_PATH${NC}"
            FAILED_FILES+=("$RELATIVE_PATH")
            ((SYNC_ERROR_COUNT++))
        fi
    fi
done <<< "$MODIFIED_FILES"

# Clear Python cache in the container to prevent stale bytecode
echo ""
echo -e "${BLUE}🧹 Clearing Python cache in container...${NC}"

# Define the path to reddit_postmachine in the container
POSTMACHINE_PATH="$CONTAINER_BASE_PATH/reddit_postmachine"

# Remove __pycache__ directories
echo -e "${BLUE}  Removing __pycache__ directories...${NC}"
ssh "$REMOTE_SERVER" "docker exec '$CONTAINER_NAME' find '$POSTMACHINE_PATH' -type d -name '__pycache__' -exec rm -rf {} + 2>/dev/null"
if [ $? -eq 0 ]; then
    echo -e "${GREEN}  ✅ Cleared __pycache__ directories${NC}"
else
    echo -e "${YELLOW}  ⚠️  Could not clear __pycache__ directories (may not exist)${NC}"
fi

# Remove .pyc files
echo -e "${BLUE}  Removing .pyc files...${NC}"
ssh "$REMOTE_SERVER" "docker exec '$CONTAINER_NAME' find '$POSTMACHINE_PATH' -type f -name '*.pyc' -delete 2>/dev/null"
if [ $? -eq 0 ]; then
    echo -e "${GREEN}  ✅ Cleared .pyc files${NC}"
else
    echo -e "${YELLOW}  ⚠️  Could not clear .pyc files (may not exist)${NC}"
fi

# Apply Frappe/ERPNext specific actions
echo ""
echo -e "${CYAN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║                APPLYING FRAPPE UPDATES                      ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# 1. Always clear cache
echo -e "${BLUE}1. Clearing cache...${NC}"
if ssh "$REMOTE_SERVER" "docker exec '$CONTAINER_NAME' bench --site '$SITE_NAME' clear-cache" 2>/dev/null; then
    echo -e "${GREEN}   ✅ Cache cleared${NC}"
else
    echo -e "${YELLOW}   ⚠️  Could not clear cache${NC}"
fi

# 2. Build assets if JS/CSS files were modified
if [ "$HAS_JS_CSS_CHANGES" = true ]; then
    echo -e "${BLUE}2. Building assets (JS/CSS files modified)...${NC}"
    if ssh "$REMOTE_SERVER" "docker exec '$CONTAINER_NAME' bench --site '$SITE_NAME' build" 2>/dev/null; then
        echo -e "${GREEN}   ✅ Assets built${NC}"
    else
        echo -e "${YELLOW}   ⚠️  Could not build assets${NC}"
    fi
fi

# 3. Run migrations if needed
if [ "$RUN_MIGRATE" = true ]; then
    echo -e "${BLUE}3. Running migrations...${NC}"
    if ssh "$REMOTE_SERVER" "docker exec '$CONTAINER_NAME' bench --site '$SITE_NAME' migrate" 2>/dev/null; then
        echo -e "${GREEN}   ✅ Migrations completed${NC}"
    else
        echo -e "${RED}   ❌ Migration failed! Check logs for details${NC}"
    fi
fi

# 4. Restart bench services (always do this for Python/template changes)
if [ "$HAS_PYTHON_CHANGES" = true ] || [ "$HAS_TEMPLATE_CHANGES" = true ] || [ "$HAS_HOOKS_CHANGES" = true ]; then
    echo -e "${BLUE}4. Restarting bench services...${NC}"
    if ssh "$REMOTE_SERVER" "docker exec '$CONTAINER_NAME' bench restart" 2>/dev/null; then
        echo -e "${GREEN}   ✅ Bench services restarted${NC}"
        sleep 2  # Give services time to start
    else
        echo -e "${YELLOW}   ⚠️  Could not restart bench services${NC}"
    fi
fi

# 5. Warm up the site
echo -e "${BLUE}5. Warming up site...${NC}"
if ssh "$REMOTE_SERVER" "docker exec '$CONTAINER_NAME' bench --site '$SITE_NAME' warm-up-site" 2>/dev/null; then
    echo -e "${GREEN}   ✅ Site warmed up${NC}"
else
    # Fallback to simple curl request
    echo -e "${YELLOW}   ⚠️  Warming up via curl...${NC}"
    ssh "$REMOTE_SERVER" "curl -s -o /dev/null -w 'HTTP Status: %{http_code}' https://$SITE_NAME || curl -s -o /dev/null -w 'HTTP Status: %{http_code}' http://$SITE_NAME || true"
    echo ""
fi

echo ""
echo -e "${CYAN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║                     SYNC COMPLETE                            ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

if [ "$FULL_SYNC" = true ]; then
    echo -e "${GREEN}🎉 Full sync complete! Synced $SYNCED_COUNT files${NC}"
else
    echo -e "${GREEN}🎉 Incremental sync complete! Synced $SYNCED_COUNT files${NC}"
fi

# Display website URL
echo ""
echo -e "${CYAN}🌐 Your website is ready at:${NC}"
echo -e "${GREEN}  https://$SITE_NAME${NC}"
echo -e "${GREEN}  http://$SITE_NAME${NC}"
echo ""

# Quick actions menu
echo -e "${CYAN}📋 Quick actions:${NC}"
echo -e "${BLUE}  1.${NC} Open in browser: ${GREEN}open https://$SITE_NAME${NC}"
echo -e "${BLUE}  2.${NC} Check logs: ${GREEN}ssh $REMOTE_SERVER 'docker logs $CONTAINER_NAME --tail 50'${NC}"
echo -e "${BLUE}  3.${NC} View bench status: ${GREEN}ssh $REMOTE_SERVER 'docker exec $CONTAINER_NAME bench status'${NC}"
echo -e "${BLUE}  4.${NC} Enter container shell: ${GREEN}ssh $REMOTE_SERVER 'docker exec -it $CONTAINER_NAME bash'${NC}"
echo -e "${BLUE}  5.${NC} View site logs: ${GREEN}ssh $REMOTE_SERVER 'docker exec $CONTAINER_NAME bench --site $SITE_NAME logs'${NC}"
echo ""

# Report any sync errors
if [ $SYNC_ERROR_COUNT -gt 0 ]; then
    echo -e "${RED}⚠️  SYNC ERRORS DETECTED: $SYNC_ERROR_COUNT file(s) failed to sync${NC}"
    echo -e "${RED}Failed files:${NC}"
    for failed_file in "${FAILED_FILES[@]}"; do
        echo -e "  • $failed_file"
    done
    echo ""
    echo -e "${YELLOW}Please check the errors above and retry the sync if needed.${NC}"
    exit 1
else
    echo -e "${GREEN}✅ All files synced successfully with no errors${NC}"
    echo -e "${GREEN}✅ Changes should now be visible on your website${NC}"
    
    # Ask if user wants to open the website
    echo ""
    read -p "Do you want to open the website in your browser now? (y/n): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        if command -v open &> /dev/null; then
            # macOS
            open "https://$SITE_NAME"
            echo -e "${GREEN}✅ Browser opened!${NC}"
        elif command -v xdg-open &> /dev/null; then
            # Linux
            xdg-open "https://$SITE_NAME"
            echo -e "${GREEN}✅ Browser opened!${NC}"
        elif command -v start &> /dev/null; then
            # Windows (WSL)
            start "https://$SITE_NAME"
            echo -e "${GREEN}✅ Browser opened!${NC}"
        else
            echo -e "${YELLOW}⚠️  Could not open browser automatically${NC}"
            echo -e "${GREEN}Please visit: https://$SITE_NAME${NC}"
        fi
    fi
    
    echo ""
    echo -e "${CYAN}🔄 Next steps:${NC}"
    echo -e "  1. Refresh your browser (F5 or Ctrl+R)"
    echo -e "  2. Clear browser cache if changes not visible (Ctrl+Shift+R)"
    echo -e "  3. Test your changes on the website"
    echo ""
    echo -e "${GREEN}✅ Sync process completed successfully!${NC}"
    
    exit 0
fi