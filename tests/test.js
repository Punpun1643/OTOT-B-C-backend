const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app');
const { expect } = require('chai');

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

    // describe('POST a place', () => {
    //     let validUser = {
    //         email: "testing123@gmail.com",
    //         password: "testing123"
    //     }

    //     before((done) => {
    //         chai.request(app)
    //         .post('/api/users/login')
    //         .send(validUser, (err) => {
    //             done();
    //         })      
    //     });

        
    //     it('request to add a place with all valid inputs should be successful', (done) => {
    //         let validPlace = {
    //             title: "RVRC",
    //             description: "RVRC place",
    //             address: "25 Lower Kent Ridge Rd F636"
    //         }
    //         chai.request(app)
    //             .post('/api/places')
    //             .send(validPlace)
    //             .end((err, res) => {
    //                 res.should.have.status(200);
    //                 done();
    //             });
       
    // });

});

describe('users', () => {
    describe('login', () => {
        let validUser = {
            email: 'testing123@gmail.com',
            password: 'testing123'
        }

        it('invalid username and password should not login successfully', (done) => {

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