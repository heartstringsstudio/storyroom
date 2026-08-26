/* ==========================================================================
   The Story Room — Heartstrings Studio
   --------------------------------------------------------------------------
   How this file is organized:
     1. CONFIG    — the Formspree endpoint and one question set per occasion.
                    Edit wording here; nothing below needs to change.
     2. STATE     — in-memory answers, mirrored to sessionStorage.
     3. RENDERING — one function per screen.
     4. SUBMIT    — compiles the intake text and posts to Formspree.
   ========================================================================== */

'use strict';

/* =========================================================================
   1. CONFIG
   ========================================================================= */

var FORM_ENDPOINT = 'https://formspree.io/f/xykbvdrb';
var STORAGE_KEY = 'storyroom-v1';

/*
 * Each occasion has:
 *   label     — shown on the card and in the compiled intake
 *   desc      — one-line card description
 *   icon      — key into ICONS below
 *   presend   — the line shown above the send button
 *   doneTitle / doneBody — confirmation screen copy
 *   questions — asked one per screen, in order. Each question has:
 *     id        — storage key (unique within the occasion)
 *     label     — UPPERCASE heading used in the compiled intake text
 *     q         — the question as shown on screen
 *     sub       — optional gentle sub-prompt
 *     essential — true = can't be skipped (only the two opening questions)
 *     heart     — true = flagged as a favorite question
 *     isEvent   — true = this answer also fills the event_date field
 *
 * To change wording, edit the strings. To add or remove a question on a
 * path, add or remove an entry — the flow, review screen, and compiled
 * intake all follow this config.
 */
