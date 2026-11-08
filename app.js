/* Food Delivery backlog prototype.
   One page with a link for each backlog item: index.html#/<slug>, for example #/sold-out-switch.
   Each item shows the problem "Today" and "With the fix" in the app where it happens.
   Plain JavaScript and CSS with no build step, so this folder can be uploaded to Vercel as it is.
   The item texts are in items.js. Restaurant names, dishes and prices come from the class case data. */
(function () {
  "use strict";

  var ITEMS = window.FD_ITEMS || [];
  var page = document.getElementById("page");

  /* ================================================================== helpers */
  var esc = function (s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };
  var tk = function (n) { return "Tk " + Math.round(n).toLocaleString("en-IN"); };
  var photo = function (name) { return "img/" + name + ".webp"; };
  var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var fmtDate = function (iso) { var p = String(iso).split("-").map(Number); return p.length === 3 ? p[2] + " " + MONTHS[p[1] - 1] : iso; };
  var daysBetween = function (a, b) { return Math.round((Date.parse(b) - Date.parse(a)) / 86400000); };
  var TODAY = "2027-03-31"; // "now" in the class case

  var ICONS = {
    back: '<path d="M15 18l-6-6 6-6"/>',
    right: '<path d="M9 6l6 6-6 6"/>',
    down: '<path d="M6 9l6 6 6-6"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    star: '<path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    bike: '<circle cx="6" cy="16" r="3.2"/><circle cx="18" cy="16" r="3.2"/><path d="M6 16l4-7h5l3 7M10 9L8.5 6H6M15 9h3"/>',
    pin: '<path d="M12 21s-6.5-6.2-6.5-11a6.5 6.5 0 0 1 13 0c0 4.8-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.4"/>',
    home: '<path d="M4 11l8-6.5 8 6.5M6.5 9.5V19h11V9.5"/>',
    search: '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4 4"/>',
    phone: '<path d="M6.5 3.5h3l1.5 4-2 1.3a10 10 0 0 0 6.2 6.2l1.3-2 4 1.5v3a2 2 0 0 1-2 2A16.5 16.5 0 0 1 4.5 5.5a2 2 0 0 1 2-2z"/>',
    chat: '<path d="M4.5 5.5h15v10h-9l-4 3.5v-3.5h-2z"/>',
    bag: '<path d="M5.5 8h13l-1 12h-11zM9 8V6.5a3 3 0 0 1 6 0V8"/>',
    list: '<path d="M8 7h12M8 12h12M8 17h12M4 7h.01M4 12h.01M4 17h.01"/>',
    tag: '<path d="M3.5 12.5V4h8.5l8.5 8.5-8 8z"/><circle cx="8" cy="8.5" r="1.4"/>',
    wallet: '<path d="M4 7h14.5v12H4zM4 7l11-3v3M15 13h3.5"/>',
    alert: '<path d="M12 4l9 16H3z"/><path d="M12 10v4.5M12 17.5h.01"/>',
    info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5M12 8h.01"/>',
    img: '<rect x="4" y="5" width="16" height="14" rx="2"/><circle cx="9" cy="10" r="1.6"/><path d="M20 16l-5-5-8 8"/>',
    file: '<path d="M6 3.5h8l4 4v13H6z"/><path d="M14 3.5v4h4"/>',
    user: '<circle cx="12" cy="8.5" r="3.5"/><path d="M5 20c1.2-3.6 3.8-5.2 7-5.2s5.8 1.6 7 5.2"/>',
    card: '<rect x="3.5" y="6" width="17" height="12" rx="2"/><path d="M3.5 10h17"/>',
    nav: '<path d="M4 11.5L20 4l-7.5 16-2-6.5z"/>',
    upload: '<path d="M12 16V4M7 9l5-5 5 5M4 16v3.5h16V16"/>',
    camera: '<path d="M4 8h3.5L9 5.5h6L16.5 8H20v11H4z"/><circle cx="12" cy="13" r="3.5"/>'
  };
  var ic = function (name, cls) {
    return '<svg class="ic' + (cls ? " " + cls : "") + '" viewBox="0 0 24 24" aria-hidden="true">' + (ICONS[name] || "") + "</svg>";
  };

  /* ============================================== state, timers and redraws */
  var current = null;    // { item, demo, mode, state }
  var timers = [];       // toasts and short delays: cleared when the item or the mode changes
  var mountTimers = [];  // animations: cleared on every redraw of the stage
  function clearTimers() {
    timers.forEach(clearTimeout); timers = [];
    mountTimers.forEach(clearInterval); mountTimers = [];
  }
  function later(s, fn, ms) {
    timers.push(setTimeout(function () {
      if (current && current.state === s) { fn(); renderStage(); }
    }, ms));
  }
  // Show a short message. key "toast" shows in the first device, "toast2" in the second.
  function flash(s, msg, key) {
    key = key || "toast";
    s[key] = msg;
    var n = (s[key + "N"] = (s[key + "N"] || 0) + 1);
    later(s, function () { if (s[key + "N"] === n) { s[key] = ""; } }, 2600);
  }

  /* ========================================================= device frames */
  function phone(caption, body, overlay, key) {
    return '<figure class="dev"><figcaption class="dev-cap">' + esc(caption) + '</figcaption>' +
      '<div class="phone"><div class="phone-screen">' +
      '<div class="phone-status"><span>1:10</span><span class="phone-sig" aria-hidden="true"><i></i><i></i><i></i><b></b></span></div>' +
      '<div class="phone-body" data-scroll="' + esc(caption + ":" + (key || "")) + '">' + body + "</div>" + (overlay || "") +
      "</div></div></figure>";
  }
  function tablet(caption, body, overlay, large) {
    return '<figure class="dev' + (large ? " dev-wide" : "") + '"><figcaption class="dev-cap">' + esc(caption) + '</figcaption>' +
      '<div class="tablet' + (large ? " tablet-lg" : "") + '"><div class="tablet-screen">' + body + (overlay || "") + "</div></div></figure>";
  }
  function browser(caption, url, body, overlay) {
    return '<figure class="dev dev-wide"><figcaption class="dev-cap">' + esc(caption) + '</figcaption>' +
      '<div class="browser"><div class="browser-bar"><span class="browser-dots" aria-hidden="true"><i></i><i></i><i></i></span>' +
      '<span class="browser-url">' + esc(url) + "</span></div>" +
      '<div class="browser-body">' + body + (overlay || "") + "</div></div></figure>";
  }

  /* ======================================================== shared pieces */
  var toast = function (msg) { return msg ? '<div class="toast" role="status">' + esc(msg) + "</div>" : ""; };
  function dialog(title, text, buttons) {
    return '<div class="dim"><div class="dlg" role="dialog" aria-modal="true" aria-label="' + esc(title) + '">' +
      "<h3>" + esc(title) + "</h3>" + (text ? "<p>" + text + "</p>" : "") + '<div class="dlg-btns">' + buttons + "</div></div></div>";
  }
  function sheet(title, inner) {
    return '<div class="dim dim-sheet"><div class="sheet" role="dialog" aria-label="' + esc(title) + '">' +
      '<div class="sheet-grip"></div><div class="sheet-hd"><h3>' + esc(title) + '</h3><button class="icon-btn" data-act="closeSheet" aria-label="Close">' + ic("x") + "</button></div>" +
      inner + "</div></div>";
  }
  function caHeader(title, o) {
    o = o || {};
    var left = o.noBack ? '<span class="icon-btn is-deco"></span>'
      : typeof o.back === "string" ? '<button class="icon-btn" data-act="' + o.back + '" aria-label="Back">' + ic("back") + "</button>"
      : '<span class="icon-btn is-deco" aria-hidden="true">' + ic("back") + "</span>";
    var right = o.right === "none" ? '<span class="icon-btn is-deco"></span>' : '<span class="icon-btn is-deco" aria-hidden="true">' + ic("search") + "</span>";
    return '<div class="ca-hd">' + left + '<div class="ca-hd-title">' + esc(title) + "</div>" + right + "</div>";
  }
  function restHero(r, extra) {
    return '<div class="ca-hero"><h2>' + esc(r.name) + '</h2><div class="ca-meta">' + ic("star", "ic-fill ic-star") +
      "<span>" + esc(r.rating) + "</span><span>&middot;</span><span>" + esc(r.where) + "</span></div>" + (extra || "") + "</div>";
  }
  // o.sold: sold out; o.flash: highlight; o.box: grey box when there is no photo; o.act: action for +
  function dishRow(d, o) {
    o = o || {};
    var img = d.img ? '<img class="ca-dish-img" src="' + photo(d.img) + '" alt="">' : o.box ? '<span class="ca-dish-img ca-noimg">' + ic("img") + "</span>" : "";
    var action = o.sold ? '<span class="pill pill-bad">Sold out</span>'
      : '<button class="add-btn" data-act="' + (o.act || "add") + '" data-id="' + d.id + '" aria-label="Add ' + esc(d.name) + '">' + ic("plus") + "</button>";
    return '<div class="ca-dish' + (o.sold ? " is-sold" : "") + (o.flash ? " flash" : "") + '">' +
      '<div class="ca-dish-txt"><div class="ca-dish-name">' + esc(d.name) + '</div><div class="ca-dish-price">' + tk(d.price) + "</div>" +
      (o.sold ? '<div class="ca-dish-note">Back tomorrow</div>' : "") + "</div>" +
      '<div class="ca-dish-side' + (img ? " has-img" : "") + '">' + img + action + "</div></div>";
  }
  function basketBar(count, total, o) {
    o = o || {};
    return '<div class="ca-bar"><button class="ca-bar-btn" data-act="' + (o.act || "viewBasket") + '">' +
      '<span class="ca-bar-count">' + count + '</span><span class="ca-bar-l">View basket' + (o.sub ? "<small>" + esc(o.sub) + "</small>" : "") + "</span>" +
      '<span class="ca-bar-r">' + tk(total) + "</span></button></div>";
  }
  var billRow = function (l, r, cls) { return '<div class="bill-row' + (cls ? " " + cls : "") + '"><span>' + l + "</span><span>" + r + "</span></div>"; };
  function tabBar(active) {
    return '<nav class="ca-tabs" aria-hidden="true">' + [["Home", "home"], ["Orders", "list"], ["Account", "user"]].map(function (t) {
      return '<span class="' + (t[0] === active ? "is-on" : "") + '">' + ic(t[1]) + t[0] + "</span>";
    }).join("") + "</nav>";
  }
  function chatOverlay() {
    return '<div class="chat">' +
      '<div class="ca-hd"><button class="icon-btn" data-act="closeChat" aria-label="Close the chat">' + ic("back") + '</button><div class="ca-hd-title">Chat with us</div><span class="icon-btn is-deco"></span></div>' +
      '<div class="chat-msgs"><div class="bubble">Hi. Tell us how we can help. An agent will join this chat.</div>' +
      '<div class="bubble">Thanks. You are in the queue. An agent will reply here soon.</div>' +
      '<div class="chat-wait">' + ic("clock") + "First replies take about a day right now</div></div>" +
      '<div class="chat-input"><span>Type your message</span>' + ic("chat") + "</div></div>";
  }
  var sw = function (on, act, id, label) {
    return '<button class="sw' + (on ? " is-on" : "") + '" role="switch" aria-checked="' + on + '" aria-label="' + esc(label) + '" data-act="' + act + '" data-id="' + id + '"><span class="sw-knob"></span></button>';
  };
  var pill = function (status) {
    var cls = { Live: "pill-good", Scheduled: "pill-blue", Ended: "pill-grey", Stopped: "pill-grey" }[status] || "pill-grey";
    return '<span class="pill ' + cls + '">' + esc(status) + "</span>";
  };
  // Restaurant tablet app
  function rtShell(name, active, tabs, content, key) {
    var icons = { Orders: "bag", Menu: "list", Discounts: "tag", Payouts: "wallet" };
    return '<div class="rt"><nav class="rt-rail" aria-hidden="true"><span class="rt-logo">FD</span>' + tabs.map(function (t) {
      return '<span class="rt-tab' + (t === active ? " is-on" : "") + '">' + ic(icons[t]) + "<span>" + t + "</span></span>";
    }).join("") + "</nav>" +
      '<div class="rt-main"><div class="rt-top"><span class="rt-name">' + esc(name) + '</span><span class="rt-time">1:10 PM</span></div>' +
      '<div class="rt-content" data-scroll="rt:' + (key || "") + '">' + content + "</div></div></div>";
  }
  // Internal tools (KAM CRM, support tool)
  function itNav(title, items, active) {
    return '<nav class="it-nav" aria-hidden="true"><div class="it-nav-t">' + esc(title) + "</div>" + items.map(function (x) {
      var p = x.split("|");
      return '<span class="' + (p[0] === active ? "is-on" : "") + '">' + p[0] + (p[1] ? "<em>" + p[1] + "</em>" : "") + "</span>";
    }).join("") + "</nav>";
  }
  // Cart helpers: cart is { dishId: quantity }
  var cartCount = function (c) { return Object.keys(c).reduce(function (a, k) { return a + c[k]; }, 0); };
  var cartTotal = function (c, dishes) {
    return Object.keys(c).reduce(function (a, k) { return a + c[k] * dishes.filter(function (d) { return d.id === k; })[0].price; }, 0);
  };
  var cartLines = function (c, dishes) {
    return Object.keys(c).filter(function (k) { return c[k] > 0; }).map(function (k) {
      var d = dishes.filter(function (x) { return x.id === k; })[0];
      return billRow(c[k] + " x " + esc(d.name), tk(c[k] * d.price));
    }).join("");
  };
  // Basket helpers: basket is { rest, lines: [{ name, qty, price }] }
  var bCount = function (b) { return b.lines.reduce(function (a, l) { return a + l.qty; }, 0); };
  var bTotal = function (b) { return b.lines.reduce(function (a, l) { return a + l.qty * l.price; }, 0); };
  var bLines = function (b) { return b.lines.map(function (l) { return billRow(l.qty + " x " + esc(l.name), tk(l.qty * l.price)); }).join(""); };

  /* ================================================================ the map */
  // A small made-up street grid in Dhanmondi. MAP_ROUTE runs from the restaurant to the customer.
  var MAP_ROUTE = [[34, 204], [160, 204], [160, 122], [262, 122], [262, 40], [296, 40]];
  function along(pts, t) {
    var seg = [], total = 0, i;
    for (i = 1; i < pts.length; i++) { var d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(d); total += d; }
    var left = Math.max(0, Math.min(1, t)) * total;
    for (i = 0; i < seg.length; i++) {
      if (left <= seg[i]) {
        var f = seg[i] ? left / seg[i] : 0;
        return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * f, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * f, i];
      }
      left -= seg[i];
    }
    var last = pts[pts.length - 1];
    return [last[0], last[1], seg.length - 1];
  }
  var ptsAttr = function (pts) { return pts.map(function (p) { return p[0].toFixed(1) + "," + p[1].toFixed(1); }).join(" "); };
  // o: { route, remaining (points), pins: true | "drop", rider: [x, y], label }
  function cityMap(o) {
    o = o || {};
    // Road centre lines; blocks fill the space between them. The grid runs past the 320 x 260
    // view box so a tall or wide frame still shows streets around the route.
    var roadX = [-140, -40, 60, 160, 262, 362, 462];
    var roadY = [-206, -124, -42, 40, 122, 204, 286, 368, 450];
    var g = '<rect x="-200" y="-260" width="720" height="780" fill="#FFFFFF"/>';
    for (var i = 0; i < roadX.length - 1; i++) {
      for (var j = 0; j < roadY.length - 1; j++) {
        var x0 = roadX[i] + 8, x1 = roadX[i + 1] - 8, y0 = roadY[j] + 8, y1 = roadY[j + 1] - 8;
        var fill = x0 === 68 && y0 === 48 ? "#D3EBD7" : x0 === 270 && y0 === 212 ? "#D3E5F3" : "#EDF0F2";
        g += '<rect x="' + x0 + '" y="' + y0 + '" width="' + (x1 - x0) + '" height="' + (y1 - y0) + '" rx="5" fill="' + fill + '"/>';
      }
    }
    var lbl = function (x, y, t, up) {
      return '<text x="' + x + '" y="' + y + '"' + (up ? ' transform="rotate(-90 ' + x + " " + y + ')"' : "") +
        ' font-size="7" fill="#8A939C" font-family="Inter, sans-serif" text-anchor="middle">' + t + "</text>";
    };
    g += lbl(110, 206.5, "Satmasjid Road") + lbl(162.5, 163, "Road 27", true) + lbl(211, 124.5, "Road 11") + lbl(264.5, 81, "Lane 4", true);
    if (o.route) {
      g += '<polyline points="' + ptsAttr(MAP_ROUTE) + '" fill="none" stroke="#0E7A6E" stroke-opacity=".25" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>';
      g += '<polyline id="route-left" points="' + ptsAttr(o.remaining || MAP_ROUTE) + '" fill="none" stroke="#0E7A6E" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>';
    }
    var pin = function (p, color) {
      return '<g transform="translate(' + p[0] + " " + p[1] + ')"><path d="M0 0C-5 -7 -9 -10.5 -9 -15.5a9 9 0 0 1 18 0C9 -10.5 5 -7 0 0z" fill="' + color + '" stroke="#fff" stroke-width="1.5"/><circle cy="-15.5" r="3.6" fill="#fff"/></g>';
    };
    if (o.pins === true) { g += pin(MAP_ROUTE[0], "#B45309"); }
    if (o.pins) { g += pin(MAP_ROUTE[MAP_ROUTE.length - 1], "#0E7A6E"); }
    if (o.rider) {
      g += '<g id="rider-dot" transform="translate(' + o.rider[0].toFixed(1) + " " + o.rider[1].toFixed(1) + ')"><circle r="11" fill="#1D4ED8" fill-opacity=".18"/><circle r="6" fill="#1D4ED8" stroke="#fff" stroke-width="2"/></g>';
    }
    return '<svg class="map" viewBox="0 0 320 260" preserveAspectRatio="xMidYMid meet" role="img" aria-label="' + esc(o.label || "Map") + '">' + g + "</svg>";
  }

  /* ============================================ restaurants used in the demos */
  var KACCHI = {
    name: "Rongdhonu Kacchi House", where: "Kacchi, Old Dhaka", rating: "4.8",
    dishes: [
      { id: "tehari", name: "Beef Tehari", price: 260, img: "tehari-1" },
      { id: "bkacchi", name: "Beef Kacchi", price: 310, img: "kacchi-1" },
      { id: "ckacchi", name: "Chicken Kacchi", price: 530, img: "kacchi-2" },
      { id: "jali", name: "Jali Kabab", price: 100 },
      { id: "borhani", name: "Borhani", price: 70 },
      { id: "doi", name: "Doi", price: 110 }
    ]
  };
  var DAAWAT = {
    name: "Daawat Biryani Ghor", where: "Biryani, Old Dhaka", rating: "4.5",
    dishes: [
      { id: "cbir", name: "Chicken Biryani", price: 320, img: "biryani-1" },
      { id: "bbir", name: "Beef Biryani special", price: 360, img: "biryani-2" },
      { id: "polao", name: "Morog Polao special", price: 420 },
      { id: "egg", name: "Egg Biryani", price: 280 },
      { id: "borhani", name: "Borhani", price: 80 },
      { id: "firni", name: "Firni special", price: 110 }
    ]
  };
  var PADMA = {
    name: "Padma Bakery and Cafe", where: "Cafe, Banani", rating: "3.9",
    dishes: [
      { id: "cake", name: "Red Velvet Cake", price: 280, img: "dessert-3" },
      { id: "mocha", name: "Mocha", price: 310, img: "cafe-1" },
      { id: "waffle", name: "Waffle", price: 280 },
      { id: "cookie", name: "Cookie", price: 60 },
      { id: "latte", name: "Iced Latte", price: 360 }
    ]
  };
  var SHISHIR = {
    name: "Shishir Chotpoti Point", where: "Street food, Gulshan", rating: "4.1", min: 250,
    dishes: [
      { id: "chotpoti", name: "Chotpoti", price: 80, img: "chotpoti-1" },
      { id: "fuchka", name: "Fuchka (10 pcs)", price: 100, img: "fuchka-1" },
      { id: "velpuri", name: "Velpuri", price: 100 },
      { id: "haleem", name: "Haleem", price: 220 },
      { id: "jhalmuri", name: "Jhalmuri", price: 40 },
      { id: "momo", name: "Chicken Momo", price: 190 }
    ]
  };
  var HAJI = {
    name: "Haji Grill and Burger", where: "Burger, Mohammadpur", rating: "3.6",
    dishes: [
      { id: "dbb", name: "Double Beef Burger", price: 420, img: "burger-2" },
      { id: "cheese", name: "Cheese Burger", price: 350, img: "burger-3" },
      { id: "chicken", name: "Chicken Burger", price: 270, img: "burger-1" }
    ]
  };
  var find = function (list, id) { return list.filter(function (d) { return d.id === id; })[0]; };

  /* ================================================================= demos */
  // Each demo: init() gives a fresh state; view(state) returns the devices; act holds the
  // click handlers (data-act), change handlers (data-change) and input handlers (data-input).
  // state.mode is "today" or "fix".
  var DEMOS = {};

  /* 1. Sold-out switch -------------------------------------------------- */
  DEMOS["sold-out-switch"] = {
    init: function () { return { sold: {}, flashId: null, asked: false, cancelled: false }; },
    view: function (s) {
      var fix = s.mode === "fix";
      var rows = KACCHI.dishes.map(function (d) {
        var off = fix && s.sold[d.id];
        var ctl = fix
          ? '<span class="rt-swl ' + (off ? "t-bad" : "t-good") + '">' + (off ? "Sold out" : "Available") + "</span>" + sw(!off, "toggle", d.id, d.name + " available")
          : '<span class="rt-swl t-muted">Available</span>';
        return '<div class="rt-row' + (off ? " is-off" : "") + '"><div class="rt-row-main"><div class="rt-row-name">' + esc(d.name) +
          '</div><div class="rt-row-sub">' + tk(d.price) + '</div></div><div class="rt-row-ctl">' + ctl + "</div></div>";
      }).join("");
      var note;
      if (fix) { note = '<div class="note note-good">' + ic("info") + "<span>Switch a dish off when it runs out. Customers see the change in a few seconds, and it comes back on when you open tomorrow.</span></div>"; }
      else if (s.asked) { note = '<div class="note note-warn">' + ic("clock") + "<span>Message sent to your account manager. A menu change takes about 3.5 hours.</span></div>"; }
      else { note = '<div class="note note-warn">' + ic("info") + '<span>Your menu is view only. To mark a dish sold out, contact your account manager.<button class="btn btn-sm note-btn" data-act="askKam">Contact account manager</button></span></div>'; }
      var tab = rtShell(KACCHI.name, "Menu", ["Orders", "Menu", "Payouts"],
        '<div class="rt-hd"><h2>Menu</h2><span class="rt-hd-sub">' + KACCHI.dishes.length + " dishes</span></div>" + note + '<div class="rt-list">' + rows + "</div>", "sold");
      var list = KACCHI.dishes.map(function (d) { return dishRow(d, { sold: fix && s.sold[d.id], flash: s.flashId === d.id }); }).join("");
      var body = caHeader("") + restHero(KACCHI) + '<div class="ca-sec-t">Menu</div><div class="ca-list">' + list + "</div>";
      var over = s.cancelled
        ? dialog("Order cancelled", "You ordered Beef Tehari. A few minutes later " + esc(KACCHI.name) + " cancelled the order: <b>the dish is sold out</b>.", '<button class="btn btn-primary" data-act="closeDlg">OK</button>')
        : toast(s.toast2);
      return tablet("Restaurant tablet", tab, toast(s.toast)) + phone("Customer app", body, over, "menu");
    },
    act: {
      toggle: function (s, el) {
        var id = el.getAttribute("data-id");
        s.sold[id] = !s.sold[id]; s.flashId = id;
        flash(s, s.sold[id] ? find(KACCHI.dishes, id).name + " is sold out for today" : find(KACCHI.dishes, id).name + " is available again");
        later(s, function () { s.flashId = null; }, 1500);
      },
      askKam: function (s) { s.asked = true; },
      add: function (s, el) {
        var d = find(KACCHI.dishes, el.getAttribute("data-id"));
        if (s.mode === "today" && d.id === "tehari") { s.cancelled = true; return; }
        flash(s, d.name + " added to basket", "toast2");
      },
      closeDlg: function (s) { s.cancelled = false; }
    }
  };

  /* 2. Restaurants set their own discounts ------------------------------- */
  DEMOS["restaurant-discounts"] = {
    init: function () {
      return { pct: 15, on: "Whole menu", start: "2027-04-01", end: "", err: "", form: null,
        list: [{ pct: 10, on: "Borhani", start: "2027-03-01", end: "2027-03-20", status: "Ended" }] };
    },
    view: function (s) {
      if (s.mode === "today") { return kamDiscountForm(s); }
      var what = function (on) { return on === "Whole menu" ? "the whole menu" : on; };
      var chips = [10, 15, 20, 25].map(function (p) {
        return '<button class="chipbtn' + (s.pct === p ? " is-on" : "") + '" data-act="pct" data-v="' + p + '" aria-pressed="' + (s.pct === p) + '">' + p + "%</button>";
      }).join("");
      var opts = ["Whole menu", "Beef Kacchi", "Chicken Kacchi", "Beef Tehari"].map(function (o) {
        return "<option" + (o === s.on ? " selected" : "") + ">" + o + "</option>";
      }).join("");
      var preview = s.pct + "% off " + what(s.on) + (s.end ? ", " + fmtDate(s.start) + " to " + fmtDate(s.end) : "");
      var form = '<div class="rt-card"><div class="rt-card-t">New discount</div>' +
        '<div class="fld"><span class="fld-l">Discount</span><div class="chips">' + chips + '</div><span class="fld-h">Up to 25%. You and Food Delivery each pay half.</span></div>' +
        '<label class="fld"><span class="fld-l">On</span><select data-change="setOn">' + opts + "</select></label>" +
        '<div class="fld-2"><label class="fld"><span class="fld-l">Starts</span><input type="date" value="' + s.start + '" min="' + TODAY + '" max="2027-12-31" data-change="setStart"></label>' +
        '<label class="fld"><span class="fld-l">Ends</span><input type="date" value="' + s.end + '" min="' + s.start + '" max="2027-12-31" data-change="setEnd" aria-required="true"></label></div>' +
        (s.err ? '<div class="fld-err" role="alert">' + ic("alert") + "<span>" + esc(s.err) + "</span></div>" : "") +
        '<div class="preview"><span>Customers see</span><b>' + esc(preview) + "</b></div>" +
        '<button class="btn btn-primary btn-block" data-act="go">Start discount</button></div>';
      var list = s.list.map(function (x, i) {
        var canStop = x.status === "Live" || x.status === "Scheduled";
        return '<div class="rt-row"><div class="rt-row-main"><div class="rt-row-name">' + x.pct + "% off " + esc(what(x.on)) + '</div><div class="rt-row-sub">' +
          fmtDate(x.start) + " to " + fmtDate(x.end) + '</div></div><div class="rt-row-ctl">' + pill(x.status) +
          (canStop ? '<button class="btn btn-sm" data-act="stop" data-i="' + i + '">Stop</button>' : "") + "</div></div>";
      }).join("");
      var content = '<div class="rt-hd"><h2>Discounts</h2></div>' + form +
        '<div class="rt-card"><div class="rt-card-t">Your discounts</div><div class="rt-list rt-list-flat">' + list + "</div></div>";
      return tablet("Restaurant tablet", rtShell(KACCHI.name, "Discounts", ["Orders", "Menu", "Discounts", "Payouts"], content, "disc"), toast(s.toast), true);
    },
    act: {
      pct: function (s, el) { s.pct = Number(el.getAttribute("data-v")); },
      setOn: function (s, el) { s.on = el.value; },
      setStart: function (s, el) { s.start = el.value || TODAY; s.err = ""; },
      setEnd: function (s, el) { s.end = el.value; s.err = ""; },
      go: function (s) {
        if (!s.end) { s.err = "Pick an end date. Every discount needs one."; return; }
        var days = daysBetween(s.start, s.end);
        if (days < 0) { s.err = "The end date is before the start date."; return; }
        if (days > 30) { s.err = "A discount can run for up to 31 days. Start a new one after that."; return; }
        s.list.unshift({ pct: s.pct, on: s.on, start: s.start, end: s.end, status: s.start <= TODAY ? "Live" : "Scheduled" });
        s.err = ""; s.end = "";
        flash(s, "Saved. Customers see it from " + fmtDate(s.list[0].start) + ".");
      },
      stop: function (s, el) {
        s.list[Number(el.getAttribute("data-i"))].status = "Stopped";
        flash(s, "Stopped. Customers no longer see this discount.");
      },
      kamSave: function (s) {
        var v = function (id) { var e = document.getElementById(id); return e ? e.value : ""; };
        s.form = { pct: v("kam-pct"), start: v("kam-start"), end: v("kam-end"), notes: v("kam-notes") };
        s.reveal = ".kam-result";
      }
    }
  };
  function kamDiscountForm(s) {
    var f = s.form || { pct: "15", start: "", end: "", notes: "" };
    var result = "";
    if (s.form) {
      var warns = [];
      if (!f.end.trim()) { warns.push("No end date. This discount runs until someone remembers to stop it."); }
      if (!/^\d{1,2}$/.test(f.pct.trim()) || Number(f.pct) > 50) { warns.push('"' + f.pct + '" was saved as the percent. Nothing checks it.'); }
      if (f.start.trim()) { warns.push('The start date "' + f.start + '" is free text, so it can mean different dates to different people.'); }
      else { warns.push("No start date. Nobody knows when it begins."); }
      result = '<div class="it-card kam-result"><div class="it-card-t">' + ic("check") + " Saved to the CRM</div>" +
        warns.map(function (w) { return '<div class="note note-warn">' + ic("alert") + "<span>" + esc(w) + "</span></div>"; }).join("") +
        '<p class="it-muted">Account managers type about 1,050 of these a month, about 18 minutes each. 6% have a mistake, and each mistake costs the app about Tk 9,500.</p></div>';
    }
    var main = '<div class="it-main" data-scroll="kam">' +
      '<div class="it-hd"><h2>New discount</h2></div>' +
      '<div class="note note-info">' + ic("chat") + '<span><b>WhatsApp from Rongdhonu Kacchi House, 9:14 am:</b> "15% off on kacchi from 1 April, for 2 weeks please."</span></div>' +
      '<div class="it-form">' +
      '<label>Restaurant<input value="Rongdhonu Kacchi House" readonly></label>' +
      '<label>Discount %<input id="kam-pct" value="' + esc(f.pct) + '"></label>' +
      '<div class="it-form-2"><label>Start<input id="kam-start" value="' + esc(f.start) + '" placeholder="Type a date"></label>' +
      '<label>End (optional)<input id="kam-end" value="' + esc(f.end) + '" placeholder="Type a date"></label></div>' +
      '<label>Notes<textarea id="kam-notes" rows="2" placeholder="Dishes, who pays, anything else">' + esc(f.notes) + "</textarea></label>" +
      '<div><button class="btn btn-primary" data-act="kamSave">Save</button></div></div>' + result + "</div>";
    return browser("KAM CRM, used by account managers", "KAM CRM  >  Discounts  >  New discount",
      '<div class="it">' + itNav("KAM CRM", ["Restaurants", "Onboarding|48", "Requests|12", "Discounts", "Payouts"], "Discounts") + main + "</div>");
  }

  /* 3. Chattogram --------------------------------------------------------- */
  var DHAKA_AREAS = ["Banani", "Bashundhara", "Dhanmondi", "Gulshan 1 and 2", "Mirpur", "Mohammadpur", "Motijheel", "Old Dhaka", "Uttara"];
  var CTG_AREAS = ["Agrabad", "GEC Circle", "Nasirabad", "Khulshi", "Halishahar", "Chawkbazar"];
  var DHAKA_RESTS = [
    { name: "Rongdhonu Kacchi House", sub: "Kacchi · 35 to 45 min", img: "kacchi-1", rating: "4.8" },
    { name: "Padma Bakery and Cafe", sub: "Cafe · 25 to 35 min", img: "cafe-1", rating: "4.8" },
    { name: "Ruchi Wok House", sub: "Chinese · 30 to 40 min", img: "chinese-1", rating: "3.8" }
  ];
  var CTG_RESTS = [
    { name: "Mezbani Ghor Agrabad", sub: "Bangla · 30 to 40 min", img: "bangla-2" },
    { name: "Karnaphuli Kacchi House", sub: "Kacchi · 35 to 45 min", img: "kacchi-2" },
    { name: "GEC Kebab and Grill", sub: "Kebab · 25 to 35 min", img: "kebab-2" },
    { name: "Patenga Pizza Point", sub: "Pizza · 30 to 40 min", img: "pizza-3" },
    { name: "Nasirabad Bakery and Cafe", sub: "Cafe · 20 to 30 min", img: "cafe-2" },
    { name: "Khulshi Chinese Kitchen", sub: "Chinese · 30 to 40 min", img: "chinese-3" }
  ];
  function restCard(r) {
    return '<div class="rc"><img src="' + photo(r.img) + '" alt=""><div class="rc-body"><div class="rc-name">' + esc(r.name) +
      '</div><div class="rc-sub">' + esc(r.sub) + "</div></div>" +
      (r.rating ? '<span class="rc-rate">' + ic("star", "ic-fill ic-star") + r.rating + "</span>" : '<span class="pill pill-good">New</span>') + "</div>";
  }
  DEMOS.chattogram = {
    init: function () { return { city: "Dhaka", area: "Dhanmondi", sheet: null, pickCity: "Dhaka" }; },
    view: function (s) {
      var fix = s.mode === "fix";
      var ctg = s.city === "Chattogram";
      var head = '<div class="ca-home-hd"><button class="loc" data-act="openLoc"><span class="loc-l">Deliver to</span><span class="loc-v">' + ic("pin") +
        "<span>" + esc(s.area) + (fix ? ", " + esc(s.city) : "") + "</span>" + ic("down") + "</span></button></div>" +
        '<div class="ca-search">' + ic("search") + "<span>Search restaurants and dishes</span></div>";
      var promo = ctg ? '<div class="promo">' + ic("info") + "<span><b>Food Delivery is now in Chattogram.</b> Pay by cash on delivery, bKash, Nagad or card.</span></div>" : "";
      var rests = ctg ? CTG_RESTS : DHAKA_RESTS;
      var body = head + promo + '<div class="ca-sec-t">Restaurants near you' + (ctg ? ' <span class="t-muted">· 6 of 25</span>' : "") + "</div>" +
        '<div class="rc-list">' + rests.map(restCard).join("") + "</div>" + tabBar("Home");
      var over = toast(s.toast);
      if (s.sheet === "city") {
        over = sheet("Choose your city", '<div class="opt-list">' + ["Dhaka", "Chattogram"].map(function (c) {
          return '<button class="opt' + (s.city === c ? " is-on" : "") + '" data-act="city" data-v="' + c + '"><span>' + c +
            (c === "Chattogram" ? ' <span class="pill pill-good">New</span>' : "") + "</span>" + (s.city === c ? ic("check") : ic("right")) + "</button>";
        }).join("") + "</div>");
      }
      if (s.sheet === "area") {
        var areas = s.pickCity === "Chattogram" ? CTG_AREAS : DHAKA_AREAS;
        over = sheet(fix ? "Choose your area in " + s.pickCity : "Choose area", '<div class="opt-list">' + areas.map(function (a) {
          return '<button class="opt' + (a === s.area ? " is-on" : "") + '" data-act="area" data-v="' + esc(a) + '"><span>' + esc(a) + "</span>" + (a === s.area ? ic("check") : ic("right")) + "</button>";
        }).join("") + "</div>");
      }
      return phone("Customer app", body, over, "home-" + s.city);
    },
    act: {
      openLoc: function (s) { if (s.mode === "fix") { s.sheet = "city"; } else { s.sheet = "area"; s.pickCity = "Dhaka"; } },
      city: function (s, el) { s.pickCity = el.getAttribute("data-v"); s.sheet = "area"; },
      area: function (s, el) {
        if (s.mode === "fix") { s.city = s.pickCity; }
        s.area = el.getAttribute("data-v"); s.sheet = null;
        flash(s, "Delivering to " + s.area + (s.mode === "fix" ? ", " + s.city : ""));
      },
      closeSheet: function (s) { s.sheet = null; }
    }
  };

  /* 4. Delivery time and fee before checkout ------------------------------ */
  DEMOS["time-and-fee"] = {
    init: function () { return { screen: "menu", cart: {} }; },
    view: function (s) {
      var fix = s.mode === "fix";
      var n = cartCount(s.cart), sum = cartTotal(s.cart, DAAWAT.dishes);
      var body;
      if (s.screen === "menu") {
        var chips = fix ? '<div class="ca-chips"><span class="chip chip-warn">' + ic("clock") + "50 to 60 min</span><span class=\"chip\">" + ic("bike") +
          'Tk 45 delivery</span><span class="chip">' + ic("pin") + "5.2 km away</span></div>" : "";
        body = caHeader("") + restHero(DAAWAT, chips) + '<div class="ca-sec-t">Menu</div><div class="ca-list">' +
          DAAWAT.dishes.map(function (d) { return dishRow(d); }).join("") + "</div>" +
          (n ? basketBar(n, sum, { sub: fix ? "50 to 60 min · Tk 45 delivery" : "" }) : "");
      } else if (s.screen === "basket") {
        var rows = fix
          ? billRow(ic("bike") + "Delivery fee", tk(45)) + billRow(ic("clock") + "Delivery time", "50 to 60 min", "is-hl") + billRow("Total", tk(sum + 45), "is-total")
          : billRow("Delivery fee", '<span class="t-muted">Calculated at checkout</span>');
        body = caHeader("Your basket", { back: "toMenu", right: "none" }) + '<div class="ca-pad"><div class="ca-card"><div class="ca-card-t">' + esc(DAAWAT.name) + "</div>" +
          cartLines(s.cart, DAAWAT.dishes) + billRow("Subtotal", tk(sum), "is-sub") + rows + "</div></div>" +
          '<div class="ca-bar"><button class="btn btn-primary btn-block btn-lg" data-act="checkout">Go to checkout</button></div>';
      } else {
        var steps = ["Address", "Time", "Payment", "Review"].map(function (x, i) {
          return '<span class="' + (i < 3 ? "is-done" : "is-now") + '">' + (i < 3 ? ic("check") : "4 ") + x + "</span>";
        }).join("");
        body = caHeader("Review order", { back: "toBasket", right: "none" }) + '<div class="ca-pad"><div class="stepper">' + steps + "</div>" +
          '<div class="ca-card"><div class="ca-card-t">' + esc(DAAWAT.name) + "</div>" + cartLines(s.cart, DAAWAT.dishes) +
          billRow("Subtotal", tk(sum), "is-sub") + billRow("Delivery fee", tk(45)) + billRow(ic("clock") + "Estimated delivery", "55 min", "is-hl") +
          billRow("Total", tk(sum + 45), "is-total") + "</div></div>" +
          '<div class="ca-bar"><button class="btn btn-primary btn-block btn-lg" data-act="place">Place order</button></div>';
      }
      return phone("Customer app", body, toast(s.toast), s.screen);
    },
    act: {
      add: function (s, el) { var id = el.getAttribute("data-id"); s.cart[id] = (s.cart[id] || 0) + 1; flash(s, find(DAAWAT.dishes, id).name + " added to basket"); },
      viewBasket: function (s) { s.screen = "basket"; },
      toMenu: function (s) { s.screen = "menu"; },
      toBasket: function (s) { s.screen = "basket"; },
      checkout: function (s) { if (s.mode === "fix") { flash(s, "Checkout shows the same time and fee"); } else { s.screen = "review"; } },
      place: function (s) { flash(s, "Order placed"); }
    }
  };

  /* 5. Bulk menu upload ------------------------------------------------- */
  var UPLOAD_ROWS = [
    { name: "Classic Beef Burger", cat: "Burgers", price: 320 },
    { name: "Double Beef Burger", cat: "Burgers", price: 450 },
    { name: "Chicken Cheese Burger", cat: "Burgers", price: 0, fix: { price: 330 } },
    { name: "Crispy Chicken Burger", cat: "Burgers", price: 290 },
    { name: "Naga Chicken Burger", cat: "Burgers", price: 310 },
    { name: "French Fries", cat: "", price: 150, fix: { cat: "Sides" } },
    { name: "Chicken Wings (6 pcs)", cat: "Sides", price: 280 },
    { name: "Vanilla Shake", cat: "Drinks", price: 260 }
  ];
  function onboardSteps(stage) {
    var menuCls = stage === "live" ? "is-done" : "is-now";
    return '<div class="steps3"><span class="is-done">' + ic("check") + 'Documents</span><span class="' + menuCls + '">' +
      (stage === "live" ? ic("check") : "2 ") + 'Menu</span><span class="' + (stage === "live" ? "is-now" : "") + '">3 Go live</span></div>';
  }
  DEMOS["menu-upload"] = {
    init: function () { return { uploaded: false, fixed: {}, published: false, typed: [] }; },
    view: function (s) {
      var head = '<div class="it-hd"><h2>Rongdhonu Burger Point</h2><p class="it-muted">Burger, Dhanmondi. Signed on 8 March.</p></div>';
      var main;
      if (s.mode === "today") {
        var n = s.typed.length;
        main = head + onboardSteps("menu") +
          '<div class="note note-warn">' + ic("info") + "<span>48 restaurants are in the queue. The menu team has 3 people and types every dish by hand.</span></div>" +
          '<div class="it-form"><div class="it-form-t">Add menu item <span class="it-muted">· dish ' + Math.min(n + 1, 48) + " of 48</span></div>" +
          '<label>Dish name<input id="mu-name" placeholder="For example, Classic Beef Burger"></label>' +
          '<div class="it-form-2"><label>Price (Tk)<input id="mu-price" inputmode="numeric" placeholder="320"></label>' +
          '<label>Category<select id="mu-cat"><option>Burgers</option><option>Sides</option><option>Drinks</option></select></label></div>' +
          '<div><button class="btn btn-primary" data-act="saveDish">Save and add next</button></div></div>' +
          (n ? '<div class="it-card"><div class="it-card-t">Added so far: ' + n + " of 48</div>" + s.typed.map(function (t) {
            return '<div class="it-line">' + esc(t.name) + "<span>" + esc(t.cat) + " · " + (t.price ? tk(t.price) : "no price") + "</span></div>";
          }).join("") + "</div>" : "");
      } else if (s.published) {
        main = head + onboardSteps("live") + '<div class="it-card it-success">' + ic("check") +
          "<div><b>Menu published: 48 dishes</b><p>Rongdhonu Burger Point can go live as soon as its tablet is set up. The menu took minutes instead of days of typing.</p></div></div>";
      } else if (!s.uploaded) {
        main = head + onboardSteps("menu") + '<div class="drop">' + ic("upload") + "<b>Upload the menu</b>" +
          "<span>An Excel or CSV file with one dish on each row: name, category and price.</span>" +
          '<button class="btn btn-primary" data-act="upload">Upload rongdhonu-menu.xlsx</button>' +
          '<button class="link-btn" data-act="template">Download the template</button></div>';
      } else {
        var left = UPLOAD_ROWS.filter(function (r, i) { return r.fix && !s.fixed[i]; }).length;
        var rows = UPLOAD_ROWS.map(function (r, i) {
          var bad = r.fix && !s.fixed[i];
          var cat = r.fix && r.fix.cat && s.fixed[i] ? r.fix.cat : r.cat;
          var price = r.fix && r.fix.price && s.fixed[i] ? r.fix.price : r.price;
          return '<tr class="' + (bad ? "is-bad" : "") + '"><td>' + esc(r.name) + "</td><td>" + (cat ? esc(cat) : '<span class="t-bad">Missing</span>') +
            "</td><td>" + (price ? tk(price) : '<span class="t-bad">Missing</span>') + "</td><td>" +
            (bad ? '<button class="btn btn-sm" data-act="fixRow" data-i="' + i + '">' + (r.fix.price ? "Set " + tk(r.fix.price) : "Set " + r.fix.cat) + "</button>"
              : '<span class="t-good">' + ic("check") + "</span>") + "</td></tr>";
        }).join("");
        main = head + onboardSteps("menu") + '<div class="it-card it-card-wide"><div class="it-card-t">' + ic("file") + "rongdhonu-menu.xlsx: 48 dishes found" +
          (left ? ' <span class="t-bad">· ' + left + " need a fix</span>" : ' <span class="t-good">· all good</span>') + "</div>" +
          '<table class="it-table"><thead><tr><th>Dish</th><th>Category</th><th>Price</th><th></th></tr></thead><tbody>' + rows +
          '<tr class="it-more"><td colspan="4">and 40 more dishes, all good</td></tr></tbody></table>' +
          '<div class="it-actions"><button class="btn btn-primary" data-act="publish"' + (left ? " disabled" : "") + ">Publish 48 dishes</button></div></div>";
      }
      return browser("KAM CRM, onboarding", "KAM CRM  >  Onboarding  >  Rongdhonu Burger Point",
        '<div class="it">' + itNav("KAM CRM", ["Restaurants", "Onboarding|48", "Requests|12", "Discounts", "Payouts"], "Onboarding") +
        '<div class="it-main" data-scroll="mu">' + main + "</div></div>", toast(s.toast));
    },
    act: {
      upload: function (s) { s.uploaded = true; },
      template: function (s) { flash(s, "The template has three columns: name, category and price"); },
      fixRow: function (s, el) { s.fixed[el.getAttribute("data-i")] = true; },
      publish: function (s) { s.published = true; },
      saveDish: function (s) {
        var v = function (id) { var e = document.getElementById(id); return e ? e.value.trim() : ""; };
        var name = v("mu-name");
        if (!name) { flash(s, "Type a dish name first"); return; }
        s.typed.push({ name: name, price: Number(v("mu-price").replace(/[^\d]/g, "")) || 0, cat: v("mu-cat") });
        flash(s, "Saved. " + (48 - s.typed.length) + " dishes to go for this restaurant.");
      }
    }
  };

  /* 6. Rider pay and delivery fee by distance ----------------------------- */
  var riderPay = function (km) { return 48 + Math.round(Math.max(0, km - 3) * 10); };
  var deliveryFee = function (km) { return 45 + Math.round(Math.max(0, km - 3) * 10); };
  DEMOS["pay-by-distance"] = {
    init: function () { return { km: 6.2 }; },
    controls: function (s) {
      return '<label class="ctl-l" for="dist">Drop distance</label><input id="dist" type="range" min="1" max="8" step="0.1" value="' + s.km + '" data-input="dist">' +
        '<b class="ctl-v" id="dist-v">' + s.km.toFixed(1) + " km</b>" +
        '<span class="ctl-h">' + (s.mode === "fix"
          ? "Example rates (the PM's assumption): Tk 48 to the rider and Tk 45 from the customer for the first 3 km, then Tk 10 a km more on each side."
          : "Today the rider gets Tk 48 and the customer pays Tk 45 at any distance.") + "</span>";
    },
    view: function (s) {
      var fix = s.mode === "fix", km = s.km;
      var p = fix ? riderPay(km) : 48, f = fix ? deliveryFee(km) : 45, extra = Math.max(0, km - 3);
      var offer = '<div class="ra"><div class="ra-top"><span class="ra-dot"></span>Online · Keraniganj</div>' +
        '<div class="ra-map">' + cityMap({ pins: true, label: "Map with the pickup and the drop" }) + "</div>" +
        '<div class="ra-card"><div class="ra-offer-hd"><b>New order</b><span class="ra-timer">0:24</span></div>' +
        '<div class="ra-stop"><span class="ra-ic ra-ic-r">' + ic("bag") + "</span><div><b>Nakshi Kacchi Ghor</b><span>Pickup · 1.1 km from you</span></div></div>" +
        '<div class="ra-stop"><span class="ra-ic ra-ic-h">' + ic("pin") + "</span><div><b>Keraniganj</b><span>" + (fix ? "Drop · " + km.toFixed(1) + " km after pickup" : "Drop area") + "</span></div></div>" +
        (fix ? '<div class="ra-pay"><span>You earn</span><b>' + tk(p) + '</b></div><div class="ra-pay-sub">Tk 48 for the first 3 km' +
          (extra > 0 ? " + " + tk(p - 48) + " for " + extra.toFixed(1) + " km more" : "") + "</div>" : "") +
        '<div class="ra-btns"><button class="btn" data-act="decline">Decline</button><button class="btn btn-primary" data-act="accept">Accept</button></div></div></div>';
      var checkout = caHeader("Review order", { right: "none" }) + '<div class="ca-pad"><div class="ca-card"><div class="ca-card-t">Nakshi Kacchi Ghor</div>' +
        billRow("1 x Chicken Kacchi", tk(530)) + billRow("Subtotal", tk(530), "is-sub") +
        billRow("Delivery fee" + (fix ? " (" + km.toFixed(1) + " km)" : ""), tk(f), fix ? "is-hl" : "") + billRow("Total", tk(530 + f), "is-total") + "</div>" +
        (fix ? '<div class="note note-good">' + ic("info") + "<span>The delivery fee is Tk 45 for the first 3 km, then Tk 10 a km.</span></div>" : "") + "</div>";
      return phone("Rider app", offer, toast(s.toast), "offer") + phone("Customer app", checkout, "", "checkout");
    },
    act: {
      dist: function (s, el) {
        s.km = Number(el.value);
        var v = document.getElementById("dist-v");
        if (v) { v.textContent = s.km.toFixed(1) + " km"; }
      },
      accept: function (s) {
        flash(s, s.mode === "fix" ? "Accepted. You earn " + tk(riderPay(s.km)) + " for this trip." : "Accepted. The drop is " + s.km.toFixed(1) + " km away, and the pay is Tk 48.");
      },
      decline: function (s) { flash(s, s.mode === "fix" ? "Declined" : "Declined. The order waits for another rider."); }
    }
  };

  /* 7. Rider on a map in order tracking ---------------------------------- */
  var TRACK_STEPS = ["Placed", "Accepted", "Picked up", "On the way", "Delivered"];
  var etaText = function (t) { return t >= 1 ? "now" : Math.max(1, Math.ceil(12 * (1 - t))) + " min"; };
  function remainingFrom(t) { var p = along(MAP_ROUTE, t); return [[p[0], p[1]]].concat(MAP_ROUTE.slice(p[2] + 1)); }
  DEMOS["rider-map"] = {
    init: function () { return { t: 0.04, chat: false }; },
    view: function (s) {
      var stepsHtml = function (cls) {
        return '<ol class="' + cls + '">' + TRACK_STEPS.map(function (x, i) {
          return '<li class="' + (i < 3 ? "is-done" : i === 3 ? "is-now" : "") + '"><span class="dot"></span>' + x + "</li>";
        }).join("") + "</ol>";
      };
      if (s.mode === "fix") {
        var pos = along(MAP_ROUTE, s.t);
        var body = caHeader("Order #58821", { right: "none" }) +
          '<div class="trk-map">' + cityMap({ route: true, remaining: remainingFrom(s.t), pins: true, rider: pos, label: "Live map with the rider" }) + "</div>" +
          '<div class="trk-card"><div class="trk-eta"><span>Arriving in</span><b id="eta-min">' + etaText(s.t) + '</b><span class="t-muted">by 1:22 PM</span></div>' +
          '<div class="trk-rider"><span class="trk-av">' + ic("bike") + "</span><div><b>Karim</b><span>Bringing your order from Rongdhonu Kacchi House</span></div>" +
          '<button class="icon-btn icon-btn-line" data-act="call" aria-label="Call Karim">' + ic("phone") + "</button></div>" + stepsHtml("trk-steps trk-steps-row") + "</div>";
        return phone("Customer app", body, toast(s.toast), "trk");
      }
      var bodyToday = caHeader("Order #58821", { right: "none" }) + '<div class="ca-pad"><div class="trk-status">' + ic("bike") +
        "<b>Rider on the way</b></div>" + stepsHtml("trk-steps") +
        '<div class="trk-actions"><span class="chipbtn">' + ic("file") + 'Order details</span></div><button class="btn btn-block" data-act="help">Need help?</button></div>';
      return phone("Customer app", bodyToday, s.chat ? chatOverlay() : toast(s.toast), "trk");
    },
    mount: function (s, root) {
      if (s.mode !== "fix") { return; }
      var dot = root.querySelector("#rider-dot"), line = root.querySelector("#route-left"), eta = root.querySelector("#eta-min");
      if (!dot || !line || !eta) { return; }
      var id = setInterval(function () {
        if (s.t >= 1) { clearInterval(id); return; }
        s.t = Math.min(1, s.t + 0.0045);
        var p = along(MAP_ROUTE, s.t);
        dot.setAttribute("transform", "translate(" + p[0].toFixed(1) + " " + p[1].toFixed(1) + ")");
        line.setAttribute("points", ptsAttr(remainingFrom(s.t)));
        eta.textContent = etaText(s.t);
      }, 130);
      mountTimers.push(id);
    },
    act: {
      call: function (s) { flash(s, "Calling Karim"); },
      help: function (s) { s.chat = true; },
      closeChat: function (s) { s.chat = false; }
    }
  };

  /* 8. Ask before a second restaurant empties the basket -------------------- */
  var familyBasket = function () {
    return { rest: "Daawat Biryani Ghor", lines: [{ name: "Chicken Biryani", qty: 2, price: 320 }, { name: "Borhani", qty: 2, price: 80 }] };
  };
  DEMOS["basket-warning"] = {
    init: function () { return { basket: familyBasket(), pending: null, screen: "menu" }; },
    view: function (s) {
      var body;
      if (s.screen === "basket") {
        body = caHeader("Your basket", { back: "toMenu", right: "none" }) + '<div class="ca-pad"><div class="ca-card"><div class="ca-card-t">' + esc(s.basket.rest) + "</div>" +
          bLines(s.basket) + billRow("Subtotal", tk(bTotal(s.basket)), "is-sub") + "</div></div>" +
          '<div class="ca-bar"><button class="btn btn-primary btn-block btn-lg" data-act="checkout">Go to checkout</button></div>';
      } else {
        body = caHeader("") + restHero(PADMA) + '<div class="ca-sec-t">Menu</div><div class="ca-list">' +
          PADMA.dishes.map(function (d) { return dishRow(d); }).join("") + "</div>" + basketBar(bCount(s.basket), bTotal(s.basket), { sub: s.basket.rest });
      }
      var over = toast(s.toast);
      if (s.pending) {
        over = dialog("Start a new basket?", "Your basket has " + bCount(s.basket) + " items from <b>" + esc(s.basket.rest) + "</b> (" + tk(bTotal(s.basket)) +
          "). A new basket for " + esc(PADMA.name) + " removes them.",
          '<button class="btn btn-primary" data-act="keep">Keep my basket</button><button class="btn" data-act="replace">Start new basket</button>');
      }
      return phone("Customer app", body, over, s.screen);
    },
    act: {
      add: function (s, el) {
        var d = find(PADMA.dishes, el.getAttribute("data-id"));
        if (s.basket.rest === PADMA.name) {
          var line = s.basket.lines.filter(function (l) { return l.name === d.name; })[0];
          if (line) { line.qty += 1; } else { s.basket.lines.push({ name: d.name, qty: 1, price: d.price }); }
          flash(s, "Added to basket"); return;
        }
        if (s.mode === "fix") { s.pending = d; return; }
        s.basket = { rest: PADMA.name, lines: [{ name: d.name, qty: 1, price: d.price }] };
        flash(s, "Added to basket");
      },
      keep: function (s) { s.pending = null; flash(s, "Your biryani is still in the basket"); },
      replace: function (s) {
        var d = s.pending; s.pending = null;
        s.basket = { rest: PADMA.name, lines: [{ name: d.name, qty: 1, price: d.price }] };
        flash(s, "New basket started");
      },
      viewBasket: function (s) { s.screen = "basket"; },
      toMenu: function (s) { s.screen = "menu"; },
      checkout: function (s) { flash(s, "Checkout is not part of this demo"); }
    }
  };

  /* 9. Order again keeps the available items ------------------------------ */
  function orderCard(name, img, date, total, items, id) {
    return '<div class="ord"><div class="ord-hd"><img src="' + photo(img) + '" alt=""><div><b>' + esc(name) + "</b><span>" + date + " · Delivered · " + tk(total) +
      '</span></div></div><div class="ord-items">' + esc(items) + '</div><button class="btn btn-block" data-act="again" data-id="' + id + '">Order again</button></div>';
  }
  DEMOS["order-again"] = {
    init: function () { return { screen: "orders", basket: null, dlg: false, note: "" }; },
    view: function (s) {
      var body;
      if (s.screen === "orders") {
        body = caHeader("Orders", { noBack: true, right: "none" }) + '<div class="ca-sec-t">Past orders</div><div class="ord-list">' +
          orderCard("Rongdhonu Kacchi House", "kacchi-1", "Sun 21 Mar", 870, "2 x Beef Kacchi, 2 x Borhani, 1 x Doi", "kacchi") +
          orderCard("Ruchi Wok House", "friedrice-1", "Sun 14 Mar", 585, "1 x Chicken Fried Rice, 1 x Beef Chowmein", "wok") + "</div>" + tabBar("Orders");
      } else if (s.basket) {
        body = caHeader("Your basket", { back: "toOrders", right: "none" }) + '<div class="ca-pad">' +
          (s.note ? '<div class="note note-warn">' + ic("info") + "<span>" + s.note + "</span></div>" : "") +
          '<div class="ca-card"><div class="ca-card-t">' + esc(s.basket.rest) + "</div>" + bLines(s.basket) + billRow("Subtotal", tk(bTotal(s.basket)), "is-sub") + "</div></div>" +
          '<div class="ca-bar"><button class="btn btn-primary btn-block btn-lg" data-act="checkout">Go to checkout</button></div>';
      } else {
        body = caHeader("Your basket", { back: "toOrders", right: "none" }) + '<div class="empty">' + ic("bag") +
          "<b>Your basket is empty</b><span>Add something tasty from a restaurant.</span>" +
          '<button class="btn" data-act="toOrders">Back to orders</button></div>';
      }
      var over = s.dlg ? dialog("Some items are not available", "", '<button class="btn btn-primary" data-act="okDlg">OK</button>') : toast(s.toast);
      return phone("Customer app", body, over, s.screen);
    },
    act: {
      again: function (s, el) {
        if (el.getAttribute("data-id") === "wok") {
          s.basket = { rest: "Ruchi Wok House", lines: [{ name: "Chicken Fried Rice", qty: 1, price: 340 }, { name: "Beef Chowmein", qty: 1, price: 200 }] };
          s.note = ""; s.screen = "basket"; return;
        }
        if (s.mode === "fix") {
          s.basket = { rest: "Rongdhonu Kacchi House", lines: [{ name: "Beef Kacchi", qty: 2, price: 310 }, { name: "Borhani", qty: 2, price: 70 }] };
          s.note = "<b>Doi is not available today</b>, so we left it out. The other 2 items are in your basket.";
          s.screen = "basket";
        } else { s.dlg = true; }
      },
      okDlg: function (s) { s.dlg = false; s.basket = null; s.screen = "basket"; },
      toOrders: function (s) { s.screen = "orders"; },
      checkout: function (s) { flash(s, "Checkout is not part of this demo"); }
    }
  };

  /* 10. Minimum order on the restaurant page ------------------------------ */
  DEMOS["minimum-order"] = {
    init: function () { return { screen: "menu", cart: {} }; },
    view: function (s) {
      var fix = s.mode === "fix";
      var n = cartCount(s.cart), sum = cartTotal(s.cart, SHISHIR.dishes), short = Math.max(0, SHISHIR.min - sum);
      var body;
      if (s.screen === "menu") {
        var chips = fix ? '<div class="ca-chips"><span class="chip chip-warn">' + ic("bag") + "Minimum order Tk 250</span><span class=\"chip\">" + ic("clock") + "20 to 30 min</span></div>" : "";
        var bar = "";
        if (n) {
          bar = fix && short > 0
            ? '<div class="ca-bar"><button class="ca-bar-btn ca-bar-min" data-act="viewBasket"><span class="ca-bar-l">Add ' + tk(short) + ' more to order<span class="prog"><i style="width:' +
              Math.round(Math.min(100, (sum / SHISHIR.min) * 100)) + '%"></i></span></span><span class="ca-bar-r">' + tk(sum) + "</span></button></div>"
            : basketBar(n, sum);
        }
        body = caHeader("") + restHero(SHISHIR, chips) + '<div class="ca-sec-t">Menu</div><div class="ca-list">' +
          SHISHIR.dishes.map(function (d) { return dishRow(d); }).join("") + "</div>" + bar;
      } else {
        var foot;
        if (short <= 0) { foot = '<div class="ca-bar"><button class="btn btn-primary btn-block btn-lg" data-act="checkout">Go to checkout</button></div>'; }
        else if (fix) { foot = '<div class="ca-bar"><button class="btn btn-block btn-lg" data-act="toMenu">' + ic("plus") + "Add " + tk(short) + " more</button></div>"; }
        else { foot = '<div class="ca-bar"><button class="btn btn-primary btn-block btn-lg" disabled>Go to checkout</button><p class="tiny-note">Minimum order Tk 250. Add ' + tk(short) + " more</p></div>"; }
        body = caHeader("Your basket", { back: "toMenu", right: "none" }) + '<div class="ca-pad">' +
          (fix && short > 0 ? '<div class="note note-warn">' + ic("info") + "<span>" + esc(SHISHIR.name) + " has a minimum order of <b>Tk 250</b>. Add " + tk(short) + " more to order.</span></div>" : "") +
          '<div class="ca-card"><div class="ca-card-t">' + esc(SHISHIR.name) + "</div>" + cartLines(s.cart, SHISHIR.dishes) + billRow("Subtotal", tk(sum), "is-sub") + "</div></div>" + foot;
      }
      return phone("Customer app", body, toast(s.toast), s.screen);
    },
    act: {
      add: function (s, el) { var id = el.getAttribute("data-id"); s.cart[id] = (s.cart[id] || 0) + 1; flash(s, find(SHISHIR.dishes, id).name + " added to basket"); },
      viewBasket: function (s) { s.screen = "basket"; },
      toMenu: function (s) { s.screen = "menu"; },
      checkout: function (s) { flash(s, "The order is above the minimum. Checkout opens."); }
    }
  };

  /* 11. Route to the customer in the rider app ------------------------------ */
  var TURNS = [
    { text: "Head east on Satmasjid Road", dist: "700 m" },
    { text: "Turn left onto Road 27", dist: "450 m" },
    { text: "Turn right onto Road 11", dist: "550 m" },
    { text: "Turn left into Lane 4", dist: "450 m" },
    { text: "House 23 is on your right", dist: "200 m" }
  ];
  DEMOS["rider-route"] = {
    init: function () { return { step: 0, nav: false }; },
    view: function (s) {
      var top = '<div class="ra-top"><span class="ra-dot"></span>On a trip · Go to the customer</div>';
      if (s.mode === "fix") {
        var done = s.step >= TURNS.length;
        var pos = MAP_ROUTE[Math.min(s.step, MAP_ROUTE.length - 1)];
        var banner = done ? '<div class="ra-turn">' + ic("home") + "<span>You have arrived</span></div>"
          : '<div class="ra-turn">' + ic("nav") + "<span>" + esc(TURNS[s.step].text) + "<small>" + TURNS[s.step].dist + "</small></span></div>";
        var list = TURNS.map(function (t, i) {
          return '<li class="' + (i < s.step ? "is-done" : i === s.step ? "is-now" : "") + '"><span>' + esc(t.text) + "</span><span>" + t.dist + "</span></li>";
        }).join("");
        var body = '<div class="ra">' + top + banner + '<div class="ra-map">' +
          cityMap({ route: true, remaining: MAP_ROUTE.slice(Math.min(s.step, MAP_ROUTE.length - 1)), pins: true, rider: pos, label: "Route to the customer" }) + "</div>" +
          '<div class="ra-card"><div class="ra-sum"><b>2.4 km · about 15 min</b><span>H-23, L-4, R-11, Dhanmondi</span></div><ol class="turns">' + list + "</ol>" +
          '<div class="ra-btns">' + (done ? '<button class="btn btn-primary btn-block" data-act="arrived">I have arrived</button>'
            : '<button class="btn btn-primary btn-block" data-act="next">Next turn</button>') + "</div></div></div>";
        return phone("Rider app", body, toast(s.toast), "route");
      }
      var bodyToday = '<div class="ra">' + top + '<div class="ra-map">' + cityMap({ pins: "drop", rider: MAP_ROUTE[0], label: "Map with the drop pin only" }) + "</div>" +
        '<div class="ra-card"><div class="ra-sum"><b>Drop</b><span>H-23, L-4, R-11, Dhanmondi</span></div>' +
        '<div class="ra-btns"><button class="btn" data-act="navigate">' + ic("nav") + 'Navigate</button><button class="btn btn-primary" data-act="arrived">I have arrived</button></div></div></div>';
      var over = s.nav ? dialog("Navigate", "Directions open in your maps app.", '<button class="btn btn-primary" data-act="closeNav">OK</button>') : toast(s.toast);
      return phone("Rider app", bodyToday, over, "route");
    },
    act: {
      next: function (s) { s.step = Math.min(TURNS.length, s.step + 1); },
      arrived: function (s) { flash(s, s.mode === "fix" ? "Arrived. Hand over the order." : "Find House 23 first"); },
      navigate: function (s) { s.nav = true; },
      closeNav: function (s) { s.nav = false; }
    }
  };

  /* 12. Answers to common questions in Help ------------------------------- */
  var FAQ = [
    ["How long does a refund take?", "We send the money back the way you paid. bKash and Nagad: within 3 working days. Card: 7 to 10 working days."],
    ["How do I cancel an order?", "Open the order and tap Cancel before the restaurant accepts it. After that, chat with us and we will help."],
    ["How do I use a promo code?", "Type the code under Promo code at checkout. Some codes need a minimum order or work only at some times. CAFE15, for example, works before 11 am."],
    ["Where is my order?", "Open Orders and tap the order to see where it is and who your rider is."],
    ["How do I change my delivery address?", "At checkout, tap the address to pick a saved one or add a new one."]
  ];
  DEMOS["help-answers"] = {
    init: function () { return { open: -1, chat: false }; },
    view: function (s) {
      if (s.mode === "fix") {
        var items = FAQ.map(function (f, i) {
          var open = s.open === i;
          return '<div class="faq' + (open ? " is-open" : "") + '"><button class="faq-q" data-act="faq" data-i="' + i + '" aria-expanded="' + open + '"><span>' + esc(f[0]) + "</span>" + ic("down") + "</button>" +
            (open ? '<div class="faq-a">' + esc(f[1]) + '<div class="faq-fb">Did this answer your question? <button class="link-btn" data-act="yes">Yes</button> <button class="link-btn" data-act="no">No</button></div></div>' : "") + "</div>";
        }).join("");
        var body = caHeader("Help", { right: "none" }) + '<div class="ca-pad"><div class="ca-sub-t">Common questions</div><div class="faq-list">' + items + "</div>" +
          '<div class="help-more"><b>Still need help?</b><span>An agent will reply in the chat.</span><button class="btn btn-block" data-act="openChat">' + ic("chat") + "Chat with us</button></div></div>";
        return phone("Customer app", body, s.chat ? chatOverlay() : toast(s.toast), "help");
      }
      var bodyToday = caHeader("Help", { right: "none" }) + '<div class="ca-pad"><div class="help-only">' + ic("chat") +
        "<p>Chat with us about an order, a payment or a refund. An agent will reply to you.</p>" +
        '<button class="btn btn-primary btn-block" data-act="openChat">Chat with us</button></div></div>';
      return phone("Customer app", bodyToday, s.chat ? chatOverlay() : "", "help");
    },
    act: {
      faq: function (s, el) { var i = Number(el.getAttribute("data-i")); s.open = s.open === i ? -1 : i; },
      yes: function (s) { flash(s, "Thanks. Glad that helped."); },
      no: function (s) { s.chat = true; },
      openChat: function (s) { s.chat = true; },
      closeChat: function (s) { s.chat = false; }
    }
  };

  /* 13. One screen for support agents ------------------------------------- */
  var REPLY = "Sorry for the wait, Tanvir. Karim picked up your order at 12:59 pm and is 1.6 km away. He should reach you in about 10 minutes.";
  var TOOLS = {
    ops: { title: "Ops tool", search: "58821", label: "Search by order id", rows: [["Order 58821", "Rongdhonu Kacchi House · On the way · Rider Karim"]] },
    pay: { title: "Payments tool", search: "01712-***678", label: "Search by phone number", rows: [["bKash", "Tk 760 · paid 12:06 pm · no refund"]] },
    old: { title: "Old ticket list", search: "01712-***678", label: "Search by phone number", rows: [["14 Feb", "Missing Borhani · refunded Tk 70"], ["2 Jan", "Late order · solved"]] }
  };
  DEMOS["agent-screen"] = {
    init: function () { return { sent: false, tool: null, looked: {} }; },
    view: function (s) {
      var fix = s.mode === "fix";
      var queue = '<div class="sp-queue"><div class="sp-qt">Open tickets <em>38</em></div>' +
        [["Where is my order?", "#48213 · waiting 12 min", true], ["Refund not received", "#48207 · waiting 1 h"], ["Wrong item delivered", "#48199 · waiting 2 h"],
          ["Promo code not working", "#48190 · waiting 3 h"], ["Rider was rude", "#48176 · waiting 5 h"]].map(function (q) {
          return '<div class="sp-q' + (q[2] ? " is-on" : "") + '"><b>' + q[0] + "</b><span>" + q[1] + "</span></div>";
        }).join("") + "</div>";
      var msgs = '<div class="msg msg-in"><b>Tanvir Ahmed</b>Order dilam 1 ghonta holo, ekhono ashe nai. Amar order kothay?<span>1:05 pm</span></div>' +
        (s.sent ? '<div class="msg msg-out"><b>Sumaiya (agent)</b>' + esc(REPLY) + "<span>1:10 pm</span></div>" : "");
      var compose = fix
        ? '<div class="sp-compose">' + (s.sent ? "" : '<div class="sp-suggest">' + ic("info") + "Suggested reply, filled in from the order</div>") +
          '<textarea id="sp-reply" rows="3" aria-label="Reply">' + (s.sent ? "" : esc(REPLY)) + '</textarea><div class="sp-compose-btns"><button class="btn btn-primary" data-act="send"' + (s.sent ? " disabled" : "") + ">" + (s.sent ? "Sent" : "Send") + "</button></div></div>"
        : '<div class="sp-compose"><textarea rows="3" placeholder="Type your reply" aria-label="Reply"></textarea><div class="sp-compose-btns"><button class="btn btn-primary" data-act="sendToday">Send</button></div></div>';
      var conv = '<div class="sp-conv"><div class="sp-conv-hd"><div><b>Where is my order?</b><span>Ticket #48213 · Tanvir Ahmed</span></div>' +
        '<span class="pill ' + (s.sent ? "pill-blue" : "pill-warn") + '">' + (s.sent ? "Waiting for customer" : "New") + "</span></div>" +
        '<div class="sp-msgs">' + msgs + "</div>" + compose + "</div>";
      var ctx;
      if (fix) {
        var kv = function (k, v) { return '<div class="sp-kv"><span>' + k + "</span><b>" + v + "</b></div>"; };
        ctx = '<div class="sp-ctx">' +
          '<section class="sp-box"><div class="sp-box-t">' + ic("user") + "Customer</div>" + kv("Name", "Tanvir Ahmed") + kv("Phone", "01712-***678") + kv("Orders", "23 since June 2025") + "</section>" +
          '<section class="sp-box"><div class="sp-box-t">' + ic("bag") + 'Order 58821 <span class="pill pill-blue">On the way</span></div>' + kv("Restaurant", "Rongdhonu Kacchi House") +
          kv("Items", "2 x Beef Kacchi, 2 x Borhani") + kv("Promised", '<span class="t-bad">by 12:56 pm, late</span>') + kv("Rider", "Karim, 1.6 km away") + "</section>" +
          '<section class="sp-box"><div class="sp-box-t">' + ic("card") + "Payment</div>" + kv("bKash", "Tk 760, paid 12:06 pm") + kv("Refunds", "None") + "</section>" +
          '<section class="sp-box"><div class="sp-box-t">' + ic("list") + "Past tickets</div>" + kv("14 Feb", "Missing Borhani, refunded Tk 70") + kv("2 Jan", "Late order, solved") + "</section></div>";
      } else {
        var opened = Object.keys(s.looked).length;
        ctx = '<div class="sp-ctx"><div class="sp-tabs"><span class="is-on">Order</span><span>Customer</span><span>Refund</span><span>History</span></div>' +
          '<div class="sp-box sp-box-flat"><div class="sp-kv"><span>Order id</span><b>58821</b></div><p class="it-muted">The order details are not in this tool. Copy the id and look it up in the other tools.</p>' +
          ["ops", "pay", "old"].map(function (k) {
            return '<button class="btn btn-block btn-sm sp-tool' + (s.looked[k] ? " is-done" : "") + '" data-act="tool" data-k="' + k + '">' + (s.looked[k] ? ic("check") : ic("search")) + "Open the " + TOOLS[k].title + "</button>";
          }).join("") +
          '<div class="sp-timer">' + ic("clock") + "<span>" + opened + " of 3 tools opened. Lookups take about 3.6 minutes on every ticket.</span></div></div></div>";
      }
      var over = toast(s.toast);
      if (s.tool) {
        var t = TOOLS[s.tool];
        over = '<div class="dim"><div class="win" role="dialog" aria-label="' + t.title + '"><div class="win-hd"><b>' + t.title + '</b><button class="icon-btn" data-act="closeTool" aria-label="Close">' + ic("x") + "</button></div>" +
          '<div class="win-body"><label class="win-l">' + t.label + '<span class="win-input">' + ic("search") + esc(t.search) + "</span></label>" +
          t.rows.map(function (r) { return '<div class="sp-kv"><span>' + r[0] + "</span><b>" + r[1] + "</b></div>"; }).join("") + "</div></div></div>";
      }
      return browser("Support tool, used by agents", "Support tool  >  Ticket #48213", '<div class="sp">' + queue + conv + ctx + "</div>", over);
    },
    act: {
      send: function (s) { s.sent = true; flash(s, "Reply sent"); },
      sendToday: function (s) { flash(s, "First find the order: open the three tools"); },
      tool: function (s, el) { var k = el.getAttribute("data-k"); s.tool = k; s.looked[k] = true; },
      closeTool: function (s) { s.tool = null; }
    }
  };

  /* 14. Food photos for small restaurants ---------------------------------- */
  DEMOS["food-photos"] = {
    init: function () { return { has: {}, picking: null, flashId: null }; },
    view: function (s) {
      var fix = s.mode === "fix";
      var rows = HAJI.dishes.map(function (d) {
        var on = fix && s.has[d.id];
        var thumb = on ? '<img class="rt-thumb" src="' + photo(d.img) + '" alt="">' : '<span class="rt-thumb">' + ic("img") + "</span>";
        var ctl = fix ? '<button class="btn btn-sm" data-act="pick" data-id="' + d.id + '">' + ic("camera") + (on ? "Change photo" : "Add photo") + "</button>" : "";
        return '<div class="rt-row">' + thumb + '<div class="rt-row-main"><div class="rt-row-name">' + esc(d.name) + '</div><div class="rt-row-sub">' + tk(d.price) +
          '</div></div><div class="rt-row-ctl">' + ctl + "</div></div>";
      }).join("");
      var note = fix ? '<div class="note note-good">' + ic("camera") + "<span>Dishes with a photo get added to the basket more often. Take one with the tablet camera.</span></div>"
        : '<div class="note note-info">' + ic("info") + "<span>Photo reviews: coming soon</span></div>";
      var tab = rtShell(HAJI.name, "Menu", ["Orders", "Menu", "Payouts"],
        '<div class="rt-hd"><h2>Menu</h2><span class="rt-hd-sub">' + HAJI.dishes.length + " dishes</span></div>" + note + '<div class="rt-list">' + rows + "</div>", "photos");
      var over = toast(s.toast);
      if (s.picking) {
        var d = find(HAJI.dishes, s.picking);
        over = dialog("Add a photo of " + d.name, "Take a new photo or pick one from the tablet's gallery.",
          '<button class="btn btn-primary" data-act="setPhoto">' + ic("camera") + 'Take a photo</button><button class="btn" data-act="setPhoto">Choose from the gallery</button><button class="btn" data-act="cancelPick">Cancel</button>');
      }
      var list = HAJI.dishes.map(function (d) {
        var shown = fix && s.has[d.id] ? d : { id: d.id, name: d.name, price: d.price };
        return dishRow(shown, { box: true, flash: s.flashId === d.id });
      }).join("");
      var body = caHeader("") + restHero(HAJI) + '<div class="ca-sec-t">Menu</div><div class="ca-list">' + list + "</div>";
      return tablet("Restaurant tablet", tab, over) + phone("Customer app", body, toast(s.toast2), "menu");
    },
    act: {
      pick: function (s, el) { s.picking = el.getAttribute("data-id"); },
      setPhoto: function (s) {
        var id = s.picking; s.picking = null; s.has[id] = true; s.flashId = id;
        flash(s, "Photo added. Customers see it now.");
        later(s, function () { s.flashId = null; }, 1500);
      },
      cancelPick: function (s) { s.picking = null; },
      add: function (s, el) { flash(s, find(HAJI.dishes, el.getAttribute("data-id")).name + " added to basket", "toast2"); }
    }
  };

  /* ====================================================== pages and routing */
  function tags(it) {
    return '<div class="tags"><span class="tag">' + esc(it.quarter) + '</span><span class="tag tag-' + it.priority.toLowerCase() + '">' + esc(it.priority) +
      ' priority</span><span class="tag">Effort ' + esc(it.effort) + "</span></div>";
  }
  function renderHub() {
    page.innerHTML = '<section class="hub"><h1>Backlog prototype</h1>' +
      '<p class="lede">The 14 items in the Food Delivery backlog. Each one opens the app where the problem happens. Switch between <b>Today</b> and <b>With the fix</b> to compare.</p>' +
      '<div class="hub-grid">' + ITEMS.map(function (it, i) {
        return '<a class="card" href="#/' + it.slug + '"><div class="card-hd"><span class="num">' + (i + 1) + '</span><span class="card-app">' + esc(it.app) + "</span></div>" +
          "<h2>" + esc(it.name) + "</h2><p>" + esc(it.desc) + "</p>" + tags(it) + "</a>";
      }).join("") + "</div>" +
      '<p class="foot">Made for a product management class. The company, the people and the numbers come from the class case and are made up.</p></section>';
  }
  function renderItem() {
    var item = current.item, i = ITEMS.indexOf(item), prev = ITEMS[i - 1], next = ITEMS[i + 1];
    page.innerHTML = '<div class="item"><aside class="side">' +
      '<a class="side-back" href="#/">' + ic("back") + "All 14 items</a>" +
      '<div class="kicker">Item ' + (i + 1) + " of " + ITEMS.length + " · " + esc(item.app) + "</div>" +
      "<h1>" + esc(item.name) + '</h1><p class="desc">' + esc(item.desc) + "</p>" + tags(item) +
      '<dl class="facts"><div><dt>Expected impact</dt><dd>' + esc(item.impact) + "</dd></div><div><dt>Raised by</dt><dd>" + esc(item.source) +
      "</dd></div><div><dt>The numbers</dt><dd>" + esc(item.numbers) + "</dd></div></dl>" +
      '<div class="modes" role="group" aria-label="Show the app"><button type="button" data-mode="today">Today</button><button type="button" data-mode="fix">With the fix</button></div>' +
      '<div class="try" id="try"></div>' +
      '<nav class="pager" aria-label="Backlog items">' + (prev ? '<a href="#/' + prev.slug + '">' + ic("back") + "Previous</a>" : "<span></span>") +
      (next ? '<a href="#/' + next.slug + '">Next' + ic("right") + "</a>" : "<span></span>") + "</nav></aside>" +
      '<section class="stage-wrap" aria-label="Prototype"><div class="controls" id="controls"></div><div class="stage" id="stage"></div></section></div>';
    applyMode();
  }
  function applyMode() {
    var mode = current.mode, item = current.item;
    page.querySelectorAll("[data-mode]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-mode") === mode)); });
    var tr = document.getElementById("try");
    tr.className = "try" + (mode === "today" ? " is-today" : "");
    tr.innerHTML = "<b>" + (mode === "today" ? "Today" : "With the fix") + ": try this</b><span>" + esc(mode === "today" ? item.tryToday : item.tryFix) +
      '</span><button class="link-btn" type="button" data-reset>Start over</button>';
    document.getElementById("controls").innerHTML = current.demo.controls ? current.demo.controls(current.state) : "";
    renderStage(true);
  }
  function renderStage(fresh) {
    var stage = document.getElementById("stage");
    if (!stage || !current) { return; }
    var keep = {};
    if (!fresh) { stage.querySelectorAll("[data-scroll]").forEach(function (el) { keep[el.getAttribute("data-scroll")] = el.scrollTop; }); }
    mountTimers.forEach(clearInterval); mountTimers = [];
    stage.innerHTML = current.demo.view(current.state);
    stage.querySelectorAll("[data-scroll]").forEach(function (el) { var k = el.getAttribute("data-scroll"); if (keep[k]) { el.scrollTop = keep[k]; } });
    // An action can ask for something to be scrolled into view inside its device (state.reveal = selector).
    var reveal = current.state.reveal && stage.querySelector(current.state.reveal);
    current.state.reveal = null;
    if (reveal) {
      var box = reveal.closest("[data-scroll]");
      if (box) { box.scrollTop = Math.max(0, box.scrollTop + reveal.getBoundingClientRect().top - box.getBoundingClientRect().top - 12); }
    }
    if (current.demo.mount) { current.demo.mount(current.state, stage); }
  }
  function setMode(mode) {
    clearTimers();
    current.mode = mode;
    current.state = current.demo.init();
    current.state.mode = mode;
    applyMode();
  }
  function route() {
    clearTimers();
    var slug = decodeURIComponent(location.hash.replace(/^#\/?/, "")).split("?")[0];
    var item = ITEMS.filter(function (x) { return x.slug === slug; })[0];
    if (!item || !DEMOS[item.slug]) {
      current = null;
      document.title = "Food Delivery backlog prototype";
      renderHub();
    } else {
      current = { item: item, demo: DEMOS[item.slug], mode: "fix", state: DEMOS[item.slug].init() };
      current.state.mode = "fix";
      document.title = item.name + " · Food Delivery prototype";
      renderItem();
    }
    window.scrollTo(0, 0);
  }
  function runAct(name, el, ev) {
    var s = current.state, fn = current.demo.act && current.demo.act[name];
    if (fn) { if (fn(s, el, ev) !== false) { renderStage(); } return; }
    if (name === "closeSheet") { s.sheet = null; renderStage(); }
  }

  document.addEventListener("click", function (ev) {
    if (!current) { return; }
    var t = ev.target;
    var mode = t.closest("[data-mode]");
    if (mode) { if (mode.getAttribute("data-mode") !== current.mode) { setMode(mode.getAttribute("data-mode")); } return; }
    if (t.closest("[data-reset]")) { setMode(current.mode); return; }
    var a = t.closest("[data-act]");
    var stage = document.getElementById("stage");
    if (!a || !stage || !stage.contains(a) || a.disabled) { return; }
    ev.preventDefault();
    runAct(a.getAttribute("data-act"), a, ev);
  });
  document.addEventListener("change", function (ev) {
    var a = ev.target.closest && ev.target.closest("[data-change]");
    if (a && current) { runAct(a.getAttribute("data-change"), a, ev); }
  });
  document.addEventListener("input", function (ev) {
    var a = ev.target.closest && ev.target.closest("[data-input]");
    if (a && current) { runAct(a.getAttribute("data-input"), a, ev); }
  });
  // Keep every food photo in memory, so redraws never flash empty boxes while a photo reloads.
  var preloaded = [];
  [KACCHI, DAAWAT, PADMA, SHISHIR, HAJI].forEach(function (r) { r.dishes.forEach(function (d) { if (d.img) { preloaded.push(d.img); } }); });
  DHAKA_RESTS.concat(CTG_RESTS).forEach(function (r) { preloaded.push(r.img); });
  preloaded.push("friedrice-1");
  preloaded = preloaded.filter(function (n, i) { return preloaded.indexOf(n) === i; }).map(function (n) { var im = new Image(); im.src = photo(n); return im; });

  window.addEventListener("hashchange", route);
  route();
})();
