#!/bin/bash
# Regenera 5 fotos según referencias de Marle (29 abr)
set -u
DEST="$(dirname "$0")/fotos"
LOGS="$(dirname "$0")/regen-marle-29abr.log"
echo "=== Regen Marle 29 abr $(date) ===" > "$LOGS"

# Prompts ultra específicos basados en las referencias visuales que mandó Marle
RECIPES=(
  "tostada-hummus-champinones|two slices of toasted whole grain dark sourdough bread topped with creamy white hummus spread, fresh spinach leaves layered, sauteed brown mushrooms with herbs scattered on top, served on white round plate, checkered linen napkin in background, soft natural light, gourmet food photography close-up shot|1001"
  "aguacate-relleno-atun|half avocado opened with light tuna flakes filled inside topped with diced cucumber red tomato red onion fresh chopped parsley sprinkled with black pepper and herbs, served on white plate, lemon wedge blurred in background, vibrant colorful close-up macro food photography|1002"
  "tofu-revuelto-tostada|scrambled yellow turmeric tofu with green diced avocado pieces visible served on slice of toasted whole grain dark sourdough bread topped with fresh cilantro and parsley garnish, served on grey ceramic plate, rustic wooden table, professional food photography|1003"
  "lomo-res-pure-coliflor|thick grilled beef tenderloin steak with deep crosshatch grill marks topped with fresh thyme sprigs sitting on top of creamy white cauliflower mash puree, drizzle of brown demi-glace sauce around the plate edge, garnished with fresh parsley, white plate, elegant restaurant style food photography|1004"
  "pechuga-rellena-queso-espinaca-zanahoria|baked chicken breast cut in half showing oozing melted white cheese mixed with cooked spinach inside the filling, golden brown crust, served on white plate with cherry tomatoes blurred in background, professional food photography close-up shot|1005"
)

for entry in "${RECIPES[@]}"; do
  IFS='|' read -r slug prompt seed <<< "$entry"
  out="$DEST/${slug}.jpg"
  rm -f "$out"

  encoded=$(python3 -c "import urllib.parse, sys; print(urllib.parse.quote(sys.argv[1]))" "$prompt")
  url="https://image.pollinations.ai/prompt/${encoded}?width=1200&height=750&seed=${seed}&nologo=true&model=flux"

  echo "Regenerating: $slug (seed=$seed)" | tee -a "$LOGS"
  for attempt in 1 2 3; do
    curl -sS --max-time 120 -o "$out" "$url"
    size=$(stat -f%z "$out" 2>/dev/null || stat -c%s "$out" 2>/dev/null || echo 0)
    if [ "$size" -gt 10000 ]; then
      echo "  OK (${size})" | tee -a "$LOGS"
      sips -Z 1600 --setProperty formatOptions high "$out" --out "$out" > /dev/null 2>&1
      break
    fi
    sleep 3
    if [ "$attempt" -eq 3 ]; then
      echo "  FAILED" | tee -a "$LOGS"
      rm -f "$out"
    fi
  done
  sleep 4
done

echo "=== Done $(date) ===" | tee -a "$LOGS"