var OCCASIONS = {

  memorial: {
    label: 'Memorial',
    desc: 'Honoring the memory of someone who has passed',
    icon: 'candle',
    presend: 'We’ll read every word with care, and we’ll make sure the song is ready when your family needs it.',
    doneTitle: 'Your story is in careful hands.',
    doneBody: 'Thank you for trusting us with them. We’ll read every word, and we’ll make sure the song is with you when your family needs it — that part is ours to carry now.',
    questions: [
      {
        id: 'about',
        label: 'WHO THE SONG IS ABOUT',
        q: 'Who is this song about?',
        sub: 'Their name, and who they were to you.',
        essential: true
      },
      {
        id: 'from',
        label: 'WHO IT’S FROM',
        q: 'And who is this song from?',
        sub: 'Your name — and anyone else whose heart it speaks for.',
        essential: true
      },
      {
        id: 'moment',
        label: 'A MOMENT / A PLACE',
        q: 'If we could see one moment with them, what would we see?',
        sub: 'Let us stand somewhere with them — a kitchen, a porch, a road, a shift at the plant. Wherever home was.'
      },
      {
        id: 'words',
        label: 'THEIR WORDS / UNSAID WORDS',
        q: 'Is there something they always said — or something you never got to say?',
        sub: 'It’s okay if this is just a fragment. Fragments are where songs begin.',
        heart: true
      },
      {
        id: 'details',
        label: 'ONLY-THEM DETAILS',
        q: 'What made them only them?',
        sub: 'Habits, objects, jobs, quirks. Nobody else packed a lunch pail quite like that.'
      },
      {
        id: 'feeling',
        label: 'THE FEELING IT SHOULD LEAVE',
        q: 'When this song ends, what do you want the listener to feel?',
        sub: 'There’s no wrong answer. Comfort, gratitude, peace — whatever is true.'
      },
      {
        id: 'remembered',
        label: 'HOW THEY SHOULD BE REMEMBERED',
        q: 'How would you like them to be remembered?',
        sub: 'What did they teach you, leave you, or make possible?'
      },
      {
        id: 'event',
        label: 'SERVICE OR GATHERING',
        q: 'Is there a service or gathering this song is for?',
        sub: 'If so, tell us when, and we’ll make sure the song is ready in time. That worry is off your list.',
        isEvent: true
      },
      {
        id: 'anything',
        label: 'ANYTHING ELSE',
        q: 'Is there anything else you’d like the songwriter to know?',
        sub: 'Anything at all. This one is completely optional.'
      }
    ]
  },

  celebration: {
    label: 'Celebration of Life',
    desc: 'A joyful remembering of a life well lived',
    icon: 'sun',
    presend: 'We’ll read every word with care, and we’ll be in touch soon.',
    doneTitle: 'Your story made it safely.',
    doneBody: 'Thank you for sharing a life worth celebrating. We’ll read every word with care, and we’ll be in touch soon.',
    questions: [
      {
        id: 'about',
        label: 'WHO THE SONG IS ABOUT',
        q: 'Whose life are we celebrating?',
        sub: 'Their name, and who they are to you.',
        essential: true
      },
      {
        id: 'from',
        label: 'WHO IT’S FROM',
        q: 'And who is this song from?',
        sub: 'Your name — and anyone else whose heart it speaks for.',
        essential: true
      },
      {
        id: 'moment',
        label: 'A MOMENT / A PLACE',
        q: 'If we could see one shining moment with them, what would we see?',
        sub: 'Put us somewhere real — a back porch in July, a crowded kitchen, a road they loved to drive.'
      },
      {
        id: 'words',
        label: 'THEIR WORDS / UNSAID WORDS',
        q: 'What did they always say — or what do you wish you’d said?',
        sub: 'Even a scrap of it. Their voice matters here.',
        heart: true
      },
      {
        id: 'details',
        label: 'ONLY-THEM DETAILS',
        q: 'What was wonderfully, unmistakably them?',
        sub: 'Habits, recipes, the hat they never took off, the way they told a story.'
      },
      {
        id: 'feeling',
        label: 'THE FEELING IT SHOULD LEAVE',
        q: 'When this song ends, what should the room feel?',
        sub: 'Joy and tears are allowed to share a seat.'
      },
      {
        id: 'remembered',
        label: 'HOW THEY SHOULD BE REMEMBERED',
        q: 'How should they be remembered?',
        sub: 'What did they teach you, leave you, or make possible?'
      },
      {
        id: 'event',
        label: 'CELEBRATION OR GATHERING',
        q: 'Is there a celebration or gathering this song is for?',
        sub: 'If so, tell us when, and we’ll make sure the song is there in good time.',
        isEvent: true
      },
      {
        id: 'anything',
        label: 'ANYTHING ELSE',
        q: 'Is there anything else you’d like the songwriter to know?',
        sub: 'Anything at all. This one is completely optional.'
      }
    ]
  },

  wedding: {
    label: 'Wedding & Anniversary',
    desc: 'A love story, told the way only a song can',
    icon: 'rings',
    presend: 'We’ll read every word with care, and we’ll be in touch soon.',
    doneTitle: 'Your story made it safely.',
    doneBody: 'Thank you — love stories are our favorite kind of homework. We’ll read every word with care, and we’ll be in touch soon.',
    questions: [
      {
        id: 'about',
        label: 'WHO THE SONG IS ABOUT',
        q: 'Whose love story is this?',
        sub: 'Names, please — yours, your parents’, your favorite pair of stubborn romantics.',
        essential: true
      },
      {
        id: 'from',
        label: 'WHO IT’S FROM',
        q: 'And who is this song from?',
        sub: 'Your name, and anyone else who’d like to sign their heart to it.',
        essential: true
      },
      {
        id: 'moment',
        label: 'A MOMENT / A PLACE',
        q: 'If we could see one moment of the two of them, what would we see?',
        sub: 'Set the scene — a porch swing, a diner booth, a slow dance in the kitchen with no music playing.'
      },
      {
        id: 'words',
        label: 'THEIR WORDS / UNSAID WORDS',
        q: 'Is there something one of them always says — a phrase, a promise, an inside joke?',
        sub: 'These have a way of becoming the chorus. No pressure.',
        heart: true
      },
      {
        id: 'details',
        label: 'ONLY-THEM DETAILS',
        q: 'What details belong to this love and nobody else’s?',
        sub: 'The toast that always burns. The truck that barely runs. The Sunday ritual nobody skips.'
      },
      {
        id: 'feeling',
        label: 'THE FEELING IT SHOULD LEAVE',
        q: 'When the song ends, what should the two of them feel?',
        sub: 'Say it plain — that’s usually where the best line is hiding.'
      },
      {
        id: 'met',
        label: 'HOW THEY MET',
        q: 'How did they meet?',
        sub: 'The real version, not the polished one.'
      },
      {
        id: 'knew',
        label: 'THE MOMENT THEY KNEW',
        q: 'What’s the moment you knew?',
        sub: 'Or the moment they knew. Somebody knew something.'
      },
      {
        id: 'anything',
        label: 'ANYTHING ELSE',
        q: 'Is there anything else you’d like the songwriter to know?',
        sub: 'A date coming up, a verse that must rhyme with a certain name — anything. Completely optional.'
      }
    ]
  },

  milestone: {
    label: 'Milestone',
    desc: 'Birthdays, retirements, graduations and more',
    icon: 'flag',
    presend: 'We’ll read every word with care, and we’ll be in touch soon.',
    doneTitle: 'Your story made it safely.',
    doneBody: 'Thank you — somebody’s big day just got bigger. We’ll read every word with care, and we’ll be in touch soon.',
    questions: [
      {
        id: 'about',
        label: 'WHO THE SONG IS ABOUT',
        q: 'Who is this song about?',
        sub: 'Their name, and who they are to you.',
        essential: true
      },
      {
        id: 'from',
        label: 'WHO IT’S FROM',
        q: 'And who is this song from?',
        sub: 'Your name, and anyone else in on it.',
        essential: true
      },
      {
        id: 'moment',
        label: 'A MOMENT / A PLACE',
        q: 'If we could see one moment with them, what would we see?',
        sub: 'A place helps — the bleachers, the break room, the kitchen table where all the homework got done.'
      },
      {
        id: 'words',
        label: 'THEIR WORDS / UNSAID WORDS',
        q: 'What do they always say — or what’s never quite been said out loud?',
        sub: 'A saying, a pep talk, the thing the whole family quotes.',
        heart: true
      },
      {
        id: 'details',
        label: 'ONLY-THEM DETAILS',
        q: 'What is so completely them that nobody else could claim it?',
        sub: 'Habits, quirks, the coffee mug no one else is allowed to touch.'
      },
      {
        id: 'feeling',
        label: 'THE FEELING IT SHOULD LEAVE',
        q: 'When this song ends, what do you want them to feel?',
        sub: 'Proud? Seen? Ready? All of the above is a fine answer.'
      },
      {
        id: 'stepping',
        label: 'THE MILESTONE',
        q: 'What are they stepping into — and what are they leaving behind?',
        sub: 'A graduation, a retirement, a birthday with a zero in it. Tell us what’s turning.'
      },
      {
        id: 'hope',
        label: 'WHAT YOU HOPE IT TELLS THEM',
        q: 'What do you hope this song tells them?',
        sub: 'The thing a greeting card never quite manages to say.'
      },
      {
        id: 'anything',
        label: 'ANYTHING ELSE',
        q: 'Is there anything else you’d like the songwriter to know?',
        sub: 'A date it’s needed by, a name that’s tricky to pronounce — anything. Completely optional.'
      }
    ]
  },

  tribute: {
    label: 'Tribute',
    desc: 'For someone still here who deserves to hear it',
    icon: 'laurel',
    presend: 'We’ll read every word with care, and we’ll be in touch soon.',
    doneTitle: 'Your story made it safely.',
    doneBody: 'Thank you. The best time to tell somebody what they mean is while they can still hear it — and you just did. We’ll read every word with care, and we’ll be in touch soon.',
    questions: [
      {
        id: 'about',
        label: 'WHO THE SONG IS ABOUT',
        q: 'Who is this song about?',
        sub: 'Their name, and who they are to you.',
        essential: true
      },
      {
        id: 'from',
        label: 'WHO IT’S FROM',
        q: 'And who is this song from?',
        sub: 'Your name, and anyone else who’d put their name to it.',
        essential: true
      },
      {
        id: 'moment',
        label: 'A MOMENT / A PLACE',
        q: 'If we could see one moment with them, what would we see?',
        sub: 'Put us there — the garden, the garage, the front pew, the night shift.'
      },
      {
        id: 'words',
        label: 'THEIR WORDS / UNSAID WORDS',
        q: 'Is there something they always say — or something you’ve never quite said to them?',
        sub: 'It’s okay if this is just a fragment. Fragments are where songs begin.',
        heart: true
      },
      {
        id: 'details',
        label: 'ONLY-THEM DETAILS',
        q: 'What makes them only them?',
        sub: 'Habits, objects, jobs, quirks. Nobody else packs a lunch pail quite like that.'
      },
      {
        id: 'feeling',
        label: 'THE FEELING IT SHOULD LEAVE',
        q: 'When this song ends, what do you want them to feel?',
        sub: 'They’re going to hear this. What should land?'
      },
      {
        id: 'honored',
        label: 'WHAT THEY’RE HONORED FOR',
        q: 'What are they being honored for?',
        sub: 'Say it plain — the years, the sacrifice, the showing up.'
      },
      {
        id: 'hope',
        label: 'WHAT YOU HOPE IT TELLS THEM',
        q: 'What do you hope this song tells them?',
        sub: 'The words that are easier to sing than to say.'
      },
      {
        id: 'anything',
        label: 'ANYTHING ELSE',
        q: 'Is there anything else you’d like the songwriter to know?',
        sub: 'Anything at all. Completely optional.'
      }
    ]
  },

  justbecause: {
    label: 'Just Because / Other',
    desc: 'No occasion needed — every story fits here',
    icon: 'note',
    presend: 'We’ll read every word with care, and we’ll be in touch soon.',
    doneTitle: 'Your story made it safely.',
    doneBody: 'Thank you — the best songs often arrive for no occasion at all. We’ll read every word with care, and we’ll be in touch soon.',
    questions: [
      {
        id: 'about',
        label: 'WHO THE SONG IS ABOUT',
        q: 'Who is this song about?',
        sub: 'Their name, and who they are to you.',
        essential: true
      },
      {
        id: 'from',
        label: 'WHO IT’S FROM',
        q: 'And who is this song from?',
        sub: 'Your name, and anyone else in on it.',
        essential: true
      },
      {
        id: 'moment',
        label: 'A MOMENT / A PLACE',
        q: 'If we could see one moment with them, what would we see?',
        sub: 'Put us there — the porch swing, the long drive, the kitchen at midnight.'
      },
      {
        id: 'words',
        label: 'THEIR WORDS / UNSAID WORDS',
        q: 'Is there something they always say — or something you’ve never quite said to them?',
        sub: 'It’s okay if this is just a fragment. Fragments are where songs begin.',
        heart: true
      },
      {
        id: 'details',
        label: 'ONLY-THEM DETAILS',
        q: 'What makes them only them?',
        sub: 'Habits, objects, quirks. The little things nobody else would think to mention.'
      },
      {
        id: 'feeling',
        label: 'THE FEELING IT SHOULD LEAVE',
        q: 'When this song ends, what should it leave behind?',
        sub: 'Warm, funny, tearful in the good way — you tell us.'
      },
      {
        id: 'reason',
        label: 'WHY THIS SONG, WHY NOW',
        q: 'There’s no occasion box for this one — so what moved you to do it?',
        sub: 'A holiday, an apology, a thank-you, or truly just because. Every reason is a good one.'
      },
      {
        id: 'anything',
        label: 'ANYTHING ELSE',
        q: 'Is there anything else you’d like the songwriter to know?',
        sub: 'A date it’s needed by, a name to work in — anything. Completely optional.'
      }
    ]
  }
};

