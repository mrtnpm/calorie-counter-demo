const app = require('../../../server');
const ROLES = require('../../../server/models/roles');
const assert = require('assert');
const request = require('supertest');
const mongoose = require('mongoose');
const session = require('supertest-session');
const testSession = session(app);
const test = require('../utilities/test')(app, request, testSession);
const User = mongoose.models.User;

describe('API: authentication', () => {
  // create admin/user/manager
  beforeEach((done) => {
    new User({
      username: 'administrator',
      password: 'password',
      expectedDailyCalories: 0,
      role: ROLES.ENTITY_ROLE_ADMIN
    }).save(() => {
      done();
    });
  });

  // clear mongo
  afterEach((done) => {
    testSession.reset();
    User.remove({}, (err) => {
      if (err) return done(err);
      done();
    });
  });

  describe('POST /login', () => {
    it('should return the user upon successful authentication', (done) => {
      test.login('administrator', 'password', done, (res) => {
        assert.equal(res.body.username, 'administrator');
        assert.equal(res.body.expectedDailyCalories, 0);
        assert.equal(res.body.role, ROLES.ENTITY_ROLE_ADMIN);
        done();
      });
    });

    it('should not include the password in the response', (done) => {
      test.login('administrator', 'password', done, (res) => {
        assert.equal(res.body.password, undefined);
        done();
      });
    });
  });

  describe('GET /logout', () => {
    it('should log the user out', (done) => {
      testSession
        .post('/api/login')
        .send({ username: 'administrator', password: 'password' })
        .end(() => {
          testSession
            .get('/api/logout')
            .expect(200, (err) => {
              if (err) return done(err);
              done();
            });
        });
    });
    it('should not be able to call an authenticated endpoint after logging out', (done) => {
      testSession
        .post('/api/login')
        .send({ username: 'administrator', password: 'password' })
        .end(() => {
          testSession
            .get('/api/logout')
            .expect(200, (err) => {
              if (err) return done(err);
              testSession.get('/api/users').expect(401).end(() => done());
            });
        });
    });

    it('should not include the password in the response', (done) => {
      request(app)
        .post('/api/login')
        .send({ username: 'administrator', password: 'password' })
        .expect('Content-Type', /json/)
        .expect(200, (err, res) => {
          assert.equal(res.body.password, undefined);
          done();
        });
    });
  });
});
