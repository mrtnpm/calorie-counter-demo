module.exports = (app, request, testSession) => {
  function login(username, password, done, cb) {
    testSession
      .post('/api/login')
      .send({ username, password })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        cb(res);
      });
  }

  function logout(cb) {
    testSession
      .get('/api/logout')
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        cb(res);
      });
  }

  function unauthWithoutLogin(method, url) {
    return (done) => {
      request(app)[method.toLowerCase()](url instanceof Function ? url() : url)
        .expect(401, 'Unauthorized')
        .end(done);
    };
  }

  function unauthWithLogin(username, password, method, url) {
    return (done) => {
      login(username, password, done, () => {
        testSession[method.toLowerCase()](url instanceof Function ? url() : url)
          .expect(401, 'Unauthorized')
          .end(done);
      });
    };
  }

  return {
    login,
    logout,
    unauthWithoutLogin,
    unauthWithLogin
  };
};