/* Order the occasion cards appear in. */
var OCCASION_ORDER = ['memorial', 'celebration', 'wedding', 'milestone', 'tribute', 'justbecause'];

/* Simple line-art icons for the occasion cards. */
var ICONS = {
  candle: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2c1.5 2 2.5 3.2 2.5 4.7A2.5 2.5 0 0 1 12 9a2.5 2.5 0 0 1-2.5-2.3C9.5 5.2 10.5 4 12 2z"/><path d="M9.5 12h5v9h-5z"/><path d="M7 21h10"/></svg>',
  sun: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="13" r="4"/><path d="M12 5v2M4 13H2m20 0h-2M6.3 7.3 4.9 5.9m14.2 1.4 1.4-1.4M5 20c2-1.6 4.4-2.5 7-2.5S17 18.4 19 20"/></svg>',
  rings: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="14" r="5.5"/><circle cx="15" cy="10" r="5.5"/></svg>',
  flag: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 21V4"/><path d="M6 4c4-2 8 2 12 0v9c-4 2-8-2-12 0"/></svg>',
  laurel: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-6.5-4.2-8.7-8C1.8 9.3 3.3 6 6.4 6c1.8 0 3 1 4 2.3L12 10l1.6-1.7C14.6 7 15.8 6 17.6 6c3.1 0 4.6 3.3 3.1 6-2.2 3.8-8.7 8-8.7 8z"/></svg>',
  note: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 18V6l10-2v11"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="16.5" cy="15" r="2.5"/></svg>'
};

