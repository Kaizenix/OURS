-- ============================================================
-- OURS — Seed Data: Daily Question Bank (100+ questions)
-- ============================================================

INSERT INTO question_bank (question, category) VALUES
-- Getting to Know You (10)
('What is one thing about you that most people would be surprised to learn?', 'getting_to_know'),
('If you could live anywhere in the world for a year, where would it be?', 'getting_to_know'),
('What is your earliest happy memory?', 'getting_to_know'),
('What song always makes you feel something?', 'getting_to_know'),
('What is a skill you have always wanted to learn?', 'getting_to_know'),
('What does your ideal Sunday look like?', 'getting_to_know'),
('What is the most spontaneous thing you have ever done?', 'getting_to_know'),
('If you could have dinner with anyone, living or dead, who would it be?', 'getting_to_know'),
('What is a book or movie that genuinely changed how you see the world?', 'getting_to_know'),
('What were you like as a teenager?', 'getting_to_know'),

-- Love (10)
('What makes you feel most loved by me?', 'love'),
('What is one small thing I do that means a lot to you?', 'love'),
('When did you first realize you were falling for me?', 'love'),
('What moment between us do you think about the most?', 'love'),
('How has your idea of love changed since we have been together?', 'love'),
('What is something I did recently that made you feel appreciated?', 'love'),
('In what ways do you feel we are different from when we first met?', 'love'),
('What is your favorite way to show me you care?', 'love'),
('What does love look like to you on an ordinary Tuesday?', 'love'),
('What is something about us that you never want to change?', 'love'),

-- Communication (10)
('Is there anything you have been wanting to tell me but have not found the right moment?', 'communication'),
('What is the best way to comfort you when you are upset?', 'communication'),
('How can I be a better listener for you?', 'communication'),
('Is there a topic we avoid that you think we should talk about?', 'communication'),
('When we disagree, what helps you feel heard?', 'communication'),
('Do you feel like you can always be honest with me? Why or why not?', 'communication'),
('What is one thing I could say more often?', 'communication'),
('How do you prefer to handle difficult conversations — in person, by text, or after some space?', 'communication'),
('Is there anything I do during arguments that makes things harder for you?', 'communication'),
('What makes you feel safe enough to be vulnerable with me?', 'communication'),

-- Future (10)
('What does a good future together look like to you?', 'future'),
('Where do you see us in five years?', 'future'),
('What is one thing you want us to accomplish together this year?', 'future'),
('What kind of home do you dream of living in?', 'future'),
('Do you have any fears about our future together?', 'future'),
('What is one experience you absolutely want us to share?', 'future'),
('How do you feel about how we handle money together?', 'future'),
('What does growing old together look like in your mind?', 'future'),
('Is there a tradition you want us to start?', 'future'),
('What is a conversation about our future we should have soon?', 'future'),

-- Memory (10)
('What memory of us do you revisit the most?', 'memory'),
('What is the funniest thing that has happened to us?', 'memory'),
('When was a time you felt truly proud of us?', 'memory'),
('What was the hardest moment we went through, and how do you feel about it now?', 'memory'),
('What is your favorite photo of us and why?', 'memory'),
('Do you remember our first real conversation? What stood out?', 'memory'),
('What is a small moment between us that you wish you could relive?', 'memory'),
('What trip or outing together has been your favorite so far?', 'memory'),
('Is there a gift I gave you that still means something special?', 'memory'),
('What is a moment where you felt completely at peace with me?', 'memory'),

-- Intimacy (10)
('What makes you feel closest to me?', 'intimacy'),
('What is something that always makes you feel connected to me?', 'intimacy'),
('How important is physical touch to you in our relationship?', 'intimacy'),
('What is something new you would like us to try together?', 'intimacy'),
('When do you feel most comfortable being yourself around me?', 'intimacy'),
('What does quality time mean to you?', 'intimacy'),
('Is there something you need more of from me right now?', 'intimacy'),
('What is the most intimate non-physical moment we have shared?', 'intimacy'),
('How do you recharge when you feel emotionally drained?', 'intimacy'),
('What small gesture from me makes your whole day better?', 'intimacy'),

