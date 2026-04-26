window.DUTCH_QUIZ_DATA = [
  {
    "category": "Verb Conjugation",
    "id": "verbs",
    "icon": "auto_fix_high",
    "description": "Practice present tense endings for regular and irregular verbs.",
    "questions": [
      {
        "question": "What is the correct conjugation: Ik ___ (hebben) een appel.",
        "options": ["heb", "hebt", "heeft", "hebben"],
        "correct": 0,
        "explanation": "For 'ik', you use the stem of the verb. Stem of hebben is 'heb'."
      },
      {
        "question": "What is the correct conjugation: Jij ___ (lopen) naar huis.",
        "options": ["loop", "loopt", "lopen", "liep"],
        "correct": 1,
        "explanation": "For 'jij/je', you add -t to the stem (loop + t = loopt)."
      },
      {
        "question": "What is the correct conjugation: Wij ___ (werken) vandaag.",
        "options": ["werk", "werkt", "werken", "gewerkt"],
        "correct": 2,
        "explanation": "For plural subjects (wij, jullie, zij), you use the infinitive form."
      },
      {
        "question": "Which is correct for the modal verb 'kunnen' (can): Hij ___ goed zwemmen.",
        "options": ["kan", "kant", "kunnen", "gekund"],
        "correct": 0,
        "explanation": "Modal verbs often have irregular 'hij' forms. 'Hij kan' is the correct form."
      },
      {
        "question": "What is the stem of the verb 'reizen' (to travel)?",
        "options": ["reize", "reiz", "reis", "reist"],
        "correct": 2,
        "explanation": "To get the stem, remove -en. If it ends in -zen, the z becomes s. (reizen -> reiz -> reis)."
      }
    ]
  },
  {
    "category": "Articles (De & Het)",
    "id": "articles",
    "icon": "category",
    "description": "Test your intuition on Dutch noun genders.",
    "questions": [
      {
        "question": "Which article is used for 'meisje' (girl)?",
        "options": ["de", "het"],
        "correct": 1,
        "explanation": "Diminutives (words ending in -je) always take 'het'."
      },
      {
        "question": "Which article is used for 'auto' (car)?",
        "options": ["de", "het"],
        "correct": 0,
        "explanation": "'Auto' is a common noun that takes 'de'."
      },
      {
        "question": "Which article is used for 'boeken' (books)?",
        "options": ["de", "het"],
        "correct": 0,
        "explanation": "All plural nouns in Dutch take 'de', regardless of their singular article."
      },
      {
        "question": "Which article is used for 'vrijheid' (freedom)?",
        "options": ["de", "het"],
        "correct": 0,
        "explanation": "Nouns ending in -heid are always 'de' words."
      },
      {
        "question": "Which article is used for 'water'?",
        "options": ["de", "het"],
        "correct": 1,
        "explanation": "'Water' is a neuter noun and takes 'het'."
      }
    ]
  },
  {
    "category": "Word Order (V2 Rule)",
    "id": "word_order",
    "icon": "low_priority",
    "description": "Master the position of verbs in Dutch sentences.",
    "questions": [
      {
        "question": "In a standard main clause, which position does the finite verb take?",
        "options": ["First", "Second", "Last", "Anywhere"],
        "correct": 1,
        "explanation": "Dutch follows the V2 rule: the conjugated verb must be the second element in a main clause."
      },
      {
        "question": "Which sentence is correct?",
        "options": [
          "Morgen ik ga naar Amsterdam.",
          "Morgen ga ik naar Amsterdam.",
          "Ik morgen ga naar Amsterdam.",
          "Ga ik morgen naar Amsterdam."
        ],
        "correct": 1,
        "explanation": "When a sentence starts with something other than the subject (like 'Morgen'), inversion occurs: the verb stays in 2nd position, and the subject follows it."
      },
      {
        "question": "Where does the 'niet' (not) go in: 'Ik begrijp het ___.'",
        "options": ["niet", "voor het", "na de ik", "is niet nodig"],
        "correct": 0,
        "explanation": "'Niet' usually comes after the finite verb and the direct object if it's a pronoun like 'het'."
      }
    ]
  }
];