var HEART_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7.5-4.9-10-9.3C.3 8.6 2 5 5.5 5c2 0 3.4 1.1 4.2 2.3L12 10l2.3-2.7C15.1 6.1 16.5 5 18.5 5 22 5 23.7 8.6 22 11.7 19.5 16.1 12 21 12 21z"/></svg>';

/* =========================================================================
   2. STATE
   ========================================================================= */

var state = {
  screen: 'welcome',        // welcome | occasion | question | contact | review | done
  occasion: null,           // key into OCCASIONS
  idx: 0,                   // current question index
  answers: {},              // question id -> text
  contact: { name: '', email: '', heard: '' },
  editingFromReview: false, // true while revisiting a single question from review
  sendError: false
};

function saveState() {
  if (state.screen === 'done') { clearState(); return; }
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
      screen: state.screen,
      occasion: state.occasion,
      idx: state.idx,
      answers: state.answers,
      contact: state.contact
    }));
  } catch (e) { /* storage unavailable (private mode) — in-memory copy still works */ }
}

function loadState() {
  try {
    var raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    var saved = JSON.parse(raw);
    if (!saved || !OCCASIONS[saved.occasion]) {
      if (saved && saved.screen && saved.screen !== 'welcome') state.screen = 'occasion';
      return;
    }
    state.occasion = saved.occasion;
    state.answers = saved.answers || {};
    state.contact = saved.contact || state.contact;
    state.idx = Math.min(saved.idx || 0, OCCASIONS[saved.occasion].questions.length - 1);
    state.screen = (saved.screen === 'done') ? 'welcome' : (saved.screen || 'welcome');
  } catch (e) { /* start fresh */ }
}

