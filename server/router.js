const controllers = require('./controllers');
const mid = require('./middleware');

const router = (app) => {
  //app.get('/getDomos', mid.requiresLogin, controllers.Main.getDomos);

  app.get('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
  app.post('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.login);

  app.post('/signup', mid.requiresSecure, mid.requiresLogout, controllers.Account.signup);

  app.get('/logout', mid.requiresLogin, controllers.Account.logout);

  app.post('/changePassword', mid.requiresLogin, controllers.Account.changePassword);

  app.get('/maker', mid.requiresLogin, controllers.Main.makerPage);
  //app.post('/maker', mid.requiresLogin, controllers.Main.makeDomo);

  app.get('/getUsername', mid.requiresLogin, controllers.Account.getUsername);

  app.get('/', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
};

module.exports = router;
