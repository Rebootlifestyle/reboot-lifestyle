#!/bin/bash
set -u
DEST="$(dirname "$0")/fotos"
LOGS="$(dirname "$0")/gen-photos-w3.log"
mkdir -p "$DEST"
echo "=== W3 $(date) ===" > "$LOGS"

RECIPES=(
  "omelette-espinaca-feta|three egg omelette with sauteed spinach crumbled feta cheese fresh oregano on white ceramic plate morning natural window light|201"
  "pescado-asado-esparragos|oven baked white fish fillet with roasted asparagus lemon slices fresh thyme on white plate mediterranean natural lunch light|202"
  "brochetas-pollo-vegetales|grilled chicken skewers with zucchini red bell pepper mushrooms red onion on wooden board served with quinoa natural dinner light|203"
  "huevos-rancheros|two sunny side up eggs over corn tortilla with red ranchera sauce avocado slices cilantro red onion lime on white plate mexican breakfast|204"
  "milanesa-pollo-ensalada|baked chicken milanesa breaded cutlet with almond flour crumbs next to fresh green salad cherry tomatoes on white plate|205"
  "sufle-atun-brocoli|golden baked tuna broccoli souffle risen in ramekin served with side salad natural dinner light home cooking|206"
  "overnight-oats-week3|overnight oats in glass mason jar topped with sliced banana fresh berries chia seeds almond butter wooden surface morning|207"
  "hamburguesas-lentejas-w3|homemade brown lentil burger patties served with lettuce wraps carrot slaw tahini sauce on rustic plate vegetarian|208"
  "ensalada-garbanzo|chickpea salad bowl with cucumber cherry tomatoes red onion kalamata olives feta leafy greens tahini lemon dressing|209"
  "arepa-avena-pollo-desmechado|oat flour arepa split filled with shredded garlic chicken on white plate venezuelan colombian breakfast morning light|210"
  "lomo-trapo-pure-calabaza|sliced rare beef tenderloin salt crust style served with creamy pumpkin puree on white plate rustic home cooking|211"
  "wrap-linaza-atun|flaxseed tortilla wrap cut in half filled with tuna salad avocado shredded carrots greens on wooden board natural light|212"
  "waffles-avena-salados-poche|savory oatmeal waffles topped with poached eggs dripping yolk avocado cherry tomatoes on white plate brunch|213"
  "goulash-arroz-coliflor|hungarian beef goulash stew with paprika tomato sauce served over cauliflower rice garnished with parsley on white plate|214"
  "pollo-cacerola-vegetales|braised chicken thighs in dutch oven with carrots celery onions bell peppers herbs broth rustic home cooking natural light|215"
  "wrap-linaza-huevos-aguacate|flaxseed tortilla wrap filled with scrambled eggs avocado slices spinach cut in half on wooden board morning brunch|216"
  "pasta-garbanzo-albondigas|chickpea pasta topped with baked beef meatballs in napolitana tomato sauce fresh basil parmesan cheese on white plate italian|217"
  "pollo-ajillo-ensalada|shredded garlic chicken breast served with romaine lettuce cherry tomato salad on white plate natural dinner light|218"
  "torta-espanola-calabacin|spanish tortilla frittata with zucchini potatoes onion slices showing layers on white plate weekend brunch natural light|219"
  "lasana-palmito-carne|hearts of palm lasagna layered with ground beef tomato sauce melted cheese sliced showing layers on rustic plate|220"
  "ensalada-camarones-aguacate|cooked shrimp salad with avocado cubes cherry tomatoes red onion cilantro lime juice in glass bowl natural dinner light|221"
)

COUNT=${#RECIPES[@]}
OK=0; FAIL=0
for i in "${!RECIPES[@]}"; do
  IFS='|' read -r slug prompt seed <<< "${RECIPES[$i]}"
  out="$DEST/${slug}.jpg"
  if [ -f "$out" ] && [ "$(stat -f%z "$out" 2>/dev/null || stat -c%s "$out")" -gt 10000 ]; then
    echo "SKIP: $slug" | tee -a "$LOGS"; OK=$((OK+1)); continue
  fi
  encoded=$(python3 -c "import urllib.parse, sys; print(urllib.parse.quote(sys.argv[1]))" "$prompt")
  url="https://image.pollinations.ai/prompt/${encoded}?width=1200&height=750&seed=${seed}&nologo=true&model=flux"
  echo "[$((i+1))/${COUNT}] $slug..." | tee -a "$LOGS"
  for attempt in 1 2 3; do
    curl -sS --max-time 90 -o "$out" "$url"
    size=$(stat -f%z "$out" 2>/dev/null || stat -c%s "$out" 2>/dev/null || echo 0)
    if [ "$size" -gt 10000 ]; then echo "  OK (${size})" | tee -a "$LOGS"; OK=$((OK+1)); break; fi
    sleep 3
    if [ "$attempt" -eq 3 ]; then echo "  FAIL" | tee -a "$LOGS"; FAIL=$((FAIL+1)); rm -f "$out"; fi
  done
  sleep 4
done
echo "=== W3 done OK:$OK FAIL:$FAIL $(date) ===" | tee -a "$LOGS"