function clearState() {
  try { sessionStorage.removeItem(STORAGE_KEY); } catch (e) { /* fine */ }
}

/* =========================================================================
   3. RENDERING
   ========================================================================= */

var appEl = document.getElementById('app');

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function render() {
  saveState();
  var html = '';
  switch (state.screen) {
    case 'welcome':  html = renderWelcome(); break;
    case 'occasion': html = renderOccasion(); break;
    case 'question': html = renderQuestion(); break;
    case 'contact':  html = renderContact(); break;
    case 'review':   html = renderReview(); break;
    case 'done':     html = renderDone(); break;
  }
  appEl.innerHTML = '<div class="screen">' + html + '</div>';
  bindScreen();
  window.scrollTo(0, 0);
}

/* --- Welcome --- */

function renderWelcome() {
  return '' +
    '<div class="welcome">' +
    '<h1>Every song starts with a story.<br>Tell us yours.</h1>' +
    '<p>No forms to fight with — just a few gentle questions, one at a time, ' +
    'asked the way a friend would ask them. Your answers go directly to Tim, who writes ' +
    'every Heartstrings song personally in Lumberport, West Virginia. Take all the time ' +
    'you need. Nothing you share here is too small, and you can’t do this wrong.</p>' +
    '<span class="offer-note">Written by hand · One story at a time</span>' +
    '<button class="btn" data-action="begin">Share your story</button>' +
    '</div>';
}

/* --- Occasion picker --- */

function renderOccasion() {
  var cards = OCCASION_ORDER.map(function (key) {
    var o = OCCASIONS[key];
    return '<li><button class="card" data-occasion="' + key + '">' +
      ICONS[o.icon] +
      '<span><strong>' + esc(o.label) + '</strong><span>' + esc(o.desc) + '</span></span>' +
      '</button></li>';
  }).join('');
  return '' +
    '<h1>What brings you here today?</h1>' +
    '<p class="soft">Whatever it is, you’re in the right place. This just helps us ask the ' +
    'right questions, in the right spirit.</p>' +
    '<ul class="cards">' + cards + '</ul>' +
    '<div class="nav-row"><button class="link-btn" data-action="back-welcome">back</button></div>';
}

/* --- Question screens --- */

function dotsHtml() {
  var total = OCCASIONS[state.occasion].questions.length + 1; // + contact screen
  var current = (state.screen === 'contact') ? total - 1 : state.idx;
  var out = '<div class="dots" aria-hidden="true">';
  for (var i = 0; i < total; i++) {
    out += '<span class="dot' + (i < current ? ' done' : i === current ? ' current' : '') + '"></span>';
  }
  return out + '</div><p class="progress-copy">Step ' + (current + 1) + ' of ' + total + '</p>';
}

function renderQuestion() {
  var q = OCCASIONS[state.occasion].questions[state.idx];
  var answer = state.answers[q.id] || '';
  var heart = q.heart
    ? '<p class="favorite-flag">' + HEART_SVG + ' a favorite question</p>'
    : '';
  var skip = q.essential
    ? ''
    : '<button class="link-btn" data-action="skip">skip this one</button>';
  return '' +
    dotsHtml() +
    heart +
    '<h2 id="question-heading">' + esc(q.q) + '</h2>' +
    (q.sub ? '<p class="sub-prompt">' + esc(q.sub) + '</p>' : '') +
    '<textarea id="answer" aria-labelledby="question-heading">' + esc(answer) + '</textarea>' +
    '<p class="field-note" id="note" hidden></p>' +
    '<div class="nav-row">' +
    '<button class="btn-quiet" data-action="back">Back</button>' +
    '<span class="spacer"></span>' + skip +
    '<button class="btn" data-action="next">Next</button>' +
    '</div>';
}

