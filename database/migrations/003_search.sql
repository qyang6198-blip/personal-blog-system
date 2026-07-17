 CREATE VIRTUAL TABLE IF NOT EXISTS articles_fts USING fts5(title, summary, content, article_id UNINDEXED);
