var superagent = require('superagent'),
    expect = require('chai').expect,
    path = require('path'),
    crypto = require('crypto'),
    url = "http://localhost:8080";


function loginUser(agent, credentials, onResponse) {
    return function(done) {
        agent.post(url + '/login')
            .send({
                email: credentials.email,
                password: crypto.createHash('md5').update(credentials.password).digest("hex"),
                rememberme: "no"
            })
            .end(function(err, res) {
                onResponse(err, res);
                return done();
            });
    };
}

describe('User authentification', function() {

    describe('/login', function() {

        var agent = superagent.agent();

        it('should be rejected with bad credentials', loginUser(agent, {
            email: 'test@dummy.com',
            password: 'wrong'
        }, function(err, res) {
            expect(res.status).to.eql(401);
            expect(res.ok).to.eql(false);
        }));

        it('should create a user session', loginUser(agent, {
            email: "khocef@gmail.com",
            password: 'azerty'
        }, function(err, res) {
            expect(res.status).to.eql(200);
            expect(res.ok).to.eql(true);
        }));

        it('should be redirected from / to /home', function(done) {
            agent.get(url)
                .end(function(err, res) {
                    expect(res.redirects).to.eql([url + '/home']);
                    done();
                });
        });
    });

});