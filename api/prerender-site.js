module.exports = (req, res) => {
  const matches = parse(req.headers['x-now-route-matches']);
  const { slug } = matches;

  const body = [];
  res.setHeader('Content-Type', 'text/html; charset=utf-8');

  if (post) {
    body.push(`<h1>${slug}</h1>`);
  } else {
    res.statusCode = 404;
    body.push(`<strong>404:</strong> Sorry! No blog post exists with this name…`);
  }

  body.push(`<em>This page was rendered at: ${new Date()}</em>`);

  res.end(body.join('<br /><br />'));
};
