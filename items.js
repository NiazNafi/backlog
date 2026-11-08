/* The 14 backlog items, highest priority first.
   The Google Sheet (backlog.csv) and backlog.md use the same words.
   Each item's prototype opens at index.html#/<slug>. */
window.FD_ITEMS = [
  {
    slug: "sold-out-switch",
    name: "Sold-out switch for restaurants",
    app: "Restaurant app and customer app",
    desc: "Let restaurants mark a dish sold out themselves, instead of waiting about 3.5 hours for an account manager.",
    impact: "Tk 5.7 lakh a month, if half of the sold-out cancellations become orders (the PM's assumption)",
    quarter: "Q2 '27", priority: "High", effort: "S",
    source: "KAM sync on 22 March, and a biryani house owner in #restaurant-partners",
    numbers: "4.4% of orders, about 2,755 a week, are cancelled because a dish is sold out.",
    tryToday: "Beef Tehari has run out, but only an account manager can change the menu. Tap + on Beef Tehari in the customer app.",
    tryFix: "Switch Beef Tehari off on the restaurant tablet. The customer's menu shows it as sold out at once."
  },
  {
    slug: "restaurant-discounts",
    name: "Restaurants set their own discounts",
    app: "Restaurant app",
    desc: "Restaurants start and stop their own discounts in their app, with a date picker and a required end date.",
    impact: "Saves about Tk 6.0 lakh a month and 315 account manager hours",
    quarter: "Q2 '27", priority: "High", effort: "M",
    source: "Raihan (KAM lead), email on 24 March",
    numbers: "Account managers type about 1,050 discount requests a month. 6% have a wrong percent or end date, and each mistake costs about Tk 9,500.",
    tryToday: "This is the CRM form an account manager fills in for each request. Leave the end date empty and save it.",
    tryFix: "Pick a percent and press Start discount with no end date. Then add an end date and start it."
  },
  {
    slug: "chattogram",
    name: "Chattogram in the app",
    app: "Customer app",
    desc: "Add a city choice with Chattogram's restaurants, delivery areas and cash on delivery before the 15 May launch.",
    impact: "Tk 5.8 lakh a month, if each restaurant gets 56 orders a week like a new Dhaka restaurant (the PM's assumption)",
    quarter: "Q2 '27", priority: "High", effort: "L",
    source: "Nadia (Head of Business and Finance), email on 28 March",
    numbers: "25 Chattogram restaurants have signed and 40 riders are ready. A new Dhaka restaurant gets about 56 orders a week.",
    tryToday: "Tap the address at the top and look for a Chattogram area. The app only knows Dhaka.",
    tryFix: "Tap the address at the top, choose Chattogram, then pick an area."
  },
  {
    slug: "time-and-fee",
    name: "Delivery time and fee before checkout",
    app: "Customer app",
    desc: "Show the delivery time and fee on the restaurant page and in the basket, not only on the last checkout screen.",
    impact: "Tk 1.11 lakh a month",
    quarter: "Q2 '27", priority: "High", effort: "S",
    source: "Labiba (data analyst), Slack message on 28 March",
    numbers: "Each week 15,690 checkouts reach a last screen that shows 50 minutes or more. 18.9% of them leave there.",
    tryToday: "Add a dish, open the basket and go to checkout. The 55-minute wait first appears on the last screen.",
    tryFix: "The time and fee are on the restaurant page. Add a dish and open the basket: they are there too."
  },
  {
    slug: "menu-upload",
    name: "Bulk menu upload for new restaurants",
    app: "KAM CRM (onboarding)",
    desc: "Upload a new restaurant's menu from a spreadsheet, so it goes live in days instead of about 3 weeks.",
    impact: "Tk 2.1 lakh a month, if the 9 restaurants a month that withdraw stay (the PM's assumption)",
    quarter: "Q2 '27", priority: "Medium", effort: "M",
    source: "KAM sync on 22 March, and Moushumi (Head of Supply) in #restaurant-partners",
    numbers: "48 restaurants are waiting to go live and 27 withdrew in Q1. A menu team of 3 types every dish by hand.",
    tryToday: "Type a dish and save it. This restaurant has 48 dishes, and 48 restaurants are waiting.",
    tryFix: "Upload the sample menu, fix the 2 flagged rows, then publish all 48 dishes."
  },
  {
    slug: "pay-by-distance",
    name: "Rider pay and delivery fee by distance",
    app: "Rider app and customer app",
    desc: "Pay riders and charge the delivery fee by distance, so long trips in the outer areas find a rider.",
    impact: "Tk 1.27 lakh a month, before the extra rider pay",
    quarter: "Q2 '27", priority: "Medium", effort: "M",
    source: "Weekly ops review on 21 March, and rider messages in #rider-ops",
    numbers: "In Uttara Sector 15, Aftabnagar, Keraniganj and Purbachal, 9.2% of orders find no rider, against 1.1% elsewhere.",
    tryToday: "Move the drop distance: the offer never shows it, and pay stays Tk 48. Then accept the offer.",
    tryFix: "Move the drop distance. Rider pay and the delivery fee rise together, so each order earns the company the same."
  },
  {
    slug: "rider-map",
    name: "Rider on a map in order tracking",
    app: "Customer app",
    desc: "Open the staff-only live map to all customers, with the rider's position and an arrival time.",
    impact: "Tk 0.65 lakh a month in agent time, if these complaints halve (the PM's assumption)",
    quarter: "Q2 '27", priority: "Medium", effort: "M",
    source: "Tahmina (Head of Customer Support) in #support on 30 March",
    numbers: "\"Where is my order?\" is 38% of complaints: about 2,995 a week, 5 agent minutes each.",
    tryToday: "Your kacchi is on the way. The screen says so in words, and nothing more.",
    tryFix: "Watch the rider move toward you while the arrival time counts down."
  },
  {
    slug: "basket-warning",
    name: "Ask before a second restaurant empties the basket",
    app: "Customer app",
    desc: "Ask the customer before a dish from a second restaurant empties the basket.",
    impact: "Tk 0.85 lakh a month",
    quarter: "Q2 '27", priority: "Medium", effort: "S",
    source: "Rumana (support team lead), forwarding Nusrat's email on 26 March",
    numbers: "605 sessions a week lose their basket this way. 27.3% of them still order, against 61.0% of other sessions.",
    tryToday: "Your basket has biryani for the family. Tap + on a dessert, then open the basket.",
    tryFix: "Your basket has biryani for the family. Tap + on a dessert."
  },
  {
    slug: "order-again",
    name: "Order again keeps the available items",
    app: "Customer app",
    desc: "When a dish has changed, Order again adds the rest of the order instead of leaving an empty basket.",
    impact: "Tk 0.64 lakh a month",
    quarter: "Q2 '27", priority: "Medium", effort: "S",
    source: "Support floor visit on 29 March: regular customers call about it",
    numbers: "345 Order again taps fail each week. 26.1% of them still end in an order, against 70.5% when it works.",
    tryToday: "Tap Order again on the kacchi order. Doi is not on the menu today.",
    tryFix: "Tap Order again on the kacchi order. Doi is not on the menu today."
  },
  {
    slug: "minimum-order",
    name: "Minimum order on the restaurant page",
    app: "Customer app",
    desc: "Show the minimum order on the restaurant page, so a grey checkout button stops looking broken.",
    impact: "Tk 0.62 lakh a month",
    quarter: "Q2 '27", priority: "Medium", effort: "S",
    source: "Ayesha (KAM executive), forwarding a fuchka stall owner on 29 March",
    numbers: "Each week 555 carts are below a minimum order. 29.7% of them become orders, against 56.8% of similar carts with no minimum.",
    tryToday: "Add one Chotpoti and open the basket. The checkout button is grey, and the reason is easy to miss.",
    tryFix: "Add one Chotpoti. The page and the basket bar say how much more to add."
  },
  {
    slug: "rider-route",
    name: "Route to the customer in the rider app",
    app: "Rider app",
    desc: "Show riders the route and turns to the customer, not just a pin on the map.",
    impact: "Late orders from 17.6% to 9.9%, if orders up to 5 minutes late arrive on time (the PM's assumption)",
    quarter: "Q3 '27", priority: "Medium", effort: "M",
    source: "Mahmud (rider ops manager) and Hasan (zone lead) in #rider-ops on 29 March",
    numbers: "17.6% of orders are late, and 43.9% of the late ones are 5 minutes late or less.",
    tryToday: "You have the food. Find your way to the customer.",
    tryFix: "Tap Next turn to follow the route to the customer's door."
  },
  {
    slug: "help-answers",
    name: "Answers to common questions in Help",
    app: "Customer app",
    desc: "Answer common questions in Help, such as how long a refund takes, above the chat button.",
    impact: "Tk 0.63 lakh a month in agent time, if half of these questions get answered in the app (the PM's assumption)",
    quarter: "Q3 '27", priority: "Low", effort: "S",
    source: "Tahmina (Head of Customer Support), email on 25 March",
    numbers: "1 in 5 tickets is a basic question: 8,973 a month, 7 agent minutes each.",
    tryToday: "You want to know how long a refund takes. Help has one button.",
    tryFix: "Open a question. The answer needs no agent."
  },
  {
    slug: "agent-screen",
    name: "One screen for support agents",
    app: "Support tool",
    desc: "Show the customer's orders, payments and past tickets on the ticket, so agents stop searching three tools.",
    impact: "Tk 1.5 lakh a month in agent time, if lookups take half as long (the PM's assumption)",
    quarter: "Q3 '27", priority: "Low", effort: "L",
    source: "CX weekly on 23 March, with Tahmina and Rumana",
    numbers: "42,400 tickets a month, each with 3.6 minutes of lookups. The first reply takes 24.7 hours, against a goal of 6.",
    tryToday: "The ticket shows only the order id. Open the three tools to find the answer.",
    tryFix: "Everything the agent needs is on the ticket. Send the suggested reply."
  },
  {
    slug: "food-photos",
    name: "Food photos for small restaurants",
    app: "Restaurant app and customer app",
    desc: "Let restaurants add dish photos from their tablet, since about 70% of dishes have none.",
    impact: "Tk 1.4 lakh a month",
    quarter: "Q3 '27", priority: "Low", effort: "M",
    source: "Ayesha (KAM executive), forwarding a Mohammadpur owner in #restaurant-partners on 25 March",
    numbers: "Each week 19,835 menu views show no photos. 58.7% of them add to cart, against 60.4% for menus with photos.",
    tryToday: "The restaurant has no way to add a photo, so the customer sees grey boxes.",
    tryFix: "Tap Add photo on a burger. The customer's menu shows it at once."
  }
];
