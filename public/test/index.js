const chai = require('chai');
const chaiHttp = require('chai-http')
const {app, runServer, closeServer} = require('../server');
const {PORT, TEST_DATABASE_URL} = require('../config');

const expect = chai.expect;

chai.use(chaiHttp);

//describe is a part of chai and it basically starts off the test?
before(function() {
  return runServer(PORT, TEST_DATABASE_URL);
});

after(function() {
  return closeServer();
});

describe('rootUrl', function(){

  it('should get status 200', function(){
      return chai.request(app)
      .get('/')
      .then(function(res){
        expect(res).to.have.status(200);
        expect(res).to.be.json;
      })
    });

});

/////-------------------------////
describe('add words', function(){

  it('create a word item on POST', function(){
    return chai.request(app)
    .post('/expenses')
    .then(function(res){
      expect(res).to.have.status(400);
      expect(res.body).to.be.a('object');
      expect(res.body.id).to.not.equal(null);
    });
  });
});
//////---------------------------------/////


describe('Words', function(){

  describe('getWords', function(){

    it('should work', function(){
      return chai.request(app)
      .get('/myWords')
      .then(function(res){
        expect(res).to.have.status(200);
      })
    });

    it('GET should return list of words', function(){
      return chai.request(app)
      .get('/myWords')
      .then(function(res){
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        res.body.forEach(function(item){
        expect(item).to.be.a('object');
        expect(item).to.have.keys(
          'word', 'definition');
        });
      })
    });
  });

});

    describe('postNewWord', function(){

      it('should add word item on POST', function(){
        return chai.request(app)
        .post('/add-word')
        .then(function(res){
          expect(res).to.have.status(400);
          expect(res.body).to.be.a('object');
          expect(res.body.id).to.not.equal(null);
        });
      });
    });

    // describe('deleteEvents', function(){
    //   it('should delete word item on DELETE', function(){
    //     return chai.request(app)
    //     fetch(`http://localhost:8080/events`, {
    //       method: 'GET',
    //       headers: {'Content-Type': 'application/json'},
    //       body: JSON.stringify({ id: deletedEventID})
    //     })
    //     .then(function(response){
    //         post('/events')
    //         .then(function(res){

    //           return chai.request(app)
    //             .delete(`/events/:id/${response.body[0].id}`);
    //             console.log(res.body[0].id);
    //             console.log(res.body[0]._id);
    //         })
    //         .then(function(res){
    //           expect(res).to.have.status(204);
    //         });
    //     });
    //   });


    // });

 });