/* --- Contact --- */

function renderContact() {
  // Gently prefill the name from the "who is it from" answer, if it's short
  // enough to plausibly be a name.
  if (!state.contact.name) {
    var from = (state.answers['from'] || '')
      .replace(/^\s*(from|this is|it's|its)\s+/i, '')
      .replace(/^\s*me[,\s—-]+/i, '')
      .split(/[,\n(—]/)[0].trim();
    if (from && from.length <= 40) state.contact.name = from;
  }
  return '' +
    dotsHtml() +
    '<h2 id="question-heading">One last thing — where can we reach you?</h2>' +
    '<p class="sub-prompt">Just so we can send word once your story is safely with us.</p>' +
    '<label for="c-name">Your name</label>' +
    '<input type="text" id="c-name" autocomplete="name" value="' + esc(state.contact.name) + '">' +
    '<label for="c-email">Email</label>' +
    '<input type="email" id="c-email" autocomplete="email" required value="' + esc(state.contact.email) + '">' +
    '<label for="c-heard">How did you hear about us? <span class="optional">(optional)</span></label>' +
    '<input type="text" id="c-heard" value="' + esc(state.contact.heard) + '">' +
    '<p class="field-note" id="note" hidden></p>' +
    '<div class="nav-row">' +
    '<button class="btn-quiet" data-action="back">Back</button>' +
    '<span class="spacer"></span>' +
    '<button class="btn" data-action="next">Next</button>' +
    '</div>';
}

/* --- Review --- */

function displayLabel(label) {
  var lower = label.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

function renderReview() {
  var occ = OCCASIONS[state.occasion];
  var sections = '';
  occ.questions.forEach(function (q, i) {
    var answer = (state.answers[q.id] || '').trim();
    sections += '<section class="review-section">' +
      '<h3>' + esc(displayLabel(q.label)) +
      '<button class="link-btn" data-edit="' + i + '">edit</button></h3>' +
      '<p>' + (answer ? esc(answer) : '<em>(skipped)</em>') + '</p>' +
      '</section>';
  });
  sections += '<section class="review-section">' +
    '<h3>Where to reach you' +
    '<button class="link-btn" data-edit="contact">edit</button></h3>' +
    '<p>' + esc(state.contact.name || '—') + ' · ' + esc(state.contact.email) +
    (state.contact.heard ? '\nHeard about us: ' + esc(state.contact.heard) : '') + '</p>' +
    '</section>';

  var nextStep = 'There’s nothing to pay and nothing to decide here. Once we’ve read your story, we’ll reach out personally with the next steps and answer anything you’d like to ask.';

  var errorBox = state.sendError
    ? '<div class="error-box" role="alert">' +
      '<p>The message didn’t go through just now — but every word you wrote is safe right here. ' +
      'Please try again in a moment, or copy your story to keep it close.</p>' +
      '<button class="btn-quiet" data-action="copy">Copy my story</button>' +
      '</div>'
    : '';

  return '' +
    '<h2>Here’s your story, just as you told it.</h2>' +
    '<p class="soft">Read it over if you like — or don’t. It’s already enough, ' +
    'exactly the way you said it.</p>' +
    sections +
    errorBox +
    '<p class="presend">' + esc(occ.presend) + '</p>' +
    '<p class="next-step">' + esc(nextStep) + '</p>' +
    '<p class="privacy-brief">Your story is sent securely to Heartstrings Studio through Formspree and is used only to create and discuss your custom song.</p>' +
    '<div class="nav-row">' +
    '<button class="btn-quiet" data-action="back">Back</button>' +
    '<span class="spacer"></span>' +
    '<button class="btn" data-action="send" id="send-btn">Send my story</button>' +
    '</div>';
}

/* --- Confirmation --- */

function renderDone() {
  var occ = OCCASIONS[state.occasion];
  return '' +
    '<div class="done-screen">' +
    '<svg class="heart-mark" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7.5-4.9-10-9.3C.3 8.6 2 5 5.5 5c2 0 3.4 1.1 4.2 2.3L12 10l2.3-2.7C15.1 6.1 16.5 5 18.5 5 22 5 23.7 8.6 22 11.7 19.5 16.1 12 21 12 21z"/></svg>' +
    '<h1>' + esc(occ.doneTitle) + '</h1>' +
    '<p class="soft">' + esc(occ.doneBody) + '</p>' +
    '<p class="soft">Watch for a note from <strong>heartstringsstudiowv@gmail.com</strong> — ' +
    'it’ll come from a real person, not a robot.</p>' +
    '<p><a href="https://heartstringsstudio.github.io/heartstringsstudio/">Back to Heartstrings Studio</a></p>' +
    '</div>';
}

/* --- Event binding ------------------------------------------------------- */

function bindScreen() {
  var screen = appEl.querySelector('.screen');
  if (!screen) return;

  screen.addEventListener('click', function (e) {
    var btn = e.target.closest('button');
    if (!btn) return;

    if (btn.dataset.occasion) { chooseOccasion(btn.dataset.occasion); return; }
    if (btn.dataset.edit !== undefined) { editFromReview(btn.dataset.edit); return; }

    switch (btn.dataset.action) {
      case 'begin':        state.screen = 'occasion'; render(); break;
      case 'back-welcome': state.screen = 'welcome'; render(); break;
      case 'back':         goBack(); break;
      case 'next':         goNext(); break;
      case 'skip':         goSkip(); break;
      case 'send':         send(); break;
      case 'copy':         copyStory(btn); break;
    }
  });

  // Keep answers mirrored to sessionStorage as they type.
  var ta = screen.querySelector('#answer');
  if (ta) {
    ta.addEventListener('input', function () {
      var q = OCCASIONS[state.occasion].questions[state.idx];
      state.answers[q.id] = ta.value;
      saveState();
    });
    ta.focus();
  }

  if (state.screen === 'contact') {
    ['c-name', 'c-email', 'c-heard'].forEach(function (id) {
      var input = screen.querySelector('#' + id);
      if (!input) return;
      input.addEventListener('input', function () {
        state.contact = readContact(screen);
        saveState();
      });
      // Enter never submits — these are stories, not fields.
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') e.preventDefault();
      });
    });
    var first = screen.querySelector('#c-name');
    if (first) first.focus();
  }

  if (state.screen === 'review' || state.screen === 'done' ||
      state.screen === 'occasion' || state.screen === 'welcome') {
    var h = screen.querySelector('h1, h2');
    if (h) { h.setAttribute('tabindex', '-1'); h.focus(); }
  }
}

function readContact(scope) {
  return {
    name: (scope.querySelector('#c-name') || {}).value || '',
    email: (scope.querySelector('#c-email') || {}).value || '',
    heard: (scope.querySelector('#c-heard') || {}).value || ''
  };
}

function showNote(text) {
  var note = appEl.querySelector('#note');
  if (note) { note.textContent = text; note.hidden = false; }
}

/* --- Navigation ----------------------------------------------------------- */

function chooseOccasion(key) {
  if (state.occasion && state.occasion !== key) {
    // A new path means new questions — start its answers fresh.
    state.answers = {};
  }
  state.occasion = key;
  state.screen = 'question';
  state.idx = 0;
  render();
}

function goBack() {
  if (state.editingFromReview) {
    state.editingFromReview = false;
    state.screen = 'review';
  } else if (state.screen === 'contact') {
    state.screen = 'question';
    state.idx = OCCASIONS[state.occasion].questions.length - 1;
  } else if (state.screen === 'review') {
    state.screen = 'contact';
  } else if (state.idx === 0) {
    state.screen = 'occasion';
  } else {
    state.idx--;
  }
  render();
}

function goNext() {
  if (state.screen === 'contact') {
    state.contact = readContact(appEl);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.contact.email.trim())) {
      showNote('We just need a working email so your song can find its way back to you.');
      var em = appEl.querySelector('#c-email');
      if (em) em.focus();
      return;
    }
    state.contact.email = state.contact.email.trim();
    state.editingFromReview = false;
    state.screen = 'review';
    render();
    return;
  }

  var q = OCCASIONS[state.occasion].questions[state.idx];
  if (q.essential && !(state.answers[q.id] || '').trim()) {
    showNote('Even just a name is plenty — we’d love at least that much here.');
    return;
  }
  advance();
}

