const app = require('./app');
var port = process.env.PORT || 8090;
app.listen(port, function() {
    console.log("App is running on port " + port);
});