var chai = require( 'chai' );
var spies = require( 'chai-spies' );

var expect = chai.expect;
chai.use( spies );

var models = require( '../models' );
var Page = models.Page;
var User = models.User;

describe( "User Model", function() {
  
  var user;
  beforeEach( 'create user object', function() {
    user = new User({ name:"Bob", email:"bob@test.com" });
  } );

  it( 'should have a name and email property', function() {
    expect( user.name ).to.be.equal( "Bob" );
    expect( user.email ).to.be.equal( "bob@test.com" );
  } );

} );

describe( "Page Model", function() {

  var page, user;
  beforeEach( 'create page object', function() {
    user = new User({ name:"Bob", email:"bob@test.com" });
    page = new Page({
      title: "Test Page!",
      content: "Page contents",
      status: "open",
      author: user._id,
      tags: ["tag1","tag2"]
    });
  } );

  it( 'should have title, content, status, author, and tags', function() {
    expect( page.title ).to.be.equal( "Test Page!" );
    expect( page.content ).to.be.equal( "Page contents" );
    expect( page.status ).to.be.equal( "open" );
    expect( page.author ).to.be.equal( user._id );
    expect( page.tags ).to.contains( 'tag1', 'tag2' );
  } );
} );
