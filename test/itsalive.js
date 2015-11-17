var chai = require('chai');
var spies = require('chai-spies');
var expect = chai.expect;

chai.use( spies );

xdescribe( 'Simple tests', function() {
  var num;

  it('2 + 2 should equal 4', function() {
    expect(2 + 2).to.have.been.equal(4);
  } );

  it('should wait for the timeout to expire', function( done ) {
    setTimeout( function() {
      expect(true).to.be.that.which.has.been.equal(true);
      done();
    }, 1000 );
  } );

  it('forEach should be called once for every element', function() {
    var anArray = [];
    for ( var i=0; i<100; ++i ) anArray.push( i );

    var fn = function( el ) {};
    var spy = chai.spy.on( fn );

    anArray.forEach( spy );

    expect(spy).to.have.been.called();
    expect(spy).to.have.been.called.exactly( anArray.length );
  } );

} );
