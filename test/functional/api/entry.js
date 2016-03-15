const app = require('../../../server');
const ROLES = require('../../../server/models/roles');
const assert = require('assert');
const request = require('supertest');
const mongoose = require('mongoose');
const session = require('supertest-session');
const testSession = session(app);
const test = require('../utilities/test')(app, request, testSession);

const User = mongoose.models.User;
const Entry = mongoose.models.Entry;
const moment = require('moment');

describe('API: entries', () => {
  var admin, adminEntry, user, userEntry, manager, managerEntry, userEntry2;

  // create admin/user/manager
  beforeEach((done) => {
    Promise.all([
      new User({
        username: 'administrator',
        password: 'password',
        expectedDailyCalories: 0,
        role: ROLES.ENTITY_ROLE_ADMIN
      }).save(),
      new User({
        username: 'user',
        password: 'password',
        expectedDailyCalories: 0,
        role: ROLES.ENTITY_ROLE_USER
      }).save(),
      new User({
        username: 'manager',
        password: 'password',
        expectedDailyCalories: 0,
        role: ROLES.ENTITY_ROLE_MANAGER
      }).save()
    ]).then((users) => {
      admin = users[0];
      user = users[1];
      manager = users[2];

      Promise.all([
        new Entry({
          title: 'admin entry',
          calories: 0,
          date: moment().format('YYYYMMDD'),
          time: 600,
          user: admin.id
        }).save(),
        new Entry({
          title: 'manager entry',
          calories: 0,
          date: moment().format('YYYYMMDD'),
          time: 600,
          user: manager.id
        }).save(),
        new Entry({
          title: 'user entry',
          calories: 6,
          date: moment().format('YYYYMMDD'),
          time: 601,
          user: user.id
        }).save(),
        new Entry({
          title: 'user entry 2',
          calories: 3,
          date: moment().format('YYYYMMDD'),
          time: 600,
          user: user.id
        }).save()
      ]).then((entries) => {
        adminEntry = entries[0];
        managerEntry = entries[1];
        userEntry = entries[2];
        userEntry2 = entries[3];

        done();
      });
    });
  });

  // clear mongo
  afterEach((done) => {
    testSession.reset();
    User.remove({}, (err) => Entry.remove({}, () => err ? done(err) : done()));
  });

  // user api
  describe('GET /dailyCaloricIntake', () => {
    it('should 401 without login', test.unauthWithoutLogin('GET', '/api/dailyCaloricIntake'));
    it('should return the daily calorie aggregate', (done) => {
      test.login('user', 'password', done, () => {
        const data = {
          title: 'user entry 3',
          calories: 5,
          date: moment().format('YYYYMMDD'),
          time: 600,
          user: user.id
        };
        new Entry(data).save((err) => {
          if (err) return done(err);
          testSession.get('/api/dailyCaloricIntake').expect(200).end((err, res) => {
            if (err) return done(err);
            assert.equal(res.body.total, 14);
            done();
          });
        });
      });
    });
    it('should not include other days', (done) => {
      test.login('user', 'password', done, () => {
        const date = moment().subtract(10, 'days').format('YYYYMMDD');
        const data = { title: 'user entry 3', calories: 15, date: date, time: 600, user: user.id };

        new Entry(data).save((err) => {
          if (err) return done(err);
          testSession.get('/api/dailyCaloricIntake').expect(200).end((err, res) => {
            assert.equal(res.body.total, 9);
            done();
          });
        });
      });
    });
  });

  describe('POST /entries', () => {
    it('should 401 without login', test.unauthWithoutLogin('POST', '/api/entries'));
    it('should create an entry for the current user and return the created entry', (done) => {
      test.login('user', 'password', done, () => {
        const data = { title: 'test', calories: 5, date: 123, time: 300 };
        testSession.post('/api/entries').send(data).expect(200).end((err, res) => {
          if (err) return done(err);
          assert.equal(res.body.date, 123);
          assert.equal(res.body.time, 300);
          assert.equal(res.body.calories, 5);
          assert.equal(res.body.user, user.id);
          assert.equal(res.body.title, 'test');
          done();
        });
      });
    });
  });
  describe('GET /entries', () => {
    it('should 401 without login', test.unauthWithoutLogin('GET', '/api/entries'));
    it('should retrieve the first page for the current user\'s posts', (done) => {
      test.login('user', 'password', done, () => {
        testSession.get('/api/entries?limit=1&page=1').expect(200).end((err, res) => {
          if (err) return done(err);
          // limit to 1
          assert.equal(res.body.total, 2);
          assert.equal(res.body.page, 1);
          assert.equal(res.body.docs.length, 1);
          // third user, since offset is 1
          assert.equal(res.body.docs[0].title, 'user entry');
          done();

        });
      });
    });
    it('should retrieve the second page for the current user\'s posts', (done) => {
      test.login('user', 'password', done, () => {
        testSession.get('/api/entries?limit=1&page=2').expect(200).end((err, res) => {
          if (err) return done(err);
          assert.equal(res.body.total, 2);
          assert.equal(res.body.page, 2);
          assert.equal(res.body.docs.length, 1);
          assert.equal(res.body.docs[0].title, 'user entry 2');
          done();

        });
      });
    });
  });
  describe('PUT /entries/:entryId', () => {
    it('should update a user\'s post', (done) => {
      test.login('user', 'password', done, () => {
        testSession.put(`/api/entries/${userEntry.id}`).send({ title: 'updated title' })
          .expect(200).end((err) => {
            if (err) return done(err);
            Entry.find({ user: user.id }).exec((err, data) => {
              if (err) return done(err);
              assert.equal(data[0].id, userEntry.id);
              assert.equal(data[0].user, userEntry.user);
              assert.equal(data[0].title, 'updated title');
              done();
            });
          });
      });
    });
    it('should not update another user\'s post', (done) => {
      test.login('user', 'password', done, () => {
        testSession.put(`/api/entries/${managerEntry.id}`).send({ title: 'updated title' })
          .expect(304).end((err) => err ? done(err) : done());
      });
    });
  });

  describe('DELETE /entries/:entryId', () => {
    const getUrl = () => `/api/entries/${userEntry.id}`;
    it('should 401 without login', test.unauthWithoutLogin('DELETE', getUrl));
    it('should delete a user\'s post', (done) => {
      test.login('user', 'password', done, () => {
        testSession.delete(getUrl()).send({ title: 'updated title' }).expect(200).end((err) => {
          if (err) return done(err);
          Entry.find({ user: user.id }).exec(function (err, data) {
            if (err) return done(err);
            assert.equal(data.length, 1);
            assert.equal(data[0].id, userEntry2.id);
            done();
          });
        });
      });
    });
    it('should not de;ete another user\'s post', (done) => {
      test.login('user', 'password', done, () => {
        testSession.put(`/api/entries/${managerEntry.id}`).send({ title: 'updated title' }).expect(304).end((err) => {
          if (err) return done(err);
          Entry.find({ user: manager.id }).exec((err, data) => {
            if (err) return done(err);

            assert.equal(data.length, 1);
            assert.equal(data[0].title, 'manager entry');
            done();
          });
        });
      });
    });
  });

  // admin api
  describe('POST /users/:userId/entries', () => {
    const getUrl = () => `/api/users/${user.id}/entries`;
    it('should 401 without login', test.unauthWithoutLogin('POST', '/api/entries'));
    it('should create an entry for the specified user and return the created entry', (done) => {
      test.login('administrator', 'password', done, () => {
        const data = { title: 'test', calories: 0, date: 20160301, time: 600, userId: user.id };
        testSession.post(getUrl()).send(data).expect(200).end((err, res) => {
          assert.equal(res.body.date, 20160301);
          assert.equal(res.body.time, 600);
          assert.equal(res.body.user, user.id);
          assert.equal(res.body.title, 'test');
          done();
        });
      });
    });
    it('should 401 for regular users', test.unauthWithLogin('user', 'password', 'GET', getUrl));
    it('should 401 for manager users', test.unauthWithLogin('manager', 'password', 'GET', getUrl));
  });
  describe('GET /users/:userId/entries', () => {
    const getUrl = () => `/api/users/${user.id}/entries`;
    it('should 401 without login', test.unauthWithoutLogin('POST', '/api/entries'));
    it('should 401 for regular users', test.unauthWithLogin('user', 'password', 'GET', getUrl));
    it('should 401 for manager users', test.unauthWithLogin('manager', 'password', 'GET', getUrl));
    it('should retrieve the first page for a user\'s posts', (done) => {
      test.login('administrator', 'password', done, () => {
        testSession.get(`${getUrl()}?limit=1&page=1`).expect(200).end((err, res) => {
          if (err) return done(err);
          // limit to 1
          assert.equal(res.body.total, 2);
          assert.equal(res.body.page, 1);
          assert.equal(res.body.docs.length, 1);
          // third user, since offset is 1
          assert.equal(res.body.docs[0].title, 'user entry');
          done();
        });
      });
    });
    it('should retrieve the second page for a user\'s posts', (done) => {
      test.login('administrator', 'password', done, () => {
        testSession.get(`${getUrl()}?limit=1&page=2`).expect(200).end((err, res) => {
          if (err) return done(err);
          assert.equal(res.body.total, 2);
          assert.equal(res.body.page, 2);
          assert.equal(res.body.docs.length, 1);
          assert.equal(res.body.docs[0].title, 'user entry 2');
          done();
        });
      });
    });
  });
  describe('PUT /users/:userId/entries/:entryId', () => {
    const getUrl = () => `/api/users/${user.id}/entries/${userEntry.id}`;
    it('should 401 without login', test.unauthWithoutLogin('PUT', getUrl));
    it('should 401 for regular users', test.unauthWithLogin('user', 'password', 'PUT', getUrl));
    it('should 401 for manager users', test.unauthWithLogin('manager', 'password', 'PUT', getUrl));

    it('should update a user\'s post without changing the user', (done) => {
      test.login('administrator', 'password', done, () => {
        testSession.put(getUrl()).send({ title: 'updated title' }).expect(200).end((err) => {
          if (err) return done(err);
          Entry.find({ user: user.id }).exec((err, data) => {
            if (err) return done(err);
            assert.equal(data[0].id, userEntry.id);
            assert.equal(data[0].user, userEntry.user);
            assert.equal(data[0].title, 'updated title');
            done();
          });
        });
      });
    });
  });
  describe('DELETE /users/:userId/entries/:entryId', () => {
    const getUrl = () => `/api/users/${user.id}/entries/${userEntry.id}`;
    it('should 401 without login', test.unauthWithoutLogin('DELETE', getUrl));
    const userRequest = test.unauthWithLogin('user', 'password', 'DELETE', getUrl);
    it('should 401 for regular users', userRequest);
    const managerRequest = test.unauthWithLogin('manager', 'password', 'DELETE', getUrl);
    it('should 401 for manager users', managerRequest);
    it('should delete a user\'s post', (done) => {
      test.login('administrator', 'password', done, () => {
        testSession.delete(getUrl()).send({ title: 'updated title' }).expect(200).end((err) => {
          if (err) return done(err);
          Entry.find({ user: user.id }).exec((err, data) => {
            if (err) return done(err);
            assert.equal(data.length, 1);
            assert.equal(data[0].id, userEntry2.id);
            done();
          });
        });
      });
    });
  });
});