-- Fun (10)
('If we had a whole weekend with no plans, what would you want to do?', 'fun'),
('What is a hobby you wish we could pick up together?', 'fun'),
('If we could teleport anywhere right now, where would we go?', 'fun'),
('What is the most ridiculous thing we have laughed about together?', 'fun'),
('If we starred in a movie, what genre would it be?', 'fun'),
('What food could you eat with me every single day?', 'fun'),
('If we had unlimited money for one day, what would we do?', 'fun'),
('What is a game or activity that always brings us closer?', 'fun'),
('What is something silly you love about me?', 'fun'),
('If we could learn one thing together — cooking, dancing, a language — what would it be?', 'fun'),

-- Values (10)
('What value do you think is most important in a relationship?', 'values'),
('What does loyalty mean to you?', 'values'),
('How do you define respect in a partnership?', 'values'),
('What is something you would never compromise on?', 'values'),
('What role does forgiveness play in how you approach our relationship?', 'values'),
('Do you think we share the same core values? Where do we differ?', 'values'),
('What does fairness look like in a relationship to you?', 'values'),
('How important is independence within a partnership to you?', 'values'),
('What is one principle you want us to always live by?', 'values'),
('How do you think we should handle disagreements about values?', 'values'),

-- Relationship (10)
('What is the strongest part of our relationship right now?', 'relationship'),
('What is one thing you wish we did more often?', 'relationship'),
('How do you feel about the balance of effort in our relationship?', 'relationship'),
('What have you learned about yourself through being with me?', 'relationship'),
('Is there anything about our relationship that worries you?', 'relationship'),
('What is one thing we have gotten better at as a couple?', 'relationship'),
('What does being a team mean to you in the context of us?', 'relationship'),
('How do you handle stress, and how can I support you during those times?', 'relationship'),
('What is something you admire about how we handle challenges?', 'relationship'),
('What keeps you committed to us?', 'relationship'),

-- Conflict (10)
('What is something we should talk about before it becomes a bigger issue?', 'conflict'),
('How do you feel after we have an argument? What helps you recover?', 'conflict'),
('Is there a recurring disagreement you wish we could resolve?', 'conflict'),
('What is your instinct when we are in conflict — fight, flight, or freeze?', 'conflict'),
('What do you need most from me after a difficult conversation?', 'conflict'),
('How can we argue more kindly?', 'conflict'),
('Is there something from the past that still bothers you?', 'conflict'),
('What is a boundary you need me to be more mindful of?', 'conflict'),
('Do you feel safe bringing up problems with me?', 'conflict'),
('What does repair after a conflict look like for you?', 'conflict'),

-- Goals (10)
('What is one personal goal you are working toward right now?', 'goals'),
('How can I better support your personal growth?', 'goals'),
('What is something you want to achieve together in the next year?', 'goals'),
('What does success look like to you — personally and as a couple?', 'goals'),
('Is there something you have been putting off that I could help with?', 'goals'),
('What is a dream you have not shared with many people?', 'goals'),
('How do you want to grow as a person this year?', 'goals'),
('What is one habit you want to build together?', 'goals'),
('Where do you want to be professionally in three years?', 'goals'),
('What is one thing we should start planning for now?', 'goals'),

-- Personal Growth (10)
('What is a lesson life has taught you recently?', 'personal_growth'),
('What part of yourself are you most proud of?', 'personal_growth'),
('What is something you are still working on improving about yourself?', 'personal_growth'),
('How has our relationship helped you grow?', 'personal_growth'),
('What is the best piece of advice you have ever received?', 'personal_growth'),
('What does self-care look like for you?', 'personal_growth'),
('What fear have you overcome that you are proud of?', 'personal_growth'),
('How do you want to be remembered?', 'personal_growth'),
('What is something you have forgiven yourself for?', 'personal_growth'),
('What does being at peace mean to you?', 'personal_growth');
