var superagent = require('superagent'),
    expect = require('chai').expect,
    url = "http://localhost:8080";


describe('Express server', function() {

    it('Should return an index html file', function(done) {
        superagent.get(url + '/')
            .end(function(err, res) {
                expect(err).to.be.null
                expect(res.status).to.eql(200)
                expect(res.body).to.be.ok
                done()
            })
    })

    it('Should not return a 404 error', function(done) {
        superagent.get(url + '/another/page')
            .end(function(err, res) {
                expect(err).to.be.null
                expect(res.status).to.not.eql(404)
                expect(res.body).to.be.ok
                done()
            })
    })

});