import { PORT } from './config';
import app from './app';

app.listen(PORT, () => console.log(`Server ready on port ${PORT}.`));

export default app;
