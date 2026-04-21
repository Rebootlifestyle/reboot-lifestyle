#!/bin/bash
# Photos for week 2 recipes
set -u
DEST="$(dirname "$0")/fotos"
LOGS="$(dirname "$0")/gen-photos-w2.log"
mkdir -p "$DEST"
echo "=== W2 generation started $(date) ===" > "$LOGS"

RECIPES=(
  "omelette-caprese|italian caprese omelette folded in half with cherry tomatoes fresh mozzarella cubes basil leaves oregano on white ceramic plate natural window light|101"
  "pollo-espinacas-crema-coliflor|chicken breast fillet with creamed spinach coconut sauce next to cauliflower mash puree on white plate garnished with fresh herbs natural lunch light|102"
  "wrap-lechuga-lomo-res|lettuce leaf wraps filled with sauteed beef tenderloin strips red bell pepper red onion cilantro on white plate asian style natural light|103"
  "waffles-huevos-poche|oat flour waffles topped with two poached eggs runny yolk fresh chives avocado slices on white plate brunch natural light|104"
  "berenjenas-rellenas-carne|baked eggplant halves stuffed with ground beef melted mozzarella cheese tomato sauce parsley on baking tray rustic natural light|105"
  "ensalada-cesar-pollo|caesar salad with grilled chicken strips romaine lettuce shaved parmesan yogurt dressing no croutons on white plate natural dinner light|106"
  "huevos-cremosos-tostada-avena|creamy soft scrambled eggs french style on oat bread toast with fresh chives cracked black pepper white plate morning natural light|107"
  "poke-bowl-salmon|hawaiian poke bowl with cubed raw salmon cauliflower rice avocado cucumber edamame sesame seeds nori seaweed on wooden surface top-down|108"
  "pasta-zucchini-bolognesa|zucchini noodles zoodles topped with beef bolognese tomato sauce fresh basil parmesan cheese on white plate italian natural light|109"
  "pancakes-fresas|stack of almond flour pancakes topped with fresh sliced strawberries cinnamon on white plate morning natural light wooden table|110"
  "pollo-ajillo-calabaza|garlic chicken pieces spanish style with fresh green salad and creamy butternut squash puree on white plate natural lunch light|111"
  "ensalada-atun|tuna salad bowl with mixed greens cherry tomatoes avocado kalamata olives hard boiled egg olive oil lemon natural light large white bowl|112"
  "muffins-huevo-aguacate|savory egg muffins baked in silicone cups with spinach bell pepper feta cheese served with sliced avocado on wooden board natural light|113"
  "pimiento-relleno-carne|baked red bell peppers stuffed with ground beef tomato sauce served next to creamy vegetable soup in white bowl natural light|114"
  "pizza-pollo-champinones|cauliflower crust pizza topped with shredded chicken mushrooms mozzarella tomato sauce fresh basil on wooden board rustic natural light|115"
  "avena-trasnochada-yogurt-frutos-rojos|overnight oats in glass mason jar with greek yogurt fresh berries strawberries blueberries almond butter chia seeds morning light top-down|116"
  "quinoa-pollo-vegetales|bowl with quinoa grilled chicken pieces roasted colorful vegetables broccoli bell peppers carrots on white plate natural lunch light|117"
  "ceviche-pescado|fresh peruvian style fish ceviche with lime red onion cilantro sweet potato avocado in glass bowl vibrant natural dinner light|118"
  "arepa-zanahoria-huevos-aguacate|orange carrot arepa bread split open with scrambled eggs avocado slices cilantro on white plate sunday brunch natural light|119"
  "frijoles-carne|black beans stew with ground beef tomato sauce bell peppers served in ceramic bowl with cilantro avocado slices lime wedge on wooden table|120"
  "carne-asada-vegetales-horneados|sliced grilled beef skirt steak with roasted vegetables zucchini bell peppers mushrooms onions on white plate natural dinner light|121"
)

COUNT=${#RECIPES[@]}
OK=0
FAIL=0

for i in "${!RECIPES[@]}"; do
  IFS='|' read -r slug prompt seed <<< "${RECIPES[$i]}"
  out="$DEST/${slug}.jpg"

  if [ -f "$out" ] && [ "$(stat -f%z "$out" 2>/dev/null || stat -c%s "$out")" -gt 10000 ]; then
    echo "SKIP: $slug" | tee -a "$LOGS"
    OK=$((OK+1)); continue
  fi

  encoded=$(python3 -c "import urllib.parse, sys; print(urllib.parse.quote(sys.argv[1]))" "$prompt")
  url="https://image.pollinations.ai/prompt/${encoded}?width=1200&height=750&seed=${seed}&nologo=true&model=flux"

  echo "[$((i+1))/${COUNT}] $slug (seed=$seed)..." | tee -a "$LOGS"

  for attempt in 1 2 3; do
    curl -sS --max-time 90 -o "$out" "$url"
    size=$(stat -f%z "$out" 2>/dev/null || stat -c%s "$out" 2>/dev/null || echo 0)
    if [ "$size" -gt 10000 ]; then
      echo "  OK (${size} bytes)" | tee -a "$LOGS"
      OK=$((OK+1)); break
    fi
    echo "  attempt $attempt small, retrying..." | tee -a "$LOGS"
    sleep 3
    if [ "$attempt" -eq 3 ]; then
      echo "  FAIL: $slug" | tee -a "$LOGS"
      FAIL=$((FAIL+1))
      rm -f "$out"
    fi
  done
  sleep 4
done

echo "=== W2 done $(date) ===" | tee -a "$LOGS"
echo "OK: $OK / $COUNT | FAIL: $FAIL" | tee -a "$LOGS"
