const app = require('../../../server');
const ROLES = require('../../../server/models/roles');
const assert = require('assert');
const request = require('supertest');
const mongoose = require('mongoose');
const session = require('supertest-session');
const testSession = session(app);
const test = require('../utilities/test')(app, request, testSession);

describe('API: users', () => {
  var admin;
  var user;
  var manager;

  // create admin/user/manager
  beforeEach((done) => {
    Promise.all([
      new mongoose.models.User({
        username: 'administrator',
        password: 'password',
        expectedDailyCalories: 0,
        role: ROLES.ENTITY_ROLE_ADMIN
      }).save(),
      new mongoose.models.User({
        username: 'user',
        password: 'password',
        expectedDailyCalories: 0,
        role: ROLES.ENTITY_ROLE_USER
      }).save(),
      new mongoose.models.User({
        username: 'manager',
        password: 'password',
        expectedDailyCalories: 0,
        role: ROLES.ENTITY_ROLE_MANAGER
      }).save()
    ]).then((values) => {
      admin = values[0];
      user = values[1];
      manager = values[2];
      done();
    });
  });

  // clear mongo
  afterEach((done) => {
    testSession.reset();
    mongoose.models.User.remove({}, (err) => {
      if (err) return done(err);
      done();
    });
  });


  describe('POST /register', () => {
    it('should not succeed when logged in', (done) => {
      test.login('administrator', 'password', done, () => {
        const data = { username: 'administrator', password: 'password' };
        testSession.post('/api/register').send(data).expect(400).end((err) => {
          if (err) return done(err);
          done();
        });
      });
    });

    it('should be able to register after logging in and then logout', (done) => {
      test.login('administrator', 'password', done, () => {
        testSession.get('/api/logout').expect(200).end((err) => {
          if (err) return done(err);
          const data = { username: 'test_user_a', password: 'password', expectedDailyCalories: 0 };
          testSession.post('/api/register').send(data).expect(200).end((err) => {
            if (err) return done(err);

            mongoose.models.User.find({ username: 'test_user_a' }).exec((err, data) => {
              assert.equal(data.length, 1);
              const user = data[0];
              assert.equal(user.username, 'test_user_a');
              assert.equal(user.expectedDailyCalories, 0);
              done();
            });
          });
        });
      });
    });

    it('should be able to register', (done) => {
      const data = { username: 'test_user_b', password: 'password', expectedDailyCalories: 10 };
      testSession.post('/api/register').send(data).expect(200).end((err, res) => {
        if (err) return done(err);
        assert.equal(res.body.username, 'test_user_b');
        assert.equal(res.body.expectedDailyCalories, 10);
        done();
      });
    });
  });
  describe('PUT /api/me', () => {
    it('should 401 without login', test.unauthWithoutLogin('PUT', '/api/me'));
    it('should update user', (done) => {
      test.login('user', 'password', done, () => {
        testSession.put('/api/me').send({ expectedDailyCalories: 100 }).expect(200).end((err) => {
          if (err) return done(err);
          test.logout(() => {
            test.login('user', 'password', done, (res) => {
              assert(res.body.expectedDailyCalories, 100);
              done();
            });
          });
        });
      });
    });
  });
  describe('POST /users', () => {
    it('should 401 without login', test.unauthWithoutLogin('POST', '/api/users'));
    it('should 401 for regular users', test.unauthWithLogin('user', 'password', 'POST', '/api/users'));
    it('should create a user', (done) => {
      test.login('administrator', 'password', done, () => {
        testSession.post('/api/users').send({
          username: 'test_user_c',
          password: 'password',
          expectedDailyCalories: 10,
          role: ROLES.ENTITY_ROLE_MANAGER
        }).expect(200).end((err) => {
          if (err) return done(err);

          mongoose.models.User.find({ username: 'test_user_c' }).exec((err, data) => {
            if (err) return done(err);

            assert.equal(data.length, 1);
            const testUser = data[0];
            assert.equal(testUser.username, 'test_user_c');
            assert.equal(testUser.expectedDailyCalories, 10);
            assert.equal(testUser.role, ROLES.ENTITY_ROLE_MANAGER);
            done();
          });
        });
      });
    });
    it('should not allow a manager to create an admin', (done) => {
      test.login('manager', 'password', done, () => {
        const data = {
          username: 'test_user_c',
          password: 'password',
          expectedDailyCalories: 10,
          role: ROLES.ENTITY_ROLE_ADMIN
        };
        testSession.post('/api/users').send(data).expect(401, 'Unauthorized').end((err) => {
          if (err) return done(err);
          done();
        });
      });
    });
  });
  describe('GET /users', () => {
    it('should 401 without login', test.unauthWithoutLogin('GET', '/api/users'));
    it('should 401 for regular users', test.unauthWithLogin('user', 'password', 'GET', '/api/users'));

    it('should get a list of manageable users', (done) => {
      test.login('administrator', 'password', done, () => {
        testSession.get('/api/users?limit=10&page=1').expect(200).end((err, res) => {
          if (err) return done(err);
          // make sure we get all the setup users
          assert(res.body.docs.length, 3);
          done();
        });
      });
    });
    it('should paginate based on limit/offset/page', (done) => {
      test.login('administrator', 'password', done, () => {
        testSession.get('/api/users?limit=1&offset=1&page=2').expect(200).end((err, res) => {
          if (err) return done(err);
          // limit to 1
          assert(res.body.docs.length, 1);
          // third user, since offset is 1
          assert(res.body.docs[0].username, 'manager');
          done();
        });
      });
    });
  });
  describe('PUT /users', () => {
    const getManagerUrl = () => `/api/users/${manager.id}`;
    const getAdminrUrl = () => `/api/users/${admin.id}`;
    const getUserUrl = () => `/api/users/${user.id}`;
    it('should 401 without login', test.unauthWithoutLogin('PUT', getManagerUrl));
    it('should 401 for regular users', test.unauthWithLogin('user', 'password', 'PUT', getManagerUrl));
    it('should update a user as an administrator', (done) => {
      test.login('administrator', 'password', done, () => {
        const data = { expectedDailyCalories: 15, role: ROLES.ENTITY_ROLE_USER };
        testSession.put(getManagerUrl()).send(data).expect(200).end((err) => {
          if (err) return done(err);
          mongoose.models.User.find({ username: manager.username }).exec((err, users) => {
            if (err) return done(err);

            assert.equal(users.length, 1);
            const updatedUser = users[0];
            assert.equal(updatedUser.expectedDailyCalories, 15);
            assert.equal(updatedUser.role, ROLES.ENTITY_ROLE_USER);
            done();
          });
        });
      });
    });

    it('should update a user as a manager', (done) => {
      test.login('manager', 'password', done, () => {
        testSession.put(getUserUrl()).expect(200).send({ expectedDailyCalories: 20 }).end((err) => {
          if (err) return done(err);

          mongoose.models.User.find({ username: user.username }).exec((err, data) => {
            if (err) return done(err);

            const user = data[0];
            assert.equal(user.expectedDailyCalories, 20);
            done();
          });
        });
      });
    });
    it('should not update a user when a manager raises its role', (done) => {
      test.login('manager', 'password', done, () => {
        testSession.put(getUserUrl()).expect(401).send({ role: ROLES.ENTITY_ROLE_MANAGER }).end((err) => {
          if (err) return done(err);

          mongoose.models.User.find({ username: user.username }).exec((err, data) => {
            if (err) return done(err);

            const user = data[0];
            assert.equal(user.role, ROLES.ENTITY_ROLE_USER);
            done();
          });
        });
      });
    });
    it('should not update when a manager attempts to update another manager', (done) => {
      test.login('manager', 'password', done, () => {
        const data = { expectedDailyCalories: 15, role: ROLES.ENTITY_ROLE_USER };
        testSession.put(getManagerUrl()).send(data).expect(304).end((err) => {
          if (err) return done(err);
          done();
        });
      });
    });
    it('should not update when a manager attempts to update an admin', (done) => {
      test.login('manager', 'password', done, () => {
        const data = { expectedDailyCalories: 15, role: ROLES.ENTITY_ROLE_USER };
        testSession.put(getAdminrUrl()).send(data).expect(304).end((err) => {
          if (err) return done(err);
          done();
        });
      });
    });
  });
  describe('DELETE /users', () => {
    const getUserUrl = () => `/api/users/${user.id}`;
    it('should 401 without login', test.unauthWithoutLogin('DELETE', getUserUrl));
    it('should 401 for regular users', test.unauthWithLogin('user', 'password', 'DELETE', getUserUrl));
    it('should delete a user', (done) => {
      test.login('administrator', 'password', done, () => {
        testSession.delete(getUserUrl()).expect(200).end((err) => {
          if (err) return done(err);
          mongoose.models.User.find({ username: user.username }).exec((err, data) => {
            if (err) return done(err);

            assert.equal(data.length, 0);
            done();
          });
        });
      });
    });
  });
});