function goSkip() {
  advance();
}

function advance() {
  if (state.editingFromReview) {
    state.editingFromReview = false;
    state.screen = 'review';
  } else if (state.idx >= OCCASIONS[state.occasion].questions.length - 1) {
    state.screen = 'contact';
  } else {
    state.idx++;
  }
  render();
}

function editFromReview(target) {
  state.editingFromReview = true;
  if (target === 'contact') {
    state.screen = 'contact';
  } else {
    state.screen = 'question';
    state.idx = parseInt(target, 10);
  }
  render();
}

/* =========================================================================
   4. SUBMIT
   ========================================================================= */

function compileIntake() {
  var occ = OCCASIONS[state.occasion];
  var eventAnswer = '';
  var skipped = [];
  var lines = [];

  occ.questions.forEach(function (q) {
    var a = (state.answers[q.id] || '').trim();
    if (q.isEvent && a) eventAnswer = a;
    if (!a && !q.essential && q.id !== 'anything') skipped.push(displayLabel(q.label));
  });

  lines.push('STORY ROOM INTAKE — ' + occ.label);
  lines.push('Client: ' + (state.contact.name.trim() || '—') + ' · ' + state.contact.email);
  lines.push('Event/date: ' + (eventAnswer || 'none given'));
  lines.push('');

  occ.questions.forEach(function (q) {
    if (q.id === 'anything') return; // saved for the end
    var a = (state.answers[q.id] || '').trim();
    lines.push(q.label);
    lines.push(a || '—');
    lines.push('');
  });

  lines.push('ANYTHING ELSE');
  lines.push((state.answers['anything'] || '').trim() || '—');
  lines.push('');
  lines.push('SKIPPED QUESTIONS');
  lines.push(skipped.length ? skipped.join(', ') : 'none');

  return { text: lines.join('\n'), eventAnswer: eventAnswer };
}

