#!/bin/bash
# Sweep masivo: 4 mayo → 11 mayo
# El programa Reboot 30 se movió del 4 mayo al 11 mayo 2026
set -u
cd "$(dirname "$0")"

# Patrones a reemplazar (literal → reemplazo)
declare -a PATTERNS=(
  "4 de mayo:11 de mayo"
  "4 de Mayo:11 de Mayo"
  "4 DE MAYO:11 DE MAYO"
  "4 MAYO 2026:11 MAYO 2026"
  "4 MAYO:11 MAYO"
  "4·MAYO:11·MAYO"
  "4 · MAYO:11 · MAYO"
  "4 mayo 2026:11 mayo 2026"
  "Lunes 4 de mayo:Lunes 11 de mayo"
  "lunes 4 de mayo:lunes 11 de mayo"
  "2026-05-04:2026-05-11"
  "May 4, 2026:May 11, 2026"
)

# Archivos a procesar (excluyendo carpetas de Semáforo que podrían tener otra fecha)
FILES=$(grep -rl "4 de mayo\|4 de Mayo\|4 MAYO\|4·MAYO\|4 · MAYO\|2026-05-04\|Lunes 4 de mayo\|lunes 4 de mayo" \
  --include="*.html" --include="*.json" --include="*.py" --include="*.js" --include="*.md" \
  --exclude-dir=node_modules \
  --exclude-dir=.git \
  --exclude-dir=semaforo \
  . 2>/dev/null)

CHANGED_FILES=0
TOTAL_REPLACEMENTS=0

for file in $FILES; do
  echo "Processing: $file"
  file_changed=0
  for pattern in "${PATTERNS[@]}"; do
    from="${pattern%%:*}"
    to="${pattern##*:}"
    # Use sed -i with backup empty (macOS)
    if grep -q "$from" "$file" 2>/dev/null; then
      count=$(grep -c "$from" "$file" 2>/dev/null || echo 0)
      sed -i '' "s|$from|$to|g" "$file"
      TOTAL_REPLACEMENTS=$((TOTAL_REPLACEMENTS + count))
      file_changed=1
    fi
  done
  if [ "$file_changed" -eq 1 ]; then
    CHANGED_FILES=$((CHANGED_FILES + 1))
  fi
done

echo ""
echo "=== Done ==="
echo "Files changed: $CHANGED_FILES"
echo "Total replacements: $TOTAL_REPLACEMENTS"
