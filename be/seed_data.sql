-- Sample posts data
INSERT INTO posts (user_id, content, likes_count, created_at) VALUES
(1, 'Just finished my midterms! Time to relax 🎉', 15, NOW()),
(1, 'Looking for study partners for CS 310. Anyone interested?', 8, NOW()),
(1, 'The new library hours are amazing! Open till midnight now 📚', 23, NOW()),
(1, 'Does anyone know when registration opens for Spring semester?', 5, NOW()),
(1, 'Great game last night! Go Aztecs! 🏈', 42, NOW());

-- Sample messages data
INSERT INTO messages (sender_id, receiver_id, content, is_read, created_at) VALUES
(1, 1, 'Hey! Are you free to study tomorrow?', false, NOW()),
(1, 1, 'Thanks for the notes from last class!', true, NOW()),
(1, 1, 'Want to grab lunch at the Union?', false, NOW());