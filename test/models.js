var chai = require( 'chai' );
var spies = require( 'chai-spies' );

var expect = chai.expect;
chai.use( spies );

var models = require( '../models' );
var Page = models.Page;
var User = models.User;

describe( "User Model", function() {
  
  describe( 'Properties', function() {

    var user;
    beforeEach( 'create user object', function() {
      user = new User({ name:"Bob", email:"bob@test.com" });
    } );

    it( 'should have a name and email property', function() {
      expect( user.name ).to.be.equal( "Bob" );
      expect( user.email ).to.be.equal( "bob@test.com" );
    } );

  } );

  describe( 'Validation', function() {

    var user;
    beforeEach( function() {
      user = new User();
    } );
    
    it( "Rejects users without a name", function( done ) {
      user.email = "email@fail.com";
      user.validate().then( function() {
        throw Error( "validation passed without name" );
      }, function( err ) {
        return expect( err.errors ).to.have.property( 'name' );
      }).then( 
        function( ok ) { done() },
        function( err ) { done( err ) }
      );
    });

    it( "Rejects users without an email", function( done ) {
      user.name = "Bob Dole";
      user.validate().then( function() {
        throw Error( "validation passed without email" );
      }, function( err ) {
        return expect( err.errors ).to.have.property( 'email' );
      }).then( 
        function( ok ) { done() },
        function( err ) { done( err ) }
      );
    });

    it( "Rejects users with non-unique email addresses", function( done ) {
      var user2 = new User();
      user.name = "Bob Dole";
      user.email = "email@fail.com";
      user.save().then(
        function() {
          user2.name = "George Bush";
          user2.email = "email@fail.com";
          return user2.save();
        }, function( err ) {
          throw err;
        }
      ).then(
        function() {
          user2.remove();
          throw Error( "Non-unique e-mail saved successfully" );
        }, function( err ) {
          expect( err ).to.have.property( 'name', 'MongoError' );
          expect( err.message ).to.include( 'dup key:' );
          expect( err.message ).to.include( 'email@fail.com' );
        }
      ).then(
        function( ok ) { user.remove(); done() },
        function( err ) { user.remove(); done( err ) }
      );
    });

  } );

  describe( 'Find or Create', function() {

    xit( "Should find the user if it exists", function() {} );
    xit( "Should create a new user if it doesn\'t", function() {} );

  } );

} );

