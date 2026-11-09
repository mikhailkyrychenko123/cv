(function () {
  "use strict";

  var section = document.querySelector(".shop-section");
  if (!section) return;

  var imagePath = "assets/shop/hdd-reference.png";
  function formatPrice(price) {
    return /^\$\d+(?:\.\d{2})?$/.test(price) && price.indexOf(".") === -1 ? price + ".00" : price;
  }
  function priceMarkup(product, price) {
    var formatted = formatPrice(price);
    if (!product.fractionalCents) return formatted;
    var parts = formatted.match(/^(.*?)(\.\d{2})$/);
    if (!parts) return formatted;
    return '<span class="shop-price-amount"><span class="shop-price-whole">' + parts[1] + '</span><span class="shop-price-cents"><span>' + parts[2] + '</span><i aria-hidden="true"></i></span></span>';
  }
  function pricePairMarkup(product) {
    if (!product.compareAtPrice) return priceMarkup(product, product.price);
    return '<del class="shop-price-was">' + priceMarkup(product, product.compareAtPrice) + '</del><span class="shop-price-current">' + priceMarkup(product, product.price) + '</span>';
  }
  var products = [
    { title: "Yin", edition: "in the Big City", price: "$899.00", compareAtPrice: "$789.00", fractionalCents: true, squareZoom: true, capacity: "One-of-a-kind miniature", detail: "A small meeting of old technology and an imagined city. Hand-sculpted in polymer clay by a programmer after midnight, the figure gives retired hardware a new story.", zoomDescription: "A hand-built miniature about giving retired technology a new story.", imageAlt: "Handmade polymer-clay figure in a miniature city scene built around a hard drive", gallery: ["assets/shop/yin-big-city-01.jpg", "assets/shop/yin-big-city-storefront.png", "assets/shop/yin-big-city-03.jpg", "assets/shop/yin-big-city-04.jpg", "assets/shop/yin-big-city-05.jpg", "assets/shop/yin-big-city-02.jpg"], galleryWidth: 700, galleryHeight: 700, facts: [{ label: "Handmade", value: "Polymer clay original" }, { label: "Delivery", value: "Free delivery in Kyiv" }], selectionFacts: [{ label: "Handmade", value: "Polymer clay" }, { label: "Delivery", value: "Free delivery in Kyiv" }], composition: [{ icon: "sculpt", label: "Material", value: "Polymer clay, wood & drive parts" }, { icon: "cast", label: "Who's here", value: "A clay hero and tiny city residents" }, { icon: "scene", label: "Scene", value: "A streetlamp, trees, game details & news" }, { icon: "idea", label: "Idea", value: "Retired hardware, given a new story" }], person: "visitor-tote.png", windowTop: 190, mobileTop: 205, labelTop: 81, imageHeight: 160, mobileImageHeight: 210 },
    { title: "Yan", edition: "May the Force Be With You...", price: "$799.00", compareAtPrice: "$689.00", fractionalCents: true, squareZoom: true, capacity: "One-of-a-kind auction piece", detail: "A small voyager stands at the edge of the cosmos, carrying a wish through the dark. Hand-sculpted after midnight, Yan is a reminder that even the smallest light can find its way across a vast universe.", zoomDescription: "A hand-built space-fantasy figure turns a familiar wish into a tiny voyage through the cosmos.", imageAlt: "Handmade masked space traveler with oversized gloves, a handwritten wish, and a tiny green companion", gallery: ["assets/shop/yan-storefront-01-swapped.png", "assets/shop/yan-storefront-02.png", "assets/shop/yan-storefront-03.png", "assets/shop/yan-storefront-04-swapped.png"], galleryWidth: 1280, galleryHeight: 1280, facts: [{ label: "Handmade", value: "Polymer-clay original" }, { label: "Delivery", value: "Free delivery in Kyiv" }], selectionFacts: [{ label: "Edition", value: "One-off auction" }, { label: "Delivery", value: "Free delivery in Kyiv" }], composition: [{ icon: "sculpt", label: "Material", value: "Hand-shaped polymer clay and painted details" }, { icon: "cast", label: "Who's here", value: "One masked voyager and a tiny green world" }, { icon: "orbit", label: "Scene", value: "A handwritten wish beneath a cosmic scale" }, { icon: "northstar", label: "Idea", value: "Hope can travel through any darkness" }], person: "visitor-photographer.png", windowTop: 160, mobileTop: 178, labelTop: 42, imageHeight: 205, mobileImageHeight: 240 },
    { title: "Memory", edition: "The Past", price: "$200", capacity: "A framed archive of drive components", detail: "“I enter the fields and roomy chambers of memory, where are the treasures of countless images.” Here, a machine’s fragments become a small archive of what time leaves behind.", detailAttribution: "— Augustine, Confessions, Book X, Ch. 8, §12", zoomDescription: "A disassembled hard drive becomes a quiet archive: fragments arranged to show how the past remains present in what we keep.", imageAlt: "Framed hard-drive components arranged as a small archive of memory", gallery: ["assets/shop/memory-past-01.jpg", "assets/shop/memory-past-02.jpg", "assets/shop/memory-past-03.jpg", "assets/shop/memory-past-04.jpg", "assets/shop/memory-past-05.jpg"], galleryWidth: 1600, galleryHeight: 1600, squareZoom: true, facts: [{ label: "Handmade", value: "One-of-a-kind framed artwork" }, { label: "Delivery", value: "Free delivery in Kyiv" }], selectionFacts: [{ label: "Edition", value: "One-of-a-kind artwork" }, { label: "Delivery", value: "Free delivery in Kyiv" }], composition: [{ icon: "drive", label: "Material", value: "Circuit board, platter & read head" }, { icon: "cast", label: "Who's here", value: "A machine, remembered in pieces" }, { icon: "scene", label: "Scene", value: "Old technology arranged as an archive" }, { icon: "idea", label: "Idea", value: "What we keep lets the past remain present" }], person: "visitor-skateboarder.png", windowTop: 140, mobileTop: 154, labelTop: 31, imageHeight: 250, mobileImageHeight: 260 },
    { title: "Developer", edition: "The Girl", price: "$899.00", compareAtPrice: "$789.00", fractionalCents: true, squareZoom: true, capacity: "One-of-a-kind miniature", detail: "“The future is already here—it’s just not very evenly distributed.” In her little city, she’s already building her share of it.", detailAttribution: "— William Gibson", zoomDescription: "A woman developer stands inside a miniature city of wires, streetlights and unfinished possibilities.", imageAlt: "Handmade miniature featuring a woman developer in a tiny city of trees, streetlights and urban details", gallery: ["assets/shop/developer-girl-storefront-01.jpg", "assets/shop/developer-girl-storefront-02.jpg", "assets/shop/developer-girl-storefront-03.jpg", "assets/shop/developer-girl-storefront-04.jpg"], galleryWidth: 1280, galleryHeight: 1280, facts: [{ label: "Handmade", value: "One-of-a-kind miniature" }, { label: "Delivery", value: "Free delivery in Kyiv" }], selectionFacts: [{ label: "Edition", value: "One-of-a-kind artwork" }, { label: "Delivery", value: "Free delivery in Kyiv" }], composition: [{ icon: "sculpt", label: "Material", value: "Polymer clay, wood & found objects" }, { icon: "cast", label: "Who's here", value: "One developer and her small city" }, { icon: "scene", label: "Scene", value: "Streetlights, trees & urban details" }, { icon: "idea", label: "Idea", value: "The future is something we build" }], person: "visitor-tote.png", windowTop: 180, mobileTop: 197, labelTop: 69, imageHeight: 160, mobileImageHeight: 210 },
    { title: "Open to Work", edition: "Subito", price: "$200", capacity: "One-of-a-kind framed artwork", detail: "大根引\n大根で道を\n教へけり", detailAttribution: "— Kobayashi Issa", poem: true, squareZoom: true, imageAlt: "A white shadow box frames an opened hard drive above printed newspaper pages", gallery: ["assets/shop/open-to-work-storefront-01.png", "assets/shop/open-to-work-storefront-02.png", "assets/shop/open-to-work-storefront-03.png", "assets/shop/open-to-work-storefront-04.png"], galleryWidth: 1280, galleryHeight: 1280, facts: [{ label: "Handmade", value: "One-of-a-kind framed artwork" }, { label: "Delivery", value: "Free delivery in Kyiv" }], selectionFacts: [{ label: "Edition", value: "One-of-a-kind artwork" }, { label: "Delivery", value: "Free delivery in Kyiv" }], composition: [{ glyph: "就", label: "BEGIN", value: "Ready for the next chapter" }, { glyph: "職", label: "CRAFT", value: "A hard drive, reframed by hand" }, { glyph: "活", label: "IN MOTION", value: "Skills kept active, not archived" }, { glyph: "動", label: "NEXT STEP", value: "Open to meaningful work" }], person: "visitor-photographer.png", windowTop: 198, mobileTop: 215, labelTop: 87, imageHeight: 135, mobileImageHeight: 195 },
    { title: "Duel", edition: "Only One Can Win", price: "$1989.00", compareAtPrice: "$1789.00", fractionalCents: true, squareZoom: true, capacity: "One-of-a-kind polymer-clay diorama", detail: "“What is opposed brings together; the finest harmony is composed of things at variance.” Two rivals meet beneath a hand-drawn measure; each gives the other shape.", detailAttribution: "— Heraclitus, Fragment B8", zoomDescription: "Two hand-sculpted rivals face one another across a miniature arena, with tiny witnesses gathered between them.", imageAlt: "A framed miniature duel: two polymer-clay rivals face each other across a hand-drawn scale, watched by tiny figures.", gallery: ["assets/shop/duel-storefront-01.jpg", "assets/shop/duel-storefront-02.jpg", "assets/shop/duel-storefront-03.jpg", "assets/shop/duel-storefront-04.jpg"], galleryWidth: 1280, galleryHeight: 1280, facts: [{ label: "Handmade", value: "One-of-a-kind clay diorama" }, { label: "Delivery", value: "Free delivery in Kyiv" }], selectionFacts: [{ label: "Edition", value: "One-of-a-kind artwork" }, { label: "Delivery", value: "Free delivery in Kyiv" }], composition: [{ icon: "sculpt", label: "Material", value: "Polymer clay, wood & miniature props" }, { icon: "cast", label: "Who's here", value: "Two rivals and three tiny witnesses" }, { icon: "scene", label: "Scene", value: "A framed arena beneath a hand-drawn scale" }, { icon: "idea", label: "Idea", value: "Rivalry gives each side its shape" }], person: "visitor-photographer.png", windowTop: 155, mobileTop: 170, labelTop: 36, imageHeight: 205, mobileImageHeight: 235 },
    { title: "Escape", edition: "The Tokens", price: "$225", squareZoom: true, capacity: "One-of-a-kind framed artwork", detail: "“If I must die, die running towards the cloud that had been the colour of a pearl.” Beneath the drive, tiny figures flee the Machine's failing world, searching for open air.", detailAttribution: "— E. M. Forster, The Machine Stops", zoomDescription: "A framed hard drive becomes a machine-world, while miniature figures make their quiet escape below.", imageAlt: "A framed hard drive with small figures escaping beneath it, reflected in a platter below.", gallery: ["assets/shop/escape-01.png", "assets/shop/escape-02.png", "assets/shop/escape-03.png", "assets/shop/escape-04.png", "assets/shop/escape-05.png"], galleryWidth: 1280, galleryHeight: 1280, facts: [{ label: "Handmade", value: "One-of-a-kind framed artwork" }, { label: "Delivery", value: "Free delivery in Kyiv" }], selectionFacts: [{ label: "Edition", value: "One-of-a-kind artwork" }, { label: "Delivery", value: "Free delivery in Kyiv" }], composition: [{ icon: "drive", label: "MATERIAL", value: "Recovered drive, mirror platter & oak frame" }, { icon: "cast", label: "RUNNERS", value: "Tiny figures escaping the machine's frame" }, { icon: "orbit", label: "SCENE", value: "A data vault, reflected disk & route out" }, { icon: "northstar", label: "IDEA", value: "Freedom begins beyond the system" }], person: "visitor-family.png", windowTop: 185, mobileTop: 204, labelTop: 75, imageHeight: 175, mobileImageHeight: 220 }
  ];
  var compositionIcons = {
    drive: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="3.5" y="4" width="17" height="16" rx="2"/><circle cx="12" cy="12" r="4"/><path d="M12 8v4l3 2M6.5 7.5h.01"/></svg>',
    people: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3.5 20c.4-3.6 2.3-5.5 5.5-5.5s5.1 1.9 5.5 5.5M14.5 15c3.5-.8 5.6 1 6 4.5"/></svg>',
    spark: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="3.5" y="5" width="17" height="15" rx="1"/><path d="m6.5 16 4-4 2.5 2.5 2.5-3 2 2.5M16 3v4M14 5h4"/></svg>',
    fit: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 6.5h6l2 2h8v10H4z"/><path d="M8 14.5c0-1.2 1.4-1.8 2.2-.9L12 15.5l1.8-1.9c.9-.9 2.2-.3 2.2.9 0 1.4-4 4.1-4 4.1s-4-2.7-4-4.1Z"/></svg>',
    sculpt: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 17.5c2.7-1.1 3-3.8 5.2-4.6 1.8-.7 2.5.5 4.1-.1 1.7-.6 1.7-2.5 3.4-3.1 1.1-.4 2.2.1 3.3.8M4 20h16M7 9.5c0-1.4 1.1-2.5 2.5-2.5S12 8.1 12 9.5 10.9 12 9.5 12"/></svg>',
    cast: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="11" cy="7.5" r="3.2"/><path d="M4.5 20c.5-4 2.6-6 6.5-6s6 2 6.5 6M18 7h2m-1-1v2"/></svg>',
    scene: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M7 20V7l3-3 3 3v13M5 20h7M8 8h4M17 20V4m-2 3h4m-4 0 2-3 2 3M15 20h5"/><circle cx="18" cy="5" r=".5"/></svg>',
    idea: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 14a8 8 0 0 1 13.7-5.7L20 10.5M20 5v5.5h-5.5M20 10a8 8 0 0 1-13.7 5.7L4 13.5M4 19v-5.5h5.5"/><path d="M12 15v-4m0 0c-2.6 0-3.8-1.5-3.8-3.4 2.8 0 4.1 1.2 4.1 3.4m-.3 0c0-2.3 1.3-3.7 3.8-3.7 0 2.1-1.2 3.7-3.8 3.7"/></svg>',
    orbit: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="2.2"/><ellipse cx="12" cy="12" rx="9" ry="4.2" transform="rotate(-28 12 12)"/><circle cx="19.6" cy="7.7" r="1.2"/><path d="m5 5 .7-1.5L7.2 3l-1.5-.7L5 1l-.7 1.3L3 3l1.3.5L5 5Zm13.2 13.2.5-1.1 1.1-.5-1.1-.5-.5-1.1-.5 1.1-1.1.5 1.1.5.5 1.1Z"/></svg>',
    northstar: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m12 2 2.1 7.9L22 12l-7.9 2.1L12 22l-2.1-7.9L2 12l7.9-2.1L12 2Z"/><circle cx="12" cy="12" r="2.4"/><path d="m18.5 3 .6 2.1 2.1.6-2.1.6-.6 2.1-.6-2.1-2.1-.6 2.1-.6.6-2.1Z"/></svg>'
  };
  function compositionIconMarkup(item) {
    if (item.glyph) {
      return '<span class="shop-composition-icon shop-composition-glyph" aria-hidden="true" data-glyph="' + item.glyph + '">' + item.glyph + '</span>';
    }
    return '<span class="shop-composition-icon" aria-hidden="true">' + (compositionIcons[item.icon] || "") + '</span>';
  }
  products.forEach(function (product) { product.activeStyle = "expanded-art"; });

  // Keep all visitors as standalone transparent PNGs and mirror every other
  // product so neighboring figures alternate their viewing direction.
  function cutout(file, width, mirror) {
    return { src: "assets/shop/" + file, cutout: true, width: width || 68, mirror: Boolean(mirror) };
  }
  var featuredGirl = cutout("visitor-girl-balloon-lollipop.png", 116);
  // Keep the screenshot's opening sequence fixed, then continue with a
  // distinct visitor for every product beyond the first screen.
  var visitorAssignments = [
    cutout("visitor-young-couple.png", 132),
    featuredGirl,
    cutout("visitor-photographer.png"),
    cutout("visitor-runner.png", 116),
    cutout("visitor-hiker.png", 116),
    cutout("visitor-skateboarder.png", 68, true),
    cutout("visitor-family.png", 132),
    cutout("visitor-bmx-rider.png", 116),
    cutout("visitor-mature-couple.png", 132),
    cutout("visitor-hiking-couple.png", 132)
  ];
  var productLayouts = {
    low: { labelTop: 76, windowTop: 157, mobileLabelTop: 76, mobileTop: 178, imageHeight: 120, mobileImageHeight: 190, frameWidth: "76%" },
    medium: { labelTop: 34, windowTop: 126, mobileLabelTop: 45, mobileTop: 154, imageHeight: 150, mobileImageHeight: 220, frameWidth: "96%" },
    high: { labelTop: 18, windowTop: 110, mobileLabelTop: 28, mobileTop: 140, imageHeight: 180, mobileImageHeight: 245, frameWidth: "88%" },
    dip: { labelTop: 61, windowTop: 150, mobileLabelTop: 65, mobileTop: 170, imageHeight: 126, mobileImageHeight: 200, frameWidth: "82%" }
  };
  // Fixed contour rhythm from the reference screenshot, continued with
  // varied heights for products that appear later in the carousel.
  var layoutNames = ["low", "medium", "high", "dip", "medium", "high", "low", "dip", "medium", "low"];
  var productWindowTops = [180, 246, 108, 234, 162, 126, 198, 145, 216, 252];
  products.forEach(function (product, index) {
    var layout = productLayouts[layoutNames[index]];
    var windowTop = productWindowTops[index];
    var labelImageGap = layout.windowTop - layout.labelTop;
    product.windowTop = windowTop;
    product.labelTop = Math.max(8, windowTop - labelImageGap - 18);
    product.mobileLabelTop = layout.mobileLabelTop;
    product.mobileTop = layout.mobileTop;
    product.imageHeight = layout.imageHeight;
    product.mobileImageHeight = layout.mobileImageHeight;
    if (product.gallery && product.galleryHeight > product.galleryWidth) {
      product.imageHeight = Math.max(product.imageHeight, 205);
      product.mobileImageHeight = Math.max(product.mobileImageHeight, 240);
    }
    product.frameWidth = layout.frameWidth;
    product.contourTop = product.windowTop - 14;
    product.mobileContourTop = layout.mobileTop - 12;
  });
  products.forEach(function (product, index) {
    product.person = visitorAssignments[index];
    product.person.flip = Boolean(product.person.mirror) !== (index % 2 === 1);
  });

  var countTotal = products.length;
  var track = section.querySelector("[data-shop-track]");
  var viewport = section.querySelector("[data-shop-viewport]");
  var dots = section.querySelector("[data-shop-dots]");
  var active = 2;
  var start = 0;
  var position = countTotal;
  var perView = 4;
  var mobileLayout = window.innerWidth <= 680;
  var detailOpen = mobileLayout;
  var baseCardWidth = 0;

  function cardMarkup(product, index, clone) {
    var number = String(index + 1).padStart(2, "0");
    var activeStyle = product.activeStyle || "standard";
    var colorBehavior = ' data-colorize-hover="true"';
    var gallery = product.gallery || [imagePath, imagePath, imagePath, imagePath];
    var galleryMode = product.gallery ? ' data-shop-gallery="photos"' : "";
    var galleryOrientation = product.gallery ? (product.galleryHeight > product.galleryWidth ? "portrait" : product.galleryWidth > product.galleryHeight ? "landscape" : "square") : "";
    var galleryShape = product.gallery ? ' data-gallery-orientation="' + galleryOrientation + '"' : "";
    var galleryAspect = product.gallery ? ';--gallery-aspect:' + (product.galleryWidth || 1280) + ' / ' + (product.galleryHeight || 949) : "";
    var frameMode = product.gallery ? "photos" : "crop";
    var intrinsicDimensions = product.gallery ? ' width="' + (product.galleryWidth || 1280) + '" height="' + (product.galleryHeight || 949) + '"' : "";
    var cardPrice = product.compareAtPrice
      ? '<span class="shop-card-price shop-card-price--sale" aria-label="Sale price ' + formatPrice(product.price) + ', was ' + formatPrice(product.compareAtPrice) + '"><del class="shop-price-was">' + priceMarkup(product, product.compareAtPrice) + '</del><strong class="shop-price-current">' + priceMarkup(product, product.price) + '</strong></span>'
      : '<span class="shop-card-price">' + priceMarkup(product, product.price) + '</span>';
    var composition = product.composition || [];
    var compositionClass = composition.length ? " has-composition" : "";
    var compositionMarkup = composition.length
      ? '<ul class="shop-inline-composition" aria-label="Piece details">' + composition.map(function (item) {
        return '<li>' + compositionIconMarkup(item) + '<span class="shop-composition-copy"><b>' + item.label + '</b><span>' + item.value + '</span></span></li>';
      }).join("") + '</ul>'
      : "";
    var facts = product.facts || [{ label: "Form factor", value: "2.5-inch HDD" }, { label: "Series", value: product.capacity }];
    var factsMarkup = '<div class="shop-inline-facts">' + facts.map(function (fact) {
      return '<div' + (fact.label === "Delivery" ? ' class="shop-fact-delivery"' : '') + '><b>' + fact.label + '</b><span>' + fact.value + '</span></div>';
    }).join("") + '</div>';
    var inlinePrice = '<p class="shop-inline-price' + (product.compareAtPrice ? ' shop-inline-price--sale' : '') + '">' + pricePairMarkup(product) + '</p>';
    var imageAlt = product.imageAlt || "Framed 2.5-inch HDD computer art, demo piece " + number;
    var hidden = clone ? ' aria-hidden="true" data-shop-clone="true"' : ' data-shop-clone="false"';
    var cardTab = clone ? ' tabindex="-1"' : ' tabindex="0" aria-label="Open product ' + number + ': ' + product.title + ' ' + product.edition + '"';
    var tab = clone ? ' tabindex="-1"' : "";
    var thumbs = "";
    var galleryDots = "";
    for (var view = 0; view < gallery.length; view += 1) {
      var previewLabel = product.gallery ? "Product view " : "Preview angle ";
      thumbs += '<button class="shop-thumb" type="button" data-shop-thumb="' + view + '" aria-pressed="' + (view === 0 ? "true" : "false") + '" aria-label="' + previewLabel + (view + 1) + '"' + tab + '><img src="' + gallery[view] + '" alt="" loading="lazy"></button>';
      galleryDots += '<button class="shop-gallery-dot" type="button" data-shop-gallery-view="' + view + '" aria-label="' + previewLabel + (view + 1) + '" aria-pressed="' + (view === 0 ? "true" : "false") + '"' + tab + '></button>';
    }
    return '<article class="shop-card" role="group" data-shop-card data-product-index="' + index + '" data-active-style="' + activeStyle + '" style="--desktop-window-top:' + product.windowTop + 'px;--mobile-window-top:' + product.mobileTop + 'px;--desktop-contour-top:' + product.contourTop + 'px;--mobile-contour-top:' + product.mobileContourTop + 'px;--label-top:' + product.labelTop + 'px;--mobile-label-top:' + product.mobileLabelTop + 'px;--frame-width:' + product.frameWidth + ';--image-height:' + product.imageHeight + 'px;--mobile-image-height:' + product.mobileImageHeight + 'px' + galleryAspect + '"' + colorBehavior + galleryMode + galleryShape + hidden + cardTab + '>' +
      '<div class="shop-card-meta"><span class="shop-card-number">' + number + '</span><h3>' + product.title + '</h3><p>(' + product.edition + ')</p>' + cardPrice + '</div>' +
      '<div class="shop-window" data-shop-window><figure class="shop-object-frame" data-shop-frame data-gallery-mode="' + frameMode + '" data-view="0"><img data-shop-main-image src="' + gallery[0] + '" alt="' + imageAlt + '"' + intrinsicDimensions + ' loading="lazy"><button class="shop-zoom-trigger" type="button" data-shop-zoom-trigger aria-label="Zoom ' + product.title + ' ' + product.edition + '"' + tab + '><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="5.5"/><path d="m15 15 5 5m-9.5-9.5h0M10.5 8v5"/></svg></button><button class="shop-mobile-image-arrow shop-mobile-image-prev" type="button" data-shop-mobile-image-prev aria-label="Previous image"' + tab + '>‹</button><button class="shop-mobile-image-arrow shop-mobile-image-next" type="button" data-shop-mobile-image-next aria-label="Next image"' + tab + '>›</button><button class="shop-mobile-more" type="button" data-shop-mobile-more' + tab + '>More details <span aria-hidden="true">↗</span></button></figure>' +
      '<div class="shop-thumbs" role="group" aria-label="Product image previews">' + thumbs + '</div>' +
      '<div class="shop-gallery-dots" role="group" aria-label="Choose product image">' + galleryDots + '</div></div>' +
      '<div class="shop-inline-detail" data-shop-inline hidden><div class="shop-inline-header"><span>' + product.title + '</span><b>' + product.edition + '</b></div>' +
      '<button class="shop-inline-collapse" type="button" data-shop-details-close aria-label="Collapse product details">×</button>' +
      '<div class="shop-inline-copy' + compositionClass + '" data-shop-product-content><p class="shop-inline-kicker">PRODUCT DETAILS</p><h3>' + product.title + ' <span>' + product.edition + '</span></h3>' + inlinePrice + '<div class="shop-inline-rule"></div>' +
      '<p class="shop-inline-description' + (product.poem ? ' shop-haiku' : '') + '">' + product.detail + (product.detailAttribution ? '<span class="shop-inline-attribution">' + product.detailAttribution + '</span>' : '') + '</p>' + compositionMarkup + factsMarkup +
      '<button class="shop-inline-action" type="button" data-shop-inquiry-open>Request this piece <span aria-hidden="true">→</span></button></div>' +
      '<form class="shop-inquiry-form" data-shop-inquiry-form hidden><p class="shop-inline-kicker">PRODUCT INQUIRY</p><h3 class="shop-inquiry-title">Ask about this piece</h3><p class="shop-inquiry-product">' + product.title + ' (' + product.edition + ') · ' + formatPrice(product.price) + '</p>' +
      '<label class="shop-inquiry-email-label">Email address<input name="email" type="email" autocomplete="email" maxlength="254" required placeholder="you@example.com"></label>' +
      '<label class="shop-inquiry-consent"><input name="consent" type="checkbox" required><span>I agree to the use of my email to respond to this product inquiry. <a href="privacy.html" target="_blank" rel="noopener noreferrer">Read the Privacy Notice</a>.</span></label>' +
      '<div class="shop-inquiry-honeypot" aria-hidden="true"><label>Leave this field empty<input name="website" type="text" tabindex="-1" autocomplete="off"></label></div>' +
      '<button class="shop-inline-action shop-inquiry-submit" type="submit"><span>Send request</span><span aria-hidden="true">↗</span></button><p class="shop-inquiry-status" data-shop-inquiry-status aria-live="polite" role="status"></p>' +
      '<button class="shop-inquiry-back" type="button" data-shop-inquiry-back>← Back to product</button></form></div>' +
      '<img class="shop-visitor" src="' + product.person.src + '" alt="" aria-hidden="true" loading="lazy" style="' + visitorStyle(product.person) + '"' + tab + '></article>';
  }

  function visitorStyle(person) {
    var width = person.width || 68;
    return "--visitor-width:" + width + "px;transform:scaleX(" + (person.flip ? -1 : 1) + ")";
  }

  var cards = "";
  for (var i = 0; i < countTotal; i += 1) cards += cardMarkup(products[i], i, true);
  for (var j = 0; j < countTotal; j += 1) cards += cardMarkup(products[j], j, false);
  for (var k = 0; k < countTotal; k += 1) cards += cardMarkup(products[k], k, true);
  track.innerHTML = cards;

  var zoomDialog = document.createElement("dialog");
  zoomDialog.className = "shop-zoom-dialog";
  zoomDialog.setAttribute("aria-labelledby", "shop-zoom-title");
  zoomDialog.innerHTML = '<div class="shop-zoom-shell">' +
    '<button class="shop-zoom-close" type="button" data-shop-zoom-close aria-label="Close product gallery">×</button>' +
    '<div class="shop-zoom-gallery"><div class="shop-zoom-stage" data-shop-zoom-stage data-view="0" data-mode="crop">' +
    '<button class="shop-zoom-nav shop-zoom-prev" type="button" data-shop-zoom-prev aria-label="Previous image">←</button>' +
    '<img data-shop-zoom-image alt=""><div class="shop-zoom-lens" data-shop-zoom-lens aria-hidden="true"></div>' +
    '<button class="shop-zoom-nav shop-zoom-next" type="button" data-shop-zoom-next aria-label="Next image">→</button></div>' +
    '<div class="shop-zoom-thumbs" data-shop-zoom-thumbs role="group" aria-label="Product images"></div>' +
    '<div class="shop-zoom-dots" data-shop-zoom-dots role="group" aria-label="Choose product image"></div></div>' +
    '<div class="shop-zoom-footer"><div class="shop-zoom-copy"><p class="shop-zoom-kicker">PRODUCT DETAILS</p>' +
    '<h2 id="shop-zoom-title" data-shop-zoom-title></h2><p class="shop-zoom-description" data-shop-zoom-description></p>' +
    '<ul class="shop-zoom-composition" data-shop-zoom-composition aria-label="Piece details" hidden></ul><div class="shop-zoom-facts" data-shop-zoom-facts></div></div>' +
    '<div class="shop-zoom-buy"><strong class="shop-zoom-price" data-shop-zoom-price></strong>' +
    '<button class="shop-zoom-request" type="button" data-shop-zoom-request><span>Request this piece</span><span aria-hidden="true">↗</span></button></div></div></div>';
  section.appendChild(zoomDialog);
  var zoomState = { productIndex: 0, view: 0, views: [], photosMode: false, originCard: null };
  var zoomStage = zoomDialog.querySelector("[data-shop-zoom-stage]");
  var zoomLens = zoomDialog.querySelector("[data-shop-zoom-lens]");
  function hideZoomLens() {
    zoomLens.classList.remove("is-visible");
    zoomStage.classList.remove("has-hover-lens");
  }
  function moveZoomLens(event) {
    var product = products[zoomState.productIndex];
    var desktopPointer = window.matchMedia("(min-width: 900px) and (hover: hover) and (pointer: fine)").matches;
    var image = zoomDialog.querySelector("[data-shop-zoom-image]");
    if (!zoomDialog.open || !product || !zoomState.photosMode || !desktopPointer || !image.naturalWidth) {
      hideZoomLens();
      return;
    }
    if (event.target.closest && event.target.closest(".shop-zoom-nav")) {
      hideZoomLens();
      return;
    }
    var stageRect = zoomStage.getBoundingClientRect();
    var imageRect = image.getBoundingClientRect();
    var fittedScale = Math.min(imageRect.width / image.naturalWidth, imageRect.height / image.naturalHeight);
    var renderedWidth = image.naturalWidth * fittedScale;
    var renderedHeight = image.naturalHeight * fittedScale;
    var imageOffsetX = (imageRect.width - renderedWidth) / 2;
    var imageOffsetY = (imageRect.height - renderedHeight) / 2;
    var localX = event.clientX - imageRect.left;
    var localY = event.clientY - imageRect.top;
    if (localX < imageOffsetX || localY < imageOffsetY || localX > imageOffsetX + renderedWidth || localY > imageOffsetY + renderedHeight) {
      hideZoomLens();
      return;
    }
    var x = event.clientX - stageRect.left;
    var y = event.clientY - stageRect.top;
    var imageContentX = localX - imageOffsetX;
    var imageContentY = localY - imageOffsetY;
    var scale = 1.18;
    var diameter = 176;
    var maxLeft = Math.max(0, stageRect.width - diameter);
    var maxTop = Math.max(0, stageRect.height - diameter);
    var left = Math.max(0, Math.min(x - diameter / 2, maxLeft));
    var top = Math.max(0, Math.min(y - diameter / 2, maxTop));
    var pointerInLensX = x - left;
    var pointerInLensY = y - top;
    zoomLens.style.width = diameter + "px";
    zoomLens.style.height = diameter + "px";
    zoomLens.style.left = left + "px";
    zoomLens.style.top = top + "px";
    zoomLens.style.backgroundImage = 'url("' + image.currentSrc + '")';
    zoomLens.style.backgroundSize = (renderedWidth * scale) + "px " + (renderedHeight * scale) + "px";
    zoomLens.style.backgroundPosition = (pointerInLensX - imageContentX * scale) + "px " + (pointerInLensY - imageContentY * scale) + "px";
    zoomLens.classList.add("is-visible");
    zoomStage.classList.add("has-hover-lens");
  }
  zoomStage.addEventListener("mousemove", moveZoomLens);
  zoomStage.addEventListener("mouseleave", hideZoomLens);
  zoomDialog.addEventListener("close", hideZoomLens);
  var suppressFrameClick = false;

  var contour = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  contour.setAttribute("class", "shop-contour");
  contour.setAttribute("aria-hidden", "true");
  var contourPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
  contour.appendChild(contourPath);
  track.insertBefore(contour, track.firstChild);

  for (var dotIndex = 0; dotIndex < countTotal; dotIndex += 1) {
    var dot = document.createElement("button");
    dot.type = "button";
    dot.className = "shop-page-dot";
    dot.setAttribute("data-shop-page", String(dotIndex));
    dot.setAttribute("aria-label", "Select product " + String(dotIndex + 1).padStart(2, "0"));
    dots.appendChild(dot);
  }

  function modulo(value, mod) { return ((value % mod) + mod) % mod; }
  function cardOffset(index) {
    var card = track.querySelectorAll(".shop-card")[index];
    return card ? card.offsetLeft : 0;
  }
  function renderTrack(animate) {
    position = countTotal + start;
    track.style.transition = animate ? "" : "none";
    track.style.transform = "translate3d(" + (-cardOffset(position)) + "px,0,0)";
    if (!animate) {
      track.getBoundingClientRect();
      track.style.transition = "";
    }
  }
  function updateStatus() {
    var product = products[active];
    var display = String(active + 1).padStart(2, "0") + " / " + String(countTotal).padStart(2, "0");
    section.querySelectorAll("[data-shop-count]").forEach(function (node) { node.textContent = display; });
    var previousIndex = modulo(active - 1, countTotal);
    var nextIndex = modulo(active + 1, countTotal);
    var previousProduct = products[previousIndex];
    var nextProduct = products[nextIndex];
    var previousName = previousProduct.title === "2.5-inch HDD" ? previousProduct.edition : previousProduct.title;
    var nextName = nextProduct.title === "2.5-inch HDD" ? nextProduct.edition : nextProduct.title;
    var previousLabel = section.querySelector("[data-shop-prev-label]");
    var nextLabel = section.querySelector("[data-shop-next-label]");
    if (previousLabel) previousLabel.textContent = "TO " + String(previousIndex + 1).padStart(2, "0") + " · " + previousName;
    if (nextLabel) nextLabel.textContent = "NEXT " + String(nextIndex + 1).padStart(2, "0") + " · " + nextName;
    section.querySelectorAll(".shop-pagination-prev").forEach(function (button) { button.setAttribute("aria-label", "Previous product: " + previousProduct.title + " " + previousProduct.edition); });
    section.querySelectorAll(".shop-pagination-next").forEach(function (button) { button.setAttribute("aria-label", "Next product: " + nextProduct.title + " " + nextProduct.edition); });
    section.querySelector("[data-shop-active-title]").textContent = product.title;
    section.querySelector("[data-shop-active-edition]").textContent = "(" + product.edition + ")";
    section.querySelector("[data-shop-active-price]").innerHTML = pricePairMarkup(product);
    var selectionFacts = product.selectionFacts || [{ label: "Form factor", value: "2.5-inch" }, { label: "Capacity", value: product.capacity }];
    var factOneLabel = section.querySelector("[data-shop-active-fact-one-label]");
    var factOneValue = section.querySelector("[data-shop-active-fact-one]");
    var factTwoLabel = section.querySelector("[data-shop-active-fact-two-label]");
    var factTwoValue = section.querySelector("[data-shop-active-fact-two]");
    if (factOneLabel) factOneLabel.textContent = selectionFacts[0].label + ":";
    if (factOneValue) factOneValue.textContent = selectionFacts[0].value;
    if (factTwoLabel) factTwoLabel.textContent = selectionFacts[1].label + ":";
    if (factTwoValue) factTwoValue.textContent = selectionFacts[1].value;
    var moreButton = section.querySelector("[data-shop-more-selected]");
    moreButton.setAttribute("aria-label", (detailOpen ? "Hide" : "Show") + " details for " + product.title + " " + product.edition);
    moreButton.setAttribute("aria-expanded", detailOpen ? "true" : "false");
    moreButton.querySelector("span:first-child").textContent = detailOpen ? "Hide details" : "More info";
    var expandedArtwork = detailOpen && product.activeStyle === "expanded-art";
    var compareExpandedPair = detailOpen && (active === 4 || active === 5);
    viewport.setAttribute("data-expanded-compare", expandedArtwork ? "true" : "false");
    dots.querySelectorAll("[data-shop-page]").forEach(function (button, index) {
      button.setAttribute("aria-current", index === active ? "step" : "false");
    });
    track.querySelectorAll("[data-shop-card]").forEach(function (card) {
      var productIndex = Number(card.getAttribute("data-product-index"));
      var selected = productIndex === active;
      card.classList.toggle("is-current", selected && detailOpen);
      card.classList.toggle("is-expanded", selected && detailOpen);
      card.classList.toggle("is-compare-focus", compareExpandedPair && (productIndex === 4 || productIndex === 5));
      card.classList.toggle("is-color-active", selected);
      var panel = card.querySelector("[data-shop-inline]");
      panel.hidden = !(selected && detailOpen);
    });
    syncExpandedHeight();
  }
  function syncExpandedHeight() {
    if (!detailOpen && window.innerWidth > 680) {
      viewport.style.height = "";
      return;
    }
    viewport.style.height = "";
    var viewportBox = viewport.getBoundingClientRect();
    var viewportTop = viewportBox.top;
    var isMobileLayout = window.innerWidth <= 680;
    var minHeight = isMobileLayout ? 0 : 420;
    var requiredHeight = minHeight;
    track.querySelectorAll("[data-shop-card]").forEach(function (card) {
      var cardBox = card.getBoundingClientRect();
      var productIndex = Number(card.getAttribute("data-product-index"));
      if (isMobileLayout ? productIndex !== active : (cardBox.right <= viewportBox.left || cardBox.left >= viewportBox.right)) return;
      var windowElement = card.querySelector("[data-shop-window]");
      var frame = card.querySelector("[data-shop-frame]");
      var thumbs = card.querySelector(".shop-thumbs");
      var galleryNav = thumbs;
      var windowBox = windowElement.getBoundingClientRect();
      var windowStyle = window.getComputedStyle(windowElement);
      var galleryNavStyle = window.getComputedStyle(galleryNav);
      var frameHeight = frame.getBoundingClientRect().height;
      var galleryNavHeight = galleryNav.getBoundingClientRect().height;
      var galleryNavMargin = galleryNavStyle.display === "none" ? 0 : (parseFloat(galleryNavStyle.marginTop) || 0);
      var windowPaddingTop = parseFloat(windowStyle.paddingTop) || 0;
      var panel = card.querySelector("[data-shop-inline]");
      if (window.innerWidth <= 680) {
        panel.style.removeProperty("top");
      } else if (!card.classList.contains("is-expanded")) {
        panel.style.removeProperty("top");
      }
      var stackBottom = windowBox.top - viewportTop
        + windowPaddingTop
        + frameHeight
        + galleryNavMargin
        + galleryNavHeight
        + 16;
      var meta = card.querySelector(".shop-card-meta");
      if (meta) requiredHeight = Math.max(requiredHeight, meta.getBoundingClientRect().bottom - viewportTop + 12);
      requiredHeight = Math.max(requiredHeight, stackBottom);
      if (card.classList.contains("is-expanded")) {
        var visibleContent = panel.querySelector("[data-shop-product-content]:not([hidden]), [data-shop-inquiry-form]:not([hidden])");
        var panelStyle = window.getComputedStyle(panel);
        var panelTop = panel.getBoundingClientRect().top - viewportTop;
        var contentHeight = visibleContent ? visibleContent.getBoundingClientRect().height : 0;
        var panelChrome = (parseFloat(panelStyle.paddingTop) || 0)
          + (parseFloat(panelStyle.paddingBottom) || 0)
          + (parseFloat(panelStyle.borderTopWidth) || 0)
          + (parseFloat(panelStyle.borderBottomWidth) || 0);
        requiredHeight = Math.max(requiredHeight, panelTop + contentHeight + panelChrome + 7);
      }
    });
    viewport.style.height = Math.ceil(requiredHeight) + "px";
  }
  function setStart(nextStart, direction, animate) {
    var oldStart = start;
    start = modulo(nextStart, countTotal);
    position = countTotal + start;
    if (direction > 0 && oldStart === countTotal - 1 && start === 0) position = countTotal * 2;
    if (direction < 0 && oldStart === 0 && start === countTotal - 1) position = countTotal - 1;
    track.style.transition = animate ? "" : "none";
    track.style.transform = "translate3d(" + (-cardOffset(position)) + "px,0,0)";
    if (!animate) {
      track.getBoundingClientRect();
      track.style.transition = "";
    }
  }
  function choose(index, direction, center) {
    active = modulo(index, countTotal);
    var newStart = start;
    if (detailOpen) applyCardWidths();
    if (center) {
      newStart = modulo(active - Math.min(2, perView - 1), countTotal);
    } else if (direction > 0) {
      var rightSlot = modulo(active - start, countTotal);
      if (rightSlot >= perView) newStart = modulo(active - perView + 1, countTotal);
    } else if (direction < 0) {
      var leftSlot = modulo(active - start, countTotal);
      if (leftSlot >= perView) newStart = active;
    }
    if (newStart !== start) setStart(newStart, direction, true);
    else if (detailOpen) renderTrack(false);
    updateStatus();
    drawContour();
  }
  function navigate(index, direction, center) {
    if (window.innerWidth > 680 && detailOpen) hideDetails();
    choose(index, direction, center);
  }
  function next() { navigate(active + 1, 1, false); }
  function previous() { navigate(active - 1, -1, false); }

  track.addEventListener("transitionend", function (event) {
    if (event.target !== track || event.propertyName !== "transform") return;
    if (position === countTotal * 2) {
      position = countTotal;
      track.style.transition = "none";
      track.style.transform = "translate3d(" + (-cardOffset(position)) + "px,0,0)";
      track.getBoundingClientRect();
      track.style.transition = "";
    } else if (position === countTotal - 1) {
      position = countTotal * 2 - 1;
      track.style.transition = "none";
      track.style.transform = "translate3d(" + (-cardOffset(position)) + "px,0,0)";
      track.getBoundingClientRect();
      track.style.transition = "";
    }
    syncExpandedHeight();
    drawContour();
  });

  function showDetails(index) {
    active = modulo(index, countTotal);
    detailOpen = true;
    applyCardWidths();
    renderTrack(false);
    updateStatus();
    drawContour();
  }
  function hideDetails() {
    if (window.innerWidth <= 680) return;
    detailOpen = false;
    applyCardWidths();
    updateStatus();
    renderTrack(false);
    drawContour();
  }
  function showInquiryForm(panel) {
    var content = panel.querySelector("[data-shop-product-content]");
    var form = panel.querySelector("[data-shop-inquiry-form]");
    panel.classList.add("is-inquiry");
    content.hidden = true;
    form.hidden = false;
    syncExpandedHeight();
    drawContour();
  }
  function showProductContent(panel) {
    panel.classList.remove("is-inquiry");
    panel.querySelector("[data-shop-inquiry-form]").hidden = true;
    panel.querySelector("[data-shop-product-content]").hidden = false;
    syncExpandedHeight();
    drawContour();
  }
  function scrollThumbRail(rail, view, advanceAtEdge) {
    if (!rail || rail.scrollWidth <= rail.clientWidth + 1) return;
    var items = Array.prototype.slice.call(rail.children);
    var item = items[view];
    if (!item) return;
    var railRect = rail.getBoundingClientRect();
    var itemRect = item.getBoundingClientRect();
    var firstMostlyVisible = -1;
    var lastMostlyVisible = -1;
    items.forEach(function (candidate, index) {
      var rect = candidate.getBoundingClientRect();
      var visibleWidth = Math.max(0, Math.min(rect.right, railRect.right) - Math.max(rect.left, railRect.left));
      var visibility = rect.width ? visibleWidth / rect.width : 0;
      // Ignore a thumbnail that only peeks a few pixels into the rail. It
      // should not prevent the last fully visible thumb from advancing it.
      if (visibility >= 0.65) {
        if (firstMostlyVisible === -1) firstMostlyVisible = index;
        lastMostlyVisible = index;
      }
    });
    var gap = parseFloat(window.getComputedStyle(rail).columnGap) || 0;
    var step = item.getBoundingClientRect().width + gap;
    var distance = 0;
    var visibleWidth = Math.max(0, Math.min(itemRect.right, railRect.right) - Math.max(itemRect.left, railRect.left));
    var itemVisibility = itemRect.width ? visibleWidth / itemRect.width : 0;
    if (advanceAtEdge && view === lastMostlyVisible && view < items.length - 1) distance = step;
    else if (advanceAtEdge && view === firstMostlyVisible && view > 0) distance = -step;
    else if (itemVisibility < 0.9) {
      if (itemRect.left < railRect.left) distance = itemRect.left - railRect.left - 1;
      else if (itemRect.right > railRect.right) distance = itemRect.right - railRect.right + 1;
    }
    if (distance) rail.scrollBy({ left: distance, behavior: "smooth" });
  }
  var thumbRailHoverState = new WeakMap();
  function handleThumbRailHover(event) {
    if (event.pointerType !== "mouse" || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    var thumb = event.target.closest && event.target.closest("[data-shop-thumb], [data-shop-zoom-view]");
    var rail = thumb && thumb.closest(".shop-thumbs, .shop-zoom-thumbs");
    if (!thumb || !rail) return;
    var index = Number(thumb.hasAttribute("data-shop-thumb") ? thumb.getAttribute("data-shop-thumb") : thumb.getAttribute("data-shop-zoom-view"));
    var previousHover = thumbRailHoverState.get(rail);
    if (previousHover) {
      var pointerTravel = Math.abs(event.clientX - previousHover.x) + Math.abs(event.clientY - previousHover.y);
      if (index === previousHover.index || pointerTravel < 4) return;
    }
    thumbRailHoverState.set(rail, { index: index, x: event.clientX, y: event.clientY });
    var items = Array.prototype.slice.call(rail.children);
    var railRect = rail.getBoundingClientRect();
    var firstMostlyVisible = -1;
    var lastMostlyVisible = -1;
    items.forEach(function (candidate, itemIndex) {
      var rect = candidate.getBoundingClientRect();
      var visibleWidth = Math.max(0, Math.min(rect.right, railRect.right) - Math.max(rect.left, railRect.left));
      if (rect.width && visibleWidth / rect.width >= 0.65) {
        if (firstMostlyVisible === -1) firstMostlyVisible = itemIndex;
        lastMostlyVisible = itemIndex;
      }
    });
    if ((index === lastMostlyVisible && index < items.length - 1) || (index === firstMostlyVisible && index > 0)) {
      scrollThumbRail(rail, index, true);
    }
  }
  function releaseThumbRailHover(event) {
    var rail = event.target.closest && event.target.closest(".shop-thumbs, .shop-zoom-thumbs");
    if (!rail || (event.relatedTarget && rail.contains(event.relatedTarget))) return;
    thumbRailHoverState.delete(rail);
  }
  section.addEventListener("pointermove", handleThumbRailHover);
  section.addEventListener("pointerout", releaseThumbRailHover);
  function setCardView(productIndex, view) {
    var product = products[productIndex];
    var views = product.gallery || [imagePath, imagePath, imagePath, imagePath];
    view = modulo(view, views.length);
    product.currentView = view;
    track.querySelectorAll('[data-shop-card][data-product-index="' + productIndex + '"]').forEach(function (card) {
      card.querySelector("[data-shop-frame]").setAttribute("data-view", String(view));
      if (product.gallery) card.querySelector("[data-shop-main-image]").src = views[view];
      card.querySelectorAll("[data-shop-thumb]").forEach(function (item, index) {
        item.setAttribute("aria-pressed", index === view ? "true" : "false");
      });
      card.querySelectorAll("[data-shop-gallery-view]").forEach(function (item, index) {
        item.setAttribute("aria-pressed", index === view ? "true" : "false");
      });
      scrollThumbRail(card.querySelector(".shop-thumbs"), view, false);
    });
  }
  function updateZoomView(view) {
    var product = products[zoomState.productIndex];
    var stage = zoomDialog.querySelector("[data-shop-zoom-stage]");
    var image = zoomDialog.querySelector("[data-shop-zoom-image]");
    var thumbs = zoomDialog.querySelector("[data-shop-zoom-thumbs]");
    var dots = zoomDialog.querySelector("[data-shop-zoom-dots]");
    var thumbScrollLeft = thumbs.scrollLeft;
    zoomState.view = modulo(view, zoomState.views.length);
    stage.setAttribute("data-view", String(zoomState.view));
    stage.setAttribute("data-mode", zoomState.photosMode ? "photos" : "crop");
    zoomDialog.setAttribute("data-gallery-mode", zoomState.photosMode ? "photos" : "crop");
    image.src = zoomState.views[zoomState.view];
    image.alt = product.imageAlt || "Larger view of " + product.title + " " + product.edition;
    thumbs.innerHTML = zoomState.views.map(function (src, index) {
      return '<button class="shop-zoom-thumb" type="button" data-shop-zoom-view="' + index + '" aria-label="Show image ' + (index + 1) + '" aria-pressed="' + (index === zoomState.view ? "true" : "false") + '"><img src="' + src + '" data-view="' + index + '" alt="" loading="lazy"></button>';
    }).join("");
    thumbs.scrollLeft = thumbScrollLeft;
    dots.innerHTML = zoomState.views.map(function (src, index) {
      return '<button class="shop-zoom-dot" type="button" data-shop-zoom-view="' + index + '" aria-label="Show image ' + (index + 1) + '" aria-pressed="' + (index === zoomState.view ? "true" : "false") + '"></button>';
    }).join("");
    setCardView(zoomState.productIndex, zoomState.view);
    window.requestAnimationFrame(function () { scrollThumbRail(thumbs, zoomState.view, true); });
  }
  function attachGallerySwipe(element, onSwipe) {
    var startTouch = null;
    element.addEventListener("touchstart", function (event) {
      if (event.touches.length !== 1) return;
      startTouch = { x: event.touches[0].clientX, y: event.touches[0].clientY, target: event.target };
    }, { passive: true });
    element.addEventListener("touchend", function (event) {
      if (!startTouch || !event.changedTouches.length) return;
      var deltaX = event.changedTouches[0].clientX - startTouch.x;
      var deltaY = event.changedTouches[0].clientY - startTouch.y;
      if (Math.abs(deltaX) >= 38 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2) {
        event.preventDefault();
        onSwipe(deltaX < 0 ? 1 : -1, startTouch.target);
      }
      startTouch = null;
    }, { passive: false });
    element.addEventListener("touchcancel", function () { startTouch = null; }, { passive: true });
  }
  function openZoom(card) {
    if (!card || !card.classList.contains("is-expanded")) return;
    var productIndex = Number(card.getAttribute("data-product-index"));
    var product = products[productIndex];
    var frame = card.querySelector("[data-shop-frame]");
    zoomState.productIndex = productIndex;
    zoomState.views = product.gallery || [imagePath, imagePath, imagePath, imagePath];
    zoomState.photosMode = Boolean(product.gallery);
    zoomState.originCard = card;
    zoomState.view = modulo(Number(frame.getAttribute("data-view")) || 0, zoomState.views.length);
    zoomDialog.querySelector("[data-shop-zoom-title]").textContent = product.title + " (" + product.edition + ")";
    var zoomDescription = zoomDialog.querySelector("[data-shop-zoom-description]");
    zoomDescription.textContent = product.composition && product.composition.length ? product.detail : (product.zoomDescription || product.detail);
    zoomDescription.classList.toggle("shop-haiku", Boolean(product.poem));
    if (product.detailAttribution) {
      var attribution = document.createElement("span");
      attribution.className = "shop-zoom-attribution";
      attribution.textContent = product.detailAttribution;
      zoomDescription.appendChild(attribution);
    }
    zoomDialog.toggleAttribute("data-has-attribution", Boolean(product.detailAttribution));
    zoomDialog.querySelector("[data-shop-zoom-price]").innerHTML = pricePairMarkup(product);
    zoomDialog.toggleAttribute("data-square-zoom", Boolean(product.squareZoom));
    var zoomStage = zoomDialog.querySelector("[data-shop-zoom-stage]");
    zoomStage.classList.toggle("is-square", Boolean(product.squareZoom));
    zoomStage.classList.toggle("is-portrait", Boolean(product.gallery && product.galleryHeight > product.galleryWidth));
    if (product.gallery) zoomStage.style.setProperty("--gallery-aspect", (product.galleryWidth || 1280) + " / " + (product.galleryHeight || 949));
    else zoomStage.style.removeProperty("--gallery-aspect");
    var zoomComposition = zoomDialog.querySelector("[data-shop-zoom-composition]");
    var composition = product.composition || [];
    zoomComposition.innerHTML = composition.map(function (item) {
      return '<li>' + compositionIconMarkup(item) + '<span class="shop-composition-copy"><b>' + item.label + '</b><span>' + item.value + '</span></span></li>';
    }).join("");
    zoomComposition.hidden = !composition.length;
    var zoomFacts = zoomDialog.querySelector("[data-shop-zoom-facts]");
    var facts = product.facts || [];
    zoomFacts.innerHTML = facts.map(function (fact) {
      return '<div' + (fact.label === "Delivery" ? ' class="shop-fact-delivery"' : '') + '><b>' + fact.label + '</b><span>' + fact.value + '</span></div>';
    }).join("");
    zoomFacts.hidden = !facts.length;
    updateZoomView(zoomState.view);
    if (!zoomDialog.open) zoomDialog.showModal();
  }
  function requestZoomProduct() {
    var productIndex = zoomState.productIndex;
    var card = zoomState.originCard;
    zoomDialog.close();
    showDetails(productIndex);
    if (!card || !card.isConnected) {
      card = track.querySelector('[data-shop-card][data-product-index="' + productIndex + '"][data-shop-clone="false"]');
    }
    var panel = card && card.querySelector("[data-shop-inline]");
    if (panel) showInquiryForm(panel);
  }
  zoomDialog.addEventListener("click", function (event) {
    if (event.target === zoomDialog) zoomDialog.close();
  });
  zoomDialog.addEventListener("keydown", function (event) {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      updateZoomView(zoomState.view - 1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      updateZoomView(zoomState.view + 1);
    }
  });
  attachGallerySwipe(track, function (direction, target) {
    var frame = target.closest && target.closest("[data-shop-frame]");
    var card = frame && frame.closest("[data-shop-card]");
    if (!frame || !card) return;
    setCardView(Number(card.getAttribute("data-product-index")), Number(frame.getAttribute("data-view")) + direction);
    suppressFrameClick = true;
    window.setTimeout(function () { suppressFrameClick = false; }, 500);
  });
  attachGallerySwipe(zoomDialog.querySelector("[data-shop-zoom-stage]"), function (direction) {
    updateZoomView(zoomState.view + direction);
  });

  track.addEventListener("submit", async function (event) {
    var form = event.target.closest("[data-shop-inquiry-form]");
    if (!form) return;
    event.preventDefault();
    var status = form.querySelector("[data-shop-inquiry-status]");
    var submit = form.querySelector(".shop-inquiry-submit");
    var card = form.closest("[data-shop-card]");
    var product = products[Number(card.getAttribute("data-product-index"))];
    status.textContent = "";
    status.classList.remove("is-error");
    if (!form.reportValidity()) return;
    submit.disabled = true;
    submit.querySelector("span").textContent = "Sending…";
    try {
      var response = await fetch("/api/product-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.elements.email.value.trim(),
          product: product.title + " — " + product.edition,
          consent: form.elements.consent.checked,
          website: form.elements.website.value
        })
      });
      var result = await response.json().catch(function () { return {}; });
      if (!response.ok || !result.ok) throw new Error(result.error || "Please try again in a moment.");
      form.reset();
      status.textContent = "Thank you! I’ll be in touch about this piece.";
    } catch (error) {
      status.classList.add("is-error");
      status.textContent = error.message || "The request could not be sent. Please try again.";
    } finally {
      submit.disabled = false;
      submit.querySelector("span").textContent = "Send request";
      syncExpandedHeight();
      drawContour();
    }
  });

  section.addEventListener("click", function (event) {
    var target = event.target;
    if (!target.closest) return;
    if (suppressFrameClick && target.closest("[data-shop-frame]")) {
      suppressFrameClick = false;
      return;
    }
    var nextButton = target.closest("[data-shop-next]");
    var previousButton = target.closest("[data-shop-prev]");
    var page = target.closest("[data-shop-page]");
    var more = target.closest("[data-shop-more-selected]");
    var thumb = target.closest("[data-shop-thumb]");
    var galleryView = target.closest("[data-shop-gallery-view]");
    var zoomTrigger = target.closest("[data-shop-zoom-trigger]");
    var mobilePrevious = target.closest("[data-shop-mobile-image-prev]");
    var mobileNext = target.closest("[data-shop-mobile-image-next]");
    var mobileMore = target.closest("[data-shop-mobile-more]");
    var zoomClose = target.closest("[data-shop-zoom-close]");
    var zoomPrevious = target.closest("[data-shop-zoom-prev]");
    var zoomNext = target.closest("[data-shop-zoom-next]");
    var zoomView = target.closest("[data-shop-zoom-view]");
    var zoomRequest = target.closest("[data-shop-zoom-request]");
    var card = target.closest("[data-shop-card]");
    var inquiryOpen = target.closest("[data-shop-inquiry-open]");
    var inquiryBack = target.closest("[data-shop-inquiry-back]");
    var detailsClose = target.closest("[data-shop-details-close]");
    if (mobilePrevious || mobileNext) {
      if (card) {
        var mobileIndex = Number(card.getAttribute("data-product-index"));
        var mobileView = Number(card.querySelector("[data-shop-frame]").getAttribute("data-view"));
        setCardView(mobileIndex, mobileView + (mobileNext ? 1 : -1));
      }
      return;
    }
    if (mobileMore) {
      if (card) {
        var detailsIndex = Number(card.getAttribute("data-product-index"));
        if (detailOpen && detailsIndex === active) hideDetails();
        else showDetails(detailsIndex);
      }
      return;
    }
    if (zoomTrigger) {
      if (card && Number(card.getAttribute("data-product-index")) === active && detailOpen) openZoom(card);
      return;
    }
    if (zoomClose) { zoomDialog.close(); return; }
    if (zoomPrevious) { updateZoomView(zoomState.view - 1); return; }
    if (zoomNext) { updateZoomView(zoomState.view + 1); return; }
    if (zoomView) { updateZoomView(Number(zoomView.getAttribute("data-shop-zoom-view"))); return; }
    if (zoomRequest) { requestZoomProduct(); return; }
    if (nextButton) { next(); return; }
    if (previousButton) { previous(); return; }
    if (page) { navigate(Number(page.getAttribute("data-shop-page")), 0, true); return; }
    if (more) { detailOpen ? hideDetails() : showDetails(active); return; }
    if (detailsClose) { hideDetails(); return; }
    if (inquiryOpen) {
      var inquiryPanel = inquiryOpen.closest("[data-shop-inline]");
      if (inquiryPanel) showInquiryForm(inquiryPanel);
      return;
    }
    if (inquiryBack) {
      var backPanel = inquiryBack.closest("[data-shop-inline]");
      if (backPanel) showProductContent(backPanel);
      return;
    }
    if (thumb) {
      var parentCard = thumb.closest("[data-shop-card]");
      if (parentCard) {
        var view = Number(thumb.getAttribute("data-shop-thumb"));
        var productIndex = Number(parentCard.getAttribute("data-product-index"));
        var thumbRail = thumb.closest(".shop-thumbs");
        setCardView(productIndex, view);
        choose(productIndex, 0, false);
        window.requestAnimationFrame(function () { scrollThumbRail(thumbRail, view, true); });
      }
      return;
    }
    if (galleryView) {
      var galleryCard = galleryView.closest("[data-shop-card]");
      if (galleryCard) setCardView(Number(galleryCard.getAttribute("data-product-index")), Number(galleryView.getAttribute("data-shop-gallery-view")));
      return;
    }
    if (card) {
      if (window.innerWidth <= 680) return;
      if (target.closest("button, a, input, select, textarea, label, form")) return;
      var productIndex = Number(card.getAttribute("data-product-index"));
      if (detailOpen && productIndex === active) hideDetails();
      else showDetails(productIndex);
    }
  });

  track.addEventListener("keydown", function (event) {
    if (event.target !== event.target.closest("[data-shop-card]")) return;
    if (event.key !== "Enter" && event.key !== " ") return;
    if (window.innerWidth <= 680) return;
    event.preventDefault();
    var card = event.target.closest("[data-shop-card]");
    var productIndex = Number(card.getAttribute("data-product-index"));
    if (detailOpen && productIndex === active) hideDetails();
    else showDetails(productIndex);
  });

  viewport.addEventListener("transitionend", function (event) {
    if (event.target === viewport && event.propertyName === "height") drawContour();
  });

  function applyCardWidths() {
    var cardWidth = baseCardWidth || viewport.clientWidth / perView;
    viewport.setAttribute("data-expanded", detailOpen ? "true" : "false");
    var selectedMultiplier;
    if (!detailOpen) {
      selectedMultiplier = 1;
    } else if (perView === 1) {
      selectedMultiplier = 1;
    } else {
      selectedMultiplier = perView === 4 ? 2.05 : 1.66;
    }
    var sideMultiplier = detailOpen && perView > 1
      ? (perView - selectedMultiplier) / (perView - 1)
      : (detailOpen ? 0.68 : 1);
    track.querySelectorAll(".shop-card").forEach(function (card) {
      var selected = Number(card.getAttribute("data-product-index")) === active;
      card.style.flexBasis = (cardWidth * (detailOpen && selected ? selectedMultiplier : sideMultiplier)) + "px";
    });
  }
  function sizeCards() {
    var width = window.innerWidth;
    var nextMobileLayout = width <= 680;
    var layoutChanged = nextMobileLayout !== mobileLayout;
    if (layoutChanged) {
      mobileLayout = nextMobileLayout;
      detailOpen = nextMobileLayout;
    }
    perView = width <= 680 ? 1 : (width <= 1100 ? 3 : 4);
    baseCardWidth = viewport.clientWidth / perView;
    applyCardWidths();
    drawContour();
    start = detailOpen
      ? (perView > 1 ? modulo(active - 1, countTotal) : active)
      : modulo(active - Math.min(2, perView - 1), countTotal);
    position = countTotal + start;
    renderTrack(false);
    if (layoutChanged) updateStatus();
    syncExpandedHeight();
    drawContour();
  }
  function drawContour() {
    var cards = track.querySelectorAll(".shop-card");
    var railWidth = Math.ceil(track.scrollWidth || track.getBoundingClientRect().width);
    var railHeight = viewport.clientHeight;
    var railBox = track.getBoundingClientRect();
    var path = "";
    function pixelCenter(value) { return Math.round(value - 0.5) + 0.5; }
    cards.forEach(function (card, index) {
      var frame = card.querySelector("[data-shop-frame]");
      var cardBox = card.getBoundingClientRect();
      var frameBox = frame.getBoundingClientRect();
      var visitor = card.querySelector(".shop-visitor");
      if (visitor && window.innerWidth <= 680) {
        var visitorBox = visitor.getBoundingClientRect();
        var visitorHeight = visitorBox.height;
        if (!visitorHeight && visitor.naturalWidth) {
          var visitorWidth = parseFloat(window.getComputedStyle(visitor).width) || 0;
          visitorHeight = visitor.naturalHeight * visitorWidth / visitor.naturalWidth;
        }
        visitor.style.top = Math.max(0, frameBox.bottom - cardBox.top - visitorHeight + 16) + "px";
        visitor.style.bottom = "auto";
      } else if (visitor) {
        visitor.style.removeProperty("top");
        visitor.style.removeProperty("bottom");
      }
      var activeStyle = card.getAttribute("data-active-style");
      var attachAtCardTop = card.classList.contains("is-expanded") && (
        activeStyle === "contour-below-text" && card.querySelector("[data-shop-inline]").classList.contains("is-inquiry")
      );
      var attachAtPanelTop = card.classList.contains("is-expanded") && activeStyle === "expanded-art";
      var meta = card.querySelector(".shop-card-meta");
      if (attachAtPanelTop && meta && window.innerWidth > 680) {
        var labelVariable = window.innerWidth <= 680 ? "--mobile-label-top" : "--label-top";
        var baseLabelTop = parseFloat(card.style.getPropertyValue(labelVariable)) || 0;
        meta.style.top = baseLabelTop + "px";
        var number = meta.querySelector(".shop-card-number");
        var numberBox = number.getBoundingClientRect();
        var labelGap = Math.max(0, frameBox.top - 20 - numberBox.bottom);
        meta.style.top = (baseLabelTop + labelGap * 0.6) + "px";
      } else if (meta) {
        meta.style.removeProperty("top");
      }
      var imageGapTop;
      var left;
      var right;
      if (attachAtCardTop) {
        imageGapTop = pixelCenter(cardBox.top - railBox.top + 0.5);
        left = pixelCenter(cardBox.left - railBox.left + 0.5);
        right = pixelCenter(cardBox.right - railBox.left - 0.5);
      } else if (attachAtPanelTop) {
        imageGapTop = pixelCenter(frameBox.top - railBox.top - 20);
        left = pixelCenter(cardBox.left - railBox.left + 0.5);
        right = pixelCenter(cardBox.right - railBox.left - 0.5);
      } else {
        imageGapTop = pixelCenter(frameBox.top - railBox.top - 20);
        var sideGap = Math.min(20, Math.max(0, (cardBox.width - frameBox.width) / 2));
        left = pixelCenter(frameBox.left - railBox.left - sideGap + 0.5);
        right = pixelCenter(frameBox.right - railBox.left + sideGap - 0.5);
      }
      if (!index) path = "M" + left + " " + imageGapTop + "H" + right;
      else path += "V" + imageGapTop + "H" + left + "H" + right;
    });
    path += "V" + Math.max(0, pixelCenter(railHeight - 7.5));
    contour.setAttribute("viewBox", "0 0 " + railWidth + " " + railHeight);
    contour.setAttribute("width", String(railWidth));
    contour.setAttribute("height", String(railHeight));
    contourPath.setAttribute("d", path);
  }
  track.addEventListener("load", function (event) {
    if (!event.target) return;
    if (event.target.classList && event.target.classList.contains("shop-visitor")) drawContour();
    if (event.target.hasAttribute("data-shop-main-image")) {
      syncExpandedHeight();
      drawContour();
    }
  }, true);
  window.addEventListener("resize", sizeCards);

  sizeCards();
  updateStatus();
})();
