// ══════════════════════════════════════════════════════════════
//  WEEKLY WONDERS — SEASON 3 ARCHIVE (2025/26)
//  FROZEN. Do not edit — this is the historical record.
//  Final: Steer 2289 · Ben 2265 · Phil 2189 · Sean 2127
//  Extracted verbatim from the original single-file dashboard.
// ══════════════════════════════════════════════════════════════

export const SEASON_2526 = (() => {

const PLAYERS = [
  { nick:'STEER', name:'Tom Steer',         team:"Steer's Strategy",       entry:1631208 },
  { nick:'BEN',   name:'Ben Tosh',           team:'TeamTosh',               entry:2762029 },
  { nick:'PGSM',  name:'Philip Green',       team:'Mr 55p',                 entry:251690  },
  { nick:'SEAN',  name:'Sean Elliott',       team:'Better Now',             entry:618820  },
  { nick:'BAZ',   name:'Barry Heath',        team:'Beefy Boys',             entry:2906530 },
  { nick:'CAT',   name:'Richard Catling',    team:"Cat'll do nicely",       entry:4295680 },
  { nick:'ALEX',  name:'Alexander Roberts',  team:"Oh For Cloughs Sake!",   entry:2013858 },
  { nick:'ANDREA',name:'Andrea Elliott',     team:'AE United',              entry:5237390 },
  { nick:'ADAM',  name:'Adam Roberts',       team:'Lee Grant me 3wishes',   entry:2823034 },
  { nick:'BOBBY', name:'Bobby Roberts',      team:'Lord of the Ings FC',    entry:525582  },
  { nick:'PASS',  name:'Sam Passmore',       team:'No time United',         entry:4227338 },
  { nick:'JO',    name:'Jo Steer',           team:'Midnight Owl FC',        entry:9106664 },
  { nick:'BLEASE',name:'Simon Bleasdale',    team:"Bleasdale's Bandits",    entry:467006  },
  { nick:'DANNY', name:'Danny Nugent',       team:'Take my money FC',       entry:8223006 }
];

// GW points per player [GW1...GW38] — net of transfer deductions
const GW_PTS = {
  STEER:  [49,54,56,70,46,72,75,67,39,86,60,44,65,66,52,96,65,38,38,40,51,42,36,62,68,68,53,67,81,47,56,58,124,66,42,89,53,48],
  BEN:    [55,53,52,54,66,69,73,70,52,82,40,50,66,66,49,82,88,37,50,31,50,44,38,53,71,78,42,67,58,62,57,63,136,5,64,62,71,59],
  PGSM:   [62,52,54,75,42,56,76,57,79,82,33,31,40,55,56,57,76,45,40,43,51,44,47,54,83,77,44,50,44,42,77,65,114,41,50,85,51,59],
  SEAN:   [60,43,60,67,38,55,67,63,46,86,36,34,24,65,43,70,56,58,50,28,54,42,64,50,67,64,47,77,72,65,47,48,81,51,45,79,66,59],
  BAZ:    [64,36,70,59,33,53,52,60,40,65,69,78,39,71,54,74,77,45,38,58,45,38,46,37,64,81,51,47,43,51,39,47,98,36,57,69,74,36],
  CAT:    [44,69,54,53,42,45,72,44,36,54,36,49,59,60,60,59,48,46,45,54,63,37,46,45,79,74,47,81,82,35,58,70,68,46,42,98,39,64],
  ALEX:   [53,38,46,69,41,67,51,65,44,86,47,57,41,74,40,62,71,52,36,71,54,46,30,59,61,59,39,51,48,42,52,57,71,68,56,94,61,35],
  ANDREA: [65,44,33,54,39,52,35,49,58,58,40,47,32,60,65,55,64,48,37,54,50,39,56,44,62,78,41,65,80,60,58,51,86,29,89,91,47,63],
  ADAM:   [48,52,58,76,33,26,55,72,51,64,36,38,40,77,54,51,58,48,29,49,62,42,39,45,54,79,43,61,66,52,59,57,91,40,80,59,66,52],
  BOBBY:  [43,60,31,71,41,36,41,39,63,76,42,29,31,72,42,80,77,67,42,30,63,27,61,67,68,44,34,68,57,57,58,46,61,41,47,94,52,53],
  PASS:   [50,53,63,67,35,60,79,53,48,55,35,39,19,78,45,64,86,42,36,40,52,31,47,42,64,67,34,56,72,43,56,49,93,38,47,73,58,34],
  JO:     [49,39,48,74,47,27,36,40,40,80,39,32,27,52,79,70,74,49,42,41,42,35,38,83,67,51,48,64,55,64,49,52,80,48,39,91,71,20],
  BLEASE: [62,48,34,48,40,35,74,93,40,71,46,33,30,43,42,53,85,49,39,68,79,26,41,69,53,60,28,62,39,34,56,56,81,50,57,77,68,62],
  DANNY:  [49,66,49,42,27,40,77,73,73,63,39,26,40,59,44,44,98,41,24,36,55,47,49,62,67,51,32,50,46,49,60,31,76,60,61,58,69,74]
};

// FPL standings after GW38 — FINAL
let STANDINGS = [
  {rank:1,  lastRank:1,  name:'Tom Steer',       nick:'STEER', team:"Steer's Strategy",      total:2289, gwPts:48, entry:1631208},
  {rank:2,  lastRank:2,  name:'Ben Tosh',         nick:'BEN',   team:'TeamTosh',              total:2265, gwPts:59, entry:2762029},
  {rank:3,  lastRank:3,  name:'Philip Green',     nick:'PGSM',  team:'Mr 55p',                total:2189, gwPts:59, entry:251690 },
  {rank:4,  lastRank:4,  name:'Sean Elliott',     nick:'SEAN',  team:'Better Now',            total:2127, gwPts:59, entry:618820 },
  {rank:5,  lastRank:5,  name:'Richard Catling',  nick:'CAT',   team:"Cat'll do nicely",      total:2103, gwPts:64, entry:4295680},
  {rank:6,  lastRank:7,  name:'Barry Heath',      nick:'BAZ',   team:'Beefy Boys',            total:2094, gwPts:36, entry:2906530},
  {rank:7,  lastRank:6,  name:'Alex Roberts',     nick:'ALEX',  team:"Oh For Cloughs Sake!",  total:2094, gwPts:35, entry:2013858},
  {rank:8,  lastRank:8,  name:'Andrea Elliott',   nick:'ANDREA',team:'AE United',             total:2078, gwPts:63, entry:5237390},
  {rank:9,  lastRank:9,  name:'Adam Roberts',     nick:'ADAM',  team:'Lee Grant me 3wishes',  total:2062, gwPts:52, entry:2823034},
  {rank:10, lastRank:12, name:'Simon Bleasdale',  nick:'BLEASE',team:"Bleasdale's Bandits",   total:2031, gwPts:62, entry:467006 },
  {rank:11, lastRank:11, name:'Bobby Roberts',    nick:'BOBBY', team:'Lord of the Ings FC',   total:2011, gwPts:53, entry:525582 },
  {rank:12, lastRank:14, name:'Danny Nugent',     nick:'DANNY', team:'Take my money FC',      total:2007, gwPts:74, entry:8223006},
  {rank:13, lastRank:10, name:'Sam Passmore',     nick:'PASS',  team:'No time United',        total:2003, gwPts:34, entry:4227338},
  {rank:14, lastRank:13, name:'Jo Steer',         nick:'JO',    team:'Midnight Owl FC',       total:1982, gwPts:20, entry:9106664}
];

// Money data — winnings (£13 for 1st, £7 for 2nd each GW) + end-of-season prizes | losses = times finishing bottom
// End-of-season prizes: 1st £100 (Steer), 2nd £75 (Ben), 3rd £50 (Phil), 4th £30 (Sean)
// Cup: £20 winner (Ben), £10 runner-up (Alex) | Highest GW score: £19 (Ben, GW33)
const MONEY = {
  STEER:  { winnings:181,    losses:0 },  // +£100 (1st place)
  BEN:    { winnings:176,    losses:2 },  // +£75 (2nd place) +£3.50 (GW37 joint 2nd) +£2.50 (GW38 joint 2nd) +£20 (cup win) +£18 (high score)
  PGSM:   { winnings:105.50, losses:2 },  // +£50 (3rd place) +£2.50 (GW38 joint 2nd)
  SEAN:   { winnings:89.50,  losses:1 },  // +£30 (4th place) +£2.50 (GW38 joint 2nd)
  CAT:    { winnings:75.5,   losses:4 },
  ALEX:   { winnings:73.5,   losses:3 },  // +£10 (cup runner-up)
  DANNY:  { winnings:67,     losses:8 },  // +£13 (GW38 win)
  BAZ:    { winnings:79,     losses:2 },  // +£13 (GW37 win) +£13 (GW26 win — missed in spreadsheet)
  BLEASE: { winnings:47,     losses:6 },
  JO:     { winnings:43.50,  losses:3 },  // +£3.50 (GW37 joint 2nd) +1 loss (GW38 bottom)
  ANDREA: { winnings:33,     losses:3 },
  PASS:   { winnings:33,     losses:1 },
  BOBBY:  { winnings:27,     losses:4 },
  ADAM:   { winnings:34,     losses:1 }   // +£7 (GW26 runner-up — missed in spreadsheet)
};

// Chips — wc1/bb1/tc1/fh1 = standard chips | wc2/bb2/tc2/fh2 = extra chips (given by FPL this season)
// null = not yet used. Values = GW number when played.
const CHIPS = {
  STEER:  { wc1:16, bb1:11, tc1:6,  fh1:13, wc2:32,   bb2:33,   tc2:36,   fh2:34   },
  BEN:    { wc1:6,  bb1:5,  tc1:17, fh1:13, wc2:32,   bb2:33,   tc2:26,   fh2:37   },  // fh2 used GW37
  PGSM:   { wc1:3,  bb1:19, tc1:13, fh1:4,  wc2:22,   bb2:38,   tc2:33,   fh2:31   },  // bb2 used GW38
  SEAN:   { wc1:4,  bb1:19, tc1:18, fh1:null,wc2:25,  bb2:36,   tc2:26,   fh2:33   },
  BAZ:    { wc1:10, bb1:16, tc1:18, fh1:19, wc2:38,   bb2:27,   tc2:36,   fh2:33   },  // wc2 used GW38
  CAT:    { wc1:19, bb1:null,tc1:18,fh1:null,wc2:34,  bb2:36,   tc2:33,   fh2:31   },
  ALEX:   { wc1:8,  bb1:13, tc1:6,  fh1:18, wc2:32,   bb2:33,   tc2:36,   fh2:34   },
  ANDREA: { wc1:null,bb1:15,tc1:18, fh1:null,wc2:null, bb2:35,  tc2:33,   fh2:26   },
  ADAM:   { wc1:8,  bb1:18, tc1:17, fh1:19, wc2:25,   bb2:35,   tc2:33,   fh2:31   },
  BOBBY:  { wc1:11, bb1:null,tc1:13,fh1:14, wc2:31,   bb2:null, tc2:36,   fh2:34   },
  PASS:   { wc1:6,  bb1:12, tc1:19, fh1:null,wc2:35,  bb2:33,   tc2:36,   fh2:34   },
  JO:     { wc1:9,  bb1:4,  tc1:17, fh1:18, wc2:32,   bb2:null, tc2:36,   fh2:34   },
  BLEASE: { wc1:19, bb1:null,tc1:18,fh1:null,wc2:32,  bb2:38,   tc2:37,   fh2:null },  // tc2 used GW37, bb2 used GW38
  DANNY:  { wc1:5,  bb1:null,tc1:18,fh1:19, wc2:null, bb2:35,   tc2:null, fh2:31   }
};

// The Needy List
const NEEDY = [
  { nick:'PASS',   name:'Sam Passmore', team:'No time United'  },
  { nick:'SEAN',   name:'Sean Elliott', team:'Better Now'      },
  { nick:'PGSM',   name:'Philip Green', team:'Mr 55p'          }
];

// Weekly Reports (editable — add new weeks here!)
const REPORTS = [
  { gw:38, winner:'Danny Nugent', winnerPts:74, runnerUp:'Ben Tosh, Philip Green & Sean Elliott', runnerUpPts:59,
    loser:'Jo Steer', loserPts:20, avg:51.3, chips:"BB — Phil (bb2) | WC — Baz (wc2) | BB — Blease (bb2)",
    mention:"Danny saves his best for last — 74 pts on the final day to win the week and steal 12th place. Jo finishes rock bottom of GW38 with just 20 pts. Season over — Steer champions, Ben runner-up.",
    fact:'Final standings: 1. Steer 2289 · 2. Ben 2265 · 3. Phil 2189 · 4. Sean 2127 · 5. Cat 2103. Season high: Ben 136 pts in GW33.' },
  { gw:37, winner:'Barry Heath', winnerPts:74, runnerUp:'Ben Tosh & Jo Steer', runnerUpPts:71,
    loser:'Richard Catling', loserPts:39, avg:61.9, chips:"FH — Ben (fh2) | TC — Blease (tc2)",
    mention:"Baz storms to the win with 74 pts — his joint-highest of the season. Ben & Jo share 2nd with 71 each. Cat bottom with just 39. Blease plays his Triple Captain to no great effect.",
    fact:'Danny (69), Blease (68) and Sean (66) all put in season-best second-half performances in GW37.' },
  { gw:36, winner:'Richard Catling', winnerPts:98, runnerUp:'Alex Roberts & Bobby Roberts', runnerUpPts:94,
    loser:'Danny Nugent', loserPts:58, avg:79.9, chips:'TC — Steer, Alex, Baz, Bobby, Pass & Jo | BB — Sean & Cat',
    mention:"Massive chip week! Cat wins with 98 on his BB while 6 players fire their Triple Captain. Highest average week of the second half of the season.",
    fact:'8 chips played in one gameweek — matching the record set in GW19.' },
  { gw:35, winner:'Andrea Elliott', winnerPts:89, runnerUp:'Adam Roberts', runnerUpPts:80,
    loser:'Jo Steer', loserPts:39, avg:55.4, chips:'BB — Adam, Andrea & Danny | WC — Passmore',
    mention:"Andrea storms to the week with 89 pts on her Bench Boost — her highest score of the season. Steer stays top despite a quiet 42.",
    fact:'PGSM took a -4 hit this week and still managed 50 pts. Respect.' },
  { gw:34, winner:'Alex Roberts', winnerPts:68, runnerUp:'Tom Steer', runnerUpPts:66,
    loser:'Andrea Elliott', loserPts:29, avg:46.7, chips:'FH — Steer, Alex, Pass, Bobby & Jo | WC — Cat',
    mention:"Steer takes sole lead at the top as Tosh gets just 5 pts on his Free Hit — a disaster week for Ben.",
    fact:'Ben\'s 5 pts is the lowest single GW score of the season.' },
  { gw:33, winner:'Ben Tosh', winnerPts:136, runnerUp:'Tom Steer', runnerUpPts:124,
    loser:'Bobby Roberts', loserPts:61, avg:89.2, chips:'BB — Tosh, Steer, Sam & Alex | TC — Phil, Adam, Andrea & Cat | FH — Baz & Sean',
    mention:'Massive chip week! Tosh tops with 136 on his Bench Boost. Steer & Tosh now level on 2004 pts at the top.',
    fact:'10 out of 14 players used a chip this week — the most in a single gameweek all season.' },
  { gw:32, winner:'Richard Catling', winnerPts:70, runnerUp:'Philip Green', runnerUpPts:65,
    loser:'Danny Nugent', loserPts:31, avg:55.4, chips:'Wildcard — Steer, Tosh, Alex, Simon & Jo',
    mention:'CAT wins his second GW in a row with 70 pts. Tosh sneaks ahead of Steer at the top by just 1 point!',
    fact:'5 wildcards played in one week — biggest chip day of the season.' },
  { gw:31, winner:'Philip Green', winnerPts:77, runnerUp:'Danny Nugent', runnerUpPts:60,
    loser:'Barry Heath', loserPts:39, avg:55.9, chips:'FH — Adam, Blease, Bobby, Cat, Danny & Phil',
    mention:'Tightest week of the season — 8 people getting between 56–59 pts.',
    fact:'Danny holds the season high of 98 pts from GW17.' },
  { gw:30, winner:'Sean Elliott', winnerPts:65, runnerUp:'Jo Steer', runnerUpPts:64,
    loser:'Simon Bleasdale', loserPts:34, avg:50.5, chips:'None',
    mention:'All the women climbing several places: Andrea, Jo & Sean.',
    fact:null },
  { gw:29, winner:'Richard Catling', winnerPts:82, runnerUp:'Tom Steer', runnerUpPts:81,
    loser:'Simon Bleasdale', loserPts:39, avg:60.4, chips:'None',
    mention:'Andrea with 80 pts and climbing 3 places.',
    fact:null },
  { gw:28, winner:'Richard Catling', winnerPts:81, runnerUp:'Sean Elliott', runnerUpPts:77,
    loser:'Danny Nugent', loserPts:50, avg:61.9, chips:'None',
    mention:'Anyone lucking out with their vice captain choices.',
    fact:null },
  { gw:27, winner:'Tom Steer', winnerPts:53, runnerUp:'Barry Heath', runnerUpPts:51,
    loser:'Simon Bleasdale', loserPts:24, avg:41.6, chips:'BB — Baz',
    mention:"I'll take the win with £6.5m in the bank.",
    fact:'Ben with 28 pts on the bench.' },
  { gw:26, winner:'Barry Heath', winnerPts:81, runnerUp:'Adam Roberts', runnerUpPts:79,
    loser:'Bobby Roberts', loserPts:44, avg:67.5, chips:'TC — Ben & Sean, FH — Andrea',
    mention:"Ben & Sean's Gabriel Triple Captain.",
    fact:null },
  { gw:25, winner:'Philip Green', winnerPts:83, runnerUp:'Richard Catling', runnerUpPts:79,
    loser:'Simon Bleasdale', loserPts:53, avg:66.3, chips:'WC — Sean & Adam',
    mention:"Phil's Palmer captaincy.",
    fact:"I'm regretting adding the fun fact one in..." },
  { gw:24, winner:'Jo Steer', winnerPts:83, runnerUp:'Simon Bleasdale', runnerUpPts:69,
    loser:'Barry Heath', loserPts:37, avg:51.9, chips:'None',
    mention:'Andrea for getting 0 from her two captain choices.',
    fact:'Lowest ever FPL score was Bednarek in 2021 — minus 7. Red card, own goal and conceded 9 goals as a defender. One person triple captained him.' },
  { gw:23, winner:'Sean Elliott', winnerPts:64, runnerUp:'Bobby Roberts', runnerUpPts:61,
    loser:'Alex Roberts', loserPts:30, avg:45.6, chips:'None',
    mention:'Sean "all grief, no thanks" Elliott.',
    fact:'Oxford University is older than the Aztec Empire.' },
  { gw:22, winner:'Danny Nugent', winnerPts:51, runnerUp:'Alex Roberts', runnerUpPts:46,
    loser:'Simon Bleasdale', loserPts:26, avg:38.9, chips:'WC — Phil',
    mention:'Blease with 22 pts on the bench.',
    fact:'Danny has lost most weeks (5) and won the joint most money so far (£47).' },
  { gw:21, winner:'Simon Bleasdale', winnerPts:79, runnerUp:'Bobby Roberts & Richard Catling', runnerUpPts:63,
    loser:'Jo Steer', loserPts:42, avg:55.1, chips:'None',
    mention:'Phil for slipping down to 5th.',
    fact:null },
  { gw:20, winner:'Alex Roberts', winnerPts:71, runnerUp:'Simon Bleasdale', runnerUpPts:68,
    loser:'Sean Elliott', loserPts:28, avg:45.9, chips:'None',
    mention:'Adam with 22 pts on his bench.',
    fact:'We have more compute power in a smartphone than NASA had for the Moon landing.' },
  { gw:19, winner:'Ben Tosh & Sean Elliott', winnerPts:50, runnerUp:'—', runnerUpPts:0,
    loser:'Danny Nugent', loserPts:24, avg:36.6, chips:'TC — Passmore, BB — Sean & Phil, FH — Danny, Adam & Baz, WC — Cat & Blease',
    mention:"Danny nearly had more points on his bench than his team — despite not needing a bench.",
    fact:"8 people didn't use all their chips in the first half of the season." },
  { gw:18, winner:'Bobby Roberts', winnerPts:67, runnerUp:'Sean Elliott', runnerUpPts:58,
    loser:'Ben Tosh', loserPts:37, avg:47.5, chips:'TC — Baz, Sean, Cat, Andrea & Blease, BB — Adam, FH — Jo',
    mention:'Top 2 losing the week.',
    fact:'Vinnie Jones was once booked after 3 seconds — still the fastest yellow card in football history.' },
  { gw:17, winner:'Danny Nugent', winnerPts:98, runnerUp:'Ben Tosh', runnerUpPts:88,
    loser:'Richard Catling', loserPts:44, avg:73.0, chips:'TC — Ben, Adam & Jo',
    mention:"Danny's 98 pts with no chip — a new season high.",
    fact:"To visit every child's home in one night, Santa would need to travel at 2,340,000 mph — visiting 822 homes per second." },
  { gw:16, winner:'Tom Steer', winnerPts:96, runnerUp:'Ben Tosh', runnerUpPts:82,
    loser:'Danny Nugent', loserPts:44, avg:65.5, chips:'BB — Baz, WC — Steer',
    mention:"Danny's rogue captain choice getting him nil points.",
    fact:'Wombats are the only animals in the world that produce cube-shaped feces.' },
  { gw:15, winner:'Jo Steer', winnerPts:79, runnerUp:'Andrea Elliott', runnerUpPts:65,
    loser:'Alex Roberts', loserPts:40, avg:51.8, chips:'BB — Andrea',
    mention:'Jo bought Fernandes and Drewsbury-Hall and confidently stated she was going to win.',
    fact:'In Switzerland it is illegal to own just one guinea pig — keeping one alone is considered animal abuse.' },
  { gw:14, winner:'Sam Passmore', winnerPts:78, runnerUp:'Adam Roberts', runnerUpPts:77,
    loser:'Simon Bleasdale', loserPts:43, avg:64.1, chips:'FH — Bobby',
    mention:'Catling holding strong as the only player without Haaland.',
    fact:'Australia is wider than the Moon.' },
  { gw:13, winner:'Ben Tosh', winnerPts:66, runnerUp:'Tom Steer', runnerUpPts:65,
    loser:'Sam Passmore', loserPts:23, avg:39.8, chips:'BB — Alex, TC — Phil & Bobby, FH — Steer & Tosh',
    mention:"Alex outdoing Passmore's Bench Boost and getting an impressive -1.",
    fact:'Baz winning the money stakes with £46.' },
  { gw:12, winner:'Barry Heath', winnerPts:78, runnerUp:'Alex Roberts', runnerUpPts:57,
    loser:'Danny Nugent', loserPts:26, avg:41.9, chips:'BB — Passmore',
    mention:'Passmore with a whopping 2 pts from his Bench Boost.',
    fact:'Danny leading the losers chart with 3.' },
  { gw:11, winner:'Barry Heath', winnerPts:69, runnerUp:'Tom Steer', runnerUpPts:60,
    loser:'Philip Green', loserPts:33, avg:42.7, chips:'WC — Bobby, BB — Steer',
    mention:'Phil saves Catling from a hat-trick of losses.',
    fact:null },
  { gw:10, winner:'Tom Steer, Sean Elliott & Alex Roberts', winnerPts:86, runnerUp:'Ben Tosh', runnerUpPts:82,
    loser:'Richard Catling', loserPts:54, avg:72.0, chips:'WC — Baz',
    mention:'Phil also on 86 but dropped 4 and 20 on his bench. Highest average week of the season.',
    fact:'Andrea, Blease, Bobby & Catling still yet to use a chip.' },
  { gw:9, winner:'Philip Green', winnerPts:79, runnerUp:'Danny Nugent', runnerUpPts:73,
    loser:'Richard Catling', loserPts:36, avg:50.6, chips:'WC — Jo',
    mention:'Nothing springs to mind.',
    fact:'Danny, Andrea & Bobby all drawing the losers table with 2 each.' },
  { gw:8, winner:'Simon Bleasdale', winnerPts:93, runnerUp:'Danny Nugent', runnerUpPts:73,
    loser:'Bobby Roberts', loserPts:39, avg:61.4, chips:'WC — Adam & Alex',
    mention:"Danny averaged 88% more points in weeks he didn't manage his own team.",
    fact:'No one has lost yet whose name begins with a letter after D in the alphabet.' },
  { gw:7, winner:'Sam Passmore', winnerPts:79, runnerUp:'Simon Bleasdale', runnerUpPts:78,
    loser:'Andrea Elliott', loserPts:35, avg:61.9, chips:'None',
    mention:'A close 77 in 3rd, 76 in 4th and 75 in 5th.',
    fact:null },
  { gw:6, winner:'Tom Steer', winnerPts:72, runnerUp:'Ben Tosh', runnerUpPts:69,
    loser:'Adam Roberts', loserPts:26, avg:41.6, chips:'WC — Ben & Passmore, TC — Steer & Alex',
    mention:'Nothing really worth a mention, other than a Haaland TC of course...',
    fact:null },
  { gw:5, winner:'Ben Tosh', winnerPts:66, runnerUp:'Jo Steer', runnerUpPts:47,
    loser:'Danny Nugent', loserPts:44, avg:41.0, chips:'WC — Danny, BB — Ben',
    mention:'Danny becomes the first person to play their Wildcard and lose the week.',
    fact:null },
  { gw:4, winner:'Adam Roberts', winnerPts:76, runnerUp:'Philip Green', runnerUpPts:75,
    loser:'Danny Nugent', loserPts:42, avg:63.4, chips:'FH — Phil',
    mention:'Jo with 74 pts or Phil with 35 pts on his bench.',
    fact:null },
  { gw:3, winner:'Barry Heath', winnerPts:70, runnerUp:'Sam Passmore', runnerUpPts:63,
    loser:'Andrea Elliott', loserPts:33, avg:51.1, chips:'WC — Phil',
    mention:'Grimsby Town.',
    fact:null },
  { gw:2, winner:'Richard Catling', winnerPts:69, runnerUp:'Danny Nugent', runnerUpPts:66,
    loser:'Alex Roberts', loserPts:38, avg:50.5, chips:'None',
    mention:'Catling with 24 points from one player off his bench; Danny nearly surpassed his winnings from last year.',
    fact:null },
  { gw:1, winner:'Andrea Elliott', winnerPts:65, runnerUp:'Barry Heath', runnerUpPts:64,
    loser:'Bobby Roberts', loserPts:43, avg:53.8, chips:'None',
    mention:'Passmore with 3 defenders out already.',
    fact:'Bitcoin update: I give up. HF$P' }
];

  return {
    id: '2025-26',
    label: '2025/26',
    edition: '3rd Edition',
    leagueId: 46235,          // historical — reissued by FPL for 26/27
    status: 'complete',
    totalGWs: 38,
    players: PLAYERS,
    gwPts: GW_PTS,
    standings: STANDINGS,
    money: MONEY,
    chips: CHIPS,
    needy: NEEDY,
    reports: REPORTS,
    entryFeeNext: 76
  };
})();
