#!/bin/bash
set -u
DEST="$(dirname "$0")/fotos"
LOGS="$(dirname "$0")/gen-photos-w4.log"
mkdir -p "$DEST"
echo "=== W4 $(date) ===" > "$LOGS"

RECIPES=(
  "tortitas-zanahoria-huevos|savory carrot fritters pancakes golden orange topped with scrambled eggs on white plate morning natural light home cooking|301"
  "bowl-falafel-tabbouleh|mediterranean bowl with baked falafel balls quinoa tabbouleh parsley tomato cucumber tahini lemon sauce on white plate|302"
  "sopa-calabaza-pollo|creamy orange butternut squash pumpkin soup in white ceramic bowl topped with shredded chicken pumpkin seeds natural dinner light|303"
  "yogurt-griego-granola-casera|greek yogurt parfait in glass bowl topped with homemade oat granola fresh berries strawberries blueberries honey drizzle morning|304"
  "pad-thai-zucchini-camarones|zucchini noodles pad thai with cooked shrimp peanuts lime wedges fresh cilantro sesame seeds on white plate asian|305"
  "ensalada-tibia-quinoa-atun|warm quinoa salad bowl with seared tuna chunks roasted vegetables mixed greens cherry tomatoes lemon dressing|306"
  "frittata-coliflor-espinaca-queso|baked frittata with cauliflower florets spinach parmesan cheese sliced showing eggs and vegetables on white plate morning|307"
  "taco-bowl-pollo-coliflor|mexican taco bowl with shredded chicken cauliflower rice black beans avocado pico de gallo cilantro lime on white bowl|308"
  "pescado-sal-vegetales-vapor|whole baked white fish salt crust broken open served with steamed broccoli carrots green beans on large white plate rustic|309"
  "crepes-avena-ricotta-arandanos|thin oat flour crepes rolled filled with ricotta cheese and fresh blueberries dusted with cinnamon on white plate morning|310"
  "pollo-curry-coco-coliflor|chicken curry in coconut cream sauce with spices served over cauliflower rice garnished with cilantro on white plate|311"
  "kebabs-res-tzatziki|grilled beef kebab skewers with vegetables served with greek tzatziki yogurt cucumber sauce on white plate mediterranean natural light|312"
  "avocado-toast-huevo-poche|smashed avocado on oat bread toast topped with poached egg runny yolk chili flakes microgreens on white plate morning|313"
  "tartar-salmon-aguacate|salmon tartare with diced avocado lime sesame oil scallions plated in ring mold on white plate microgreens natural lunch light|314"
  "rollos-pepino-atun|cucumber sushi rolls wrapped with nori filled with tuna salad avocado sesame seeds on bamboo mat natural dinner light|315"
  "chia-pudding-coco-fresas|chia seed pudding in glass jar with coconut milk topped with fresh sliced strawberries slivered almonds morning natural light top-down|316"
  "pastel-carne-pure-brocoli|sliced homemade meatloaf served with creamy broccoli puree and roasted vegetables on white plate natural lunch light|317"
  "salmon-teriyaki-casero|glazed teriyaki salmon fillet on cauliflower rice with steamed broccoli sesame seeds spring onions asian bowl natural dinner|318"
  "shakshuka|shakshuka cast iron pan with poached eggs in spiced tomato sauce red bell peppers cilantro feta cheese weekend brunch natural light|319"
  "risotto-coliflor-pollo|creamy cauliflower risotto with grilled chicken slices parmesan shavings fresh thyme black pepper in white bowl|320"
  "estofado-pollo-vegetales|slow cooked chicken stew with carrots celery onions herbs broth in rustic dutch oven garnished with parsley natural dinner|321"
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
echo "=== W4 done OK:$OK FAIL:$FAIL $(date) ===" | tee -a "$LOGS"
