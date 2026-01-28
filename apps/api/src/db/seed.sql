-- Seed data for Demo Twitter
-- Password for all users is "password123" (hashed with SHA-256 for demo)
-- In production, use proper bcrypt hashing

-- Demo Users
INSERT INTO users (id, username, email, password_hash, display_name, bio, avatar_url) VALUES
  ('user_alice', 'alice', 'alice@demo.com', 'cGFzc3dvcmQxMjM=', 'Alice Johnson', 'Full-stack developer. Coffee enthusiast. Building cool things.', ''),
  ('user_bob', 'bob', 'bob@demo.com', 'cGFzc3dvcmQxMjM=', 'Bob Smith', 'Designer by day, coder by night. UI/UX passionate.', ''),
  ('user_carol', 'carol', 'carol@demo.com', 'cGFzc3dvcmQxMjM=', 'Carol Williams', 'Tech lead at startup. Love open source.', ''),
  ('user_dave', 'dave', 'dave@demo.com', 'cGFzc3dvcmQxMjM=', 'Dave Brown', 'DevOps engineer. Kubernetes fan. Cloud native.', ''),
  ('user_eve', 'eve', 'eve@demo.com', 'cGFzc3dvcmQxMjM=', 'Eve Davis', 'Product manager. Agile advocate. User-focused.', '');

-- Demo Tweets
INSERT INTO tweets (id, user_id, content, created_at) VALUES
  ('tweet_1', 'user_alice', 'Just deployed my first Cloudflare Worker! The edge is amazing. #serverless #cloudflare', datetime('now', '-2 hours')),
  ('tweet_2', 'user_bob', 'Working on a new design system. Tailwind CSS makes everything so much easier.', datetime('now', '-1 hours')),
  ('tweet_3', 'user_carol', 'Code review tip: Focus on the logic, not the style. Let the linter handle formatting.', datetime('now', '-45 minutes')),
  ('tweet_4', 'user_alice', 'TanStack Query + Zustand is the perfect combo for React state management. No more Redux boilerplate!', datetime('now', '-30 minutes')),
  ('tweet_5', 'user_dave', 'Kubernetes tip of the day: Always set resource limits on your pods. Your cluster will thank you.', datetime('now', '-20 minutes')),
  ('tweet_6', 'user_eve', 'User research is not optional. Talk to your users early and often.', datetime('now', '-15 minutes')),
  ('tweet_7', 'user_bob', 'New blog post: "Why I switched from Figma to designing in code" - link in bio', datetime('now', '-10 minutes')),
  ('tweet_8', 'user_carol', 'Open source maintainers deserve more recognition. Thank a maintainer today!', datetime('now', '-5 minutes')),
  ('tweet_9', 'user_alice', 'Building a Twitter clone to learn the oxc stack. Hono + React + D1 is chef''s kiss!', datetime('now', '-2 minutes')),
  ('tweet_10', 'user_dave', 'Hot take: YAML is fine. The problem is not the format, it''s the complexity of what we''re configuring.', datetime('now', '-1 minutes'));

-- Demo Follows (create a social graph)
INSERT INTO follows (id, follower_id, following_id) VALUES
  ('follow_1', 'user_alice', 'user_bob'),
  ('follow_2', 'user_alice', 'user_carol'),
  ('follow_3', 'user_bob', 'user_alice'),
  ('follow_4', 'user_bob', 'user_carol'),
  ('follow_5', 'user_carol', 'user_alice'),
  ('follow_6', 'user_carol', 'user_dave'),
  ('follow_7', 'user_dave', 'user_alice'),
  ('follow_8', 'user_dave', 'user_eve'),
  ('follow_9', 'user_eve', 'user_alice'),
  ('follow_10', 'user_eve', 'user_carol');

-- Demo Likes
INSERT INTO likes (id, user_id, tweet_id) VALUES
  ('like_1', 'user_bob', 'tweet_1'),
  ('like_2', 'user_carol', 'tweet_1'),
  ('like_3', 'user_alice', 'tweet_2'),
  ('like_4', 'user_dave', 'tweet_3'),
  ('like_5', 'user_eve', 'tweet_4'),
  ('like_6', 'user_alice', 'tweet_5'),
  ('like_7', 'user_bob', 'tweet_6'),
  ('like_8', 'user_carol', 'tweet_9'),
  ('like_9', 'user_dave', 'tweet_9'),
  ('like_10', 'user_eve', 'tweet_9');

-- Demo Retweets
INSERT INTO retweets (id, user_id, tweet_id) VALUES
  ('retweet_1', 'user_carol', 'tweet_1'),
  ('retweet_2', 'user_dave', 'tweet_4'),
  ('retweet_3', 'user_eve', 'tweet_8');
