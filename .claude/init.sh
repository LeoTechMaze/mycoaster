#!/bin/bash
echo "=== MyCoaster Dev Session ==="
echo "Branch : $(git branch --show-current 2>/dev/null || echo 'unknown')"
echo "Commit : $(git log --oneline -1 2>/dev/null || echo 'no commits')"
echo ""

if [ -f .claude/progress.md ]; then
  FEATURE=$(grep '^Feature:' .claude/progress.md | sed 's/Feature: //' | sed 's/<!--.*-->//' | xargs)
  PLAN=$(grep '^Active plan:' .claude/progress.md | sed 's/Active plan: //' | sed 's/<!--.*-->//' | xargs)
  if [ -n "$FEATURE" ] && [ "$FEATURE" != "" ]; then
    echo "--- Active Feature ---"
    echo "Feature : $FEATURE"
    echo "Plan    : $PLAN"
    echo ""
    grep -A 20 '## In Progress' .claude/progress.md | head -10
    echo "----------------------"
  else
    echo "No active feature. Start with /planner to plan a new feature."
  fi
else
  echo "No progress.md found. Start with /planner to plan a new feature."
fi
