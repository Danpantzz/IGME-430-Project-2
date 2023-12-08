const controllers = require('./controllers');
const mid = require('./middleware');

const router = (app) => {
  //app.get('/getDomos', mid.requiresLogin, controllers.Main.getDomos);

  app.get('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
  app.post('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.login);

  app.post('/signup', mid.requiresSecure, mid.requiresLogout, controllers.Account.signup);

  app.get('/logout', mid.requiresLogin, controllers.Account.logout);

  app.post('/changePassword', mid.requiresLogin, controllers.Account.changePassword);

  app.get('/app', mid.requiresLogin, controllers.Main.appPage);
  //app.post('/maker', mid.requiresLogin, controllers.Main.makeDomo);

  app.get('/', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
};

module.exports = router;
