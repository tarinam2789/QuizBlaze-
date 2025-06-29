app.get('/api/leaderboard', async (req, res) => {
  try {
    const dbScores = await Score.find().sort({ score: -1, date: -1 }).limit(10);
    if (dbScores.length > 0) {
      return res.json(dbScores);
    }

    const scoresPath = path.join(__dirname, 'scores.json');
    const fileData = fs.readFileSync(scoresPath, 'utf-8');
    const jsonScores = JSON.parse(fileData)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
    res.json(jsonScores);
  } catch (err) {
    res.status(500).json({ error: 'Could not load leaderboard' });
  }
});