xdescribe( "Page Model", function() {

  describe( 'Properties', function() {
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
  });

  describe( 'Validation', function() {

    var page;
    beforeEach( function() {
      page = new Page();
    } );
    
    it( 'should reject a page without a title', function( done ) {
      page.content = "Hello!";
      page.validate().then( function() {
        throw Error( "validation passed without title" );
      }, function( err ) {
        return expect( err.errors ).to.have.property( 'title' );
      }).then( 
        function( ok ) { done() },
        function( err ) { done( err ) }
      );
    });

    it( 'should reject a page without content', function( done ) {
      page.title = "Hello!";
      page.validate().then( function() {
        throw Error( "validation passed without content" );
      }, function( err ) {
        return expect( err.errors ).to.have.property( 'content' );
      }).then( 
        function( ok ) { done() },
        function( err ) { done( err ) }
      );
    });

    it( 'should accept a page with just the required fields', function( done ) {
      page.title = "Hello!";
      page.content = "Conent";
      page.validate().then( null,
      function( err ) {
        throw Error( "validation failed with required fields" );
      }).then( 
        function( ok ) { done() },
        function( err ) { done( err ) }
      );
    });

  } );

  describe( 'Methods & Virtuals', function() {

    var page;
    beforeEach( function() {
      page = new Page();
      page.title = "This is a Title!";
      page.content = "This is **markdown** content\n\n# With header";
      page.validate();
    } );
    
    it( 'should have a route virtual', function() {
      expect(page).has.property( 'route' );
    });

    it( 'route virtual should evaluate to the page\'s route', function() {
      expect(page.route).to.equal( '/wiki/' + page.urlTitle );
    });

    it( 'should have a renderedContent virtual', function() {
      expect(page).has.property( 'renderedContent' );
    });

    it( 'renderedContent virtual should evaluate to parsed markdown', function() {
      expect(page.renderedContent).to.be.equal( '<p>This is <strong>markdown</strong> content</p>\n<h1 id="with-header">With header</h1>\n' );
    });

    it( 'should have a findByTag static method', function() {
      expect(Page).has.property( 'findByTag' );
      expect(Page.findByTag).to.be.a( 'function' );
    });

    it( 'findByTag should find pages that include the given tags', function( done ) {
      page.tags = ['this_tag','that_tag'];
      page.save().then( function() {
        return Page.findByTag( 'this_tag' )
      }).then(
        function( pages ) {
          expect( pages.length ).to.be.at.least( 1, "No pages were found" );
          return expect( pages.pop()._id.toString() ).to.be.equal( page._id.toString() );
        }, function( err ) {
          throw err;
        }
      ).then( function() { done() }, function( err ) { done( err ) } );
    });

    it( 'findByTag shouldn\'t find pages that don\'t include the given tags', function( done ) {
      page.tags = ['this_tag','that_tag'];
      page.save().then( function() {
        return Page.findByTag( 'im_not_a_tag' )
      }).then(
        function( pages ) {
          if ( pages.length === 0 ) return;
          return expect( pages.pop()._id.toString() ).to.not.be.equal( page._id.toString() );
        }, function( err ) {
          throw err;
        }
      ).then( function() { done() }, function( err ) { done( err ) } );
    });

    it( 'should have a findSimilar instance method', function() {
      expect( page ).to.have.property( 'findSimilar' );
      expect( page.findSimilar ).to.be.a( 'function' );
    });

    it( 'findSimilar should find pages that include any of this page\'s tags', function( done ) {
      page.tags = ['this_tag','that_tag'];

      var page2 = new Page();
      page2.title = "ok"; page2.content = "fine"; page2.tags = ['this_tag','another_tag'];
      page2.save().then( function() {
        return page.findSimilar();
      }).then(
        function( pages ) {
          expect( pages.length ).to.be.at.least( 1, "No pages were found" );
          expect( pages.pop()._id.toString() ).to.be.equal( page2._id.toString() );
        }, function( err ) {
          throw err;
        }
      ).then( function() { page2.remove(); done() }, function( err ) { page2.remove(); done( err ) } );
    });

    it( 'findSimilar shouldn\'t find pages that don\'t have any of this page\'s tags', function( done ) {
      page.tags = ['this_tag','that_tag'];

      var page2 = new Page();
      page2.title = "ok"; page2.content = "fine"; page2.tags = ['not_our_tag','another_tag'];
      page2.save().then( function() {
        return page.findSimilar();
      }).then(
        function( pages ) {
          if ( pages.length === 0 ) return;
          expect( pages.pop()._id.toString() ).to.not.be.equal( page2._id.toString() );
        }, function( err ) {
          throw err;
        }
      ).then( function() { page2.remove(); done() }, function( err ) { page2.remove(); done( err )} );
    });

    afterEach( function() {
      page.remove();
    } );

  } );

  describe( 'Hooks & Defaults', function() {

    var page;
    beforeEach( function() {
      page = new Page();
      page.title = "This is a Title!";
      page.content = "This is **markdown** content\n\n# With header";
      page.validate();
    } );
    
    it( 'should set the date to now by default', function() {
      // javascript is SO SLOW
      expect( Date.parse( page.date ) ).to.be.closeTo( Date.now(), 1000 );
    });

    it( 'should set the urlTitle based on the title before validation', function() {
      expect( page.urlTitle ).to.be.equal( 'This_is_a_Title' );
    });
    
    it( 'should set the urlTitle to a random string if there\'s no title', function( done ) {
      page.title = "";
      page.validate().then( null,
        function() {
          expect( page.urlTitle.length ).to.be.at.least( 1 );
        }
      ).then( function() {done()}, function( err ) {done(err)} );
    });

  } );
} );
