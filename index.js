const app = require("express")()

app.use('/', require('./routes/index.js'));

const PORT = process.env.PORT || 7070;

app.listen(PORT, console.log(`Server started on port ${PORT} `));
