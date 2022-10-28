const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../server');
const { expect } = require('chai');
var superagent = require('superagent');
var agent = superagent.agent();

chai.use(chaiHttp);
chai.should();

describe('places', () => {
    describe('GET an existing place', () => {
        it('request an existing place should return an existing place', (done) => {
            const id = '634bbeed893c301a1935a1bc';
            chai.request(app)
                .get(`/api/places/${id}`)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('place');
                    res.body['place'].should.all.have.nested.property('title');
                    res.body['place'].should.all.have.nested.property('description');
                    res.body['place'].should.all.have.nested.property('image');
                    res.body['place'].should.all.have.nested.property('address');
                    res.body['place'].should.all.have.nested.property('location');
                    res.body['place'].should.all.have.nested.property('creator');
                    done();
                });
                
        });

        it('request a non existing place should not return place and throw error', (done) => {
            const id = '6356a90105d6de707dce7e5f';
            chai.request(app)
                .get(`/api/places/${id}`)
                .end((err, res) => {
                    expect(res).to.have.status(404);
                    done();
                })
        });

        it('request to invalid path should throw 500', (done) => {
            const id = 'invalid';
            chai.request(app)
                .get(`/api/places/${id}`)
                .end((err, res) => {
                    expect(res).to.have.status(500);
                    done();
                })
        });
    });

    describe('GET a place without login', () => {
        it('attempt to get a place without loging in should throw 401 error', (done) => {
            const id = '634b9f95c9940527f9d4f9da';
            chai.request(app)
                .get(`/api/places/user/${id}`)
                .end((err, res) => {
                    expect(res).to.have.status(401);
                    done();
                });
        });
    });

    describe('PUT a place', () => {
        let validUser = {
            email: "testing123@gmail.com",
            password: "testing123"
        }

        let validNewPlace = {
            location: {lat:1.2943438,lng:103.7727616},
            title:"NUS",
            description:"NUS Computing", 
            address:"Computing Drive, National University Of Singapore, 119077",
            creator:"634ba089c9940527f9d4f9e9"
        }

        it('request to edit a valid place with a valid new place information should be successful', (done) => {
            chai.request(app)
                .post('/api/users/login')
                .send(validUser)
                .end((err, res) => {
                    res.body.should.have.property('token');
                    var token = res.body.token;
                    var id = '6356a90105d6de707dce7e5e';
                    chai.request(app)
                        .put(`/api/places/${id}`)
                        .send(validNewPlace)
                        .set('Authorization', 'Bearer ' + token)
                        .end((err, res) => {
                            res.should.have.status(200);
                            done();
                        });
                });
                
        });
       
    });

    describe('DELETE a place', () => {
        let validUser = {
            email: "testing123@gmail.com",
            password: "testing123"
        }

        it ('request to delete a valid place should be successful', () => {
            chai.request(app)
                .post('/api/users/login')
                .send(validUser)
                .end((err, res) => {
                    res.body.should.have.property('token');
                    var token = res.body.token;
                    var id = '6356a90105d6de707dce7e5e';
                    chai.request(app)
                        .delete(`/api/places/${id}`)
                        .set('Authorization', 'Bearer ' + token)
                        .end((err, res) => {
                            res.should.have.status(200);
                            done();
                        })
                });
        });
    });

});

describe('users', () => {
    describe('POST login', () => {
        let validUser = {
            email: 'testing123@gmail.com',
            password: 'testing123'
        }

        it('valid username and password should login successfully', (done) => {

            chai.request(app)
                .post('/api/users/login')
                .send(validUser)
                .end((err, res) => {
                    res.should.have.status(200);
                    done();
                });
        })
    });
});