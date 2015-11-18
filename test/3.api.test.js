var superagent = require('superagent'),
    expect = require('chai').expect,
    url = "http://localhost:8080",
    apikey = 'dea589e9-d1e9-4e75-a865-e9b7d81014ff'; // khocef api key


describe('API', function() {

    describe('Authorization', function() {

        it('Should return a 400 bad request error', function(done) {
            superagent.post(url + '/api/authenticate')
                .accept('json')
                .end(function(err, res) {
                    expect(err).to.be.null
                    expect(res.status).to.eql(400)
                    done()
                })
        })

        it('Should return a 401 unauthorized error', function(done) {
            superagent.post(url + '/api/authenticate')
                .set({
                    'apikey': 'foobar'
                })
                .accept('json')
                .end(function(err, res) {
                    expect(err).to.be.null
                    expect(res.status).to.eql(401)
                    done()
                })
        })

        it('Should successfully access the API', function(done) {
            superagent.post(url + '/api/authenticate')
                .set({
                    'apikey': apikey
                })
                .accept('json')
                .end(function(err, res) {
                    expect(err).to.be.null
                    expect(res.status).to.eql(200)
                    expect(res.ok).to.eql(true)
                    done()
                })
        })

    })

});