function send() {
  var btn = appEl.querySelector('#send-btn');
  if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }

  var occ = OCCASIONS[state.occasion];
  var intake = compileIntake();

  fetch(FORM_ENDPOINT, {
    method: 'POST',
    headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({
      occasion: occ.label,
      client_name: state.contact.name.trim(),
      client_email: state.contact.email,
      event_date: intake.eventAnswer || 'none given',
      heard_about: state.contact.heard.trim(),
      story_intake: intake.text,
      _subject: 'Story Room — ' + occ.label + ' — ' + (state.contact.name.trim() || 'no name given')
    })
  }).then(function (res) {
    if (!res.ok) throw new Error('send failed');
    state.sendError = false;
    state.screen = 'done';
    clearState(); // their story arrived; nothing sensitive left behind
    /* The one conversion event this page has — the story actually arriving. */
    if (typeof gtag === 'function') {
      gtag('event', 'story_sent', {
        event_category: 'conversion',
        occasion: occ.label
      });
    }
    render();
  }).catch(function () {
    state.sendError = true;
    render(); // answers are untouched; review screen shows the retry + copy box
  });
}

function copyStory(btn) {
  var text = compileIntake().text;
  var done = function () {
    btn.textContent = 'Copied — it’s safe on your clipboard';
    setTimeout(function () { btn.textContent = 'Copy my story'; }, 3500);
  };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(done, function () { legacyCopy(text); done(); });
  } else {
    legacyCopy(text);
    done();
  }
}

function legacyCopy(text) {
  var ta = document.createElement('textarea');
  ta.value = text;
  ta.setAttribute('readonly', '');
  ta.style.position = 'absolute';
  ta.style.left = '-9999px';
  document.body.appendChild(ta);
  ta.select();
  try { document.execCommand('copy'); } catch (e) { /* best effort */ }
  document.body.removeChild(ta);
}

/* =========================================================================
   Boot
   ========================================================================= */

function applyOccasionFromUrl() {
  if (state.screen !== 'welcome' && state.screen !== 'occasion') return;
  var raw;
  try { raw = new URLSearchParams(window.location.search).get('occasion'); }
  catch (e) { return; }
  if (!raw) return;

  var key = raw.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  var map = {
    'wedding': 'wedding',
    'anniversary': 'wedding',
    'memorial': 'memorial',
    'memorial tribute': 'memorial',
    'celebration of life': 'celebration',
    'birthday': 'milestone',
    'retirement': 'milestone',
    'graduation': 'milestone',
    'military tribute': 'tribute',
    'gratitude thank you': 'tribute',
    'just because': 'justbecause'
  };
  if (!map[key]) return;
  state.occasion = map[key];
  state.idx = 0;
  state.screen = 'question';
}

loadState();
applyOccasionFromUrl();
render();
