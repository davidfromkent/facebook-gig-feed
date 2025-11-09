import fetch from 'node-fetch';

export default async function handler(req, res) {
  try {
    const query = req.query.venue || 'Half Moon and Seven Stars';
    const apiKey = process.env.GOOGLE_API_KEY;
    const cx = process.env.GOOGLE_CSE_ID;

    const url = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(query)}+site:facebook.com&key=${apiKey}&cx=${cx}`;

    const response = await fetch(url);
    const data = await response.json();

    const results = (data.items || []).map(item => ({
      title: item.title,
      link: item.link,
      snippet: item.snippet,
    }));

    res.status(200).json({
      venue: query,
      count: results.length,
      results,
    });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Failed to fetch data', details: error.message });
  }
}
